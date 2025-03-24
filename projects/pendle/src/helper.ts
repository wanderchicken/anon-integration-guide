import axios from 'axios';

const HOSTED_SDK_URL = 'https://api-v2.pendle.finance/core/';
export const LIMIT_ORDER_URL = 'https://api-v2.pendle.finance/limit-order/'

type MethodReturnType<Data> = {
    tx: {
        data: string;
        to: string;
        value: string;
    };
    data: Data;
};

export async function callSDK<Data>(path: string, params: Record<string, any> = {}) {
    const response = await axios.get<MethodReturnType<Data>>(HOSTED_SDK_URL + path, {
        params
    });

    return response.data;
}

export async function getMarketData(chainId: number) {
    try {
        const response = await axios.get(`${HOSTED_SDK_URL}v1/${chainId}/markets/active`);
        return response.data.markets;
    } catch (error) {
        console.error('Error fetching market data:', error);
        throw error;
    }
} 
