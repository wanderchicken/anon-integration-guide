import { Address, formatUnits } from 'viem';
import { FunctionReturn } from '../../../types';
import { toResult } from '../../../transformers';
import { getViemClient, getChainFromName } from 'libs/blockchain';
import { supportedChains, SSR_ADDRESS } from '../constants';
import { ssrAbi } from '../abis';

interface Props {
    chainName: string;
    account: Address;
}

export async function maxWithdrawSSR({ chainName, account }: Props): Promise<FunctionReturn> {
    const chainId = getChainFromName(chainName);
    if (!chainId) return toResult(`Unsupported chain name: ${chainName}`, true);
    if (!supportedChains.includes(chainId)) return toResult(`Sky protocol is not supported on ${chainName}`, true);

    const publicClient = getViemClient({ chainId });

    const maxWithdraw = await publicClient.readContract({
        address: SSR_ADDRESS,
        abi: ssrAbi,
        functionName: 'maxWithdraw',
        args: [account],
    });

    return toResult(`Maximum withdrawable amount: ${formatUnits(maxWithdraw, 18)} USDS`);
}
