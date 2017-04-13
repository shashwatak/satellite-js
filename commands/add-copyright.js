import path from 'path';
import fs from 'fs';
import glob from 'glob'; // eslint-disable-line
import prependFile from 'prepend-file'; // eslint-disable-line

const lines = fs.readFileSync('copyright.txt', {
  encoding: 'utf8',
}).split('\n');

const args = process.argv.slice(2);
const pattern = args[0];

glob(pattern, (err, files) => {
  files.forEach((file) => {
    const filePath = path.resolve(file);
    prependFile.sync(filePath, lines.map((line, i) => {
      if (i === 0) {
        return `/*!\n * ${line}`;
      } else if (i === lines.length - 1) {
        return ` * ${line}\n */\n\n`;
      }
      return ` * ${line}`;
    }).join('\n'), {
      encoding: 'utf8',
    });
  });
});
