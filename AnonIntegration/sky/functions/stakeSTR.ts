import { Address, encodeFunctionData, parseUnits } from 'viem';
import { FunctionReturn, SystemTools, TransactionParams } from '../../../types';
import { toResult } from '../../../transformers';
import { getChainFromName } from 'libs/blockchain';
import { supportedChains, STR_ADDRESS, USDS_ADDRESS } from '../constants';
import { strAbi } from '../abis';
import { checkToApprove } from '../../../helpers';

interface Props {
    chainName: string;
    account: Address;
    amount: string;
}
export async function stakeSTR({ chainName, account, amount }: Props, tools: SystemTools): Promise<FunctionReturn> {
    const { sign, notify } = tools;

    if (!account) return toResult('Wallet not connected', true);

    const chainId = getChainFromName(chainName);
    if (!chainId) return toResult(`Unsupported chain name: ${chainName}`, true);
    if (!supportedChains.includes(chainId)) return toResult(`Sky protocol is not supported on ${chainName}`, true);

    await notify('Preparing to stake USDS tokens in Sky Token Rewards...');

    const amountInWei = parseUnits(amount, 18);
    if (amountInWei === 0n) return toResult('Amount must be greater than 0', true);

    const txData: TransactionParams[] = [];

    // Check and prepare approve transaction if needed
    const approve = await checkToApprove(chainName, account, USDS_ADDRESS, STR_ADDRESS, amountInWei);
    if (approve.length > 0) {
        await notify('Approval needed for USDS token transfer...');
    }
    txData.push(...approve);
    // Prepare stake transaction
    const tx: TransactionParams = {
        target: STR_ADDRESS,
        data: encodeFunctionData({
            abi: strAbi,
            functionName: 'stake',
            args: [amountInWei],
        }),
    };
    txData.push(tx);

    await notify('Waiting for transaction confirmation...');

    const result = await sign(chainId, account, txData);
    const stakeMessage = result.messages[result.messages.length - 1];

    return toResult(result.isMultisig ? stakeMessage : `Successfully staked ${amount} USDS in STR. ${stakeMessage}`);
}
