<div align="center">

<img src="./public/logo.png" alt="TipHive Logo" width="100" />

# 🍯 TipHive

### **The Bitcoin-Native Creator Economy Engine — Powered by Mezo L2**

*Zero platform fees. Instant settlements. Absolute self-custody. Powered by MUSD.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Mezo L2](https://img.shields.io/badge/Mezo-L2-F7931A?logo=bitcoin)](https://mezo.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Privy](https://img.shields.io/badge/Auth-Privy-indigo.svg)](https://www.privy.io/)

</div>

---

## 📖 Introduction: What is TipHive?

TipHive is a **production-grade, decentralized creator monetization ecosystem** built directly on **Mezo L2 (the Bitcoin Economic Layer)**. It empowers creators—including developers, writers, artists, and streamers—to bypass extractive corporate gatekeepers and receive direct financial support from their audiences using **MUSD** (the price-stable digital currency backed by Bitcoin).

By replacing corporate payment processors with trustless, non-custodial Solidity smart contracts, TipHive guarantees **instant settlements, absolute censorship resistance, and zero platform cuts**. Creator income goes directly from the supporters' wallets to the creators' non-custodial smart vaults.

---

## ❌ The Problem & 🍯 TipHive Solution

| Metric / Feature                | Traditional Platforms (Patreon, Twitch, Ko-fi)        | 🍯 TipHive Solution                                      |
| :------------------------------ | :---------------------------------------------------- | :------------------------------------------------------- |
| **Platform Take Rate**    | 5% to 30% of every subscription or tip                | **0% Platform Tax — Creators keep 100%**          |
| **Payout Holding Period** | 7 to 30 business days                                 | **Instant On-chain Settlement (<5s)**              |
| **Account Freeze Risk**   | High (subject to arbitrary corporate bans/KYC blocks) | **Unstoppable & Non-Custodial (Sovereign Vaults)** |
| **Chargeback Fraud**      | High risk (supporters can reverse payments via banks) | **Zero Chargeback Risk (On-chain finality)**       |
| **Value Stability**       | Volatile crypto standard or high Web2 conversion fees | **Price-stable MUSD pegged 1:1 with USD**          |

---

## 🔌 Core Systems & Web2.5 Architecture

TipHive leverages a state-of-the-art **Web2.5 Hybrid Architecture** designed to deliver a modern, lightning-fast user experience with absolute Web3 security and decentralization at its foundation.

```
 Supporters (Wagmi/Viem Client)
          │
          ├─► [1] Execute On-Chain TX (Tipping / Subscriptions) ─► Mezo L2 Blockchain
          │                                                               │
          │                                                               ▼ [Contract Event Logs]
          ├─► [3] Load Gated Media & Real-Time Chat                   Custom Indexer Node
          │          ▲                                                    │
          │          │ RLS Rules (auth.uid() = Wallet DID)                ▼ [Insert/Update Cache]
          ▼          │                                                    │
   Next.js App Server ◄─── [2] Sync On-Chain Event State ───────── Supabase PostgreSQL
```

### 1. Wallet-Centric Web3 Identity (Privy)

Identity is managed via a secure hybrid onboarding setup powered by **Privy**.

* **Sessional Wallet Flow**: Privy is initialized with `createOnLogin: 'off'` in `PrivyProviderWrapper.tsx`. This configuration ensures that while social/email sign-ins can establish a database profile (DID), **creators and fans must explicitly connect their external Web3 wallets** (MetaMask, Rainbow, Coinbase Wallet) to sign transactions, perform on-chain checkout, or withdraw creator earnings.
* **Wallet Network Guardrails**: The frontend implements a strict `WalletSwitchGuard.tsx` to automatically intercept operations and force wallet connections to the correct **Mezo Testnet (Chain ID: 31611)** or **Mezo Mainnet (Chain ID: 31612)** networks, ensuring zero lost gas fees.

### 2. Supabase Real-Time Cache & PostgreSQL Triggers

To avoid slow blockchain latency when browsing creators, TipHive uses **Supabase** as a high-performance database cache.

* **Row-Level Security (RLS)**: Protects all user data. Reading creator profile layouts and public content is open to the public, but inserting posts, sending direct messages, or updating custom tipping metrics requires a authenticated JWT signed by the user's verified Privy DID wallet.
* **Auto-Generated Metadata**: New wallet profiles automatically receive unique, randomly mapped user handles and vector avatars (via DiceBear CDN) to ensure an instantaneous onboarding flow.

### 3. High-Fidelity Content Gating

Creators can publish content posts with three distinct visibility modes:

1. **Public**: Indexed in the explore feeds to drive discoverability.
2. **Followers Only**: Accessible to any fan who follows the creator (driving social loops).
3. **Supporters Only**: Cryptographically protected. The Next.js API router verifies the client session, queries the active subscription on-chain or inside the database cache, and serves the Cloudinary media links (images/videos/audios) only to verified active members of that tier.

---

## ⛓️ Trustless Smart Contracts (Mezo L2)

TipHive's financial operations are governed by audited, non-custodial smart contracts deployed on the Mezo network.

### 1. Tipping Contract (`Tipping.sol`)

Enables direct one-time support. It utilizes a **non-custodial, pull-based ledger** using the **Checks-Effects-Interactions (CEI)** pattern to defend against reentrancy vectors.

* **Non-Custodial Flow**: When a fan tips a creator, MUSD is transferred from their wallet into the contract, and the balance is credited to `creatorBalance[creator]`.
* **Sovereign Withdrawal**: Creators call `withdraw(amount)` to retrieve their funds. The contract decrements the balance ledger *before* sending the ERC-20 transfer, guaranteeing protection against reentrancy exploits.

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

    // Effects (CEI Pattern)
    creatorBalance[msg.sender] -= _amount;
    creators[msg.sender].withdrawnAmount += _amount;

    // Interaction
    require(musd.transfer(msg.sender, _amount), "Withdrawal failed");
    emit Withdrawal(msg.sender, _amount);
}
```

---

### 2. SubscriptionV2 Contract (`Subscription.sol`)

A production-grade recurring membership engine. Overhauled to solve common Web3 subscription friction points, offering premium safeguards for creators and supporters alike.

* **Deterministic 1-to-1 Mapping**: Instead of using fragile dynamic auto-incrementing subscription IDs that create chaotic off-chain state caches, memberships are mapped deterministically via:
  ```solidity
  mapping(address => mapping(uint256 => SubscriptionRecord)) public subscriptions;
  ```

  A supporter maps to exactly one subscription state per tier (`subscriptions[subscriber][planId]`), completely eliminating duplicate subscriptions, double-billing, or transaction collisions.
* **EIP-2612 Atomic Permits (`subscribeWithPermit`)**: Removes the tedious two-step approval flow. By acquiring an off-chain signature from the supporter, the frontend can bundle ERC-20 token approval and subscription checkout into a **single on-chain transaction**, cutting gas costs in half and matching the fluid checkout UX of Web2.
  ```solidity
  function subscribeWithPermit(
      uint256 _planId,
      uint256 _amount,
      uint256 _deadline,
      uint8   _v,
      bytes32 _r,
      bytes32 _s
  ) external nonReentrant returns (bytes32 subId) {
      // Execute the off-chain signed approval on-chain in 1 click
      musdPermit.permit(msg.sender, address(this), _amount, _deadline, _v, _r, _s);

      Plan memory plan = plans[_planId];
      require(_amount == plan.price, "Permit amount != plan price");

      subId = _subscribe(msg.sender, _planId);
  }
  ```
* **Cancel-As-Designed Grace Periods**: In traditional smart contracts, calling "cancel" revokes immediate access. SubscriptionV2 decouples auto-renewal status from expiration:
  ```solidity
  sub.autoRenew = false;
  ```

  The user's auto-renewal flag is disabled, but their access remains fully valid until their prepaid `endDate` passes.
* **Platform Fee Safety Isolation**: To guarantee that contract owners cannot accidentally drain creator funds, the contract limits protocol fees to a maximum of 5% and tracks them separately inside `platformFeesAccumulated`. The owner can only withdraw protocol fees, leaving creator vaults completely untouched and isolated.
  ```solidity
  function withdrawPlatformFees(uint256 _amount) external onlyOwner nonReentrant {
      require(_amount <= platformFeesAccumulated, "Exceeds accumulated fees");
      platformFeesAccumulated -= _amount;
      require(musd.transfer(msg.sender, _amount), "Transfer failed");
  }
  ```

---

## 🔌 Unified API & Embed Widgets V1

TipHive includes a public REST and embeddable assets layer to allow creators to integrate tipping metrics anywhere.

### 1. Dynamic SVG Badge Generator

Generates live-updating SVG badges displaying creator supporter counts and branding configurations.

```
GET /api/v1/button?slug=USERNAME&color=F7931A&text=Support+Me&emoji=⚡
```

* **Response**: `image/svg+xml` — A beautifully rendered vector badge, perfect for embedding inside GitHub readmes, personal portfolios, or blog sidebars.

### 2. Embeddable JavaScript Widget

A secure loader script that injects a fully functional, sleek tipping modal anywhere.

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

### 3. Vector QR Code Generator

Allows creators to export SVG/PNG QR codes from their dashboard. Streamers can easily overlay these graphics onto OBS/Streamlabs overlays, and writers can print them on business cards for instant mobile tipping.

---

## 📊 Database Schema & RLS Policies

TipHive's PostgreSQL cache utilizes a clean relational schema protected by granular RLS policies.

```
  [user_profiles] (Privy DID key)
         │
         ├─► [posts] (One-to-Many creator publications)
         ├─► [followers] (Many-to-Many social relationships)
         ├─► [tips] (One-to-Many on-chain tip records)
         ├─► [direct_messages] (Sovereign fan-creator chat)
         └─► [subscriptions] (Many-to-One mapped to subscription_plans)
