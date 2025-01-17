import { 
    Address, 
    encodeFunctionData,
    formatEther,
  } from "viem";
  import { 
    FunctionReturn, 
    FunctionOptions, 
    TransactionParams, 
    toResult, 
    getChainFromName,
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
  
  interface BalanceResult extends FunctionReturn {
    balance?: string;  // Balance in ETH as string
    balanceWei?: bigint; // Raw balance in Wei
  }
  
  /**
   * Gets the stETH balance for a given account.
   * Returns both formatted balance in ETH and raw balance in Wei.
   * 
   * @param props - The balance check parameters.
   * @param tools - System tools for blockchain interactions.
   * @returns Balance result containing stETH amount.
   */
  export async function getStETHBalance(
    { chainName, account }: Props,
    { sendTransactions, notify }: FunctionOptions
  ): Promise<BalanceResult> {
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
      await notify("Checking stETH balance...");
  
      // Prepare multicall transaction for balance check
      const tx: TransactionParams = {
        target: stETH_ADDRESS,
        data: encodeFunctionData({
          abi: lidoAbi,
          functionName: "balanceOf",
          args: [account],
        }),
      };
  
      // Get balance using multicall
      const result = await sendTransactions({
        chainId,
        account,
        transactions: [tx],
      });
  
      if (!result.data[0]?.message) {
        return toResult("Failed to retrieve balance data", true);
      }
  
      // Decode the balance result
      const balanceWei = BigInt(result.data[0].message);
      const balance = formatEther(balanceWei);
  
      return {
        ...toResult("Successfully retrieved stETH balance"),
        balance,
        balanceWei
      };
    } catch (error) {
      return toResult(
        `Failed to get stETH balance: ${error instanceof Error ? error.message : "Unknown error"}`,
        true
      );
    }
  }
  