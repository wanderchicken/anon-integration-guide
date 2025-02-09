/**
 * **Function: wrapStETH**
 * 
 * This function wraps **stETH** into **wstETH** (a non-rebasing token) while ensuring that the user has enough allowance.
 * It follows a **secure and efficient process** to prevent errors such as `ALLOWANCE_EXCEEDED`.
 * 
 * ✅ **Flow of Execution:**
 * 1️⃣ **Validate Inputs** → Ensure the user’s wallet is connected and the amount is valid.
 * 2️⃣ **Fetch the Chain ID** → Check if the selected chain supports Lido's wrapping mechanism.
 * 3️⃣ **Check & Approve Allowance** → Use `checkToApprove` to verify if the user has granted enough allowance.
 *     - If allowance is insufficient, request approval.
 *     - Wait for allowance confirmation before proceeding.
 * 4️⃣ **Send the Wrap Transaction** → Convert the specified amount of **stETH** into **wstETH**.
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
import { supportedChains, wstETH_ADDRESS, stETH_ADDRESS } from '../constants';
import wstETHAbi from '../abis/wstETHAbi';
import stEthAbi from '../abis/stEthAbi';

interface StEthInfoProps {
  chainName: string;
  account: Address;
  amount: string; // Amount to wrap
}

export async function wrapStETH(
  { chainName, account, amount }: StEthInfoProps,
  { sendTransactions,getProvider, notify }: FunctionOptions
): Promise<FunctionReturn> {
  if (!account) return toResult('Wallet not connected', true);
  if (!amount || parseFloat(amount) <= 0) return toResult('Invalid amount.', true);

  // ✅ Get Chain ID Dynamically
  const chainId = getChainFromName(chainName);
  if (!chainId || !supportedChains.includes(chainId)) {
    return toResult(`Lido protocol is not supported on ${chainName}`, true);
  }

  try {
    const amountInWei = parseEther(amount);
    await notify(`Checking stETH allowance for wrapping...`);

    const provider = getProvider(chainId);
    let transactions: TransactionParams[] = [];

    // ✅ Step 1: Use `checkToApprove` to Ensure Correct Allowance
    await checkToApprove({
      args: {
        account,
        target: stETH_ADDRESS, // Token being approved (stETH)
        spender: wstETH_ADDRESS, // Wrapping contract address
        amount: amountInWei, // Required allowance
      },
      provider,
      transactions,
    });

    // ✅ Step 2: If Approval Needed, Send Approval Transaction First
    if (transactions.length > 0) {
      await notify(`Approving stETH allowance for wrapping...`);
      const approvalResult = await sendTransactions({ chainId, account, transactions });

      if (!approvalResult || !approvalResult.data || approvalResult.data.length === 0) {
        return toResult(`Approval failed. No transaction response received.`, true);
      }

      await notify(`Approval transaction confirmed. Verifying allowance update...`);

      // ✅ Step 3: Wait for Allowance Update Before Wrapping
      let retries = 0;
      const maxRetries = 10;
      let allowanceUpdated = false;

      while (retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // ✅ Wait 5 seconds

        const updatedAllowance = await provider.readContract({
          address: stETH_ADDRESS,
          abi: stEthAbi,
          functionName: "allowance",
          args: [account, wstETH_ADDRESS],
        }) as bigint

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

    // ✅ Step 4: Prepare Wrap Transaction
    const wrapTx: TransactionParams = {
      target: wstETH_ADDRESS as `0x${string}`,
      data: encodeFunctionData({
        abi: wstETHAbi,
        functionName: "wrap",
        args: [amountInWei],
      }),
    };

    await notify(`Sending transaction to wrap ${amount} stETH into wstETH...`);
    const result = await sendTransactions({
      chainId,
      account,
      transactions: [wrapTx],
    });

    if (!result || !result.data || result.data.length === 0) {
      return toResult(`Wrapping transaction failed. No transaction response received.`, true);
    }

    return toResult(
      `Successfully wrapped ${amount} stETH to wstETH. Transaction Hash: ${result?.data?.[0]?.hash || "Unknown"}`
    );
  } catch (error) {
    return toResult(
      `Failed to wrap stETH: ${error instanceof Error ? error.message : "Unknown error"}`,
      true
    );
  }
}
