import { createWatcher } from '../src';

const OASIS_TOKEN = '0xd9c99510a5e3145359d91fe9caf92dd5d68b603a';
const OASIS_DECIMALS = 9;
const FISH = '0x86dd9a218780c64f934799a530371795d46f1a8a';
const DEPLOYER = '0x000000000D0D02A775C6E45C2b88572C07CF665B'

// All the available presets: https://github.com/CryptOasisDS/multicall.js/blob/master/src/addresses.json
// const config = { preset: 'kovan' };

// Alternatively the rpcUrl and multicallAddress can be specified manually
const config = {
  preset: 'bsc'
};

(async () => {
  const watcher = createWatcher(
    [
      {
        call: [
          'getEthBalance(address)(uint256)',
          DEPLOYER
        ],
        returns: [['ETH_BALANCE', val => val / 10 ** 18]]
      },
      {
        target: OASIS_TOKEN,
        call: ['balanceOf(address)(uint256)', DEPLOYER],
        returns: [['BALANCE_OF_DEPLOYER', val => val / 10 ** OASIS_DECIMALS]]
      }
    ],
    false,
    config
  );

  watcher.subscribe(update => {
    console.log(`Update: ${update.type} = ${update.value}`);
  });

  watcher.batch().subscribe(updates => {
    // Handle batched updates here
  });

  watcher.onNewBlock(blockNumber => {
    console.log(`New block: ${blockNumber}`);
  });

  setTimeout(async () => {
    watcher.start();

    await watcher.awaitInitialFetch();

    console.log('Initial fetch completed');

    // Update the calls
    setTimeout(() => {
      console.log('Updating calls...');
      const fetchWaiter = watcher.tap(calls => [
        ...calls,
        {
          target: OASIS_TOKEN,
          call: ['balanceOf(address)(uint256)', FISH],
          returns: [['BALANCE_OF_FISH', val => val / 10 ** OASIS_DECIMALS]]
        }
      ]);
      fetchWaiter.then(() => {
        console.log('Initial fetch completed');
      });
    }, 1000);

    // Recreate watcher (useful if network has changed)
    setTimeout(() => {
      console.log('Recreating with new calls and config...');
      const fetchWaiter = watcher.recreate(
        [
          {
            target: OASIS_TOKEN,
            call: ['balanceOf(address)(uint256)', DEPLOYER],
            returns: [['BALANCE_OF_DEPLOYER', val => val / 10 ** OASIS_DECIMALS]]
          }
        ],
        config
      );
      fetchWaiter.then(() => {
        console.log('Initial fetch completed');
      });
    }, 2000);

  }, 1);

  // When subscribing to state updates, previously cached values will be returned immediately
  // setTimeout(() => {
  //   console.log(
  //     'Subscribing to updates much later (will immediately return cached values)'
  //   );
  //   watcher.subscribe(update => {
  //     console.log(
  //       `Update (2nd subscription): ${update.type} = ${update.value}`
  //     );
  //   });
  //   watcher.onNewBlock(blockNumber => {
  //     console.log(`New block (2nd subscription): ${blockNumber}`);
  //   });
  // }, 15000);
})();

(async () => {
  await new Promise(res => {
    setTimeout(res, 10000000);
  });
})();
