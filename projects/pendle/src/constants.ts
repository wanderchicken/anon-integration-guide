
// Supported chains for Pendle Finance

import { Chain, EVM } from '@heyanon/sdk';
const { ChainIds } = EVM.constants;

export const supportedChains = [ChainIds[Chain.ETHEREUM]];
// export const supportedChains = [1, 10, 42161, 8453, 324];
