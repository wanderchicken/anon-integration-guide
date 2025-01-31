import { Address } from "viem";
import { FunctionReturn, FunctionOptions, toResult, getChainFromName } from "@heyanon/sdk";
import { supportedChains, stETH_ADDRESS, wstETH_ADDRESS } from "../constants";
import stEthAbi from "../abis/stEthAbi";
import wstEthAbi from "../abis/wstEthAbi";

interface StEthInfoProps {
  chainName: string;
  account: Address;
}


/**
 * Calculates the average APR over the user's staking period.
 */
export async function getAverageAPR(
  { chainName, account }: StEthInfoProps,
  { getProvider }: FunctionOptions
): Promise<FunctionReturn> {
  if (!account) return toResult("Wallet not connected", true);

  const chainId = getChainFromName(chainName);
  if (!chainId || !supportedChains.includes(chainId)) {
    return toResult(`Lido protocol is not supported on ${chainName}`, true);
  }

  try {
    const publicClient = getProvider(chainId);

    const stEthBalance = await publicClient.readContract({
      address: stETH_ADDRESS,
      abi: stEthAbi,
      functionName: "balanceOf",
      args: [account],
    }) as bigint

    // Fetch wstETH balance
    const wstEthBalance = await publicClient.readContract({
      address: wstETH_ADDRESS,
      abi: wstEthAbi,
      functionName: "balanceOf",
      args: [account],
    }) as bigint

    // Convert wstETH to stETH equivalent
    const convertedStEth = await publicClient.readContract({
      address: wstETH_ADDRESS,
      abi: wstEthAbi,
      functionName: "getStETHByWstETH",
      args: [wstEthBalance],
    }) as bigint

    const depositLogs = await publicClient.getLogs({
      address: stETH_ADDRESS,
      event: {
        name: "Transfer",
        type: "event",
        inputs: [
          { type: "address", name: "from", indexed: true },
          { type: "address", name: "to", indexed: true },
          { type: "uint256", name: "value" },
        ],
      },
      fromBlock: 0n,
      toBlock: "latest",
      args: {
        to: account as `0x${string}`,
        from: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      },
    });

    if (!Array.isArray(depositLogs) || depositLogs.length === 0) {
      return toResult("No initial staked amount found.", true);
    }

    const firstDeposit = depositLogs[0];
    const initialStakedAmount = firstDeposit.args?.value
      ? BigInt(firstDeposit.args.value as bigint) // Safely assert the type as bigint
      : 0n;

    const firstStakeBlock = firstDeposit.blockNumber;
    const firstStakeTimestamp = await publicClient.getBlock({ blockNumber: firstStakeBlock });
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const daysStaked = (currentTimestamp - Number(firstStakeTimestamp.timestamp)) / 86400;

    if (daysStaked < 1) {
      return toResult("Staking period is too short to calculate APR.", true);
    }

    const rewardsEarned = BigInt(stEthBalance) + BigInt(convertedStEth) - initialStakedAmount;
    const apr = ((Number(rewardsEarned) / Number(initialStakedAmount)) * (365 / daysStaked) * 100).toFixed(2);

    return toResult(`Your Average APR over ${daysStaked.toFixed(2)} days: ${apr}%`);
  } catch (error) {
    return toResult(`Failed to fetch Average APR: ${error instanceof Error ? error.message : "Unknown error"}`, true);
  }
}
