import { AiTool } from '@heyanon/sdk';
import { supportedChains } from './constants';

export const tools: AiTool[] = [
    {
        name: 'stakeETH',
        description: 'Stake ETH through Lido and receive stETH in return',
        required: ['chainName', 'account', 'amount'],
        props: [
            {
                name: 'chainName',
                type: 'string',
                enum: supportedChains,
                description: 'The blockchain network to stake ETH on',
            },
            {
                name: 'account',
                type: 'string',
                description: 'The account address staking ETH',
            },
            {
                name: 'amount',
                type: 'string',
                description: 'The amount of ETH to stake in decimal format',
            },
        ],
    },
    {
        name: 'getStETHBalance',
        description: 'Retrieve the stETH balance for a specific account',
        required: ['chainName', 'account'],
        props: [
            {
                name: 'chainName',
                type: 'string',
                enum: supportedChains,
                description: 'The blockchain network to query',
            },
            {
                name: 'account',
                type: 'string',
                description: 'The account address to query the stETH balance',
            },
        ],
    },
    {
        name: 'getStakingAPR',
        description: 'Get the current annual percentage rate (APR) for staking ETH',
        required: ['chainName'],
        props: [
            {
                name: 'chainName',
                type: 'string',
                enum: supportedChains,
                description: 'The blockchain network to query for the APR',
            },
        ],
    },
    {
        name: 'getTotalPooledEther',
        description: 'Retrieve the total pooled ETH in Lido',
        required: ['chainName'],
        props: [
            {
                name: 'chainName',
                type: 'string',
                enum: supportedChains,
                description: 'The blockchain network to query',
            },
        ],
    },
    {
        name: 'unstakeETH',
        description: 'Unstake ETH by swapping stETH back to ETH via Lido',
        required: ['chainName', 'account', 'amount'],
        props: [
            {
                name: 'chainName',
                type: 'string',
                enum: supportedChains,
                description: 'The blockchain network where the unstaking occurs',
            },
            {
                name: 'account',
                type: 'string',
                description: 'The account address to unstake ETH from',
            },
            {
                name: 'amount',
                type: 'string',
                description: 'The amount of stETH to convert back to ETH in decimal format',
            },
        ],
    },
    {
        name: 'getUserStakedETH',
        description: 'Retrieve the user’s total staked ETH position including rewards',
        required: ['chainName', 'account'],
        props: [
            {
                name: 'chainName',
                type: 'string',
                enum: supportedChains,
                description: 'The blockchain network to query',
            },
            {
                name: 'account',
                type: 'string',
                description: 'The account address to query for staked ETH position',
            },
        ],
    },
    {
        name: 'claimRewards',
        description: 'Claim staking rewards for a specific account',
        required: ['chainName', 'account'],
        props: [
            {
                name: 'chainName',
                type: 'string',
                enum: supportedChains,
                description: 'The blockchain network where rewards are claimed',
            },
            {
                name: 'account',
                type: 'string',
                description: 'The account address claiming the rewards',
            },
        ],
    },
];
