import { Address, encodeFunctionData, parseEther } from "viem";
import { FunctionReturn, FunctionOptions, toResult, getChainFromName } from "@heyanon/sdk";
import { supportedChains, stETH_ADDRESS, wstETH_ADDRESS, LIDO_WITHDRAWAL_ADDRESS } from "../constants";
import stEthAbi from "../abis/stEthAbi";

interface StEthInfoProps {
  chainName: string;
  account: Address;
  amount: string; // Amount to approve
  operation: "wrap" | "withdraw"; // Determines approval type
}

/**
 * Approves stETH for wrapping into wstETH.
 */
export async function approveStETH(
    { chainName, account, amount,operation }: StEthInfoProps,
    { sendTransactions, notify }: FunctionOptions
  ): Promise<FunctionReturn> {
    if (!account) return toResult("Wallet not connected", true);
    if (!amount) return toResult("Invalid amount.", true);
  
    const chainId = getChainFromName(chainName);
    if (!chainId || !supportedChains.includes(chainId)) {
      return toResult(`Lido protocol is not supported on ${chainName}`, true);
    }
  
    try {
      const amountInWei = parseEther(amount);
      const spenderAddress = operation === "wrap" ? wstETH_ADDRESS : LIDO_WITHDRAWAL_ADDRESS; // ✅ Wrapping or Withdrawal Approval

      await notify(`Approving ${amount} stETH for ${operation === "wrap" ? "wrapping" : "withdrawal"}...`);
  
      const tx = {
        target: stETH_ADDRESS as `0x${string}`,
        data: encodeFunctionData({
          abi: stEthAbi,
          functionName: 'approve',
          args: [spenderAddress, amountInWei],
        }),
      };
  
      const result = await sendTransactions({ chainId:17000, account, transactions: [tx] });
      return toResult(`Successfully approved ${amount} stETH for Withdrawal. Transaction Hash : ${result?.data?.[0]?.hash || "Unknown"}`);
    } catch (error) {
      return toResult(`Failed to approve stETH: ${error instanceof Error ? error.message : "Unknown error"}`, true);
    }
  }