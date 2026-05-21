<div align="center">

<img src="./public/logo.png" alt="TipHive Logo" width="100" />

# 🍯 TipHive

### **The Bitcoin-Native Creator Economy Engine — Powered by Mezo L2**

*Zero platform fees. Instant settlements. Absolute self-custody. Powered by MUSD.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Mezo L2](https://img.shields.io/badge/Mezo-L2-F7931A?logo=bitcoin)](https://mezo.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![SIWE](https://img.shields.io/badge/Auth-SIWE%20%2B%20Wallet-F7931A.svg)](https://eips.ethereum.org/EIPS/eip-4361)

</div>

---

## 📖 Introduction: What is TipHive?

TipHive is a **production-grade, decentralized creator monetization ecosystem** built directly on **Mezo L2 (the Bitcoin Economic Layer)**. It empowers creators — developers, writers, artists, streamers — to bypass extractive corporate gatekeepers and receive direct financial support from their audiences using **MUSD** (the price-stable digital currency backed by Bitcoin).

By replacing corporate payment processors with trustless, non-custodial Solidity smart contracts, TipHive guarantees **instant settlements, absolute censorship resistance, and zero platform cuts**. Creator income flows directly from supporters' wallets to creators' non-custodial smart vaults.

---

## ❌ The Problem & 🍯 TipHive Solution

| Metric / Feature                    | Traditional Platforms (Patreon, Twitch, Ko-fi)        | 🍯 TipHive Solution                                      |
| :---------------------------------- | :---------------------------------------------------- | :------------------------------------------------------- |
| **Platform Take Rate**        | 5% to 30% of every subscription or tip                | **0% Platform Tax — Creators keep 100%**          |
| **Payout Holding Period**     | 7 to 30 business days                                 | **Instant On-chain Settlement (< 5s)**             |
| **Account Freeze Risk**       | High (subject to arbitrary corporate bans/KYC blocks) | **Unstoppable & Non-Custodial (Sovereign Vaults)** |
| **Chargeback Fraud**          | High risk (supporters can reverse payments via banks) | **Zero Chargeback Risk (On-chain finality)**       |
| **Value Stability**           | Volatile crypto standard or high Web2 conversion fees | **Price-stable MUSD pegged 1:1 with USD**          |
| **Identity Provider Lock-in** | Email + password + corporate OAuth                    | **Wallet-only — Your keys, your account**         |

---

## 🔌 Core Systems & Web3 Architecture

TipHive uses a clean **wallet-native hybrid architecture** — on-chain for value, off-chain for speed.

```
 Supporters (Wagmi/Viem Client)
          │
          ├─► [1] Execute On-Chain TX (Tipping / Subscriptions) ─► Mezo L2 Blockchain
          │                                                              │
          │                                                              ▼ [Contract Event Logs]
          ├─► [3] Load Gated Media & Real-Time UI                   Custom Indexer Node
          │          ▲                                                   │
          │          │ Row-Level Security + wallet-bound API routes      ▼ [Insert/Update Cache]
          ▼          │                                                   │
   Next.js App Server ◄─── [2] Sync On-Chain Event State ───── Supabase PostgreSQL
```

### 1. Wallet-Only Identity (SIWE)

Identity is purely wallet-native. There is no email login, social login, password, or embedded wallet.

* **Sign-In With Ethereum (EIP-4361)**: On first visit, the user connects a wallet (MetaMask, Rainbow, Coinbase Wallet, Phantom, WalletConnect-compatible apps) and signs a one-time SIWE message. The server verifies the signature with viem's `verifyMessage`, validates the nonce, and issues a session cookie HMAC-signed with a server-side `WALLET_SESSION_SECRET`.
* **Session-Only Cookies**: The session cookie is set without `maxAge`, so it lives only as long as the browser session. Close the browser → re-sign next time. This eliminates the entire stolen-cookie replay window.
* **Wallet Mismatch Guard**: A client-side `WalletSwitchGuard` compares the session-bound wallet against the currently active wallet. Any mismatch triggers a forced sign-out + re-sign flow, preventing accidental cross-account actions.
* **Chain Lock**: Only Mezo Testnet (Chain ID `31611`) and Mezo Mainnet (Chain ID `31612`) are accepted in SIWE messages. Any other chain is rejected at verification time.

### 2. Supabase Cache & Row-Level Security

Supabase PostgreSQL acts as a high-performance off-chain cache for everything that doesn't need to be on-chain — profiles, posts, comments, in-app notifications.

* **Row-Level Security (RLS)**: All public tables enable RLS. Public reads are open where appropriate (profiles, posts, public tips ledger), but writes are gated through server-side API routes that verify the session cookie before issuing service-role queries.
* **Auto-Generated Metadata**: New wallets receive auto-mapped temporary usernames (`u_<address-slice>`) and DiceBear vector avatars so the onboarding flow lands the user inside the app in under 3 seconds.

### 3. High-Fidelity Content Gating

Creators publish posts with three visibility tiers:

1. **Public** — indexed in the explore feed for discoverability.
2. **Followers Only** — accessible to fans who follow the creator.
3. **Supporters Only** — cryptographically gated. The API verifies the viewer's active on-chain subscription before unsealing Cloudinary media URLs.

### 4. Post Content Sanitization (XSS-Hardened)

Rich-text post content from TipTap is HTML, so before rendering with `dangerouslySetInnerHTML` it passes through `isomorphic-dompurify` with a tightly scoped allowlist:

* Only safe tags (`p`, `h1-h6`, `strong`, `em`, `a`, `img`, `iframe`, …) survive.
* Iframes are restricted to YouTube, Vimeo, and Spotify embed domains.
* All `on*` event handlers, `javascript:` URLs, and `<script>` tags are stripped.

---

## ⛓️ Trustless Smart Contracts (Mezo L2)

### 1. Tipping Contract (`Tipping.sol`)

Direct one-time support via a **non-custodial, pull-based ledger** using the **Checks-Effects-Interactions (CEI)** pattern.

* **Non-Custodial Flow**: A fan's tip transfers MUSD into the contract and credits `creatorBalance[creator]`.
* **Sovereign Withdrawal**: Creators call `withdraw(amount)` to claim. The balance ledger is decremented *before* the ERC-20 transfer — reentrancy-safe.
* **Self-Tip Guard**: The contract refuses `_creator == msg.sender` to prevent self-tipping at the contract level. The frontend also blocks it before the wallet popup, so the user gets an immediate "Creators can't tip themselves" notification.

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

A production-grade recurring membership engine.

* **Deterministic 1-to-1 Mapping**: `subscriptions[subscriber][planId]` — exactly one subscription state per tier. No collisions, no double-billing.
* **EIP-2612 Atomic Permits (`subscribeWithPermit`)**: Bundles ERC-20 approval and subscription checkout into a single transaction using off-chain permit signatures.
* **Cancel-As-Designed Grace Periods**: Cancellation flips `autoRenew = false` but preserves access through the prepaid `endDate`.
* **Platform Fee Isolation**: Protocol fees capped at 5% and tracked separately in `platformFeesAccumulated`. Owner-only withdrawals can never touch creator vaults.
* **Self-Subscribe Guard**: Contract + frontend both block creators from subscribing to their own plans.

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

Creators export SVG/PNG QR codes from the dashboard for OBS overlays, business cards, and IRL stickers.

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
         └─► [subscriptions]      (mapped to subscription_plans)
```

* **`user_profiles`** — Identity cache (display name, bio, social links, avatar, suggested tip amounts).
* **`posts`** — Content with `visibility` ∈ `{public, followers, supporters}`.
* **`followers`** — Social graph mapping.
* **`tips`** — Off-chain index synced from contract events for fast feed rendering.
* **`subscriptions` / `subscription_plans`** — Active membership ledger, source-of-truth synced from on-chain.
* **`direct_messages`** — End-to-end chat protected by per-row RLS.
* **`notifications`** — In-app bell alerts (likes, comments, follows, tips). **No email transport** — all alerts surface inside the app.

---

## 🔒 Security Posture

| Layer                               | Mechanism                                                                                                                            |
| :---------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| **Session integrity**         | HMAC-SHA256 cookie signed with a required `WALLET_SESSION_SECRET` (≥ 32 chars). Throws at runtime if missing — no weak fallback. |
| **Session lifetime**          | Session-only cookie (no `maxAge`). Browser close = forced re-sign.                                                                 |
| **Wallet binding**            | SIWE message includes domain + nonce + chainId; server validates all four; nonce is single-use.                                      |
| **Mismatch detection**        | `WalletSwitchGuard` compares session wallet ↔ active wallet on every render; forces re-sign if they diverge.                      |
| **XSS**                       | All user-generated HTML (TipTap posts) passes through `isomorphic-dompurify` with iframe-host allowlist.                           |
| **Reentrancy**                | OpenZeppelin `ReentrancyGuard` on all state-changing contract methods. CEI pattern enforced.                                       |
| **Self-tip / self-subscribe** | Blocked at both contract level and frontend level with toast/banner notifications.                                                   |
| **RLS**                       | Row-Level Security enabled on every public table in Supabase.                                                                        |

---

## 🚀 Getting Started

### Prerequisites

* Node.js v20 or later
* A Web3 wallet (MetaMask, Rainbow, Coinbase, Phantom, or any WalletConnect-compatible app) configured with Mezo Mainnet (or Testnet for development)
* A Supabase project

### 1. Install Dependencies

```bash
cd web
npm install
```

### 2. Smart Contracts (Hardhat)

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
```

### 3. Database Setup

Execute these inside the Supabase SQL Editor:

1. Create tables (`user_profiles`, `posts`, `followers`, `tips`, `subscriptions`, `subscription_plans`, `notifications`, `direct_messages`).
2. Enable RLS on every public table.
3. Add the storage bucket for media uploads (if not using Cloudinary).

### 4. Environment Variables

Create `web/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Wallet Session (REQUIRED — server throws if missing or < 32 chars)
# Generate with:  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
WALLET_SESSION_SECRET=your-strong-random-base64-string

# WalletConnect
NEXT_PUBLIC_WC_PROJECT_ID=your-walletconnect-project-id

# Mezo Network — Testnet
NEXT_PUBLIC_TESTNET_RPC_URL=https://your-private-testnet-rpc
NEXT_PUBLIC_TESTNET_TIPPING_CONTRACT=0x...
NEXT_PUBLIC_TESTNET_SUBSCRIPTION_CONTRACT=0x...
NEXT_PUBLIC_TESTNET_MUSD_ADDRESS=0x...

# Mezo Network — Mainnet
NEXT_PUBLIC_MAINNET_RPC_URL=https://your-private-mainnet-rpc
NEXT_PUBLIC_MAINNET_TIPPING_CONTRACT=0x...
NEXT_PUBLIC_MAINNET_SUBSCRIPTION_CONTRACT=0x...
NEXT_PUBLIC_MAINNET_MUSD_ADDRESS=0x...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

> ⚠️ **Note on RPC URLs**: The public RPC endpoints baked into `src/lib/chains.ts` (`https://rpc.test.mezo.org` for testnet, `https://rpc-http.mezo.boar.network` for mainnet) are the URLs sent to the user's wallet when the chain is registered. The `NEXT_PUBLIC_*_RPC_URL` env values above are used by wagmi's transports for the app's own RPC calls.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Directory Structure

```
TipHive/
├── contracts/                  # Solidity Smart Contracts (Hardhat)
│   ├── Tipping.sol             # One-time tipping contract
│   ├── Subscription.sol        # Recurring subscription contract
│   ├── hardhat.config.js
│   └── scripts/                # Deploy & verify scripts
│
├── indexer/                    # On-chain event indexer
│
└── web/                        # Next.js 16 frontend + API
    ├── public/                 # Static assets (logo, manifest, icons)
    └── src/
        ├── app/
        │   ├── (api)/api/      # Serverless API routes
        │   │   ├── auth/       # SIWE: nonce, verify, session, logout
        │   │   ├── profile/    # Profile read/update + username check
        │   │   ├── notifications/  # In-app notification bell feed
        │   │   ├── referrals/  # Referral list endpoint
        │   │   ├── upload/     # Cloudinary signed-upload endpoint
        │   │   └── v1/         # Public widget JS + SVG button generator
        │   ├── [username]/     # Public creator profile + posts
        │   ├── dashboard/      # Creator dashboard (analytics, posts, inbox)
        │   ├── docs/           # In-app documentation pages
        │   ├── embed/          # Iframeable widget for external sites
        │   ├── editprofile/    # Profile editor (own profile only)
        │   ├── explore/        # Creator discovery feed
        │   ├── onboarding/     # First-time wallet sign-in flow
        │   ├── privacy/        # Privacy policy page
        │   ├── terms/          # Terms of service page
        │   └── cookies/        # Cookie policy page
        ├── components/
        │   ├── layout/         # Navbar, Footer, NetworkSwitcher, NotificationBell
        │   ├── providers/      # Web3Provider, OnboardingGuard, WalletSwitchGuard, PwaRegister
        │   ├── wallet/         # WalletProfileMenu
        │   ├── profile/        # SubscriptionSection
        │   ├── dashboard/      # SubscriptionManager, MySubscriptions, inbox/ChatWindow
        │   └── ui/             # Skeletons, Modals, Buttons, Pagination
        └── lib/
            ├── wallet-session.ts   # SIWE verify + HMAC session cookies
            ├── wallet-auth-shim.ts # Client wallet auth state hook
            ├── chains.ts           # Mezo chain definitions + RPC config
            ├── contracts.ts        # ABI + contract addresses
            ├── sanitize.ts         # DOMPurify wrapper for TipTap content
            ├── supabase.ts         # Anon + service-role clients
            └── hooks/              # useNetworkConfig, usePerformanceSettings
```

---

## 🧪 What's NOT in TipHive (Intentionally)

To keep the security surface tight, the following were considered and explicitly excluded:

* ❌ **No email login** — wallet-only identity. No magic links, no OAuth.
* ❌ **No transactional email** — all alerts are in-app notifications. No SendGrid, no Brevo, no third-party mail relay.
* ❌ **No social-login embedded wallets** — supporters use their own wallets.
* ❌ **No persistent session cookies** — browser close = re-sign.
* ❌ **No custodial vault** — tips go straight from supporter wallet to creator contract balance.

---

**Built with ❤️ for the Mezo L2 Global Hackathon.**
