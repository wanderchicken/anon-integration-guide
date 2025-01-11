import { Address, parseUnits, formatUnits, encodeFunctionData } from 'viem';
import { FunctionReturn, SystemTools, TransactionParams } from '../../../types';
import { toResult } from '../../../transformers';
import { getViemClient, getChainFromName } from 'libs/blockchain';
import { supportedChains, SSR_ADDRESS } from '../constants';
import { ssrAbi } from '../abis';

interface Props {
    chainName: string;
    account: Address;
    shares: string;
}

export async function redeemSSR({ chainName, account, shares }: Props, tools: SystemTools): Promise<FunctionReturn> {
    const { sign } = tools;

    if (!account) return toResult('Wallet not connected', true);

    const chainId = getChainFromName(chainName);
    if (!chainId) return toResult(`Unsupported chain name: ${chainName}`, true);
    if (!supportedChains.includes(chainId)) return toResult(`Sky protocol is not supported on ${chainName}`, true);

    const publicClient = getViemClient({ chainId });

    const sharesInWei = parseUnits(shares, 18);
    if (sharesInWei === 0n) return toResult('Amount must be greater than 0', true);

    // Check max redeemable amount
    const maxRedeem = await publicClient.readContract({
        address: SSR_ADDRESS,
        abi: ssrAbi,
        functionName: 'maxRedeem',
        args: [account],
    });

    if (sharesInWei > maxRedeem) {
        return toResult(`Cannot redeem more than ${formatUnits(maxRedeem, 18)} sUSDS`, true);
    }

    const txs: TransactionParams[] = [
        {
            target: SSR_ADDRESS,
            data: encodeFunctionData({
                abi: ssrAbi,
                functionName: 'redeem',
                args: [sharesInWei, account, account],
            }),
        },
    ];

    const result = await sign(chainId, account, txs);
    const redeemMessage = result.messages[result.messages.length - 1];

    return toResult(result.isMultisig ? redeemMessage : `Successfully redeemed ${shares} sUSDS. ${redeemMessage}`);
}
