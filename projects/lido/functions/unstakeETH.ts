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
    amount: string; // Amount of stETH to unstake (in wei)
  }
  
  interface UnstakeResult extends FunctionReturn {
    transactionHash?: string;  // Transaction hash for the unstaking operation
  }
  
  /**
   * Unstakes the specified amount of stETH and converts it back to ETH.
   * 
   * @param props - The unstaking parameters.
   * @param tools - System tools for blockchain interactions.
   * @returns Unstake result containing the transaction hash.
   */
  export async function unstakeETH(
    { chainName, account, amount }: Props,
    { sendTransactions, notify }: FunctionOptions
  ): Promise<UnstakeResult> {
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
      await notify(`Unstaking ${amount} stETH...`);
  
      // Prepare the transaction to unstake stETH
      const tx: TransactionParams = {
        target: stETH_ADDRESS,
        data: encodeFunctionData({
          abi: lidoAbi,
          functionName: "unstake",
          args: [amount], // Amount to unstake (in wei)
        }),
      };
  
      // Send the unstaking transaction
      const result = await sendTransactions({
        chainId,
        account,
        transactions: [tx],
      });
  
      if (!result.data[0]?.message) {
        return toResult("Failed to submit unstaking transaction", true);
      }
  
      const transactionHash = result.data[0].message; // Extract the transaction hash
  
      return {
        ...toResult("Successfully submitted unstaking transaction"),
        transactionHash
      };
    } catch (error) {
      return toResult(
        `Failed to unstake ETH: ${error instanceof Error ? error.message : "Unknown error"}`,
        true
      );
    }
  }
  