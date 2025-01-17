import { 
    Address, 
    encodeFunctionData,
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
  
  interface APRResult extends FunctionReturn {
    apr?: string;  // APR as percentage string
    aprBasisPoints?: number; // APR in basis points
  }
  
  /**
   * Gets the current staking APR from the Lido protocol.
   * Returns both formatted percentage and basis points.
   * 
   * @param props - The query parameters.
   * @param tools - System tools for blockchain interactions.
   * @returns APR result containing current staking rate.
   */
  export async function getStakingAPR(
    { chainName, account }: Props,
    { sendTransactions, notify }: FunctionOptions
  ): Promise<APRResult> {
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
      await notify("Fetching current staking APR...");
  
      // Prepare transaction for APR check
      const tx: TransactionParams = {
        target: stETH_ADDRESS,
        data: encodeFunctionData({
          abi: lidoAbi,
          functionName: "getAPR",
          args: [],
        }),
      };
  
      // Get APR data
      const result = await sendTransactions({
        chainId,
        account,
        transactions: [tx],
      });
  
      if (!result.data[0]?.message) {
        return toResult("Failed to retrieve APR data", true);
      }
  
      // Convert APR to basis points (1 basis point = 0.01%)
      const aprBasisPoints = Number(result.data[0].message);
      
      // Format APR as percentage string with 2 decimal places
      const apr = (aprBasisPoints / 100).toFixed(2) + '%';
  
      return {
        ...toResult("Successfully retrieved current staking APR"),
        apr,
        aprBasisPoints
      };
    } catch (error) {
      return toResult(
        `Failed to get staking APR: ${error instanceof Error ? error.message : "Unknown error"}`,
        true
      );
    }
  }