import { Address, formatUnits } from 'viem';
import {
  FunctionReturn,
  FunctionOptions,
  toResult,
  getChainFromName,
} from '@heyanon/sdk';
import { supportedChains, stETH_ADDRESS, wstETH_ADDRESS } from '../constants';
import stEthAbi from '../abis/stEthAbi';
import wstEthAbi from '../abis/wstEthAbi';

interface StEthInfoProps {
  chainName: string;
  account: Address;
}

/**
 * Fetches the total rewards earned by the user on Lido (stETH balance - initial stake).
 */
export async function getTotalRewardsEarned(
  { chainName, account }: StEthInfoProps,
  { getProvider }: FunctionOptions
): Promise<FunctionReturn> {
  if (!account) return toResult('Wallet not connected', true);

  const chainId = getChainFromName(chainName);
  if (!chainId || !supportedChains.includes(chainId)) {
    return toResult(`Lido protocol is not supported on ${chainName}`, true);
  }

  try {
    const publicClient = getProvider(chainId);

    // Fetch stETH balance
    const stEthBalance = (await publicClient.readContract({
      address: stETH_ADDRESS,
      abi: stEthAbi,
      functionName: 'balanceOf',
      args: [account],
    })) as bigint;

    // Fetch wstETH balance
    const wstEthBalance = (await publicClient.readContract({
      address: wstETH_ADDRESS,
      abi: wstEthAbi,
      functionName: 'balanceOf',
      args: [account],
    })) as bigint;

    // Convert wstETH to stETH equivalent
    const convertedStEth = (await publicClient.readContract({
      address: wstETH_ADDRESS,
      abi: wstEthAbi,
      functionName: 'getStETHByWstETH',
      args: [wstEthBalance],
    })) as bigint;

    // Fetch the first deposit event logs to determine initial staked amount
    const depositLogs = await publicClient.getLogs({
      address: stETH_ADDRESS,
      event: {
        name: 'Transfer',
        type: 'event',
        inputs: [
          { type: 'address', name: 'from', indexed: true },
          { type: 'address', name: 'to', indexed: true },
          { type: 'uint256', name: 'value' },
        ],
      },
      fromBlock: 0n,
      toBlock: 'latest',
      args: {
        to: account as `0x${string}`,
        from: '0x0000000000000000000000000000000000000000' as `0x${string}`,
      },
    });

    if (!Array.isArray(depositLogs) || depositLogs.length === 0) {
      return toResult('No initial staked amount found.', true);
    }

    const firstDeposit = depositLogs[0];
    const initialStakedAmount = firstDeposit.data
      ? BigInt(firstDeposit.data)
      : 0n;

    // Calculate total rewards earned (stETH + converted wstETH - initial stake)
    const totalRewards =
      BigInt(stEthBalance) + BigInt(convertedStEth) - initialStakedAmount;

    return toResult(
      `Total Rewards Earned: ${formatUnits(totalRewards, 18)} stETH`
    );
  } catch (error) {
    return toResult(
      `Failed to fetch total rewards: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      true
    );
  }
}