```

### Relational Tables & Rules

#### `user_profiles`

* **Purpose**: Identity cache (display names, bio details, customizable tipping buttons).
* **RLS Constraint**: `SELECT` is public. `INSERT`/`UPDATE` requires the authenticated Privy DID to match the row's primary key owner.

#### `posts`

* **Purpose**: Creator posts & media metadata.
* **RLS Constraint**: `SELECT` is allowed for public posts, or checks `followers`/`subscriptions` tables if gated. `INSERT`/`DELETE` requires creator profile ownership.

#### `followers`

* **Purpose**: Social network mappings.
* **RLS Constraint**: Users can only follow/unfollow on behalf of their authenticated wallet address.

#### `tips`

* **Purpose**: On-chain payment index cache.
* **RLS Constraint**: Inserted only by the background sync service-role indexer; read-only for public metrics.

#### `subscriptions` & `subscription_plans`

* **Purpose**: Plan structures and active subscriber ledger tracking.
* **RLS Constraint**: Managed by the custom Wagmi indexer. Read-only for users to verify active status gates.

#### `direct_messages`

* **Purpose**: E2E sessional real-time direct chat.
* **RLS Constraint**: Access is strictly limited:
  ```sql
  auth.uid() = sender_did OR auth.uid() = recipient_did
  ```

---

## 🔒 Security, Safeguards & Threat Modeling

TipHive implements multiple layers of defense to establish a secure economic system.

1. **Anti-Sybil & Anti-Gaming Rules**:
   To prevent fake engagement, the endorsement and review systems implement a strict **7-day account age minimum** and are rate-limited to a maximum of **10 actions per day** and **30 requests per hour** via Upstash Redis.
2. **Reentrancy Protection**:
   All contract state changes on Mezo L2 are protected using OpenZeppelin's `ReentrancyGuard` to block multi-call drain attacks.
3. **Storage Sanitization**:
   All uploads to the `tipmusd` Supabase bucket are filtered through an image size optimizer and file signature checker, preventing shell injection or buffer overflow vectors.

---

## 🚀 Getting Started & Local Installation

### Prerequisites

* Node.js v20 or later
* A Web3 wallet configured for the Mezo Testnet
* A Supabase project instance

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Smart Contracts (Hardhat)

Compile contract files and run local unit verification:

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
```

