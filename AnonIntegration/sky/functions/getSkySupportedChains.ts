import { FunctionReturn } from 'libs/adapters/types';
import { toResult } from 'libs/adapters/transformers';
import { supportedChains } from '../constants';
import { chainNames } from 'libs/blockchain/chainNames';

export async function getSkySupportedChains(): Promise<FunctionReturn> {
    const skySupportedChains = supportedChains.map((chainId) => ({
        chainId,
        chainName: chainNames[chainId],
    }));

    return toResult(JSON.stringify(skySupportedChains));
}
