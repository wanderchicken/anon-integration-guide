import { Address, Hex, parseEther } from 'viem';
import { EVM, EvmChain, FunctionOptions, FunctionReturn, toResult } from '@heyanon/sdk';
import { callSDK } from '../helper';
import { SwapData } from '../types';

const { getChainFromName } = EVM.utils;

interface SwapPtToSyProps {
    chainName: string; // Name of the blockchain network (e.g., "Ethereum")
    account: Address; // User's wallet address
    amount: string; // Amount of PT (Principal Token) to swap
    PT_ADDRESS: Address; // Address of the Principal Token contract
    MARKET_ADDRESS: Address; // Address of the Pendle Finance market contract
    SY_ADDRESS: Address; // Address of the Standard Yield Token contract
}

/**
 * Swaps PT (Principal Token) to SY (Standard Yield Token) in Pendle Finance.
 * @param {SwapPtToSyProps} args - Contains the blockchain name, account, amount, and token addresses.
 * @param {FunctionOptions} options - Provides `sendTransactions` and `notify` utilities.
 * @returns {Promise<FunctionReturn>} - A promise resolving to a success or error message.
 */
export async function swapPtToSy(
    { chainName, account, amount, PT_ADDRESS, MARKET_ADDRESS, SY_ADDRESS }: SwapPtToSyProps,
    options: FunctionOptions
): Promise<FunctionReturn> {
    const {
        evm: { getProvider, sendTransactions },
        notify,
    } = options;

    // **Input Validation**
    if (!account) return toResult('Wallet not connected', true);
    if (!chainName || typeof chainName !== 'string') return toResult('Chain name must be a non-empty string', true);
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return toResult('Amount must be a valid number greater than 0', true);

    // **Validate Blockchain Network**
    const chainId = getChainFromName(chainName as EvmChain); // Convert chain name to chain ID
    if (!chainId) return toResult(`Unsupported chain name: ${chainName}`, true);

    // **Get the Provider for the Specified Chain**
    const publicClient = getProvider(chainId);
    if (!publicClient) return toResult(`Failed to get provider for chain: ${chainName}`, true);

    try {
        // **Notify User Before Swap Begins**
        await notify(`Preparing to swap ${amount} PT to SY...`);

        // **Call Pendle SDK to Get Swap Transaction Details**
        const res = await callSDK<SwapData>(`/v1/sdk/${chainId}/markets/${MARKET_ADDRESS}/swap`, {
            receiver: account, // User's wallet receives the swapped tokens
            slippage: 0.01, // Set slippage tolerance to 1%
            tokenIn: PT_ADDRESS, // PT (Principal Token) being swapped
            tokenOut: SY_ADDRESS, // SY (Standard Yield Token) received
            amountIn: amount, // Amount of PT to swap
        });

        // **Transform the SDK Response into a Valid Transaction Format**
        const transaction = {
            target: res.tx.to as Address, // Target contract address (swap contract)
            data: res.tx.data as Hex, // Transaction data (encoded call to the smart contract)
            value: parseEther(res.tx.value), // Convert ETH amount (if required) to the correct format
        };

        // **Notify User Before Sending the Transaction**
        await notify(`Swapping ${amount} PT to SY. Sending transaction...`);

        // **Send the Transaction Using sendTransactions**
        const result = await sendTransactions({
            chainId, // The blockchain network ID
            account, // User's wallet address
            transactions: [transaction], // Transaction details array
        });

        // **Return Success Message**
        return toResult(`Swap successful: Swapped ${amount} PT to SY. Transaction: ${result.data}`);
    } catch (error) {
        // **Handle and Return Error Message**
        return toResult(`Failed to swap PT to SY: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
    }
}
