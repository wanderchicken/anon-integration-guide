import { 
    Address, 
    encodeFunctionData 
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
  
  interface PooledEtherResult extends FunctionReturn {
    totalPooledEther?: string;  // Total pooled Ether in string format
  }
  
  /**
   * Gets the total amount of pooled Ether in the Lido protocol.
   * 
   * @param props - The query parameters.
   * @param tools - System tools for blockchain interactions.
   * @returns Pooled Ether result containing the total amount.
   */
  export async function getTotalPooledEther(
    { chainName, account }: Props,
    { sendTransactions, notify }: FunctionOptions
  ): Promise<PooledEtherResult> {
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
      await notify("Fetching total pooled Ether...");
  
      // Prepare transaction for pooled Ether check
      const tx: TransactionParams = {
        target: stETH_ADDRESS,
        data: encodeFunctionData({
          abi: lidoAbi,
          functionName: "getTotalPooledEther",
          args: [],
        }),
      };
  
      // Get total pooled Ether data
      const result = await sendTransactions({
        chainId,
        account,
        transactions: [tx],
      });
  
      if (!result.data[0]?.message) {
        return toResult("Failed to retrieve total pooled Ether data", true);
      }
  
      // The result will be in Wei, so convert to Ether (1 Ether = 10^18 Wei)
      const totalPooledEther = (Number(result.data[0].message) / 1e18).toFixed(4);
  
      return {
        ...toResult("Successfully retrieved total pooled Ether"),
        totalPooledEther
      };
    } catch (error) {
      return toResult(
        `Failed to get total pooled Ether: ${error instanceof Error ? error.message : "Unknown error"}`,
        true
      );
    }
  }
  