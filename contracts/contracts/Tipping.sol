// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Tipping is ReentrancyGuard, Ownable {
    IERC20 public musd;

    struct Creator {
        address wallet;
        uint256 totalEarned;
        uint256 withdrawnAmount;
        bool exists;
    }

    struct TipRecord {
        address fan;
        address creator;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => Creator) public creators;
    mapping(address => uint256) public creatorBalance;
    
    TipRecord[] public tipHistory;

    event TipReceived(address indexed from, address indexed creator, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed creator, uint256 amount);
    event CreatorRegistered(address indexed creator);

    constructor(address _musdAddress) {
        musd = IERC20(_musdAddress);
    }

    function registerCreator() external {
        require(!creators[msg.sender].exists, "Already registered");
        creators[msg.sender] = Creator({
            wallet: msg.sender,
            totalEarned: 0,
            withdrawnAmount: 0,
            exists: true
        });
        emit CreatorRegistered(msg.sender);
    }

    function tip(address _creator, uint256 _amount) external nonReentrant {
        require(_amount > 0, "Tip must be > 0");
        require(_creator != address(0), "Invalid creator");
        require(_creator != msg.sender, "Cannot tip yourself");

        require(
            musd.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        creatorBalance[_creator] += _amount;
        
        if (!creators[_creator].exists) {
            creators[_creator] = Creator({
                wallet: _creator,
                totalEarned: _amount,
                withdrawnAmount: 0,
                exists: true
            });
        } else {
            creators[_creator].totalEarned += _amount;
        }

        tipHistory.push(TipRecord({
            fan: msg.sender,
            creator: _creator,
            amount: _amount,
            timestamp: block.timestamp
        }));

        emit TipReceived(msg.sender, _creator, _amount, block.timestamp);
    }

    function withdraw(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be > 0");
        require(creatorBalance[msg.sender] >= _amount, "Insufficient balance");

        creatorBalance[msg.sender] -= _amount;
        creators[msg.sender].withdrawnAmount += _amount;

        require(musd.transfer(msg.sender, _amount), "Withdrawal failed");

        emit Withdrawal(msg.sender, _amount);
    }

    function getCreatorBalance(address _creator) external view returns (uint256) {
        return creatorBalance[_creator];
    }

    function getTipCount() external view returns (uint256) {
        return tipHistory.length;
    }

    function getTipHistory(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (TipRecord[] memory) 
    {
        require(_offset < tipHistory.length, "Invalid offset");
        uint256 end = _offset + _limit > tipHistory.length ? tipHistory.length : _offset + _limit;
        TipRecord[] memory result = new TipRecord[](end - _offset);
        
        for (uint256 i = 0; i < end - _offset; i++) {
            result[i] = tipHistory[_offset + i];
        }
        return result;
    }
}
