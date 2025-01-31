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
import stEthAbi from "../abis/stEthAbi";

interface Props {
  chainName: string; // Name of the blockchain network (e.g., "Ethereum")
  account: Address; // User's wallet address
  amount: string; // Amount of ETH to stake (as a string, e.g., "1.5")
}

/**
 * Stakes ETH into the Lido protocol and receives stETH in return.
 * @param {Props} params - An object containing the chain name, account address, and stake amount.
 * @param {FunctionOptions} options - An object containing `sendTransactions`, `getProvider`, and `notify` utilities.
 * @returns {Promise<FunctionReturn>} - A promise that resolves to a success message or an error message.
 */
export async function stakeETH(
  { chainName, account, amount }: Props,
  { sendTransactions, notify }: FunctionOptions
): Promise<FunctionReturn> {
  // Check if the wallet is connected
  if (!account) {
    return toResult("Wallet not connected", true);
  }

  // Get the chain ID from the chain name
  const chainId = getChainFromName(chainName);
  if (!chainId) {
    return toResult(`Unsupported chain name: ${chainName}`, true);
  }

  // Check if the chain is supported by the protocol
  if (!supportedChains.includes(chainId)) {
    return toResult(`Lido protocol is not supported on ${chainName}`, true);
  }

  // Validate the stake amount
  if (!amount || parseFloat(amount) <= 0) {
    return toResult("Invalid stake amount", true);
  }

  try {
    // Convert the stake amount from ETH to wei (smallest unit of ETH)
    const amountInWei = parseEther(amount);

    // Notify the user that the staking process is starting
    await notify(`Preparing to stake ${amount} ETH...`);

    // Prepare the stake transaction
    const tx: TransactionParams = {
      target: stETH_ADDRESS, // Address of the Lido stETH contract
      data: encodeFunctionData({
        abi: stEthAbi, // ABI of the Lido stETH contract
        functionName: "submit", // Function to call (stake ETH)
        args: [account], // Arguments for the function (recipient address)
      }),
      value: amountInWei, // Amount of ETH to send (in wei)
    };

    // Notify the user that the transaction is being processed
    await notify("Waiting for transaction confirmation...");

    // Send the transaction to the blockchain
    const result = await sendTransactions({
      chainId, // Chain ID of the network
      account, // User's wallet address
      transactions: [tx], // List of transactions to send
    });

    // Extract the result message from the transaction response
    const stakeMessage = result.data[result.data.length - 1];

    // Return a success message
    return toResult(
      result.isMultisig 
        ? stakeMessage.message // If multisig, return the multisig message
        : `Successfully staked ${amount} ETH. ${stakeMessage.message}` // Otherwise, return a success message
    );
  } catch (error) {
    // Handle any errors that occur during the staking process
    return toResult(
      `Failed to stake ETH: ${error instanceof Error ? error.message : "Unknown error"}`,
      true
    );
  }
}