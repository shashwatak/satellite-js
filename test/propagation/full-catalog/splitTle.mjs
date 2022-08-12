/* eslint-disable no-sync */
import * as fs from 'fs';

// eslint-disable-next-line no-sync
const catalog = fs.readFileSync('./test/sgp4/full-catalog/TLE.txt', 'utf8').split('\n');

let fileCt = 0;
let satCount = 0;
let output = [];

for (let i = 0; i < catalog.length; i += 2) {
  const line1 = catalog[i];
  const line2 = catalog[i + 1];

  output.push({
    line1,
    line2,
  });
  satCount++;
  if (satCount > 500) {
    fs.writeFileSync(`./test/sgp4/full-catalog/TLE_${fileCt}.json`, JSON.stringify(output), 'utf8');
    fileCt++;
    output = [];
    satCount = 0;
  }
}
