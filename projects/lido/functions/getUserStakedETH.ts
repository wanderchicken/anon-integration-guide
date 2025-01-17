import { 
    Address, 
    encodeFunctionData, 
    decodeFunctionResult 
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
  
  interface UserStakedETHResult extends FunctionReturn {
    stakedETH?: string;  // The amount of Ether the user has staked, in Ether
  }
  
  /**
   * Gets the amount of Ether staked by a user in the Lido protocol (represented as stETH).
   * 
   * @param props - The query parameters.
   * @param tools - System tools for blockchain interactions.
   * @returns The amount of stETH held by the user, converted to Ether.
   */
  export async function getUserStakedETH(
    { chainName, account }: Props,
    { sendTransactions, notify }: FunctionOptions
  ): Promise<UserStakedETHResult> {
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
      await notify("Fetching user staked Ether...");
  
      // Prepare the transaction to query the user's stETH balance
      const tx: TransactionParams = {
        target: stETH_ADDRESS,
        data: encodeFunctionData({
          abi: lidoAbi,
          functionName: "balanceOf",
          args: [account], // The account whose staked balance we are querying
        }),
      };
  
      // Send the transaction to fetch the stETH balance
      const result = await sendTransactions({
        chainId,
        account,
        transactions: [tx],
      });
  
      if (!result.data[0]?.message) {
        return toResult("Failed to retrieve stETH balance", true);
      }
  
      // Ensure the result is a valid hex string (starting with '0x')
      let hexData = result.data[0].message;
  
      if (!hexData.startsWith('0x')) {
        hexData = '0x' + hexData;
      }
  
      // Decode the result (stETH balance in Wei)
      const decodedResult = decodeFunctionResult({
        abi: lidoAbi,
        data: hexData as `0x${string}`, // Cast hexData to a valid `0x${string}` type
      });
  
      // Type assertion: we know it will return an array with a single value (stETH balance)
      const decodedArray = decodedResult as [string]; // Decode to an array of strings
  
      // Extract the stETH balance (in Wei)
      const stETHBalanceWei = decodedArray[0]; // stETH balance in Wei (as a string)
  
      // Convert the stETH balance to Ether (1 Ether = 10^18 Wei)
      const stakedETH = (Number(stETHBalanceWei) / 1e18).toFixed(4);
  
      return {
        ...toResult("Successfully retrieved user staked Ether"),
        stakedETH
      };
    } catch (error) {
      return toResult(
        `Failed to get user staked Ether: ${error instanceof Error ? error.message : "Unknown error"}`,
        true
      );
    }
  }
  