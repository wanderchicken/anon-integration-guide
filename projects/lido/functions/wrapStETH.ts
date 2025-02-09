/**
 * Function: wrapStETH
 *
 * This function wraps stETH into wstETH (a non-rebasing token) while ensuring that the user has enough allowance.
 *
 * ✅ Flow of Execution:
 * 1. Validate user input (wallet connection and valid amount).
 * 2. Fetch the chain ID and verify if it supports Lido's wrapping mechanism.
 * 3. Check the user's stETH allowance for the wrapping contract.
 *    - If the allowance is insufficient, approve the required amount.
 *    - Poll allowance updates (up to 30 seconds) to confirm approval.
 * 4. Once allowance is confirmed, send the transaction to wrap stETH into wstETH.
 * 5. Return success or failure message based on execution result.
 */


import { Address, encodeFunctionData, parseEther, formatUnits } from 'viem';
import {
  FunctionReturn,
  FunctionOptions,
  toResult,
  getChainFromName,
} from '@heyanon/sdk';
import { supportedChains, wstETH_ADDRESS } from '../constants';
import wstETHAbi from '../abis/wstETHAbi';
import { checkAllowance } from './checkAllowance';
import { approveStETH } from './approveStETH';

interface StEthInfoProps {
  chainName: string;
  account: Address;
  amount: string; // Amount to wrap
}

export async function wrapStETH(
  { chainName, account, amount }: StEthInfoProps,
  { sendTransactions, getProvider, notify }: FunctionOptions // Removed waitForTransaction
): Promise<FunctionReturn> {
  if (!account) return toResult('Wallet not connected', true);
  if (!amount || parseFloat(amount) <= 0) return toResult('Invalid amount.', true);

  const chainId = getChainFromName(chainName);
  if (!chainId || !supportedChains.includes(chainId)) {
    return toResult(`Lido protocol is not supported on ${chainName}`, true);
  }

  try {
    const amountInWei = parseEther(amount);
    await notify(`Checking stETH allowance for wrapping...`);

    // ✅ Step 1: Check Initial Allowance
    let allowanceResponse = await checkAllowance({ chainName, account, operation: "wrap" }, { sendTransactions, getProvider, notify });
    if (!allowanceResponse.success) return allowanceResponse;

    let allowance = parseEther(allowanceResponse.data.split(' ')[1]); // Convert allowance amount to BigInt

    if (allowance < amountInWei) {
      const remainingToApprove = amountInWei - allowance;
      await notify(`Insufficient allowance: ${formatUnits(allowance, 18)} stETH. Approving additional ${formatUnits(remainingToApprove, 18)} stETH...`);

      // ✅ Step 2: Approve the Remaining Amount
      const approvalResponse = await approveStETH(
        { chainName, account, amount: formatUnits(remainingToApprove, 18), operation: "wrap" },
        { sendTransactions, notify, getProvider }
      );

      if (!approvalResponse.success) return approvalResponse;

      await notify(`Approval transaction sent. Waiting for allowance update...`);

      // ✅ Step 3: Poll Allowance Until It Updates (Max 30 seconds)
      let retries = 0;
      const maxRetries = 6; // Retry every 5 seconds for 30 seconds

      while (retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before checking again

        allowanceResponse = await checkAllowance({ chainName, account, operation: "wrap" }, { sendTransactions, getProvider, notify });
        if (!allowanceResponse.success) return allowanceResponse;
        
        allowance = parseEther(allowanceResponse.data.split(' ')[1]); // Convert allowance amount

        if (allowance >= amountInWei) {
          await notify(`Approval confirmed! New allowance: ${formatUnits(allowance, 18)} stETH.`);
          break;
        }

        retries++;
      }

      if (allowance < amountInWei) {
        return toResult(`Approval did not process in time. Please try again later.`, true);
      }
    }

    // ✅ Step 4: Wrap stETH → wstETH
    await notify(`Wrapping ${amount} stETH to wstETH...`);
    const tx = {
      target: wstETH_ADDRESS as `0x${string}`,
      data: encodeFunctionData({
        abi: wstETHAbi,
        functionName: 'wrap',
        args: [amountInWei],
      }),
    };

    const result = await sendTransactions({
      chainId,
      account,
      transactions: [tx],
    });

    return toResult(
      `Successfully wrapped ${amount} stETH to wstETH. Transaction Hash: ${result?.data?.[0]?.hash || "Unknown"}`
    );
  } catch (error) {
    return toResult(
      `Failed to wrap stETH: ${error instanceof Error ? error.message : 'Unknown error'}`,
      true
    );
  }
}
