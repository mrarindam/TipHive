<div align="center">

<img src="./public/logo.png" alt="TipHive Logo" width="110" />

# 🍯 TipHive

### **The Bitcoin-Native Creator Economy, Rebuilt on Mezo L2**

*Zero platform fees. Instant settlements. Absolute self-custody. Powered by MUSD.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-149ECA?logo=react)](https://react.dev/)
[![Mezo L2](https://img.shields.io/badge/Mezo-L2-F7931A?logo=bitcoin)](https://mezo.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![SIWE](https://img.shields.io/badge/Auth-SIWE%20%2B%20Wallet-F7931A.svg)](https://eips.ethereum.org/EIPS/eip-4361)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa)](./public/manifest.json)

</div>

---

## 📖 What is TipHive?

**TipHive** is a production-grade, fully decentralized creator monetization ecosystem built directly on **Mezo L2 — the Bitcoin Economic Layer**. It empowers creators (developers, writers, artists, streamers, educators) to bypass extractive corporate gatekeepers and receive direct financial support from their audience using **MUSD** — the price-stable digital currency backed by Bitcoin.

By replacing corporate payment processors with trustless, non-custodial Solidity smart contracts, TipHive guarantees **instant settlements, censorship resistance, and zero platform cuts**. Every cent of creator income flows directly from supporters' wallets to creators' sovereign smart vaults.

> **TipHive is more than tips.** It's a complete creator suite: tips, recurring memberships, gated content publishing, embeddable widgets, on-chain referrals, native MUSD borrowing against your BTC, and a unified Mezo ecosystem toolkit — all inside one Bitcoin-native app.

---

## ❌ The Problem & 🍯 The TipHive Solution

| Metric / Feature                  | Traditional Platforms (Patreon, Twitch, Ko-fi)        | 🍯 TipHive                                            |
| :-------------------------------- | :---------------------------------------------------- | :--------------------------------------------------- |
| **Platform Take Rate**            | 5% – 30% of every tip or subscription                 | **0% — Creators keep 100%**                          |
| **Payout Holding Period**         | 7 – 30 business days                                  | **Instant on-chain settlement (< 5s)**               |
| **Account Freeze Risk**           | High — arbitrary corporate bans, KYC blocks           | **Unstoppable & non-custodial (sovereign vaults)**   |
| **Chargeback Fraud**              | High — banks reverse payments months later            | **Zero chargeback risk (on-chain finality)**         |
| **Value Stability**               | Volatile crypto or expensive Web2 FX conversion fees  | **Price-stable MUSD, pegged 1:1 to USD**             |
| **Identity Provider Lock-in**     | Email + password + corporate OAuth                    | **Wallet-only — your keys, your account**            |
| **Liquidity for Creators**        | Forced into payout queues, can't borrow against earnings | **Native MUSD borrowing against BTC collateral**  |

---

## ✨ Full Feature Suite

### 🎁 For Supporters
- **One-Click Tipping** — Send MUSD tips with a single transaction, no signup, no email.
- **Recurring Memberships** — Subscribe to creator tiers; cancel any time and keep access until period ends.
- **Cross-Site Tipping** — Tip directly from a creator's blog, GitHub README, OBS overlay, or QR code.
- **Auto-Unlocking Content** — The moment you tip or subscribe, gated posts blur-fade open in real time.

### 🛠 For Creators
- **Creator Dashboard** — Earnings analytics, supporter feed, post manager, inbox, referral tracking.
- **Three-Tier Content Publishing** — Public, Supporters-Only, and Members-Only posts with rich-text + media.
- **Tip Circle** — A live map of who's backing your work, when, and how much.
- **Visual Toolkit** — Auto-generate embeddable buttons, JS widgets, and SVG/PNG QR codes for off-site monetization.
- **Borrow MUSD** — Open a Trove on Mezo's Liquity-style borrowing protocol against BTC collateral, directly inside TipHive.
- **Referrals** — Bring new creators on-chain and track conversions.
- **Direct Messages** — Private creator ↔ supporter chat backed by per-row RLS.
- **Sovereign Withdrawals** — Pull-based, reentrancy-safe withdrawal from your on-chain vault.

### 🌐 Platform
- **Mezo Toolkit Hub** — One-stop launcher for faucet, MUSD acquisition, borrowing, explorers, and docs.
- **Installable PWA** — Add TipHive to your home screen with offline-aware service worker.
- **Testnet ↔ Mainnet Switcher** — Built-in network switcher with chain-aware contract address routing.
- **Dark, Bitcoin-Themed UI** — Crafted with Tailwind v4, Framer Motion, and GSAP transitions.

---

## 🔌 Core Systems & Web3 Architecture

TipHive uses a clean **wallet-native hybrid architecture** — on-chain for value, off-chain for speed.

```
 Supporters (Wagmi / Viem Client)
          │
          ├─► [1] Execute On-Chain TX (Tipping / Subs / Borrow) ─► Mezo L2 Blockchain
          │                                                              │
          │                                                              ▼ [Contract Event Logs]
          ├─► [3] Load Gated Media & Real-Time UI                        │
          │          ▲                                                   │
          │          │ Row-Level Security + wallet-bound API routes      ▼ [Cache State]
          ▼          │                                                   │
   Next.js App Server ◄─── [2] Read On-Chain State + Sync ────── Supabase PostgreSQL
```

### 1. Wallet-Only Identity (SIWE)

Identity is purely wallet-native. There is no email login, social login, password, or embedded wallet.

- **Sign-In With Ethereum (EIP-4361)** — On first visit the user connects a wallet (MetaMask, Rainbow, Coinbase, Phantom, WalletConnect-compatible) and signs a one-time SIWE message. The server verifies the signature with viem's `verifyMessage`, validates the nonce, and issues a session cookie HMAC-signed with a server-side `WALLET_SESSION_SECRET`.
- **Session-Only Cookies** — Cookie is set without `maxAge`, living only as long as the browser session. Close the browser → re-sign next time. Stolen-cookie replay window: eliminated.
- **Wallet Mismatch Guard** — A client-side `WalletSwitchGuard` compares the session-bound wallet against the active wallet on every render. Any mismatch forces a sign-out + re-sign, preventing accidental cross-account actions.
- **Chain Lock** — Only Mezo Testnet (`31611`) and Mezo Mainnet (`31612`) are accepted in SIWE messages. Any other chain is rejected at verification time.

### 2. Supabase Cache & Row-Level Security

Supabase PostgreSQL acts as a high-performance off-chain cache for everything that doesn't need to live on-chain — profiles, posts, comments, in-app notifications.

- **Row-Level Security (RLS)** — All public tables enable RLS. Public reads are open where appropriate (profiles, posts, public tips ledger), writes are gated through server-side API routes that verify the session cookie before issuing service-role queries.
- **Auto-Generated Metadata** — New wallets receive auto-mapped temporary usernames (`u_<address-slice>`) and DiceBear vector avatars so onboarding lands the user inside the app in under 3 seconds.

### 3. High-Fidelity Content Gating

Creators publish posts with three visibility tiers (internal IDs preserved for backward compatibility; display labels refreshed for clarity):

1. **Public** — Indexed in the explore feed for discoverability. Visible to everyone.
2. **Supporters Only** *(internal ID: `followers`)* — Accessible to **both tippers and members**. Anyone who has ever sent the creator a tip OR holds an active subscription can view.
3. **Members Only** *(internal ID: `supporters`)* — Gated to **active paid subscribers only**. The API verifies the viewer's active on-chain subscription before unsealing Cloudinary media URLs.

> **Auto-Unlock on Buy** — Locks resolve instantly on tip or subscription success via cross-component `tip-success` / `subscription-success` custom events — no page reload needed. Blurred thumbnails on `/explore`, `/[username]`, and `/[username]/posts` un-blur the moment the on-chain transaction lands.

### 4. Post Content Sanitization (XSS-Hardened)

Rich-text post content from TipTap is HTML, so before rendering with `dangerouslySetInnerHTML` it passes through `isomorphic-dompurify` with a tightly scoped allowlist:

- Only safe tags (`p`, `h1-h6`, `strong`, `em`, `a`, `img`, `iframe`, …) survive.
- Iframes are restricted to YouTube, Vimeo, and Spotify embed domains.
- All `on*` event handlers, `javascript:` URLs, and `<script>` tags are stripped.

---

## ⛓️ Trustless Smart Contracts (Mezo L2)

### 1. Tipping Contract (`Tipping.sol`)

Direct one-time support via a **non-custodial, pull-based ledger** using the **Checks-Effects-Interactions (CEI)** pattern.

- **Non-Custodial Flow** — A fan's tip transfers MUSD into the contract and credits `creatorBalance[creator]`.
- **Sovereign Withdrawal** — Creators call `withdraw(amount)` to claim. The balance ledger is decremented *before* the ERC-20 transfer — reentrancy-safe.
- **Self-Tip Guard** — The contract refuses `_creator == msg.sender` to prevent self-tipping at the contract level. The frontend also blocks it before the wallet popup so the user gets an immediate "Creators can't tip themselves" notification.
- **On-Chain Tip History** — Every tip is appended to a paginated `tipHistory` array (`getTipHistory(offset, limit)`) for verifiable, censorship-resistant audits.

```solidity
function tip(address _creator, uint256 _amount) external nonReentrant {
    require(_amount > 0, "Tip must be > 0");
    require(_creator != msg.sender, "Cannot tip yourself");

    require(musd.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

    creatorBalance[_creator] += _amount;
    emit TipReceived(msg.sender, _creator, _amount, block.timestamp);
}

function withdraw(uint256 _amount) external nonReentrant {
    require(creatorBalance[msg.sender] >= _amount, "Insufficient balance");

    creatorBalance[msg.sender] -= _amount;
    creators[msg.sender].withdrawnAmount += _amount;

    require(musd.transfer(msg.sender, _amount), "Withdrawal failed");
    emit Withdrawal(msg.sender, _amount);
}
```

### 2. SubscriptionV2 Contract (`Subscription.sol`)

A production-grade recurring membership engine with a clean 3-state lifecycle: `ACTIVE → CANCELLED → EXPIRED`.

- **Deterministic 1-to-1 Mapping** — `subscriptions[subscriber][planId]` — exactly one subscription state per tier. No collisions, no double-billing.
- **EIP-2612 Atomic Permits (`subscribeWithPermit`)** — Bundles ERC-20 approval and subscription checkout into a single transaction using off-chain permit signatures.
- **Cancel-As-Designed Grace Periods** — Cancellation flips `autoRenew = false` but preserves access through the prepaid `endDate`. No mid-cycle terminations.
- **Platform Fee Isolation** — Protocol fees capped at 5% and tracked separately in `platformFeesAccumulated`. Owner-only withdrawals can never touch creator vaults.
- **Self-Subscribe Guard** — Contract + frontend both block creators from subscribing to their own plans.

---

## 🏦 Native MUSD Borrowing (Trove Integration)

TipHive includes a first-class integration with **Mezo's Liquity-style borrowing protocol**, letting creators (or anyone) **open a Trove and mint MUSD against BTC collateral** without leaving the app.

Available at `/dashboard/borrow-musd`, the borrow page calls directly into the official Mezo contracts:

- `BorrowerOperations` — `openTrove`, `closeTrove`, `addColl`, `withdrawColl`, `withdrawMUSD`, `repayMUSD`, `adjustTrove`
- `TroveManager` — Position queries (debt, collateral, ICR, status)
- `HintHelpers` + `SortedTroves` — On-chain hint computation for gas-efficient Trove insertion
- `PriceFeed` — Live BTC/USD price feed for collateral valuation

Built-in client-side safety:
- Live collateral ratio (CR) tone classification: **safe ≥ 150%**, **warn ≥ 120%**, **danger < 120%**
- Minimum Collateral Ratio (MCR) enforcement at the wagmi call site (`MIN_CR_BPS = 110%`)
- 200 MUSD gas-compensation reservation tracked separately
- Hint generation via `getApproxHint` with 15 trial rounds for near-optimal insertion gas

This means a creator can: **earn tips → borrow MUSD against BTC → keep earning interest on BTC → repay later** — all on Mezo L2, all from one wallet, all from one dashboard.

---

## 🔌 Embed Widgets & Public API

External sites can integrate TipHive without iframe friction.

### 1. Dynamic SVG Badge Generator

```
GET /api/v1/button?slug=USERNAME&color=F7931A&text=Support+Me&emoji=⚡
```

Returns a vector SVG badge — drop it into a GitHub README or portfolio sidebar.

### 2. Embeddable Tipping Widget

```html
<script
  src="https://tiphive.xyz/api/v1/widget"
  data-name="tiphive-button"
  data-slug="YOUR_USERNAME"
  data-color="f7931a"
  data-text="Support My Work"
  data-emoji="⚡"
  async>
</script>
```

The widget renders inside any third-party site. Visitors connect their wallet, approve MUSD, and tip — all without leaving the host page. SIWE is intentionally skipped inside `/embed/*` routes; the on-chain transaction itself is the proof.

### 3. Vector QR Code Generator

Creators export SVG/PNG QR codes from the Visual Toolkit for OBS overlays, business cards, IRL stickers, and merch.

---

## 🎨 Creator Dashboard

A single, polished workspace for every creator action:

| Section                                         | What lives here                                                                              |
| :---------------------------------------------- | :------------------------------------------------------------------------------------------- |
| `/dashboard`                                    | Overview, vault balance, withdraw, earnings snapshot                                         |
| `/dashboard/posts` + `/dashboard/createposts`   | Three-tier post manager and TipTap-powered rich editor                                       |
| `/dashboard/subscriptions`                      | Create + edit subscription plans, view active members                                        |
| `/dashboard/mysubsriptions`                     | Subscriptions you hold on other creators                                                     |
| `/dashboard/tipcircle`                          | Live ledger of every tip received, supporter ranking, suggested-amount settings              |
| `/dashboard/sentsupport`                        | Outgoing tip + subscription history                                                          |
| `/dashboard/activityfeed`                       | Unified on-chain + off-chain activity timeline                                               |
| `/dashboard/earninganalysis`                    | Chart.js-powered analytics for MUSD earnings over time                                       |
| `/dashboard/inbox`                              | Real-time creator ↔ supporter direct messages (RLS-protected)                              |
| `/dashboard/visual-toolkit`                     | Button generator, embeddable JS widget, QR code exporter                                     |
| `/dashboard/referrals`                          | Track who you've onboarded and the volume they've generated                                  |
| `/dashboard/borrow-musd`                        | Open / manage a Mezo Trove against BTC collateral                                            |

---

## 📊 Database Schema (Supabase PostgreSQL)

```
  [user_profiles] (wallet_address as canonical key)
         │
         ├─► [posts]              (creator publications, three visibility tiers)
         ├─► [followers]          (many-to-many social graph)
         ├─► [tips]               (off-chain index of on-chain tip events)
         ├─► [direct_messages]    (creator ↔ fan chat)
         ├─► [notifications]      (in-app alerts only — no email transport)
         ├─► [referrals]          (creator-to-creator referral graph)
         └─► [subscriptions]      (mapped to subscription_plans)
```

- **`user_profiles`** — Identity cache (display name, bio, social links, avatar, banner, suggested tip amounts).
- **`posts`** — Content with `visibility` ∈ `{public, followers, supporters}` (display labels: *Public*, *Supporters Only*, *Members Only*).
- **`followers`** — Social graph mapping.
- **`tips`** — Off-chain index synced from contract events for fast feed rendering.
- **`subscriptions` / `subscription_plans`** — Active membership ledger; source-of-truth synced from on-chain.
- **`direct_messages`** — End-to-end chat protected by per-row RLS.
- **`notifications`** — In-app bell alerts (likes, comments, follows, tips). **No email transport** — all alerts surface inside the app.
- **`referrals`** — Tracks creator-to-creator referral conversions.

---

## 🔒 Security Posture

| Layer                          | Mechanism                                                                                                                              |
| :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| **Session integrity**          | HMAC-SHA256 cookie signed with a required `WALLET_SESSION_SECRET` (≥ 32 chars). Throws at runtime if missing — no weak fallback.       |
| **Session lifetime**           | Session-only cookie (no `maxAge`). Browser close = forced re-sign.                                                                     |
| **Wallet binding**             | SIWE message includes domain + nonce + chainId; server validates all four; nonce is single-use.                                        |
| **Mismatch detection**         | `WalletSwitchGuard` compares session wallet ↔ active wallet on every render; forces re-sign if they diverge.                          |
| **XSS**                        | All user-generated HTML (TipTap posts) passes through `isomorphic-dompurify` with iframe-host allowlist.                              |
| **Reentrancy**                 | OpenZeppelin `ReentrancyGuard` on every state-changing contract method. CEI pattern enforced.                                          |
| **Self-tip / self-subscribe**  | Blocked at both contract level and frontend level with toast / banner notifications.                                                   |
| **Trove safety**               | Client-side MCR enforcement (`MIN_CR_BPS = 110%`) before the wagmi call ever fires.                                                    |
| **RLS**                        | Row-Level Security enabled on every public table in Supabase.                                                                          |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js v20+**
- A Web3 wallet (MetaMask, Rainbow, Coinbase, Phantom, or any WalletConnect-compatible app) configured with Mezo Mainnet (or Testnet for development)
- A **Supabase** project
- A **Cloudinary** account (for media uploads)

### 1. Clone the Repository

```bash
git clone https://github.com/mrarindam/TipHive.git
cd TipHive
```

### 2. Install Dependencies

A single `npm install` from inside `web/` installs **everything** — Next.js, wagmi, Hardhat, OpenZeppelin contracts, ethers, all toolbox plugins — under one unified `node_modules`.

```bash
cd web
npm install
```

### 3. Smart Contracts (Hardhat)

The Hardhat workspace lives at `web/contracts/` and shares the root `node_modules`. Run from inside `web/`:

```bash
npm run contracts:compile           # hardhat compile
npm run contracts:test              # hardhat test
npm run contracts:deploy:testnet    # deploy SubscriptionV2 to Mezo Testnet
npm run contracts:deploy:mainnet    # deploy to Mezo Mainnet
```

### 4. Database Setup

Execute these in the Supabase SQL Editor:

1. Create tables: `user_profiles`, `posts`, `followers`, `tips`, `subscriptions`, `subscription_plans`, `notifications`, `direct_messages`, `referrals`.
2. Enable RLS on every public table.
3. Add the storage bucket for media uploads (if not using Cloudinary).

### 5. Environment Variables

Create `web/.env.local`:

```env
# ── Supabase ────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ── Wallet Session (REQUIRED — server throws if missing or < 32 chars)
# Generate with:  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
WALLET_SESSION_SECRET=your-strong-random-base64-string

# ── WalletConnect ───────────────────────────────────────────────
NEXT_PUBLIC_WC_PROJECT_ID=your-walletconnect-project-id

# ── Mezo Network — Testnet ──────────────────────────────────────
NEXT_PUBLIC_TESTNET_RPC_URL=https://your-private-testnet-rpc
NEXT_PUBLIC_TESTNET_TIPPING_CONTRACT=0x...
NEXT_PUBLIC_TESTNET_SUBSCRIPTION_CONTRACT=0x...
NEXT_PUBLIC_TESTNET_MUSD_ADDRESS=0x...

# Borrow / Trove (Mezo Testnet)
NEXT_PUBLIC_TESTNET_BORROWER_OPERATIONS=0x...
NEXT_PUBLIC_TESTNET_TROVE_MANAGER=0x...
NEXT_PUBLIC_TESTNET_HINT_HELPERS=0x...
NEXT_PUBLIC_TESTNET_SORTED_TROVES=0x...
NEXT_PUBLIC_TESTNET_PRICE_FEED=0x...

# ── Mezo Network — Mainnet ──────────────────────────────────────
NEXT_PUBLIC_MAINNET_RPC_URL=https://your-private-mainnet-rpc
NEXT_PUBLIC_MAINNET_TIPPING_CONTRACT=0x...
NEXT_PUBLIC_MAINNET_SUBSCRIPTION_CONTRACT=0x...
NEXT_PUBLIC_MAINNET_MUSD_ADDRESS=0x...

# Borrow / Trove (Mezo Mainnet)
NEXT_PUBLIC_MAINNET_BORROWER_OPERATIONS=0x...
NEXT_PUBLIC_MAINNET_TROVE_MANAGER=0x...
NEXT_PUBLIC_MAINNET_HINT_HELPERS=0x...
NEXT_PUBLIC_MAINNET_SORTED_TROVES=0x...
NEXT_PUBLIC_MAINNET_PRICE_FEED=0x...

# ── Cloudinary ──────────────────────────────────────────────────
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

> ⚠️ **Note on RPC URLs** — The public RPC endpoints baked into `src/lib/chains.ts` (`https://rpc.test.mezo.org` for testnet, `https://rpc-http.mezo.boar.network` for mainnet) are the URLs sent to the user's wallet when the chain is registered. The `NEXT_PUBLIC_*_RPC_URL` env values above are used by wagmi's transports for the app's own RPC calls.

### 6. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🧰 Tech Stack

| Layer            | Stack                                                                                |
| :--------------- | :----------------------------------------------------------------------------------- |
| **Frontend**     | Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS v4                  |
| **Animation**    | Framer Motion · GSAP                                                                  |
| **Web3**         | wagmi · viem · RainbowKit · WalletConnect v2                                          |
| **Editor**       | TipTap 3 (StarterKit, Image, YouTube, Link, Code, Highlight, Color, Underline)        |
| **Data**         | Supabase PostgreSQL (RLS) · TanStack Query · Cloudinary (media CDN)                  |
| **Charts & UX**  | Chart.js + react-chartjs-2 · react-easy-crop · qr-code-styling · emoji-mart           |
| **Auth**         | EIP-4361 SIWE · HMAC-SHA256 session cookies                                          |
| **Contracts**    | Solidity ^0.8.19 · OpenZeppelin (ReentrancyGuard, Ownable, IERC20, IERC20Permit) · Hardhat |
| **Security**     | isomorphic-dompurify (XSS) · Row-Level Security · WalletSwitchGuard                  |
| **PWA**          | Manifest + Service Worker (`/public/sw.js`)                                          |

---

## 📁 Directory Structure

All Next.js + Hardhat code lives inside a single unified workspace at the repo root (`web/`). Solidity contracts share the same `node_modules` and `package.json` as the frontend — one install, one place.

```
TipHive/                             # Repo root
└── web/                             # Unified Next.js 16 + Hardhat workspace
    ├── package.json                 # Single manifest (Next + Hardhat deps)
    ├── node_modules/                # Single dependency tree
    ├── .env.local                   # Shared env (consumed by Next + Hardhat)
    ├── next.config.ts               # Next.js config
    ├── tsconfig.json                # TypeScript config
    ├── eslint.config.mjs            # ESLint config
    ├── postcss.config.mjs           # Tailwind v4 / PostCSS config
    │
    ├── contracts/                   # Hardhat project (shares root node_modules)
    │   ├── hardhat.config.js        # Solc 0.8.19 + Mezo testnet/mainnet networks
    │   ├── contracts/               # Solidity sources
    │   │   ├── Tipping.sol          # One-time tipping contract
    │   │   └── Subscription.sol     # SubscriptionV2 — recurring memberships
    │   └── scripts/                 # Deploy & verify scripts
    │       ├── deploySubscription.js
    │       ├── deployMainnet.js
    │       ├── deployment.json
    │       └── deployment_mainnet.json
    │
    ├── public/                      # PWA manifest, service worker, logos, icons
    │
    └── src/
        ├── app/
        │   ├── (api)/api/           # Serverless API routes
        │   │   ├── auth/            # SIWE: nonce, verify, session, logout
        │   │   ├── profile/         # Profile read/update + username check
        │   │   ├── notifications/   # In-app notification bell feed
        │   │   ├── referrals/       # Referral list endpoint
        │   │   ├── plans/           # Subscription plan CRUD
        │   │   ├── subscriptions/   # Subscription read endpoints
        │   │   ├── og/              # Open Graph image generators
        │   │   ├── upload/          # Cloudinary signed-upload endpoint
        │   │   └── v1/              # Public widget JS + SVG button generator
        │   ├── [username]/          # Public creator profile + posts / members / subscriptions
        │   ├── dashboard/
        │   │   ├── activityfeed/    # Unified on/off-chain activity stream
        │   │   ├── borrow-musd/     # Mezo Trove (open/adjust/close)
        │   │   ├── createposts/     # TipTap-powered post composer
        │   │   ├── earninganalysis/ # Chart.js earnings analytics
        │   │   ├── inbox/           # Direct messages
        │   │   ├── mysubsriptions/  # Subscriptions you hold
        │   │   ├── posts/           # Your post manager
        │   │   ├── referrals/       # Referral tracking
        │   │   ├── sentsupport/     # Outgoing support history
        │   │   ├── subscriptions/   # Plan management
        │   │   ├── tipcircle/       # Live tip ledger + supporter ranking
        │   │   └── visual-toolkit/  # Buttons, widgets, QR codes
        │   ├── mezo-toolkit/        # Mezo ecosystem launcher hub
        │   ├── docs/                # In-app documentation pages
        │   ├── embed/               # Iframeable widget for external sites
        │   ├── editprofile/         # Profile editor (own profile only)
        │   ├── explore/             # Creator discovery feed
        │   ├── onboarding/          # First-time wallet sign-in flow
        │   ├── about/ contact/      # Marketing pages
        │   ├── privacy/ terms/ cookies/  # Legal pages
        │   ├── HomePageClient.tsx   # Landing page
        │   ├── layout.tsx           # Root layout + providers
        │   ├── opengraph-image.tsx  # Auto OG image generator
        │   ├── sitemap.ts robots.ts # SEO
        │   └── globals.css
        ├── components/
        │   ├── layout/              # Navbar, Footer, NetworkSwitcher, NotificationBell
        │   ├── providers/           # Web3Provider, OnboardingGuard, WalletSwitchGuard, PwaRegister
        │   ├── wallet/              # WalletProfileMenu
        │   ├── profile/             # SubscriptionSection
        │   ├── dashboard/           # SubscriptionManager, MySubscriptions, Analytics, inbox/ChatWindow
        │   ├── modals/              # Tip modals, Subscribe modals
        │   ├── performance/         # Perf-aware wrappers
        │   ├── ui/                  # Skeletons, Modals, Buttons, Pagination, MUSDLogo
        │   └── GsapStackingCards.tsx
        └── lib/
            ├── wallet-session.ts    # SIWE verify + HMAC session cookies
            ├── wallet-auth-shim.ts  # Client wallet auth state hook
            ├── chains.ts            # Mezo chain definitions + RPC config
            ├── contracts.ts         # Tipping + Subscription ABIs + addresses
            ├── borrow-contracts.ts  # Mezo Trove ABIs + addresses + constants
            ├── sanitize.ts          # DOMPurify wrapper for TipTap content
            ├── supabase.ts          # Anon + service-role clients
            ├── cropImage.ts         # react-easy-crop helper
            ├── og-pages.ts          # OG image data mapping
            └── hooks/               # useNetworkConfig, usePerformanceSettings
```

---

## 🤝 Contributing

Pull requests welcome. For substantial changes, please open an issue first to discuss what you'd like to change. Make sure tests pass and the contracts compile cleanly under Hardhat.

---

<div align="center">

**Built with ❤️ for the Mezo L2 Global Hackathon.**

*Bitcoin earned it. Bitcoin keeps it.*

</div>
