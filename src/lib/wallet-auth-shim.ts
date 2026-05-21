'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

type ShimUser = {
  id: string;
  wallet?: { address?: string };
};

export type User = ShimUser;

async function fetchJson(path: string, options?: RequestInit) {
  const response = await fetch(path, { credentials: 'include', ...options });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

export function useWalletAuth() {
  const { address, isConnected } = useAccount();
  const { disconnect, disconnectAsync } = useDisconnect();
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<ShimUser | null>(null);

  const refresh = useCallback(async () => {
    try {
      if (!isConnected || !address) {
        setUser(null);
        setAuthenticated(false);
        return;
      }

      const session = await fetchJson('/api/auth/session');
      const walletAddress = String(session.address || '').toLowerCase();
      const activeAddress = address.toLowerCase();

      if (!walletAddress) {
        setUser(null);
        setAuthenticated(false);
        return;
      }

      if (walletAddress !== activeAddress) {
        setUser({
          id: walletAddress,
          wallet: { address: walletAddress },
        });
        setAuthenticated(true);
        return;
      }

      const profile = await fetchJson(`/api/auth?wallet=${walletAddress}`);
      setUser({
        id: walletAddress,
        wallet: { address: walletAddress },
      });
      setAuthenticated(Boolean(profile?.user || profile?.profile));
    } catch {
      setUser(null);
      setAuthenticated(false);
    } finally {
      setReady(true);
    }
  }, [address, isConnected]);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('tiphive-auth-changed', handler);
    return () => window.removeEventListener('tiphive-auth-changed', handler);
  }, [refresh]);

  const login = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });

    if (isConnected) {
      try {
        await disconnectAsync();
      } catch {
        disconnect();
      }
    }

    setAuthenticated(false);
    setUser(null);
    window.dispatchEvent(new Event('tiphive-auth-changed'));
    window.setTimeout(() => {
      window.dispatchEvent(new Event('open-rainbowkit-connect'));
    }, 100);
  }, [disconnect, disconnectAsync, isConnected]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    disconnect();
    setAuthenticated(false);
    setUser(null);
    window.dispatchEvent(new Event('tiphive-auth-changed'));
  }, [disconnect]);

  // Session is cookie-based; this exists for legacy call sites that still
  // pass an Authorization header. API routes ignore it — the cookie does the
  // real work. Returns null because the session endpoint does not issue a
  // bearer token.
  const getAccessToken = useCallback(async () => {
    try {
      await fetchJson('/api/auth/session');
    } catch {
      return null;
    }
    return null;
  }, []);

  const linkWallet = useCallback(() => {
    window.dispatchEvent(new Event('open-rainbowkit-connect'));
  }, []);

  return useMemo(
    () => ({
      ready,
      authenticated,
      user,
      login,
      logout,
      getAccessToken,
      linkWallet,
    }),
    [authenticated, getAccessToken, linkWallet, login, logout, ready, user]
  );
}
