'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bitcoin, Loader2, ExternalLink, AlertTriangle, ArrowRight,
  Lock, ShieldCheck, Sparkles, Wallet, X, CheckCircle2,
  ChevronDown, HelpCircle, BookOpen,
  Calendar, Heart, Store, Coins, Droplets,
} from 'lucide-react';
import Link from 'next/link';
import {
  useAccount, useChainId, useBalance, usePublicClient, useWalletClient,
  useReadContracts,
} from 'wagmi';
import { formatUnits, parseUnits } from 'viem';

import { useNetworkConfig } from '@/lib/hooks/useNetworkConfig';
import { supabase } from '@/lib/supabase';
import { useDashboard } from '@/components/providers/DashboardProvider';
import MUSDLogo from '@/components/ui/MUSDLogo';
import {
  TESTNET_BORROW, MAINNET_BORROW,
  BORROWER_OPERATIONS_ABI, TROVE_MANAGER_ABI, HINT_HELPERS_ABI,
  SORTED_TROVES_ABI, PRICE_FEED_ABI, MUSD_ERC20_ABI,
  ONE_E18, GAS_COMPENSATION, MIN_CR_BPS, NUM_HINT_TRIALS,
  type BorrowAddresses,
} from '@/lib/borrow-contracts';

type StatusKind = '' | 'ok' | 'err' | 'pending';
interface Status { msg: string; kind: StatusKind; }

const ZERO_ADDR = '0x0000000000000000000000000000000000000000' as const;
const ZERO = BigInt(0);

function fmt(bn: bigint | undefined | null, dp = 4): string {
  if (bn === undefined || bn === null) return '—';
  try {
    return Number(formatUnits(bn, 18)).toLocaleString(undefined, { maximumFractionDigits: dp });
  } catch { return '—'; }
}

function pct(bn: bigint | undefined | null, dp = 2): string {
  if (bn === undefined || bn === null) return '—';
  try { return (Number(formatUnits(bn, 18)) * 100).toFixed(dp) + '%'; }
  catch { return '—'; }
}

function tryParse(v: string): bigint {
  if (!v) return ZERO;
  try { return parseUnits(v as `${number}`, 18); } catch { return ZERO; }
}

function randomSeed(): bigint {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let hex = '0x';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return BigInt(hex);
}

function getCrTone(crRaw: bigint | null | undefined): 'safe' | 'warn' | 'danger' | 'none' {
  if (!crRaw) return 'none';
  if (crRaw >= parseUnits('1.5', 18)) return 'safe';
  if (crRaw >= parseUnits('1.2', 18)) return 'warn';
  return 'danger';
}

