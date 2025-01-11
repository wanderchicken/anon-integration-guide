import { Address, formatUnits } from 'viem';
import { FunctionReturn } from '../../../types';
import { toResult } from '../../../transformers';
import { getViemClient, getChainFromName } from 'libs/blockchain';
import { supportedChains, STR_ADDRESS, SSR_ADDRESS } from '../constants';
import { strAbi, ssrAbi } from '../abis';

interface Props {
    chainName: string;
    account: Address;
}

export async function getUserPositionOnSKY({ chainName, account }: Props): Promise<FunctionReturn> {
    const chainId = getChainFromName(chainName);
    if (!chainId) return toResult(`Unsupported chain name: ${chainName}`, true);
    if (!supportedChains.includes(chainId)) return toResult(`Sky protocol is not supported on ${chainName}`, true);

    const publicClient = getViemClient({ chainId });

    // Get STR data
    const [stakedBalance, earnedRewards] = await Promise.all([
        publicClient.readContract({
            address: STR_ADDRESS,
            abi: strAbi,
            functionName: 'balanceOf',
            args: [account],
        }),
        publicClient.readContract({
            address: STR_ADDRESS,
            abi: strAbi,
            functionName: 'earned',
            args: [account],
        }),
    ]);

    // Get SSR data
    const maxWithdraw = await publicClient.readContract({
        address: SSR_ADDRESS,
        abi: ssrAbi,
        functionName: 'maxWithdraw',
        args: [account],
    });

    return toResult(
        `Sky Protocol Position:\n` +
            `STR:\n` +
            `- Staked USDS: ${formatUnits(stakedBalance, 18)} USDS\n` +
            `- Pending SKY rewards: ${formatUnits(earnedRewards, 18)} SKY\n` +
            `SSR:\n` +
            `- Available to withdraw: ${formatUnits(maxWithdraw, 18)} USDS`,
    );
}
