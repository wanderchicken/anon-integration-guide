import { Address, encodeFunctionData } from 'viem';
import { FunctionReturn, SystemTools, TransactionParams } from 'libs/adapters/types';
import { toResult } from 'libs/adapters/transformers';
import { getChainFromName, getViemClient } from 'libs/blockchain';
import { supportedChains, STR_ADDRESS } from '../constants';
import { strAbi } from '../abis';

interface Props {
    chainName: string;
    account: Address;
}

export async function claimRewardSTR({ chainName, account }: Props, tools: SystemTools): Promise<FunctionReturn> {
    const { sign, notify } = tools;

    if (!account) return toResult('Wallet not connected', true);

    const chainId = getChainFromName(chainName);
    if (!chainId) return toResult(`Unsupported chain name: ${chainName}`, true);
    if (!supportedChains.includes(chainId)) return toResult(`Sky protocol is not supported on ${chainName}`, true);

    await notify('Checking pending rewards...');

    // Check pending rewards
    const publicClient = getViemClient({ chainId });
    const pendingReward = await publicClient.readContract({
        address: STR_ADDRESS,
        abi: strAbi,
        functionName: 'earned',
        args: [account],
    });

    if (pendingReward === 0n) {
        return toResult('No rewards to claim', true);
    }

    await notify('Preparing claim transaction...');

    const tx: TransactionParams = {
        target: STR_ADDRESS,
        data: encodeFunctionData({
            abi: strAbi,
            functionName: 'getReward',
            args: [],
        }),
    };

    await notify('Waiting for transaction confirmation...');

    const result = await sign(chainId, account, [tx]);
    const claimMessage = result.messages[result.messages.length - 1];

    return toResult(result.isMultisig ? claimMessage : `Successfully claimed SKY rewards. ${claimMessage}`);
}
