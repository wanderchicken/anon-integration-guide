import { Address, formatUnits } from 'viem';
import { FunctionReturn } from '../../../types';
import { toResult } from '../../../transformers';
import { getViemClient, getChainFromName } from 'libs/blockchain';
import { supportedChains, STR_ADDRESS } from '../constants';
import { strAbi } from '../abis';

interface Props {
    chainName: string;
    account: Address;
}

export async function getPendingRewardSTR({ chainName, account }: Props): Promise<FunctionReturn> {
    const chainId = getChainFromName(chainName);
    if (!chainId) return toResult(`Unsupported chain name: ${chainName}`, true);
    if (!supportedChains.includes(chainId)) return toResult(`Sky protocol is not supported on ${chainName}`, true);

    const publicClient = getViemClient({ chainId });

    const earned = await publicClient.readContract({
        address: STR_ADDRESS,
        abi: strAbi,
        functionName: 'earned',
        args: [account],
    });

    return toResult(`Pending SKY rewards: ${formatUnits(earned, 18)} SKY`);
}
