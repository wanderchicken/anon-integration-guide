import { Address, encodeFunctionData, parseUnits } from 'viem';
import { FunctionReturn, SystemTools, TransactionParams } from 'libs/adapters/types';
import { toResult } from 'libs/adapters/transformers';
import { getChainFromName } from 'libs/blockchain';
import { supportedChains, SSR_ADDRESS, USDS_ADDRESS } from '../constants';
import { ssrAbi } from '../abis';
import { checkToApprove } from 'libs/adapters/helpers';

interface Props {
    chainName: string;
    account: Address;
    amount: string;
    referral?: number;
}

export async function depositSSR({ chainName, account, amount }: Props, tools: SystemTools): Promise<FunctionReturn> {
    const { sign, notify } = tools;

    if (!account) return toResult('Wallet not connected', true);

    const chainId = getChainFromName(chainName);
    if (!chainId) return toResult(`Unsupported chain name: ${chainName}`, true);
    if (!supportedChains.includes(chainId)) return toResult(`Sky protocol is not supported on ${chainName}`, true);

    await notify('Preparing to deposit USDS tokens to Sky Savings Rate...');

    const amountInWei = parseUnits(amount, 18);
    if (amountInWei === 0n) return toResult('Amount must be greater than 0', true);

    const txData: TransactionParams[] = [];

    // Check and prepare approve transaction if needed
    const approve = await checkToApprove(chainName, account, USDS_ADDRESS, SSR_ADDRESS, amountInWei);
    if (approve.length > 0) {
        await notify('Approval needed for USDS token transfer...');
    }
    txData.push(...approve);

    // Prepare deposit transaction
    const tx: TransactionParams = {
        target: SSR_ADDRESS,
        data: encodeFunctionData({
            abi: ssrAbi,
            functionName: 'deposit',
            args: [amountInWei, account],
        }),
    };
    txData.push(tx);

    await notify('Waiting for transaction confirmation...');

    const result = await sign(chainId, account, txData);
    const depositMessage = result.messages[result.messages.length - 1];

    return toResult(result.isMultisig ? depositMessage : `Successfully deposited ${amount} USDS to SSR. ${depositMessage}`);
}
