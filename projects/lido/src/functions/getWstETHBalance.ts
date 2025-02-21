import { Address, formatUnits } from 'viem';
import { supportedChains, wstETH_ADDRESS } from '../constants';
import wstETHAbi from '../abis/wstETHAbi';
import { EVM, EvmChain, FunctionOptions, FunctionReturn, toResult } from '@heyanon/sdk';
const { getChainFromName } = EVM.utils;

interface StEthInfoProps {
  chainName: string;
  account: Address;
}

/**
 * Fetches the user's wstETH balance.
 */
export async function getWstETHBalance( { chainName, account }: StEthInfoProps, options: FunctionOptions): Promise<FunctionReturn> {
  
  const {
		evm: { getProvider },
	} = options;
  
  if (!account) return toResult('Wallet not connected', true);

  const chainId = getChainFromName(chainName as EvmChain);
  if (!chainId || !supportedChains.includes(chainId)) {
    return toResult(`Lido protocol is not supported on ${chainName}`, true);
  }

  try {
    const publicClient = getProvider(chainId);
    const balance = (await publicClient.readContract({
      address: wstETH_ADDRESS,
      abi: wstETHAbi,
      functionName: 'balanceOf',
      args: [account],
    })) as bigint;

    return toResult(`wstETH Balance: ${formatUnits(balance, 18)} wstETH`);
  } catch (error) {
    return toResult(
      `Failed to fetch wstETH balance: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      true
    );
  }
}
