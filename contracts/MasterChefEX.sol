// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MasterChefEX (Manual Reward Funding Version)
 * @dev Staking LP untuk dapat EX. Hadiah diambil dari saldo EX di kontrak ini (bukan mint).
 */
contract MasterChefEX is Ownable {
    using SafeERC20 for IERC20;

    struct UserInfo {
        uint256 amount;     
        uint256 rewardDebt; 
    }

    struct PoolInfo {
        IERC20 lpToken;           
        uint256 allocPoint;       
        uint256 lastRewardBlock;  
        uint256 accExPerShare;    
    }

    IERC20 public ex;             // Token EX (Sudah Fixed Supply)
    uint256 public exPerBlock;    // Target hadiah EX per blok
    
    uint256 public startBlock;       
    uint256 public halvingPeriod = 2100000; 
    uint256 public lastHalvingBlock; 

    PoolInfo[] public poolInfo;      
    mapping(uint256 => mapping(address => UserInfo)) public userInfo; 
    uint256 public totalAllocPoint = 0; 

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event Halving(uint256 newExPerBlock, uint256 blockNumber);

    constructor(
        IERC20 _ex,
        uint256 _exPerBlock,
        uint256 _startBlock
    ) Ownable(msg.sender) {
        ex = _ex;
        exPerBlock = _exPerBlock;
        startBlock = _startBlock;
        lastHalvingBlock = _startBlock;
    }

    // --- LOGIKA HALVING ---
    function _updateHalving() internal {
        if (block.number >= lastHalvingBlock + halvingPeriod) {
            exPerBlock = exPerBlock * 50 / 100; 
            lastHalvingBlock = block.number;
            emit Halving(exPerBlock, block.number);
        }
    }

    // --- VIEW FUNCTIONS ---
    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    function pendingEx(uint256 _pid, address _user) external view returns (uint256) {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accExPerShare = pool.accExPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = block.number - pool.lastRewardBlock;
            uint256 exReward = multiplier * exPerBlock * pool.allocPoint / totalAllocPoint;
            accExPerShare = accExPerShare + (exReward * 1e12 / lpSupply);
        }
        return user.amount * accExPerShare / 1e12 - user.rewardDebt;
    }

    // --- CORE FUNCTIONS ---
    function add(uint256 _allocPoint, IERC20 _lpToken, bool _withUpdate) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint + _allocPoint;
        poolInfo.push(PoolInfo({
            lpToken: _lpToken,
            allocPoint: _allocPoint,
            lastRewardBlock: lastRewardBlock,
            accExPerShare: 0
        }));
    }

    function updatePool(uint256 _pid) public {
        _updateHalving(); 
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) return;
        
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        
        uint256 multiplier = block.number - pool.lastRewardBlock;
        uint256 exReward = multiplier * exPerBlock * pool.allocPoint / totalAllocPoint;
        
        // CATATAN: Di sini tidak ada ex.mint. 
        // Logika accExPerShare tetap berjalan seolah-olah token dicetak.
        
        pool.accExPerShare = pool.accExPerShare + (exReward * 1e12 / lpSupply);
        pool.lastRewardBlock = block.number;
    }

    function deposit(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        
        if (user.amount > 0) {
            uint256 pending = user.amount * pool.accExPerShare / 1e12 - user.rewardDebt;
            if (pending > 0) safeExTransfer(msg.sender, pending);
        }
        
        if (_amount > 0) {
            pool.lpToken.safeTransferFrom(address(msg.sender), address(this), _amount);
            user.amount = user.amount + _amount;
        }
        user.rewardDebt = user.amount * pool.accExPerShare / 1e12;
        emit Deposit(msg.sender, _pid, _amount);
    }

    function withdraw(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "withdraw: not enough staked");
        updatePool(_pid);
        
        uint256 pending = user.amount * pool.accExPerShare / 1e12 - user.rewardDebt;
        if (pending > 0) safeExTransfer(msg.sender, pending);
        
        if (_amount > 0) {
            user.amount = user.amount - _amount;
            pool.lpToken.safeTransfer(address(msg.sender), _amount);
        }
        user.rewardDebt = user.amount * pool.accExPerShare / 1e12;
        emit Withdraw(msg.sender, _pid, _amount);
    }

    function emergencyWithdraw(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        uint256 amount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;
        pool.lpToken.safeTransfer(address(msg.sender), amount);
        emit EmergencyWithdraw(msg.sender, _pid, amount);
    }

    /**
     * @dev Fungsi krusial: Mengirim EX dari saldo kontrak.
     * Jika saldo EX di kontrak kurang dari jumlah yang harus dibayar,
     * kontrak hanya akan mengirimkan sisa saldo yang ada.
     */
    function safeExTransfer(address _to, uint256 _amount) internal {
        uint256 exBal = ex.balanceOf(address(this));
        if (_amount > exBal) {
            ex.transfer(_to, exBal);
        } else {
            ex.transfer(_to, _amount);
        }
    }

    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    function setExPerBlock(uint256 _exPerBlock) public onlyOwner {
        exPerBlock = _exPerBlock;
    }
}