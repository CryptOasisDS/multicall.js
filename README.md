# Multicall.js <img width="100" align="right" alt="Multicall" src="https://user-images.githubusercontent.com/304108/55666937-320cb180-5888-11e9-907b-48ba66150523.png" />

[![npm version](https://img.shields.io/npm/v/@wonderwall/multicall.svg?style=flat-square)](https://www.npmjs.com/package/@wonderwall/multicall)

**This version was created by [Oasis team](https://wonderwall.finance). It supports Multicall v2 (with failed calls support), typescript and Binance Smart Chain.**

**Multicall.js** is a lightweight JavaScript library for interacting with the [multicall](https://github.com/makerdao/multicall) smart contract.

Multicall allows multiple smart contract constant function calls to be grouped into a single call and the results aggregated into a single result. This reduces the number of separate JSON RPC requests that need to be sent over the network if using a remote node like Infura, and provides the guarantee that all values returned are from the same block. The latest block number is also returned along with the aggregated results.

## Summary

- Get the return value(s) of multiple smart contract function calls in a single call
- Guarantee that all values are from the same block
- Use watchers to poll for multiple blockchain state variables/functions
- Get updates when a watcher detects state has changed
- Results from out of sync nodes are automatically ignored
- Get new block updates

## Installation

```bash
yarn add @wonderwall/multicall
```

## Usage

```javascript
import { createWatcher } from '@wonderwall/multicall';

// Contract addresses used in this example
const TOKEN = '0xd9c99510a5e3145359d91fe9caf92dd5d68b603a';
const DECIMALS = 9;
const FISH = '0x86dd9a218780c64f934799a530371795d46f1a8a';
const DEPLOYER = '0x000000000D0D02A775C6E45C2b88572C07CF665B'

// Preset can be 'ethereum', 'kovan', 'rinkeby', 'goerli' or 'xdai'
const config = { preset: 'bsc' };

// Create watcher
const watcher = createWatcher(
  [
    {
      target: TOKEN,
      call: ['balanceOf(address)(uint256)', DEPLOYER],
      returns: [['BALANCE_OF_DEPLOYER', val => val / 10 ** DECIMALS]]
    }
  ],
  false,
  config
);

// Subscribe to state updates
watcher.subscribe(update => {
  console.log(`Update: ${update.type} = ${update.value}`);
});

// Subscribe to batched state updates
watcher.batch().subscribe(updates => {
  // Handle batched updates here
  // Updates are returned as { type, value } objects, e.g:
  // { type: 'BALANCE_OF_DEPLOYER', value: 70000 }
});

// Subscribe to new block number updates
watcher.onNewBlock(blockNumber => {
  console.log('New block:', blockNumber);
});

// Start the watcher polling
watcher.start();
```

```javascript
// The JSON RPC URL and multicall contract address can also be specified in the config:
const config = {
  rpcUrl: 'https://kovan.infura.io',
  multicallAddress: '0x5ba1e12693dc8f9c48aad8770482f4739beed696'
};
```

```javascript
// Update the watcher calls using tap()
const fetchWaiter = watcher.tap(calls => [
  // Pass back existing calls...
  ...calls,
  // ...plus new calls
  {
    target: MKR_TOKEN,
    call: ['balanceOf(address)(uint256)', FISH],
    returns: [['BALANCE_OF_FISH', val => val / 10 ** DECIMALS]]
  }
]);
// This promise resolves when the first fetch completes
fetchWaiter.then(() => {
  console.log('Initial fetch completed');
});
```

```javascript
// Recreate the watcher with new calls and config (allowing the network to be changed)
const config = { preset: 'ethereum' };
watcher.recreate(
  [
    {
      target: MKR_TOKEN,
      call: ['balanceOf(address)(uint256)', DEPLOYER],
      returns: [['BALANCE_OF_DEPLOYER', val => val / 10 ** DECIMALS]]
    }
  ],
  false,
  config
);
```

## Helper Functions
Special variables and functions (e.g. `addr.balance`, `block.blockhash`, `block.timestamp`) can be accessed by calling their corresponding helper function.
To call these helper functions simply omit the `target` property (and it will default to multicall's contract address).
```javascript
const watcher = createWatcher(
  [
    {
      call: [
        'getEthBalance(address)(uint256)', 
        '0x72776bb917751225d24c07d0663b3780b2ada67c'
      ],
      returns: [['ETH_BALANCE', val => val / 10 ** 18]]
    },
    {
      call: ['getBlockHash(uint256)(bytes32)', 11482494],
      returns: [['SPECIFIC_BLOCK_HASH_0xFF4DB']]
    },
    {
      call: ['getLastBlockHash()(bytes32)'],
      returns: [['LAST_BLOCK_HASH']]
    },
    {
      call: ['getCurrentBlockTimestamp()(uint256)'],
      returns: [['CURRENT_BLOCK_TIMESTAMP']]
    },
    {
      call: ['getCurrentBlockDifficulty()(uint256)'],
      returns: [['CURRENT_BLOCK_DIFFICULTY']]
    },
    {
      call: ['getCurrentBlockGasLimit()(uint256)'],
      returns: [['CURRENT_BLOCK_GASLIMIT']]
    },
    {
      call: ['getCurrentBlockCoinbase()(address)'],
      returns: [['CURRENT_BLOCK_COINBASE']]
    }
  ],
  false,
  { preset: 'kovan' }
);
```

## Examples

Check out those [Examples](https://github.com/CryptOasisDS/multicall.js/tree/master/examples).

To run the example in the project, first clone this repo:

```bash
git clone https://github.com/CryptOasisDS/multicall.js
```

Then install the dependencies:

```bash
yarn
```

Finally run the example script (`examples/es-example.js`):

```bash
yarn example
```

## Test

To run tests use:

```bash
yarn test
```