export default function BorrowMUSDPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { isTestnet, explorerUrl, networkName } = useNetworkConfig();
  const publicClient = usePublicClient();
  const { fetchData: refreshDashboard } = useDashboard();
  const { data: walletClient } = useWalletClient();

  // Pick the right addresses based on chain. Both testnet and mainnet are live.
  const ADDR: BorrowAddresses = isTestnet ? TESTNET_BORROW : MAINNET_BORROW;
  const addressesLoaded = ADDR.BorrowerOperations !== ZERO_ADDR && ADDR.PriceFeed !== ZERO_ADDR && ADDR.TroveManager !== ZERO_ADDR;

  const [collInput, setCollInput] = useState('');
  const [debtInput, setDebtInput] = useState('');
  const [repayInput, setRepayInput] = useState('');
  const [status, setStatus] = useState<Status>({ msg: '', kind: '' });
  const [busy, setBusy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const setMsg = (msg: string, kind: StatusKind = '') => setStatus({ msg, kind });

  // ---- Reads (multicall) ----
  const protocolReads = useReadContracts({
    allowFailure: true,
    contracts: [
      { address: ADDR.BorrowerOperations, abi: BORROWER_OPERATIONS_ABI, functionName: 'borrowingRate' },
      { address: ADDR.BorrowerOperations, abi: BORROWER_OPERATIONS_ABI, functionName: 'minNetDebt' },
      { address: ADDR.PriceFeed, abi: PRICE_FEED_ABI, functionName: 'fetchPrice' },
    ],
    query: {
      enabled: addressesLoaded,
      refetchInterval: 15_000,
    },
  });

  const borrowingRate = protocolReads.data?.[0]?.result as bigint | undefined;
  const minNetDebt = protocolReads.data?.[1]?.result as bigint | undefined;
  const price = protocolReads.data?.[2]?.result as bigint | undefined;

  // BTC native balance
  const { data: btcBalanceData } = useBalance({
    address,
    chainId,
    query: { enabled: Boolean(address), refetchInterval: 15_000 },
  });
  const btcBal = btcBalanceData?.value;

  // Account reads
  const accountReads = useReadContracts({
    allowFailure: true,
    contracts: [
      { address: ADDR.MUSD, abi: MUSD_ERC20_ABI, functionName: 'balanceOf', args: [address ?? ZERO_ADDR] },
      { address: ADDR.MUSD, abi: MUSD_ERC20_ABI, functionName: 'allowance', args: [address ?? ZERO_ADDR, ADDR.BorrowerOperations] },
      { address: ADDR.TroveManager, abi: TROVE_MANAGER_ABI, functionName: 'getTroveStatus', args: [address ?? ZERO_ADDR] },
      { address: ADDR.TroveManager, abi: TROVE_MANAGER_ABI, functionName: 'getTroveDebt', args: [address ?? ZERO_ADDR] },
      { address: ADDR.TroveManager, abi: TROVE_MANAGER_ABI, functionName: 'getTroveColl', args: [address ?? ZERO_ADDR] },
    ],
    query: {
      enabled: Boolean(address) && addressesLoaded,
      refetchInterval: 15_000,
    },
  });

  const musdBal = accountReads.data?.[0]?.result as bigint | undefined;
  const musdAllowance = accountReads.data?.[1]?.result as bigint | undefined;
  const troveStatus = Number((accountReads.data?.[2]?.result as bigint | undefined) ?? ZERO);
  const troveDebt = accountReads.data?.[3]?.result as bigint | undefined;
  const troveColl = accountReads.data?.[4]?.result as bigint | undefined;
  const hasTrove = troveStatus === 1;

  // Current ICR (only useful when trove is open AND we have price)
  const icrRead = useReadContracts({
    allowFailure: true,
    contracts: [
      { address: ADDR.TroveManager, abi: TROVE_MANAGER_ABI, functionName: 'getCurrentICR', args: [address ?? ZERO_ADDR, price ?? ZERO] },
    ],
    query: {
      enabled: Boolean(address) && hasTrove && Boolean(price && price > ZERO) && addressesLoaded,
      refetchInterval: 15_000,
    },
  });
  const troveICR = icrRead.data?.[0]?.result as bigint | undefined;

  const refreshAll = useCallback(async () => {
    await Promise.all([
      protocolReads.refetch(),
      accountReads.refetch(),
      icrRead.refetch(),
    ]);
  }, [protocolReads, accountReads, icrRead]);

  // ---- Preview (live calc) ----
  const preview = useMemo(() => {
    if (!borrowingRate || !price) return null;
    const coll = tryParse(collInput);
    const debt = tryParse(debtInput);
    if (coll === ZERO || debt === ZERO) return null;
    const fee = (debt * borrowingRate) / ONE_E18;
    const compositeDebt = debt + fee + GAS_COMPENSATION;
    let cr = ZERO;
    try { cr = (coll * price) / compositeDebt; } catch {}
    const liqPrice = (compositeDebt * MIN_CR_BPS) / coll;
    return { fee, compositeDebt, cr, liqPrice };
  }, [collInput, debtInput, borrowingRate, price]);

  const previewBelowMin = preview && preview.cr < MIN_CR_BPS;

  // Balance / gas-buffer checks — block tx before MetaMask if user can't afford it.
  const GAS_BUFFER = parseUnits('0.001', 18);
  const collParsed = tryParse(collInput);
  const insufficientBalance = useMemo(() => {
    if (!btcBal || collParsed === ZERO) return false;
    return collParsed > btcBal;
  }, [collParsed, btcBal]);
  const insufficientGasBuffer = useMemo(() => {
    if (!btcBal || collParsed === ZERO || insufficientBalance) return false;
    return (btcBal - collParsed) < GAS_BUFFER;
  }, [collParsed, btcBal, insufficientBalance, GAS_BUFFER]);
  const debtBelowMin = useMemo(() => {
    if (!minNetDebt) return false;
    const debt = tryParse(debtInput);
    if (debt === ZERO) return false;
    return debt < minNetDebt;
  }, [debtInput, minNetDebt]);

  const maxRepayable = useMemo(() => {
    if (!troveDebt || !minNetDebt) return ZERO;
    const floor = GAS_COMPENSATION + minNetDebt;
    return troveDebt > floor ? troveDebt - floor : ZERO;
  }, [troveDebt, minNetDebt]);

  // ---- Tx helpers ----
  const computeHints = useCallback(async (coll: bigint, compositeDebt: bigint) => {
    if (!publicClient) throw new Error('No public client');
    const nicr = await publicClient.readContract({
      address: ADDR.HintHelpers, abi: HINT_HELPERS_ABI,
      functionName: 'computeNominalCR', args: [coll, compositeDebt],
    }) as bigint;
    const size = await publicClient.readContract({
      address: ADDR.SortedTroves, abi: SORTED_TROVES_ABI,
      functionName: 'getSize',
    }) as bigint;
    const trials = Math.max(NUM_HINT_TRIALS, Math.min(100, Math.floor(Math.sqrt(Number(size)) * 15)));
    const seed = randomSeed();
    const approx = await publicClient.readContract({
      address: ADDR.HintHelpers, abi: HINT_HELPERS_ABI,
      functionName: 'getApproxHint', args: [nicr, BigInt(trials), seed],
    }) as readonly [`0x${string}`, bigint, bigint];
    const hintAddress = approx[0];
    const pos = await publicClient.readContract({
      address: ADDR.SortedTroves, abi: SORTED_TROVES_ABI,
      functionName: 'findInsertPosition', args: [nicr, hintAddress, hintAddress],
    }) as readonly [`0x${string}`, `0x${string}`];
    return { upper: pos[0], lower: pos[1] };
  }, [publicClient, ADDR]);

  const withTx = useCallback(async (
    label: string,
    fn: () => Promise<{ hash: `0x${string}`; log?: { event_type: 'borrow' | 'repay' | 'close'; musd_amount?: number; btc_amount?: number } } | `0x${string}`>,
  ) => {
    if (!walletClient || !publicClient) { setMsg('Connect a wallet first.', 'err'); return; }
    setBusy(true);
    try {
      setMsg(`${label}…`, 'pending');
      const result = await fn();
      const hash = typeof result === 'string' ? result : result.hash;
      const log = typeof result === 'string' ? undefined : result.log;
      setMsg(`${label} — tx sent. Confirming…`, 'pending');
      await publicClient.waitForTransactionReceipt({ hash });
      setMsg(`${label} confirmed.`, 'ok');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
      if (log && address) {
        try {
          const { error: dbErr } = await supabase.from('borrow_events').insert({
            wallet: address.toLowerCase(),
            event_type: log.event_type,
            musd_amount: log.musd_amount ?? null,
            btc_amount: log.btc_amount ?? null,
            tx_hash: hash,
            chain_id: chainId,
          });
          if (dbErr) {
            console.error('borrow_events insert error', dbErr);
            setMsg(`${label} confirmed, but activity log failed: ${dbErr.message}`, 'err');
          } else {
            try { refreshDashboard(); } catch { /* noop */ }
          }
        } catch (e) {
          const err = e as { message?: string };
          console.error('borrow_events insert threw', e);
          setMsg(`${label} confirmed, but activity log failed: ${err?.message ?? 'unknown'}`, 'err');
        }
      }
      await refreshAll();
    } catch (e: unknown) {
      const err = e as { shortMessage?: string; message?: string };
      const m = err?.shortMessage || err?.message || String(e);
      setMsg(`${label} failed: ${m}`, 'err');
    } finally {
      setBusy(false);
    }
  }, [walletClient, publicClient, refreshAll, address, chainId, refreshDashboard]);

  // ---- Actions ----
  const onBorrow = () => withTx('Opening trove', async () => {
    const coll = tryParse(collInput);
    const debt = tryParse(debtInput);
    if (coll === ZERO) throw new Error('Enter BTC collateral');
    if (debt === ZERO) throw new Error('Enter MUSD amount to borrow');
    if (minNetDebt && debt < minNetDebt) throw new Error(`Minimum borrow is ${fmt(minNetDebt, 0)} MUSD`);
    if (!borrowingRate) throw new Error('Rate not ready');
    const fee = (debt * borrowingRate) / ONE_E18;
    const compositeDebt = debt + fee + GAS_COMPENSATION;
    const { upper, lower } = await computeHints(coll, compositeDebt);
    const hash = await walletClient!.writeContract({
      address: ADDR.BorrowerOperations,
      abi: BORROWER_OPERATIONS_ABI,
      functionName: 'openTrove',
      args: [debt, upper, lower],
      value: coll,
    });
    return {
      hash,
      log: {
        event_type: 'borrow' as const,
        musd_amount: Number(formatUnits(debt, 18)),
        btc_amount: Number(formatUnits(coll, 18)),
      },
    };
  });

  const onApproveRepay = () => withTx('Approving MUSD', async () => {
    const amt = tryParse(repayInput);
    if (amt === ZERO) throw new Error('Enter repay amount');
    return await walletClient!.writeContract({
      address: ADDR.MUSD, abi: MUSD_ERC20_ABI,
      functionName: 'approve', args: [ADDR.BorrowerOperations, amt],
    });
  });

  const onRepay = () => withTx('Repaying MUSD', async () => {
    const amt = tryParse(repayInput);
    if (amt === ZERO) throw new Error('Enter repay amount');
    if (amt > maxRepayable) {
      throw new Error(
        `Max partial repay is ${fmt(maxRepayable, 2)} MUSD ` +
        `(net debt must stay ≥ ${fmt(minNetDebt, 0)}). Use Close Trove to clear everything.`
      );
    }
    if (!troveDebt || !troveColl) throw new Error('Trove state not loaded');
    const newDebt = troveDebt - amt;
    const { upper, lower } = await computeHints(troveColl, newDebt);
    const hash = await walletClient!.writeContract({
      address: ADDR.BorrowerOperations, abi: BORROWER_OPERATIONS_ABI,
      functionName: 'repayMUSD', args: [amt, upper, lower],
    });
    return {
      hash,
      log: {
        event_type: 'repay' as const,
        musd_amount: Number(formatUnits(amt, 18)),
      },
    };
  });

  const onApproveClose = () => withTx('Approving MUSD for close', async () => {
    if (!troveDebt) throw new Error('No active trove');
    const needed = troveDebt - GAS_COMPENSATION;
    // Approve 0.001 MUSD extra so any micro-dust between approval and close-tx doesn't block it.
    const approveAmt = needed + parseUnits('0.001', 18);
    return await walletClient!.writeContract({
      address: ADDR.MUSD, abi: MUSD_ERC20_ABI,
      functionName: 'approve', args: [ADDR.BorrowerOperations, approveAmt],
    });
  });

  const onClose = () => withTx('Closing trove', async () => {
    if (!troveDebt) throw new Error('No active trove');
    const needed = troveDebt - GAS_COMPENSATION;
    if (musdBal !== undefined && musdBal < needed) {
      throw new Error(`Need ${fmt(needed, 2)} MUSD to close. Wallet has ${fmt(musdBal, 2)}.`);
    }
    if (musdAllowance !== undefined && musdAllowance < needed) {
      throw new Error(`Approve at least ${fmt(needed, 2)} MUSD first.`);
    }
    const collSnapshot = troveColl ?? ZERO;
    const hash = await walletClient!.writeContract({
      address: ADDR.BorrowerOperations, abi: BORROWER_OPERATIONS_ABI,
      functionName: 'closeTrove', args: [],
    });
    return {
      hash,
      log: {
        event_type: 'close' as const,
        musd_amount: Number(formatUnits(needed, 18)),
        btc_amount: Number(formatUnits(collSnapshot, 18)),
      },
    };
  });

  // ---- Rendering ----
  if (!addressesLoaded) return <ComingSoon networkName={networkName} />;

  return (
    <div className="space-y-12 relative">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="px-4 md:px-0 space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-1 bg-[#f7931a] rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f7931a]">Mezo · Borrow Vault</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] flex flex-wrap gap-x-4">
          <span>Borrow</span>
          <span className="text-[#f7931a]">MUSD</span>
          <span>with BTC</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
          Lock BTC as collateral. Mint MUSD against it. No monthly payments — 1% APR, 110% min CR.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Pill icon={<ShieldCheck size={12} />} tone="orange">{isTestnet ? 'Testnet — matsnet' : 'Mainnet — Live'}</Pill>
          <Pill icon={<Sparkles size={12} />} tone="white">1% APR · 110% MCR</Pill>
        </div>
      </motion.div>

      {/* Connect prompt */}
      {!isConnected && <ConnectGate />}

      {/* Status bar */}
      <AnimatePresence>
        {status.msg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-2xl border p-4 font-medium text-sm flex items-start gap-3 ${
              status.kind === 'ok'
                ? 'border-green-500/30 bg-green-500/5 text-green-300'
                : status.kind === 'err'
                ? 'border-red-500/30 bg-red-500/5 text-red-300'
                : 'border-[#f7931a]/30 bg-[#f7931a]/5 text-[#f7931a]'
            }`}
          >
            {status.kind === 'pending' ? <Loader2 size={18} className="animate-spin mt-0.5 shrink-0" />
              : status.kind === 'err' ? <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              : status.kind === 'ok' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              : null}
            <span className="break-words">{status.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <StatTile label="BTC Balance" value={btcBal ? fmt(btcBal, 6) : '—'} suffix="BTC" icon={<Bitcoin size={16} className="text-[#f7931a]" />} />
        <StatTile label="MUSD Balance" value={fmt(musdBal, 2)} suffix="MUSD" valueIcon={<MUSDLogo className="w-6 h-6 md:w-7 md:h-7" />} />
        <StatTile label="BTC Price" value={price ? `$${fmt(price, 0)}` : '—'} />
        <StatTile label="Borrowing Fee" value={borrowingRate ? pct(borrowingRate, 3) : '—'} />
        <StatTile label="Min Borrow" value={minNetDebt ? fmt(minNetDebt, 0) : '—'} suffix="MUSD" valueIcon={<MUSDLogo className="w-6 h-6 md:w-7 md:h-7" />} />
        <StatTile label="Min CR" value="110%" />
      </div>

      {/* Main panel */}
      {hasTrove ? (
        <ActiveLoanPanel
          troveDebt={troveDebt}
          troveColl={troveColl}
          troveICR={troveICR}
          minNetDebt={minNetDebt}
          maxRepayable={maxRepayable}
          repayInput={repayInput}
          setRepayInput={setRepayInput}
          musdBal={musdBal}
          musdAllowance={musdAllowance}
          onApproveRepay={onApproveRepay}
          onRepay={onRepay}
          onApproveClose={onApproveClose}
          onClose={onClose}
          busy={busy}
          connected={isConnected}
        />
      ) : (
        <OpenTrovePanel
          collInput={collInput} setCollInput={setCollInput}
          debtInput={debtInput} setDebtInput={setDebtInput}
          btcBal={btcBal}
          minNetDebt={minNetDebt}
          preview={preview}
          previewBelowMin={previewBelowMin}
          insufficientBalance={insufficientBalance}
          insufficientGasBuffer={insufficientGasBuffer}
          debtBelowMin={debtBelowMin}
          onBorrow={onBorrow}
          busy={busy}
          connected={isConnected}
        />
      )}

      {/* MUSD smart options — what to do with your borrowed MUSD */}
      <MUSDActions />

      {/* FAQ — how borrowing works */}
      <BorrowFAQ />

      {/* Contract footer */}
      <ContractRefs ADDR={ADDR} explorerUrl={explorerUrl} />

      {/* Success popup */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] bg-[#1a1a24] border border-green-500/40 p-6 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex items-center gap-6 min-w-[340px] backdrop-blur-2xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-500 shrink-0 shadow-inner">
              <CheckCircle2 size={32} />
            </div>
            <div className="pr-4">
              <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight">Tx Confirmed</h3>
              <p className="text-slate-500 font-bold uppercase tracking-[0.1em] text-[10px] mt-1">Borrow vault updated</p>
            </div>
            <button onClick={() => setShowSuccess(false)} className="ml-auto w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================== Sub-components ============================== */

function Pill({ children, icon, tone }: { children: React.ReactNode; icon?: React.ReactNode; tone: 'orange' | 'white' }) {
  const cls = tone === 'orange'
    ? 'border-[#f7931a]/40 bg-[#f7931a]/10 text-[#f7931a]'
    : 'border-white/10 bg-white/5 text-slate-300';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${cls}`}>
      {icon}{children}
    </span>
  );
}

