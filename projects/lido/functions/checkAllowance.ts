import { Address, formatUnits } from 'viem';
import {
  FunctionReturn,
  FunctionOptions,
  toResult,
  getChainFromName,
} from '@heyanon/sdk';
import { stETH_ADDRESS, wstETH_ADDRESS, supportedChains } from '../constants';
import stEthAbi from '../abis/stEthAbi';

interface StEthInfoProps {
  chainName: string;
  account: Address;
}

/**
 * Checks the allowance for stETH wrapping.
 */
export async function checkAllowance(
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
    const allowance = (await publicClient.readContract({
      address: stETH_ADDRESS,
      abi: stEthAbi,
      functionName: 'allowance',
      args: [account, wstETH_ADDRESS],
    })) as bigint;

    return toResult(`Allowance: ${formatUnits(allowance, 18)} stETH`);
  } catch (error) {
    return toResult(
      `Failed to check allowance: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      true
    );
  }
}
