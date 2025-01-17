import { 
    Address, 
    encodeFunctionData, 
  } from "viem";
  import { 
    FunctionReturn, 
    FunctionOptions, 
    TransactionParams, 
    toResult, 
    getChainFromName 
  } from "@heyanon/sdk";
  import { 
    supportedChains, 
    stETH_ADDRESS 
  } from "../constants";
  import { lidoAbi } from "../abis/lidoAbi";
  
  interface Props {
    chainName: string;
    account: Address;
  }
  
  interface ClaimRewardsResult extends FunctionReturn {
    rewardsClaimed?: string;  // The amount of rewards claimed, in Ether
  }
  
  /**
   * Claims staking rewards for a given user.
   * 
   * @param props - The claim rewards parameters.
   * @param tools - System tools for blockchain interactions.
   * @returns Rewards claim result containing the claimed amount.
   */
  export async function claimRewards(
    { chainName, account }: Props,
    { sendTransactions, notify }: FunctionOptions
  ): Promise<ClaimRewardsResult> {
    // Check wallet connection
    if (!account) {
      return toResult("Wallet not connected", true);
    }
  
    // Validate chain
    const chainId = getChainFromName(chainName);
    if (!chainId) {
      return toResult(`Unsupported chain name: ${chainName}`, true);
    }
    if (!supportedChains.includes(chainId)) {
      return toResult(`Protocol is not supported on ${chainName}`, true);
    }
  
    try {
      await notify("Claiming staking rewards...");
  
      // Prepare transaction to claim rewards
      const tx: TransactionParams = {
        target: stETH_ADDRESS,  // Assuming the staking contract address
        data: encodeFunctionData({
          abi: lidoAbi,
          functionName: "claimRewards",  // You should have this function in the contract ABI
          args: [account],  // The account for which rewards are being claimed
        }),
      };
  
      // Send the transaction to claim rewards
      const result = await sendTransactions({
        chainId,
        account,
        transactions: [tx],
      });
  
      if (!result.data[0]?.message) {
        return toResult("Failed to claim rewards", true);
      }
  
      // Decode the result (claim reward transaction result)
      const rewardAmountWei = BigInt(result.data[0].message);  // Assume the result is in Wei
      const rewardsClaimed = (Number(rewardAmountWei) / 1e18).toFixed(4);
  
      return {
        ...toResult("Successfully claimed staking rewards"),
        rewardsClaimed
      };
    } catch (error) {
      return toResult(
        `Failed to claim staking rewards: ${error instanceof Error ? error.message : "Unknown error"}`,
        true
      );
    }
  }
  