function StatTile({ label, value, suffix, icon, valueIcon }: { label: string; value: string; suffix?: string; icon?: React.ReactNode; valueIcon?: React.ReactNode }) {
  return (
    <div className="bg-[#1a1a24] rounded-3xl border border-white/5 p-5 relative overflow-hidden group">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</div>
      </div>
      <div className="flex items-center gap-2 leading-none">
        <span className="text-2xl md:text-3xl font-black text-white tabular-nums">{value}</span>
        {valueIcon && <span className="shrink-0">{valueIcon}</span>}
      </div>
      {suffix && <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">{suffix}</div>}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-[#f7931a]/0 group-hover:bg-[#f7931a]/5 transition-colors blur-2xl" />
    </div>
  );
}

function ConnectGate() {
  return (
    <div className="bg-[#1a1a24] border border-white/5 rounded-3xl p-8 flex items-center gap-5">
      <div className="w-14 h-14 rounded-2xl bg-[#f7931a]/10 border border-[#f7931a]/30 flex items-center justify-center text-[#f7931a] shrink-0">
        <Wallet size={24} />
      </div>
      <div>
        <h3 className="text-xl font-black text-white uppercase tracking-tight">Wallet Locked</h3>
        <p className="text-slate-500 font-medium text-sm mt-1">Connect your wallet from the top bar to open or manage your BTC-backed loan.</p>
      </div>
    </div>
  );
}

interface OpenPanelProps {
  collInput: string; setCollInput: (v: string) => void;
  debtInput: string; setDebtInput: (v: string) => void;
  btcBal: bigint | undefined;
  minNetDebt: bigint | undefined;
  preview: { fee: bigint; compositeDebt: bigint; cr: bigint; liqPrice: bigint } | null;
  previewBelowMin: boolean | null | undefined;
  insufficientBalance: boolean;
  insufficientGasBuffer: boolean;
  debtBelowMin: boolean;
  onBorrow: () => void;
  busy: boolean;
  connected: boolean;
}

function OpenTrovePanel(p: OpenPanelProps) {
  const tone = getCrTone(p.preview?.cr);
  const crColor = tone === 'safe' ? 'text-green-400' : tone === 'warn' ? 'text-yellow-400' : tone === 'danger' ? 'text-red-400' : 'text-white';

  return (
    <div className="bg-[#1a1a24] border border-white/5 rounded-3xl p-6 md:p-10 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#f7931a]/10 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Open a Loan</h2>
          <Pill icon={<Bitcoin size={12} />} tone="orange">BTC → MUSD</Pill>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Collateral input */}
          <Field
            label="BTC collateral"
            rightHint={`Balance: ${p.btcBal ? fmt(p.btcBal, 6) : '—'}`}
            input={
              <div className="flex gap-2">
                <input
                  value={p.collInput}
                  onChange={e => p.setCollInput(e.target.value)}
                  placeholder="0.0"
                  inputMode="decimal"
                  className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-2xl font-black text-white tabular-nums focus:outline-none focus:border-[#f7931a]/60 placeholder:text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!p.btcBal) return;
                    const buf = parseUnits('0.001', 18);
                    const max = p.btcBal > buf ? p.btcBal - buf : ZERO;
                    p.setCollInput(formatUnits(max, 18));
                  }}
                  className="px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition"
                >Max</button>
              </div>
            }
          />
          {/* Debt input */}
          <Field
            label="MUSD to borrow"
            rightHint={`Min ${p.minNetDebt ? fmt(p.minNetDebt, 0) : '—'}`}
            input={
              <input
                value={p.debtInput}
                onChange={e => p.setDebtInput(e.target.value)}
                placeholder="0.0"
                inputMode="decimal"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-2xl font-black text-white tabular-nums focus:outline-none focus:border-[#f7931a]/60 placeholder:text-slate-700"
              />
            }
          />
        </div>

        {/* Preview */}
        <AnimatePresence>
          {p.preview && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <PreviewCell label="Collat. ratio" value={pct(p.preview.cr, 2)} valueClass={crColor} />
              <PreviewCell label="Liq. price" value={`$${fmt(p.preview.liqPrice, 0)}`} />
              <PreviewCell label="Issuance fee" value={`${fmt(p.preview.fee, 4)} MUSD`} />
              <PreviewCell label="Total debt" value={`${fmt(p.preview.compositeDebt, 2)} MUSD`} />
            </motion.div>
          )}
        </AnimatePresence>

        {p.insufficientBalance && (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/5 text-red-300 p-4 text-sm font-medium flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>
              Not enough BTC. Your wallet has <b className="tabular-nums">{fmt(p.btcBal, 6)} BTC</b> but you&apos;re trying to use <b className="tabular-nums">{fmt(tryParse(p.collInput), 6)} BTC</b> as collateral.
            </span>
          </div>
        )}

        {p.insufficientGasBuffer && !p.insufficientBalance && (
          <div className="mb-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 text-yellow-300 p-4 text-sm font-medium flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>Leave at least <b>0.001 BTC</b> in your wallet for gas — otherwise the transaction will fail.</span>
          </div>
        )}

        {p.debtBelowMin && (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/5 text-red-300 p-4 text-sm font-medium flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>MUSD amount is below the minimum of <b className="tabular-nums">{fmt(p.minNetDebt, 0)} MUSD</b>.</span>
          </div>
        )}

        {p.preview && p.previewBelowMin && (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/5 text-red-300 p-4 text-sm font-medium flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>Below 110% MCR — this transaction would revert. Add more BTC or borrow less MUSD.</span>
          </div>
        )}

        <button
          onClick={p.onBorrow}
          disabled={!p.connected || p.busy || !p.preview || !!p.previewBelowMin || p.insufficientBalance || p.insufficientGasBuffer || p.debtBelowMin}
          className="w-full group relative overflow-hidden rounded-2xl bg-[#f7931a] text-black font-black uppercase tracking-tight text-lg py-5 px-6 flex items-center justify-center gap-3 hover:bg-[#ffa736] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(247,147,26,0.25)] hover:shadow-[0_0_60px_rgba(247,147,26,0.45)]"
        >
          {p.busy ? <Loader2 size={20} className="animate-spin" /> : <Bitcoin size={20} />}
          <span>{p.busy ? 'Working…' : p.insufficientBalance ? 'Insufficient BTC' : 'Borrow MUSD'}</span>
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="mt-5 text-slate-500 text-xs font-medium leading-relaxed">
          Includes a one-time issuance fee (current rate above) and 200 MUSD held as gas compensation (refunded when you close the loan).
        </div>
      </div>
    </div>
  );
}

