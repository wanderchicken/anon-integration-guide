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

export async function exitSTR({ chainName, account }: Props, tools: SystemTools): Promise<FunctionReturn> {
    const { sign, notify } = tools;

    if (!account) return toResult('Wallet not connected', true);

    const chainId = getChainFromName(chainName);
    if (!chainId) return toResult(`Unsupported chain name: ${chainName}`, true);
    if (!supportedChains.includes(chainId)) return toResult(`Sky protocol is not supported on ${chainName}`, true);

    await notify('Checking staked balance...');

    // Check if user has staked balance
    const publicClient = getViemClient({ chainId });

    // Check if user has any staked tokens
    const stakedBalance = await publicClient.readContract({
        address: STR_ADDRESS,
        abi: strAbi,
        functionName: 'balanceOf',
        args: [account],
    });

    if (stakedBalance === 0n) {
        return toResult('No staked balance to withdraw', true);
    }

    await notify('Preparing exit transaction (withdraw all + claim rewards)...');

    const tx: TransactionParams = {
        target: STR_ADDRESS,
        data: encodeFunctionData({
            abi: strAbi,
            functionName: 'exit',
            args: [],
        }),
    };

    await notify('Waiting for transaction confirmation...');

    const result = await sign(chainId, account, [tx]);
    const exitMessage = result.messages[result.messages.length - 1];

    return toResult(result.isMultisig ? exitMessage : `Successfully exited from STR (withdrawn all + claimed rewards). ${exitMessage}`);
}
