import { Address, Hex, parseEther } from 'viem';
import { EVM, EvmChain, FunctionOptions, FunctionReturn, toResult } from '@heyanon/sdk';
import { callSDK, getMarketData } from '../helper';
import { SwapData } from '../types';
import { MARKET_TOKENS } from '../constants';

const { getChainFromName } = EVM.utils;

interface swapTokenToPtProps {
    chainName: string; // Name of the blockchain network (e.g., "Ethereum")
    account: Address; // User's wallet address
    amount: string; // Amount of PT (Principal Token) to swap
    inToken: string; // Name of the Input token (e.g., "ETH")
    outToken: string; // Name of the output token (e.g., "PT stEth")
}

/**
 * Swaps PT (Principal Token) to SY (Standard Yield Token) in Pendle Finance.
 * @param {swapTokenToPtProps} args - Contains blockchain name, account, amount, and token addresses.
 * @param {FunctionOptions} options - Provides `sendTransactions` and `notify` utilities.
 * @returns {Promise<FunctionReturn>} - A promise resolving to a success or error message.
 */
export async function swapTokenToPt(
    { chainName, account, amount, outToken, inToken }: swapTokenToPtProps,
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
        await notify(`Fetching market data for ${chainName}...`);

        // Fetch market data to dynamically get PT_ADDRESS
        const marketData = await getMarketData(chainId);
        if (!marketData || marketData.length === 0) {
            return toResult(`No active markets found for chain ${chainName}`, true);
        }

        // Extract PT_ADDRESS from the market data based on outToken name
        const market = marketData.find((m: any) => m.name === outToken.split(" ")[1]);
        const PT_ADDRESS = market?.pt as Address;
        const MARKET_ADDRESS = market?.address as Address;
        const TOKEN_ADDRESS = MARKET_TOKENS[chainId][inToken]

        // ✅ Validate TOKEN_ADDRESS
        if (!TOKEN_ADDRESS) return toResult(`Token address not found for ${inToken} on ${chainName}`, true);

        // ✅ Validate PT_ADDRESS
        if (!PT_ADDRESS) return toResult(`No PT address found for ${outToken} on ${chainName}`, true);

        // **Call Pendle SDK to Get Swap Transaction Details**
        const res = await callSDK<SwapData>(`/v1/sdk/${chainId}/markets/${MARKET_ADDRESS}/swap`, {
            receiver: account, // User's wallet receives the swapped tokens
            slippage: 0.01, // Set slippage tolerance to 1%
            tokenIn: TOKEN_ADDRESS, 
            tokenOut: PT_ADDRESS,
            amountIn: amount, 
        });

        // **Validate SDK Response**
        if (!res || !res.tx) return toResult(`Failed to get swap transaction details from SDK`, true);

        // **Transform the SDK Response into a Valid Transaction Format**
        const transaction = {
            target: res.tx.to as Address, // Target contract address (swap contract)
            data: res.tx.data as Hex, // Transaction data (encoded call to the smart contract)
            value: parseEther(res.tx.value), // Convert ETH amount (if required) to the correct format
        };

        // **Notify User Before Sending the Transaction**
        // await notify(`Swapping ${amount} ${inToken} to ${outToken}. Sending transaction...`);

        // **Send the Transaction Using sendTransactions**
        const result = await sendTransactions({
            chainId, // The blockchain network ID
            account, // User's wallet address
            transactions: [transaction], // Transaction details array
        });

        // **Return Success Message**
        return toResult(`Swap successful: Swapped ${amount} ${TOKEN_ADDRESS} to ${outToken}. Transaction: ${result.data}`);
    } catch (error) {
        // **Handle and Return Error Message**
        return toResult(`Failed to swap ${inToken} to ${outToken}: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
    }
}