interface ActivePanelProps {
  troveDebt: bigint | undefined;
  troveColl: bigint | undefined;
  troveICR: bigint | undefined;
  minNetDebt: bigint | undefined;
  maxRepayable: bigint;
  repayInput: string;
  setRepayInput: (v: string) => void;
  musdBal: bigint | undefined;
  musdAllowance: bigint | undefined;
  onApproveRepay: () => void;
  onRepay: () => void;
  onApproveClose: () => void;
  onClose: () => void;
  busy: boolean;
  connected: boolean;
}

function ActiveLoanPanel(p: ActivePanelProps) {
  const tone = getCrTone(p.troveICR);
  const crColor = tone === 'safe' ? 'text-green-400' : tone === 'warn' ? 'text-yellow-400' : tone === 'danger' ? 'text-red-400' : 'text-white';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Loan stats */}
      <div className="lg:col-span-3 bg-[#1a1a24] border border-white/5 rounded-3xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#f7931a]/10 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Your Loan</h2>
            <Pill icon={<ShieldCheck size={12} />} tone="orange">Active Trove</Pill>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <BigStat label="Loan Debt" value={fmt(p.troveDebt, 2)} suffix="MUSD" valueIcon={<MUSDLogo className="w-7 h-7" />} />
            <BigStat label="Collateral" value={fmt(p.troveColl, 6)} suffix="BTC" />
            <BigStat label="Collat. Ratio" value={pct(p.troveICR, 2)} valueClass={crColor} />
            <BigStat label="APR" value="1.0%" />
          </div>

          <div className="mt-6 rounded-2xl border border-white/5 bg-black/30 p-4 text-slate-500 text-xs font-medium leading-relaxed">
            Loan debt includes 200 MUSD held as gas compensation. It is refunded automatically when you close the loan.
          </div>
        </div>
      </div>

      {/* Repay / Close */}
      <div className="lg:col-span-2 bg-[#1a1a24] border border-white/5 rounded-3xl p-6 md:p-10">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">Repay / Close</h2>

        <Field
          label="MUSD to repay"
          rightHint={`Max partial: ${fmt(p.maxRepayable, 2)}`}
          input={
            <div className="flex gap-2">
              <input
                value={p.repayInput}
                onChange={e => p.setRepayInput(e.target.value)}
                placeholder="0.0"
                inputMode="decimal"
                className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-lg font-black text-white tabular-nums focus:outline-none focus:border-[#f7931a]/60 placeholder:text-slate-700"
              />
              <button
                type="button"
                onClick={() => {
                  if (!p.musdBal || p.maxRepayable === ZERO) return;
                  const cap = p.musdBal < p.maxRepayable ? p.musdBal : p.maxRepayable;
                  p.setRepayInput(formatUnits(cap, 18));
                }}
                className="px-3 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition"
              >Max</button>
            </div>
          }
        />

        <div className="text-slate-500 text-[11px] font-medium leading-relaxed mb-4">
          Partial repay must leave net debt ≥ {p.minNetDebt ? fmt(p.minNetDebt, 0) : '—'} MUSD. Allowance: {fmt(p.musdAllowance, 2)}.
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <SecondaryBtn onClick={p.onApproveRepay} disabled={!p.connected || p.busy}>Approve</SecondaryBtn>
          <PrimaryBtn onClick={p.onRepay} disabled={!p.connected || p.busy}>Repay</PrimaryBtn>
        </div>

        <div className="border-t border-white/5 pt-6">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Close Loan</div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <SecondaryBtn onClick={p.onApproveClose} disabled={!p.connected || p.busy}>Approve Full</SecondaryBtn>
            <DangerBtn onClick={p.onClose} disabled={!p.connected || p.busy}>Close Trove</DangerBtn>
          </div>
          <div className="text-slate-500 text-[11px] font-medium leading-relaxed">
            Closing requires (debt − 200 MUSD gas comp) in your wallet. The 200 MUSD gas comp is refunded.
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, rightHint, input }: { label: string; rightHint?: string; input: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</span>
        {rightHint && <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{rightHint}</span>}
      </div>
      {input}
    </div>
  );
}

