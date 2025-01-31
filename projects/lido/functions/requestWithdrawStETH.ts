import { Address, encodeFunctionData, parseEther } from "viem";
import { FunctionReturn, FunctionOptions, toResult, getChainFromName } from "@heyanon/sdk";
import { supportedChains, LIDO_WITHDRAWAL_ADDRESS } from "../constants";
import withdrawalAbi from "../abis/withdrawalAbi";

interface WithdrawProps {
  chainName: string; // Name of the blockchain network (e.g., "Ethereum")
  account: Address; // User's wallet address
  amount: string; // Amount of stETH to withdraw, specified as a string
}

/**
 * Requests a withdrawal of stETH from the Lido protocol.
 * @param {WithdrawProps} params - Includes chain name, account, and withdrawal amount.
 * @param {FunctionOptions} options - Provides the `sendTransactions` and `notify` utilities.
 * @returns {Promise<FunctionReturn>} - A promise resolving to a success message or an error message.
 */
export async function requestWithdrawStETH(
  { chainName, account, amount }: WithdrawProps,
  { sendTransactions, notify }: FunctionOptions
): Promise<FunctionReturn> {
  if (!account) return toResult("Wallet not connected", true);

  // Get the chain ID from the chain name
  const chainId = getChainFromName(chainName);
  if (!chainId || !supportedChains.includes(chainId)) {
    return toResult(`Lido protocol is not supported on ${chainName}`, true);
  }

  try {
    // Convert the withdrawal amount from ETH to wei (smallest unit of ETH)
    const amountInWei = parseEther(amount);

    // Notify the user about the withdrawal request
    await notify(`Requesting withdrawal of ${amount} stETH...`);

    // Prepare the withdrawal transaction
    const tx = {
      target: LIDO_WITHDRAWAL_ADDRESS as `0x${string}`, // Lido withdrawal contract address
      data: encodeFunctionData({
        abi: withdrawalAbi, // ABI of the Lido withdrawal contract
        functionName: "requestWithdrawals", // Function to call for requesting withdrawal
        args: [[amountInWei], account], // Withdrawal amount and recipient address
      }),
    };

    // Send the transaction to initiate the withdrawal request
    const result = await sendTransactions({ chainId, account, transactions: [tx] });

    // Return success message
    return toResult(`Withdrawal request submitted. Transaction: ${result.data}`);
  } catch (error) {
    // Handle errors during the withdrawal request process
    return toResult(`Failed to request withdrawal: ${error instanceof Error ? error.message : "Unknown error"}`, true);
  }
}
