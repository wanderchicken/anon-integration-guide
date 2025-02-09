/**
 * **Function: requestWithdrawStETH**
 *
 * This function requests a withdrawal of **stETH** from the **Lido protocol** while ensuring the user has sufficient allowance.
 *
 * ✅ **Flow of Execution:**
 * 1️⃣ **Validate Inputs** → Ensure the user’s wallet is connected and the amount is valid.
 * 2️⃣ **Fetch the Chain ID** → Verify if the selected chain supports Lido’s withdrawal mechanism.
 * 3️⃣ **Check & Approve Allowance** → Use `checkToApprove` to verify and update the user’s stETH allowance.
 *     - If allowance is insufficient, request approval.
 *     - Wait for allowance confirmation before proceeding.
 * 4️⃣ **Send the Withdrawal Request** → Convert the specified amount of **stETH** into **a withdrawal request**.
 * 5️⃣ **Return Success or Failure** → Notify the user about the transaction result.
 */

import { Address, encodeFunctionData, parseEther } from 'viem';
import {
  FunctionReturn,
  FunctionOptions,
  toResult,
  getChainFromName,
  checkToApprove,
  TransactionParams
} from '@heyanon/sdk';
import { supportedChains, LIDO_WITHDRAWAL_ADDRESS, stETH_ADDRESS } from '../constants';
import withdrawalAbi from '../abis/withdrawalAbi';
import stEthAbi from '../abis/stEthAbi';

interface WithdrawProps {
  chainName: string; // Blockchain network name
  account: Address; // User's wallet address
  amount: string; // Amount of stETH to withdraw
}

/**
 * **Requests a withdrawal of stETH from the Lido protocol after ensuring allowance.**
 */
export async function requestWithdrawStETH(
  { chainName, account, amount }: WithdrawProps,
  { sendTransactions,getProvider, notify }: FunctionOptions
): Promise<FunctionReturn> {
  // ✅ Step 1: Validate User Inputs
  if (!account) return toResult('Wallet not connected', true);
  if (!amount || parseFloat(amount) <= 0) return toResult('Invalid withdrawal amount.', true);

  // ✅ Step 2: Fetch Chain ID Dynamically
  const chainId = getChainFromName(chainName);
  if (!chainId || !supportedChains.includes(chainId)) {
    return toResult(`Lido protocol is not supported on ${chainName}`, true);
  }

  try {
    const amountInWei = parseEther(amount);
    await notify(`Checking stETH allowance for withdrawal...`);

    const provider = getProvider(chainId);
    let transactions: TransactionParams[] = [];

    // ✅ Step 3: Use `checkToApprove` to Ensure Correct Allowance
    await checkToApprove({
      args: {
        account,
        target: stETH_ADDRESS, // Token being approved (stETH)
        spender: LIDO_WITHDRAWAL_ADDRESS, // Lido Withdrawal contract
        amount: amountInWei, // Required allowance
      },
      provider,
      transactions,
    });

    // ✅ Step 4: If Approval is Required, Send the Approval Transaction
    if (transactions.length > 0) {
      await notify(`Approving stETH allowance for withdrawal...`);
      const approvalResult = await sendTransactions({ chainId, account, transactions });

      if (!approvalResult || !approvalResult.data || approvalResult.data.length === 0) {
        return toResult(`Approval failed. No transaction response received.`, true);
      }

      await notify(`Approval transaction confirmed. Verifying allowance update...`);

      // ✅ Step 5: Wait for Allowance Update Before Proceeding
      let retries = 0;
      const maxRetries = 10;
      let allowanceUpdated = false;

      while (retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // ✅ Wait 5 seconds

        const updatedAllowance = await provider.readContract({
          address: stETH_ADDRESS,
          abi: stEthAbi,
          functionName: "allowance",
          args: [account, LIDO_WITHDRAWAL_ADDRESS],
        }) as bigint;

        if (updatedAllowance >= amountInWei) {
          allowanceUpdated = true;
          break;
        }

        retries++;
      }

      if (!allowanceUpdated) {
        return toResult(`Allowance update did not finalize. Please try again later.`, true);
      }
    }

    // ✅ Step 6: Prepare Withdrawal Transaction
    await notify(`Requesting withdrawal of ${amount} stETH...`);

    const withdrawTx: TransactionParams = {
      target: LIDO_WITHDRAWAL_ADDRESS as `0x${string}`,
      data: encodeFunctionData({
        abi: withdrawalAbi, // ✅ Lido Withdrawal ABI
        functionName: "requestWithdrawals",
        args: [[amountInWei], account], // Withdrawal amount and recipient address
      }),
    };

    // ✅ Step 7: Send Withdrawal Transaction
    const result = await sendTransactions({
      chainId,
      account,
      transactions: [withdrawTx],
    });

    if (!result || !result.data || result.data.length === 0) {
      return toResult(`Withdrawal transaction failed. No transaction response received.`, true);
    }

    return toResult(
      `Withdrawal request of ${amount} stETH submitted. Transaction Hash: ${result?.data?.[0]?.hash || "Unknown"}`
    );
  } catch (error) {
    return toResult(
      `Failed to request withdrawal: ${error instanceof Error ? error.message : "Unknown error"}`,
      true
    );
  }
}

