import { watch } from 'rollup';

import config from './rollup.config.es';

config.watch = {
  chokidar: true,
  include: 'src/**',
};

const watcher = watch(config);
watcher.on('event', (event) => {
  if (event.code === 'START') {
    console.log('Rebuilding package...');
  } else if (event.code === 'END') {
    console.log('Package is rebuilt.');
  } else if (event.code === 'FATAL') {
    console.log('Fatal error is occurred.');
  }
});
