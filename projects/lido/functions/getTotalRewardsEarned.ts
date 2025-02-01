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
 * Fetches the total rewards earned by the user on Lido using sharesOf.
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

    // Fetch user's shares
    const userShares = (await publicClient.readContract({
      address: stETH_ADDRESS,
      abi: stEthAbi,
      functionName: 'sharesOf',
      args: [account],
    })) as bigint;

    // Get total pooled ETH in Lido
    const totalPooledEther = (await publicClient.readContract({
      address: stETH_ADDRESS,
      abi: stEthAbi,
      functionName: 'getTotalPooledEther',
    })) as bigint;

    // Get total shares issued by Lido
    const totalShares = (await publicClient.readContract({
      address: stETH_ADDRESS,
      abi: stEthAbi,
      functionName: 'getTotalShares',
    })) as bigint;

    // Calculate initial staked amount using shares formula
    const initialStakedAmount = (userShares * totalPooledEther) / totalShares;

    // Calculate total rewards earned (stETH + converted wstETH - initial stake)
    const totalRewards = BigInt(stEthBalance) + BigInt(convertedStEth) - initialStakedAmount;

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
