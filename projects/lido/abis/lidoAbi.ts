export const lidoAbi = [
  // Staking
  {
    inputs: [{ name: "_referral", type: "address" }],
    name: "submit",
    outputs: [{ name: "", type: "uint256" }],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  
  // Withdrawal
  {
    inputs: [{ name: "amounts", type: "uint256[]" }],
    name: "requestWithdrawals",
    outputs: [{ 
      name: "requestId", 
      type: "uint256" 
    }],
    stateMutability: "nonpayable",
    type: "function"
  },
  
  // Balance checks
  {
    inputs: [{ name: "_account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getTotalPooledEther",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  
  // Rate and APR
  {
    inputs: [],
    name: "getAPR",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getStETHByWstETH",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
   // unstake
  {
    inputs: [{ name: "_amount", type: "uint256" }],
    name: "unstake",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  
  //claim Rewards
  {
    inputs: [{ name: "_account", type: "address" }],
    name: "claimRewards",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "sender", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "referral", type: "address" }
    ],
    name: "Submitted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "requestId", type: "uint256" },
      { indexed: true, name: "requestor", type: "address" },
      { indexed: false, name: "amount", type: "uint256" }
    ],
    name: "WithdrawalRequested",
    type: "event"
  }
];