import { 
    Address, 
    encodeFunctionData,
    parseEther
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
    amount: string; // Amount in ETH as string (e.g., "1.5")
  }
  
  /**
   * Stakes ETH in the Lido protocol to receive stETH.
   * The stETH balance will increase over time as staking rewards accrue.
   * 
   * @param props - The staking parameters including amount of ETH to stake.
   * @param tools - System tools for blockchain interactions.
   * @returns Transaction result.
   */
  export async function stakeETH(
    { chainName, account, amount }: Props,
    { sendTransactions, notify }: FunctionOptions
  ): Promise<FunctionReturn> {
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
  
    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      return toResult("Invalid stake amount", true);
    }
  
    try {
      // Convert amount to Wei
      const amountInWei = parseEther(amount);
  
      await notify(`Preparing to stake ${amount} ETH...`);
  
      // Prepare stake transaction
      const tx: TransactionParams = {
        target: stETH_ADDRESS,
        data: encodeFunctionData({
          abi: lidoAbi,
          functionName: "submit",
          args: [account], // address _referral (using user's address as referral)
        }),
        value: amountInWei, // Include ETH value to be staked
      };
  
      await notify("Waiting for transaction confirmation...");
  
      // Sign and send transaction
      const result = await sendTransactions({
        chainId,
        account,
        transactions: [tx],
      });
  
      const stakeMessage = result.data[result.data.length - 1];
      
      return toResult(
        result.isMultisig 
          ? stakeMessage.message 
          : `Successfully staked ${amount} ETH. ${stakeMessage.message}`
      );
    } catch (error) {
      return toResult(
        `Failed to stake ETH: ${error instanceof Error ? error.message : "Unknown error"}`,
        true
      );
    }
  }