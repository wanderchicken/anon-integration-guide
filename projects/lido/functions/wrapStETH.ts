import { Address, encodeFunctionData, parseEther } from "viem";
import { FunctionReturn, FunctionOptions, toResult, getChainFromName } from "@heyanon/sdk";
import { supportedChains, wstETH_ADDRESS } from "../constants";
import wstEthAbi from "../abis/wstEthAbi";

interface StEthInfoProps {
  chainName: string;
  account: Address;
  amount: string; // Amount to wrap/unwrap
}

/**
 * Wraps stETH into wstETH (non-rebasing token).
 */
export async function wrapStETH(
  { chainName, account, amount }: StEthInfoProps,
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
    await notify(`Wrapping ${amount} stETH to wstETH...`);

    const tx = {
      target: wstETH_ADDRESS as `0x${string}`,
      data: encodeFunctionData({
        abi: wstEthAbi,
        functionName: "wrap",
        args: [amountInWei],
      }),
    };

    const result = await sendTransactions({ chainId, account, transactions: [tx] });
    return toResult(`Successfully wrapped ${amount} stETH to wstETH. Transaction: ${result.data}`);
  } catch (error) {
    return toResult(`Failed to wrap stETH: ${error instanceof Error ? error.message : "Unknown error"}`, true);
  }
}