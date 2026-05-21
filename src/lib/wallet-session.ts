import { cookies, headers } from 'next/headers';
import { createHmac } from 'crypto';
import { isAddress, verifyMessage } from 'viem';
import { generateSiweNonce, parseSiweMessage } from 'viem/siwe';
import { mezoMainnet, mezoTestnet } from '@/lib/chains';

const SESSION_COOKIE = 'tiphive_wallet_session';
const NONCE_COOKIE = 'tiphive_siwe_nonce';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSessionSecret(): string {
  const secret = process.env.WALLET_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      'WALLET_SESSION_SECRET is not set. Generate a strong random value (at least 32 bytes) and add it to .env.local before starting the server.'
    );
  }
  if (secret.length < 32) {
    throw new Error(
      'WALLET_SESSION_SECRET is too short. Use at least 32 characters of randomness (run `openssl rand -base64 32`).'
    );
  }
  return secret;
}

async function hmac(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
}

export async function createNonce() {
  const nonce = generateSiweNonce();
  const cookieStore = await cookies();
  cookieStore.set(NONCE_COOKIE, nonce, {
    ...cookieOptions(),
    maxAge: 60 * 10,
  });
  return nonce;
}

export class WalletSessionError extends Error {
  constructor(public reason: string, message?: string) {
    super(message || reason);
    this.name = 'WalletSessionError';
  }
}

export async function createWalletSession(message: string, signature: `0x${string}`) {
  const cookieStore = await cookies();
  const cookieNonce = cookieStore.get(NONCE_COOKIE)?.value;
  if (!cookieNonce) {
    throw new WalletSessionError('NONCE_MISSING', 'Nonce cookie not found. Please try connecting your wallet again.');
  }

  const host = (await headers()).get('host') || '';
  const parsed = parseSiweMessage(message);
  const address = parsed.address?.toLowerCase();
  const chainId = parsed.chainId;
  const messageNonce = parsed.nonce;

  if (!address || !isAddress(address)) {
    throw new WalletSessionError('INVALID_ADDRESS', `Address parsed from SIWE message is invalid: ${parsed.address}`);
  }

  if (!chainId) {
    throw new WalletSessionError('MISSING_CHAIN_ID', 'SIWE message did not include a chainId.');
  }

  const validChain = chainId === mezoTestnet.id || chainId === mezoMainnet.id;
  if (!validChain) {
    throw new WalletSessionError(
      'UNSUPPORTED_CHAIN',
      `Wallet is on chain ${chainId}. Please switch to Mezo Testnet (${mezoTestnet.id}) or Mezo Mainnet (${mezoMainnet.id}) before signing in.`
    );
  }

  if (parsed.domain !== host) {
    throw new WalletSessionError(
      'DOMAIN_MISMATCH',
      `SIWE message domain "${parsed.domain}" does not match request host "${host}".`
    );
  }

  if (messageNonce !== cookieNonce) {
    throw new WalletSessionError(
      'NONCE_MISMATCH',
      `Nonce in signed message does not match server-issued nonce.`
    );
  }

  const verified = await verifyMessage({
    address,
    message,
    signature,
  });

  if (!verified) {
    throw new WalletSessionError(
      'SIGNATURE_INVALID',
      'Signature could not be verified against the wallet address.'
    );
  }

  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = Buffer.from(JSON.stringify({ address, chainId, expiresAt })).toString('base64url');
  const signatureHash = await hmac(payload);

  // Session-only cookie: no `maxAge` means the browser treats this as a
  // session cookie that lives in memory and is dropped when the browser is
  // fully closed. Combined with the server-side `expiresAt` payload check,
  // we have both a browser-lifetime bound AND a 7-day hard cap on the server.
  cookieStore.set(SESSION_COOKIE, `${payload}.${signatureHash}`, cookieOptions());
  cookieStore.delete(NONCE_COOKIE);

  return { address, chainId };
}

export async function getWalletSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  const [payload, signatureHash] = sessionCookie.split('.');
  if (!payload || !signatureHash || (await hmac(payload)) !== signatureHash) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      address?: string;
      chainId?: number;
      expiresAt?: number;
    };

    if (!session.address || !isAddress(session.address) || !session.expiresAt || session.expiresAt < Date.now()) {
      return null;
    }

    return {
      address: session.address.toLowerCase(),
      chainId: session.chainId || mezoMainnet.id,
    };
  } catch {
    return null;
  }
}

export async function requireWalletSession() {
  const session = await getWalletSession();
  if (!session) {
    throw new Error('Auth required');
  }
  return session;
}

export async function clearWalletSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(NONCE_COOKIE);
}