function PreviewCell({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-2xl bg-black/30 border border-white/5 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{label}</div>
      <div className={`text-lg font-black tabular-nums ${valueClass || 'text-white'}`}>{value}</div>
    </div>
  );
}

function BigStat({ label, value, suffix, valueClass, valueIcon }: { label: string; value: string; suffix?: string; valueClass?: string; valueIcon?: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-black/30 border border-white/5 p-5">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">{label}</div>
      <div className="flex items-center gap-2">
        <span className={`text-4xl font-black tabular-nums ${valueClass || 'text-white'}`}>{value}</span>
        {valueIcon && <span className="shrink-0">{valueIcon}</span>}
      </div>
      {suffix && <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">{suffix}</div>}
    </div>
  );
}

function PrimaryBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="rounded-2xl bg-[#f7931a] text-black font-black uppercase tracking-tight text-sm py-3 px-4 hover:bg-[#ffa736] transition disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(247,147,26,0.25)]"
    >{children}</button>
  );
}
function SecondaryBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-tight text-sm py-3 px-4 hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
    >{children}</button>
  );
}
function DangerBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 font-black uppercase tracking-tight text-sm py-3 px-4 hover:bg-red-500/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
    >{children}</button>
  );
}

function ContractRefs({ ADDR, explorerUrl }: { ADDR: BorrowAddresses; explorerUrl: string }) {
  const entries: Array<{ label: string; addr: `0x${string}` }> = [
    { label: 'BorrowerOperations', addr: ADDR.BorrowerOperations },
    { label: 'TroveManager', addr: ADDR.TroveManager },
    { label: 'MUSD token', addr: ADDR.MUSD },
    { label: 'PriceFeed', addr: ADDR.PriceFeed },
  ];
  return (
    <div className="bg-[#0f0f14] border border-white/5 rounded-3xl p-6">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Contracts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {entries.map(({ label, addr }) => (
          <a
            key={label}
            href={`${explorerUrl}/address/${addr}`}
            target="_blank" rel="noreferrer"
            className="group flex items-center justify-between gap-3 rounded-2xl bg-white/[0.02] border border-white/5 p-4 hover:border-[#f7931a]/40 hover:bg-[#f7931a]/[0.04] transition"
          >
            <div>
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</div>
              <div className="text-white font-mono text-xs mt-1 break-all">{addr.slice(0, 10)}…{addr.slice(-6)}</div>
            </div>
            <ExternalLink size={14} className="text-slate-500 group-hover:text-[#f7931a] transition shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}

function MUSDActions() {
  const actions: Array<{
    icon: React.ReactNode;
    title: string;
    desc: string;
    href: string;
    external: boolean;
  }> = [
    {
      icon: <Calendar size={20} />,
      title: 'TipHive Subscriptions',
      desc: 'Pay creator subscriptions with your MUSD.',
      href: '/subscriptions',
      external: false,
    },
    {
      icon: <Heart size={20} />,
      title: 'Tip Creators',
      desc: 'Send MUSD tips to creators you love.',
      href: '/',
      external: false,
    },
    {
      icon: <Store size={20} />,
      title: 'Mezo Market',
      desc: 'Spend MUSD on the on-chain market.',
      href: 'https://mezo.org/market',
      external: true,
    },
    {
      icon: <Coins size={20} />,
      title: 'Mezo Vaults',
      desc: 'Park MUSD in yield-bearing vaults.',
      href: 'https://mezo.org/earn/vaults',
      external: true,
    },
    {
      icon: <Droplets size={20} />,
      title: 'Mezo Pools',
      desc: 'Provide liquidity to earn from pools.',
      href: 'https://mezo.org/earn/pools',
      external: true,
    },
  ];

  return (
    <div className="bg-[#0f0f14] border border-white/5 rounded-3xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-[#f7931a]/10 border border-[#f7931a]/30 flex items-center justify-center text-[#f7931a]">
          <Sparkles size={18} />
        </div>
        <div>
          <h3 className="text-white font-black uppercase tracking-tighter text-2xl leading-none">
            What can you do with MUSD?
          </h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.25em] mt-2">
            5 ways to put your MUSD to work
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {actions.map((a, i) => {
          const inner = (
            <>
              <div className="w-11 h-11 rounded-2xl bg-[#f7931a]/10 border border-[#f7931a]/20 flex items-center justify-center text-[#f7931a] group-hover:bg-[#f7931a]/20 group-hover:border-[#f7931a]/40 transition">
                {a.icon}
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-black tracking-tight text-base leading-tight">{a.title}</h4>
                  {a.external && (
                    <ExternalLink size={12} className="text-slate-500 group-hover:text-[#f7931a] transition shrink-0" />
                  )}
                </div>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">{a.desc}</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-[#f7931a] transition">
                {a.external ? 'Open' : 'Go'} <ArrowRight size={12} />
              </div>
            </>
          );
          const cardClass =
            'group flex flex-col rounded-2xl bg-white/[0.02] border border-white/5 p-5 hover:border-[#f7931a]/40 hover:bg-[#f7931a]/[0.03] transition';
          return a.external ? (
            <a key={i} href={a.href} target="_blank" rel="noreferrer" className={cardClass}>
              {inner}
            </a>
          ) : (
            <Link key={i} href={a.href} className={cardClass}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function BorrowFAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const toggle = (i: number) => setOpen(open === i ? null : i);

  const items: Array<{ q: string; a: React.ReactNode }> = [
    {
      q: 'What is Borrow MUSD, in plain English?',
      a: (
        <>
          You lock <span className="text-[#f7931a] font-black">BTC</span> as collateral in a smart contract
          and the protocol mints <span className="text-white font-black">MUSD</span> — a USD-pegged stablecoin —
          against it. You keep your BTC exposure, get instant dollar liquidity, and pay back later to
          unlock the BTC. No middleman, no credit check, no expiry.
        </>
      ),
    },
    {
      q: 'How does the system actually work under the hood?',
      a: (
        <ul className="space-y-3 list-disc list-inside marker:text-[#f7931a]">
          <li>Your loan lives inside a personal vault called a <span className="text-white font-black">Trove</span> (one Trove per wallet).</li>
          <li><span className="text-white font-black">BorrowerOperations</span> is the contract you interact with — open, top-up, repay, close. It mints MUSD to you and stores your BTC.</li>
          <li><span className="text-white font-black">TroveManager</span> tracks the state of every Trove (collateral, debt, status).</li>
          <li><span className="text-white font-black">PriceFeed</span> reads the live BTC/USD oracle price and decides whether your Trove is healthy.</li>
          <li><span className="text-white font-black">SortedTroves + HintHelpers</span> keep Troves sorted by collateral-ratio so liquidations & insertions stay gas-cheap.</li>
        </ul>
      ),
    },
    {
      q: 'What is the Collateral Ratio (CR) and why does it matter?',
      a: (
        <>
          <p className="mb-3">
            CR = (BTC collateral value in USD) ÷ (MUSD debt). The protocol enforces a
            <span className="text-white font-black"> minimum 110% CR</span>. Drop below that and your Trove can be
            <span className="text-red-300 font-black"> liquidated</span> by anyone — they repay your debt and take your BTC.
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3">
              <div className="text-red-300 font-black text-[10px] uppercase tracking-widest">&lt; 110%</div>
              <div className="text-slate-400 mt-1">Liquidation zone</div>
            </div>
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3">
              <div className="text-amber-300 font-black text-[10px] uppercase tracking-widest">110–150%</div>
              <div className="text-slate-400 mt-1">Risky</div>
            </div>
            <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-3">
              <div className="text-green-300 font-black text-[10px] uppercase tracking-widest">&gt; 200%</div>
              <div className="text-slate-400 mt-1">Healthy</div>
            </div>
          </div>
        </>
      ),
    },
    {
      q: 'What fees do I pay?',
      a: (
        <ul className="space-y-2 list-disc list-inside marker:text-[#f7931a]">
          <li><span className="text-white font-black">Borrowing fee</span> — a one-time fee on the MUSD minted (a few %, set by the protocol). Shown in the preview before you confirm.</li>
          <li><span className="text-white font-black">Gas compensation</span> — a small fixed amount of MUSD (≈200) is locked at open. You get it back when you close the Trove. It funds liquidators who clean up bad debt.</li>
          <li><span className="text-white font-black">No interest</span> — there is no per-second interest. The cost is the one-time borrow fee.</li>
        </ul>
      ),
    },
    {
      q: 'What is the minimum I can borrow?',
      a: (
        <>
          The protocol enforces a <span className="text-white font-black">Minimum Net Debt</span> (e.g. 1,800 MUSD) so dust Troves
          don&apos;t spam the system. Your borrowed MUSD must be at least this amount, plus the borrowing fee, plus the gas
          compensation. The exact number is shown in the stats strip at the top of the page.
        </>
      ),
    },
    {
      q: 'Can I partially repay or top up collateral?',
      a: (
        <>
          Yes. You can <span className="text-white font-black">add BTC</span> to push your CR higher,
          <span className="text-white font-black"> withdraw BTC</span> if you&apos;re comfortably over-collateralized,
          <span className="text-white font-black"> borrow more MUSD</span>, or <span className="text-white font-black">repay part of the debt</span>.
          Partial repay <span className="text-amber-300 font-black">does NOT release your BTC</span> proportionally —
          your collateral stays locked until you fully close the Trove. Repaying only improves your CR (lower liquidation risk).
        </>
      ),
    },
    {
      q: 'How do I close the Trove and get my BTC back?',
      a: (
        <ol className="space-y-2 list-decimal list-inside marker:text-[#f7931a]">
          <li>Make sure your wallet holds enough MUSD to cover (debt − gas compensation).</li>
          <li>Click <span className="text-white font-black">APPROVE FULL</span> — this approves slightly more MUSD (+0.001) to avoid rounding mismatch.</li>
          <li>Click <span className="text-white font-black">CLOSE TROVE</span>. The protocol burns your MUSD, returns the gas compensation, and releases all BTC collateral.</li>
        </ol>
      ),
    },
    {
      q: 'What is liquidation and how do I avoid it?',
      a: (
        <>
          If BTC price drops and your CR falls under 110%, anyone can <span className="text-red-300 font-black">liquidate</span>
          your Trove: they repay your MUSD debt, claim your BTC collateral (plus a bonus). You lose the BTC but keep the borrowed MUSD.
          <span className="text-white font-black"> Avoid it by:</span> opening with a high CR (200%+), monitoring BTC price,
          and topping up collateral or repaying debt before the buffer gets thin.
        </>
      ),
    },
    {
      q: 'Where does this run? Is it the real Mezo protocol?',
      a: (
        <>
          Yes — these are the official <span className="text-white font-black">Mezo</span> borrowing contracts
          (a Liquity v2 fork tuned for BTC collateral on Mezo). TipHive&apos;s UI is a thin frontend on top.
          The dashboard auto-switches between <span className="text-white font-black">Mezo Testnet (matsnet)</span> and
          <span className="text-white font-black"> Mezo Mainnet</span> based on your wallet network. Addresses for the current
          network are listed at the bottom of this page.
        </>
      ),
    },
  ];

  return (
    <div className="bg-[#0f0f14] border border-white/5 rounded-3xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-[#f7931a]/10 border border-[#f7931a]/30 flex items-center justify-center text-[#f7931a]">
          <BookOpen size={18} />
        </div>
        <div>
          <h3 className="text-white font-black uppercase tracking-tighter text-2xl leading-none">How borrowing works</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.25em] mt-2">FAQ · Theory · Mechanics</p>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className={`rounded-2xl border transition-colors ${
                isOpen
                  ? 'bg-[#f7931a]/[0.04] border-[#f7931a]/30'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-4 p-4 md:p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black tabular-nums w-6 ${isOpen ? 'text-[#f7931a]' : 'text-slate-600'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={`font-black tracking-tight text-base md:text-lg ${isOpen ? 'text-white' : 'text-slate-300'}`}>
                    {it.q}
                  </span>
                </div>
                <ChevronDown
                  size={20}
                  className={`shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#f7931a]' : 'text-slate-500'}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pl-14 text-slate-400 text-sm md:text-[15px] leading-relaxed font-medium">
                      {it.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-500/[0.06] border border-amber-500/20 p-4">
        <HelpCircle size={18} className="text-amber-300 shrink-0 mt-0.5" />
        <p className="text-amber-100/80 text-xs md:text-sm font-medium leading-relaxed">
          <span className="text-amber-300 font-black">Not financial advice.</span> Borrowing against BTC is risky — if BTC price falls fast,
          your Trove can be liquidated and you lose collateral. Start small, keep CR comfortably above 200%, and only borrow what you can repay.{' '}
          <a
            href="https://mezo.org/docs/users/musd/mint-musd/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-amber-300 font-black underline underline-offset-2 hover:text-amber-200 transition"
          >
            Learn more about borrow <ExternalLink size={11} />
          </a>
        </p>
      </div>
    </div>
  );
}

function ComingSoon({ networkName }: { networkName: string }) {
  return (
    <div className="space-y-12 relative">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="px-4 md:px-0 space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-1 bg-[#f7931a] rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f7931a]">Mezo · Borrow Vault</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] flex flex-wrap gap-x-4">
          <span>Borrow</span><span className="text-[#f7931a]">MUSD</span>
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1a24] border border-white/5 rounded-3xl p-10 md:p-16 relative overflow-hidden text-center"
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#f7931a]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#f7931a]/5 blur-3xl pointer-events-none" />
        <div className="relative">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex w-24 h-24 rounded-3xl bg-[#0f0f14] border-2 border-[#f7931a]/40 items-center justify-center text-[#f7931a] mb-8 shadow-[0_0_40px_rgba(247,147,26,0.2)]"
          >
            <Lock size={40} />
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">Coming Soon</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium leading-relaxed mb-6">
            Borrow MUSD on <span className="text-[#f7931a]">{networkName}</span> is not live yet. The vault is fully functional on <span className="text-white font-black">Mezo Testnet</span> — switch your wallet network to try it out.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Pill icon={<Sparkles size={12} />} tone="orange">Mainnet — Coming Soon</Pill>
            <Pill icon={<ShieldCheck size={12} />} tone="white">Testnet — Live</Pill>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-network-switcher'))}
            className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-[#f7931a] text-black font-black uppercase tracking-tight text-sm py-4 px-6 hover:bg-[#ffa736] transition shadow-[0_0_30px_rgba(247,147,26,0.3)]"
          >
            <MUSDLogo className="w-4 h-4" /> Switch to Testnet
            <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
