
import { Chain, EVM } from '@heyanon/sdk';
const { ChainIds } = EVM.constants;

export const supportedChains = [ChainIds[Chain.ETHEREUM],ChainIds[Chain.ARBITRUM],ChainIds[Chain.OPTIMISM],ChainIds[Chain.BASE],ChainIds[Chain.SONIC]];
