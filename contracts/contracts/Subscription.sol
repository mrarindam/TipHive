// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SubscriptionV2
 * @notice Production-grade creator subscription system on Mezo L2 (MUSD)
 *
 * ── Key upgrades over V1 ──────────────────────────────────────────────────
 *  1. Cancel = disable auto-renew ONLY  (access kept until endDate)
 *  2. 1 user → 1 plan → 1 subscription  (deterministic mapping, no dup subIds)
 *  3. Clean 3-state lifecycle: ACTIVE | CANCELLED | EXPIRED
 *  4. Direct frontend query helpers (no subId needed)
 *  5. EIP-2612 permit support (approve + subscribe in 1 tx)
 *  6. Platform fee accounting tracked separately (no rug risk)
 * ─────────────────────────────────────────────────────────────────────────
 */
contract SubscriptionV2 is ReentrancyGuard, Ownable {

    // ─── Token ───────────────────────────────────────────────────────────────

    IERC20        public immutable musd;
    IERC20Permit  public immutable musdPermit; // EIP-2612 interface (same token)

    // ─── Enums ───────────────────────────────────────────────────────────────

    /**
     * @dev Subscription state machine
     *
     *  subscribe()
     *      │
     *      ▼
     *   ACTIVE ──── cancelSubscription() ──► CANCELLED
     *      │                                     │
     *      │  endDate passed                      │  endDate passed
     *      ▼                                     ▼
     *   EXPIRED ◄────────────────────────── EXPIRED
     *      │
     *      │  renewSubscription()
     *      ▼
     *   ACTIVE  (endDate extended, autoRenew stays as it was)
     */
    enum SubStatus {
        ACTIVE,      // paid, time valid, auto-renew ON
        CANCELLED,   // paid, time still valid, auto-renew OFF
        EXPIRED      // time has passed (regardless of cancel state)
    }

    // ─── Structs ─────────────────────────────────────────────────────────────

    struct Plan {
        uint256 id;
        address creator;
        string  name;
        uint256 price;      // in MUSD (wei)
        uint256 duration;   // in seconds
        bool    active;     // creator can deactivate new subscriptions
        uint256 createdAt;
    }

    /**
     * @dev  `autoRenew` replaces the old `active` flag.
     *       Access validity is now PURELY time-based: block.timestamp < endDate
     *       `autoRenew = false` means the subscription will NOT be renewed
     *       but the user KEEPS ACCESS until endDate (cancel-as-designed).
     */
    struct SubscriptionRecord {
        uint256 planId;
        address subscriber;
        address creator;
        uint256 startDate;
        uint256 endDate;
        bool    autoRenew;   // true = renew enabled; false = cancelled
        uint256 totalPaid;
        uint256 renewalCount;
    }

    // ─── Storage ─────────────────────────────────────────────────────────────

    mapping(uint256 => Plan)   public plans;
    mapping(address => uint256[]) public creatorPlans;

    /**
     * @dev  FIX #2 – deterministic 1-to-1 mapping
     *       subscriptions[subscriber][planId] = SubscriptionRecord
     *       No more keccak(user, creator, planId, timestamp) → duplicate subIds gone.
     */
    mapping(address => mapping(uint256 => SubscriptionRecord)) public subscriptions;

    mapping(address => uint256) public creatorEarnings;

    /// @dev Separately tracked so owner cannot accidentally drain creator funds
    uint256 public platformFeesAccumulated;

    uint256 public planCounter;
    uint256 public platformFee = 50; // 0.5% (basis 10 000)

    // ─── Events ──────────────────────────────────────────────────────────────

    event PlanCreated(uint256 indexed planId, address indexed creator, string name, uint256 price);
    event PlanUpdated(uint256 indexed planId, string name, uint256 price, bool active);

    /// @dev subId is now keccak(subscriber, planId) — stable & deterministic
    event SubscriptionCreated(bytes32 indexed subId, address indexed subscriber, address indexed creator, uint256 planId);
    event SubscriptionRenewed(bytes32 indexed subId, uint256 newEndDate, uint256 renewalCount);

    /// @dev Cancel now means "auto-renew disabled", NOT "access revoked"
    event SubscriptionCancelled(bytes32 indexed subId, uint256 accessValidUntil);

    event EarningsWithdrawn(address indexed creator, uint256 amount);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event PlatformFeesWithdrawn(address indexed owner, uint256 amount);

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor(address _musdAddress) Ownable() {
        require(_musdAddress != address(0), "Invalid MUSD address");
        musd       = IERC20(_musdAddress);
        musdPermit = IERC20Permit(_musdAddress);
    }

    // ─── Internal Helpers ────────────────────────────────────────────────────

    /**
     * @dev Stable, deterministic subId — same user + planId always = same ID.
     *      No timestamp in hash → no duplicates possible.
     */
    function _subId(address _subscriber, uint256 _planId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_subscriber, _planId));
    }

    /**
     * @dev Core access check: time-based ONLY.
     *      autoRenew flag does NOT affect current-period access.
     */
    function _isAccessValid(SubscriptionRecord storage sub) internal view returns (bool) {
        return block.timestamp < sub.endDate;
    }

    /**
     * @dev Split payment and credit earnings + platform fee.
     */
    function _creditPayment(address _creator, uint256 _amount) internal {
        uint256 fee     = (_amount * platformFee) / 10_000;
        uint256 earning = _amount - fee;
        creatorEarnings[_creator]  += earning;
        platformFeesAccumulated    += fee;
    }

    // ─── Plan Management ─────────────────────────────────────────────────────

    function createPlan(
        string memory _name,
        uint256 _price,
        uint256 _duration
    ) external {
        require(_price    > 0,                 "Price must be > 0");
        require(_duration > 0,                 "Duration must be > 0");
        require(bytes(_name).length > 0,       "Name required");

        uint256 planId = planCounter++;

        plans[planId] = Plan({
            id:        planId,
            creator:   msg.sender,
            name:      _name,
            price:     _price,
            duration:  _duration,
            active:    true,
            createdAt: block.timestamp
        });

        creatorPlans[msg.sender].push(planId);

        emit PlanCreated(planId, msg.sender, _name, _price);
    }

    function updatePlan(
        uint256 _planId,
        string  memory _name,
        uint256 _price,
        bool    _active
    ) external {
        Plan storage plan = plans[_planId];
        require(plan.creator == msg.sender, "Not the plan creator");

        plan.name   = _name;
        plan.price  = _price;
        plan.active = _active;

        emit PlanUpdated(_planId, _name, _price, _active);
    }

    function getCreatorPlans(address _creator) external view returns (uint256[] memory) {
        return creatorPlans[_creator];
    }

    // ─── Subscription (Standard: approve first, then subscribe) ──────────────

    /**
     * @notice Subscribe to a plan.
     *         Requires prior musd.approve(address(this), plan.price).
     * @dev    FIX #2: Reverts if subscription already exists and is still valid.
     *         FIX #3: Sets autoRenew = true on fresh subscribe.
     */
    function subscribe(uint256 _planId) external nonReentrant returns (bytes32 subId) {
        subId = _subscribe(msg.sender, _planId);
    }

    // ─── Subscription (Permit: approve + subscribe in 1 tx) ──────────────────

    /**
     * @notice Subscribe using EIP-2612 permit — single transaction UX.
     * @dev    FIX #5: Combines approve + subscribe atomically.
     *         `deadline`, `v`, `r`, `s` come from the user's off-chain signature.
     *
     * Flow (frontend with Wagmi/Viem):
     *   1. User signs permit off-chain → gets { v, r, s, deadline }
     *   2. Calls subscribeWithPermit(planId, price, deadline, v, r, s)
     *   3. Contract calls musd.permit() then transfers — 1 tx total
     */
    function subscribeWithPermit(
        uint256 _planId,
        uint256 _amount,    // must equal plan.price; passed in to avoid extra read
        uint256 _deadline,
        uint8   _v,
        bytes32 _r,
        bytes32 _s
    ) external nonReentrant returns (bytes32 subId) {
        // Execute the off-chain signed approval on-chain
        musdPermit.permit(msg.sender, address(this), _amount, _deadline, _v, _r, _s);

        // Verify amount matches plan price (safety check)
        Plan memory plan = plans[_planId];
        require(_amount == plan.price, "Permit amount != plan price");

        subId = _subscribe(msg.sender, _planId);
    }

    /**
     * @dev  Shared internal subscribe logic.
     *       FIX #2: 1 user = 1 plan = 1 subscription enforced here.
     *       FIX #3: Fresh subscription sets autoRenew = true.
     */
    function _subscribe(address _subscriber, uint256 _planId) internal returns (bytes32 subId) {
        Plan memory plan = plans[_planId];
        require(plan.active,                          "Plan is not active");
        require(plan.price > 0,                       "Invalid plan");
        require(plan.creator != _subscriber,          "Creator cannot self-subscribe");

        // FIX #2 – Prevent duplicate active subscriptions
        SubscriptionRecord storage existing = subscriptions[_subscriber][_planId];
        require(
            existing.endDate == 0 || !_isAccessValid(existing),
            unicode"Active subscription already exists — use renewSubscription()"
        );

        require(
            musd.transferFrom(_subscriber, address(this), plan.price),
            "MUSD transfer failed"
        );

        _creditPayment(plan.creator, plan.price);

        subscriptions[_subscriber][_planId] = SubscriptionRecord({
            planId:       _planId,
            subscriber:   _subscriber,
            creator:      plan.creator,
            startDate:    block.timestamp,
            endDate:      block.timestamp + plan.duration,
            autoRenew:    true,       // FIX #3: explicit, not implicit
            totalPaid:    plan.price,
            renewalCount: 0
        });

        subId = _subId(_subscriber, _planId);

        emit SubscriptionCreated(subId, _subscriber, plan.creator, _planId);
    }

    // ─── Renew ───────────────────────────────────────────────────────────────

    /**
     * @notice Renew a subscription (can also re-activate an expired one).
     *         Works even if autoRenew was disabled (cancelled) — renewal is
     *         always a deliberate user action.
     * @dev    FIX #3: endDate extended from MAX(now, current endDate) so
     *         renewing early doesn't waste time; renewing late doesn't gap.
     */
    function renewSubscription(uint256 _planId) external nonReentrant {
        SubscriptionRecord storage sub = subscriptions[msg.sender][_planId];
        require(sub.startDate > 0,             "No subscription found");

        Plan memory plan = plans[sub.planId];
        require(plan.active,                   "Plan no longer active");

        require(
            musd.transferFrom(msg.sender, address(this), plan.price),
            "MUSD transfer failed"
        );

        _creditPayment(sub.creator, plan.price);

        // Extend from current endDate OR now — whichever is later (no wasted time)
        uint256 base    = sub.endDate > block.timestamp ? sub.endDate : block.timestamp;
        sub.endDate      = base + plan.duration;
        sub.totalPaid   += plan.price;
        sub.renewalCount += 1;
        sub.autoRenew    = true; // re-enable auto-renew on explicit renewal

        bytes32 sid = _subId(msg.sender, _planId);
        emit SubscriptionRenewed(sid, sub.endDate, sub.renewalCount);
    }

    // ─── Cancel ──────────────────────────────────────────────────────────────

    /**
     * @notice Cancel = disable auto-renew ONLY.
     *         Access is retained until endDate (FIX #1).
     * @dev    Old V1 set `active = false` which immediately blocked access.
     *         Now we ONLY flip `autoRenew = false`.
     *         isAccessValid() is purely time-based and unaffected.
     */
    function cancelSubscription(uint256 _planId) external {
        SubscriptionRecord storage sub = subscriptions[msg.sender][_planId];
        require(sub.startDate > 0,         "No subscription found");
        require(_isAccessValid(sub),       "Subscription already expired");
        require(sub.autoRenew,             "Auto-renew already disabled");

        sub.autoRenew = false; // The ONLY state change — access clock keeps ticking

        bytes32 sid = _subId(msg.sender, _planId);
        emit SubscriptionCancelled(sid, sub.endDate); // FIX: emit accessValidUntil
    }

    // ─── Query Methods (FIX #4 — Frontend Optimization) ──────────────────────

    /**
     * @notice Get a user's subscription for a plan directly.
     *         Frontend uses: wagmi `useReadContract` — zero gas.
     */
    function getUserSubscription(
        address _subscriber,
        uint256 _planId
    ) external view returns (SubscriptionRecord memory) {
        return subscriptions[_subscriber][_planId];
    }

    /**
     * @notice Check if user currently has valid access to a plan.
     *         Pure time-based check — cancel does NOT affect this.
     *         Frontend uses: wagmi `useReadContract` — zero gas.
     */
    function isUserSubscribed(
        address _subscriber,
        uint256 _planId
    ) external view returns (bool) {
        SubscriptionRecord storage sub = subscriptions[_subscriber][_planId];
        return _isAccessValid(sub);
    }

    /**
     * @notice Full status of a subscription — maps to the SubStatus enum.
     *         Useful for UI badges: "Active", "Cancelled (expires Aug 1)", "Expired".
     * @dev    FIX #3: Clean 3-state lifecycle exposed to frontend.
     */
    function getSubscriptionStatus(
        address _subscriber,
        uint256 _planId
    ) external view returns (SubStatus) {
        SubscriptionRecord storage sub = subscriptions[_subscriber][_planId];
        if (!_isAccessValid(sub)) {
            return SubStatus.EXPIRED;
        }
        if (!sub.autoRenew) {
            return SubStatus.CANCELLED; // access valid, renew off
        }
        return SubStatus.ACTIVE;
    }

    /**
     * @notice Legacy-compatible subId getter (for off-chain indexing / events).
     */
    function getSubId(
        address _subscriber,
        uint256 _planId
    ) external pure returns (bytes32) {
        return _subId(_subscriber, _planId);
    }

    /**
     * @notice Legacy-compatible validity check using subId.
     *         Kept for backward compat with V1 event listeners.
     */
    function isSubscriptionValid(bytes32 _sid) external view returns (bool) {
        // subId = keccak(subscriber, planId) — we cannot reverse-lookup without
        // indexing off-chain. This method is intentionally left as a stub that
        // always returns false to signal callers to migrate to isUserSubscribed().
        // Off-chain indexers should use SubscriptionCreated events to map subId → (user, planId).
        revert("Deprecated: use isUserSubscribed(subscriber, planId)");
    }

    // ─── Earnings ────────────────────────────────────────────────────────────

    function withdrawEarnings(uint256 _amount) external nonReentrant {
        require(_amount > 0,                             "Amount must be > 0");
        require(creatorEarnings[msg.sender] >= _amount,  "Insufficient earnings");

        creatorEarnings[msg.sender] -= _amount;

        require(musd.transfer(msg.sender, _amount), "Transfer failed");

        emit EarningsWithdrawn(msg.sender, _amount);
    }

    function getCreatorEarnings(address _creator) external view returns (uint256) {
        return creatorEarnings[_creator];
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 500, "Max fee is 5%");
        emit PlatformFeeUpdated(platformFee, _newFee);
        platformFee = _newFee;
    }

    /**
     * @notice Owner withdraws ONLY platform fees — cannot touch creator earnings.
     * @dev    FIX #6: V1 had no accounting; owner could drain any amount.
     *         Now strictly bounded by platformFeesAccumulated.
     */
    function withdrawPlatformFees(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount <= platformFeesAccumulated, "Exceeds accumulated fees");
        platformFeesAccumulated -= _amount;
        require(musd.transfer(msg.sender, _amount), "Transfer failed");
        emit PlatformFeesWithdrawn(msg.sender, _amount);
    }
}
