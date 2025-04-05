
import { EVM } from '@heyanon/sdk';
import { Address } from 'viem';
const { ChainIds } = EVM.constants;

interface Token {
	address: Address;
	chainBased?: boolean;
}

interface MarketTokens {
	[key: string]: Token;
}

interface TokenConfig {
	[chainId: number]: MarketTokens;
}

export const supportedChains = [ChainIds.ethereum,ChainIds.arbitrum,ChainIds.base,ChainIds.sonic];

export const MARKET_TOKENS: TokenConfig = {
	[ChainIds.base]: {
		ETH: { address: '0x0000000000000000000000000000000000000000' },
		mUSDC: { address: '0xedc817a28e8b93b03976fbd4a3ddbc9f7d176c22' },
		USDC: { address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' },
		AERO: { address: '0x940181a94a35a4569e4529a3cdfb74e38fd98631' },
		cbBTC: { address: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf' },
		DAI: { address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb' },
		USDT: { address: '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2' },
		USR: { address: '0x35e5db674d8e93a03d814fa0ada70731efe8a4b9' },
		VIRTUAL: { address: '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b' },
		weETH: { address: '0x04c0599ae5a44757c0af6f9ec3b93da8976c150a' },
		rETH: { address: '0xb6fe221fe9eef5aba221c348ba20a1bf5e73624c' },
		CONVO: { address: '0xab964f7b7b6391bd6c4e8512ef00d01f255d9c0d' },
		wstETH: { address: '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452' },
		WETH: { address: '0x4200000000000000000000000000000000000006' },
		TRUMP: { address: '0xc27468b12ffa6d714b1b5fbc87ef403f38b82ad4' },
	},
	[ChainIds.ethereum]: {
		ETH: { address: '0x0000000000000000000000000000000000000000' },
		stETH: { address: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84' },
		WETH: { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
		wstETH: { address: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0' },
		"1INCH": { address: '0x111111111117dc0aa78b770fa6a738034120c302' },
		AAVE: { address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9' },
		agETH: { address: '0xe1b4d34e8754600962cd944b535180bd758e6c2e' },
		amphrETH: { address: '0x5fd13359ba15a84b76f7f87568309040176167cd' },
		ankrETH: { address: '0xe95a203b1a91a908f9b9ce46459d101078c2c3cb' },
		APE: { address: '0x4d224452801aced8b2f0aebe155379bb5d594381' },
		ARB: { address: '0xb50721bcf8d664c30412cfbc6cf7a15145234ad1' },
		AURA: { address: '0xc0c293ce456ff0ed870add98a0828dd4d2903dbf' },
		BAL: { address: '0xba100000625a3754423978a60c9317c58a424e3d' },
		BNB: { address: '0xb8c77482e45f1f44de1745f52c74426c631bdd52' },
		CARROT: { address: '0x282a69142bac47855c3fbe1693fcc4ba3b4d5ed6' },
		cbBTC: { address: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf' },
		COMP: { address: '0xc00e94cb662c3520282e6f5717214004a7f26888' },
		CRV: { address: '0xd533a949740bb3306d119cc777fa900ba034cd52' },
		cUSDO: { address: '0xad55aebc9b8c03fc43cd9f62260391c13c23e7c0' },
		DOLA: { address: '0x865377367054516e17014ccded1e7d814edc9ce4' },
		eBTC: { address: '0x657e8c867d8b37dcc18fa4caead9c45eb088c642' },
		eUSD: { address: '0xdf3ac4f479375802a821f7b7b46cd7eb5e4262cc' },
		PEPE: { address: '0x6982508145454ce325ddbe47a25d4ec3d2311933' },
		OETH: { address: '0x856c4efb76c1d1ae02e20ceb03a2a6a08b0b8dc3' },
		MORPHO: { address: '0x58d97b57bb95320f9a05dc918aef65434969c2b2' },
		PYUSD: { address: '0x6c3ea9036406852006290770bedfcaba0e23a0e8' },
		LDO: { address: '0x5a98fcbea516cf06857215779fd812ca3bef1b32' },
		swETH: { address: '0xf951e335afb289353dc249e82926178eac7ded78' },
		pufETH: { address: '0xd9a442856c234a39a81a089c06451ebaa4306a72' },
		USDC: { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
	},
	[ChainIds.sonic]: {
		aUSDC: { address: '0x578ee1ca3a8e1b54554da1bf7c583506c4cd11c6' },
		Anon: { address: '0x79bbf4508b1391af3a0f4b30bb5fc4aa9ab0e07c' },
		OS: { address: '0xb1e25689d55734fd3fffc939c4c3eb52dff8a794' },
		WETH: { address: '0x50c42deacd8fc9773493ed674b675be577f2634b' },
		USDT: { address: '0x6047828dc181963ba44974801ff68e538da5eaf9' },
		Sonic: { address: '0x0000000000000000000000000000000000000000' },
		stS: { address: '0xe5da20f15420ad15de0fa650600afc998bbe3955' },
	},
    [ChainIds.arbitrum]: {
		wstETH: { address: '0x5979d7b546e38e414f7e9822514be443a4800529' },
		USDT: { address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9' },
		USDe: { address: '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34' },
		WETH: { address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1' },
		WBTC: { address: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f' },
		USDS: { address: '0x6491c05a82219b8d1479057361ff1654749b876b' },
		rsETH: { address: '0x4186bfc76e2e237523cbc30fd220fe055156b41f' },
		LINK: { address: '0xf97f4df75117a78c1a5a0dbb814af92458539fb4' },
		MIM: { address: '0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a' },
		gUSDC: { address: '0xd3443ee1e91af28e5fb858fbd0d72a63ba8046e0' },
		ETH: { address: '0x0000000000000000000000000000000000000000' },

	},
};
