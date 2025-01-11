import { Address, parseUnits, formatUnits, encodeFunctionData } from 'viem';
import { FunctionReturn, SystemTools, TransactionParams } from 'libs/adapters/types';
import { toResult } from 'libs/adapters/transformers';
import { getChainFromName } from 'libs/blockchain';
import { supportedChains, SSR_ADDRESS, SUSDS_ADDRESS } from '../constants';
import { ssrAbi } from '../abis';
import { balanceOf } from 'libs/adapters/helpers';

interface Props {
    chainName: string;
    account: Address;
    amount: string;
}

export async function withdrawSSR({ chainName, account, amount }: Props, tools: SystemTools): Promise<FunctionReturn> {
    const { sign, notify } = tools;

    if (!account) return toResult('Wallet not connected', true);

    const chainId = getChainFromName(chainName);
    if (!chainId) return toResult(`Unsupported chain name: ${chainName}`, true);
    if (!supportedChains.includes(chainId)) return toResult(`Sky protocol is not supported on ${chainName}`, true);

    await notify('Preparing to withdraw USDS tokens from Sky Savings Rate...');

    const amountInWei = parseUnits(amount, 18);
    if (amountInWei === 0n) return toResult('Amount must be greater than 0', true);

    const sUSdsBalance = await balanceOf(chainName, account, SUSDS_ADDRESS);

    if (sUSdsBalance < amountInWei) {
        return toResult(`Insufficient sUSDS balance. Have ${formatUnits(sUSdsBalance, 18)}, want to withdraw ${amount}`, true);
    }

    const tx: TransactionParams = {
        target: SSR_ADDRESS,
        data: encodeFunctionData({
            abi: ssrAbi,
            functionName: 'withdraw',
            args: [amountInWei, account, account],
        }),
    };

    await notify('Waiting for transaction confirmation...');

    const result = await sign(chainId, account, [tx]);
    const withdrawMessage = result.messages[result.messages.length - 1];

    return toResult(result.isMultisig ? withdrawMessage : `Successfully withdrawn ${amount} USDS from SSR. ${withdrawMessage}`);
}