### 3. Database Schema Setup

Execute the SQL parameters inside your Supabase SQL Editor:

1. Initialize the PostgreSQL schemas (tables, constraints).
2. Configure RLS rules and triggers for Privy identity mapping.
3. Establish the `tipmusd` storage bucket.

### 4. Configure Environment Variables

Create a `.env.local` file in the root of the `web/` directory and configure the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id

# Mezo Blockchain RPC & Contracts
NEXT_PUBLIC_TESTNET_RPC_URL=https://rpc.testnet.mezo.org
NEXT_PUBLIC_TIPPING_CONTRACT=0x...
NEXT_PUBLIC_SUBSCRIPTION_CONTRACT=0x...
NEXT_PUBLIC_MUSD_ADDRESS=0x...
```

### 5. Launch the Development Server

Run the local dev compiler:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) inside your web browser.

---

## 📁 Directory Structure

```
c:/Hackathon/TipHive/
├── contracts/               # Solidity Smart Contracts (Hardhat Suite)
│   ├── Subscription.sol     # Recurrent subscription tier payments contract
│   ├── Tipping.sol          # Wallet-to-wallet tip processor contract
│   ├── hardhat.config.js    # Hardhat networks and compiler configurations
│   └── scripts/             # Smart contract deployment & validation scripts
│
├── indexer/                 # On-chain logs indexing and event monitor suite
│
└── web/                     # Main Next.js Frontend and API Application
    ├── public/              # Static media, logos, and global brand assets
    └── src/
        ├── app/             # Next.js App Router folders and routes
        │   ├── (api)/       # Serverless API routes (auth, uploads, emails)
        │   ├── [username]/  # Creator public customizable profile pages
        │   ├── dashboard/   # Content creator analytics & control panels
        │   │   ├── createposts/ # Rich text posting creator screen
        │   │   ├── inbox/   # Real-time direct messages screen
        │   │   └── posts/   # Creator posts view & management center
        │   ├── onboarding/  # Sign-up flows and unique username reservation
        │   └── page.tsx     # Landing page with visual features
        ├── components/      # Modular high-fidelity React components
        │   ├── layout/      # Shared Navbar, Sidebars, and footers
        │   ├── profile/     # Public interactive tipping/subscribing boxes
        │   └── ui/          # Sleek premium glassmorphic UI controls
        └── lib/             # Shared client configs and integration scripts
            ├── brevo.ts     # Transactional email service connector
            ├── contracts.ts # Viem & Wagmi contract hooks integration
            └── supabase.ts  # Supabase client instance and database types
```

---

**Built with ❤️ for the Mezo L2 Global Hackathon.**
