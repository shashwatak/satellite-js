var compressor = require('node-minify');
var config = require('./package.json');
var path = require('path');
var fs = require('fs');
var uglify = process.argv.indexOf('--compress')>-1;
var common = process.argv.indexOf('--commonjs')>-1;

var start = new Date();


new compressor.minify({
  type:(uglify)?'uglifyjs':'no-compress',
  fileIn: [
     './src/satellite-head.js',
     './src/constants.js',
     './src/dpper.js',
     './src/dscom.js',
     './src/dsinit.js',
     './src/dspace.js',
     './src/gstime.js',
     './src/initl.js',
     './src/sgp4init.js',
     './src/propagate.js',
     './src/sgp4.js',
     './src/coordinate-transforms.js',
     './src/doppler.js',
     './src/satellite-tail.js'
  ],
  fileOut: config.main,
  callback: function(err,min){
    if(err){
      console.error(err);
    }else{
      if(common){
  
        fs.writeFileSync(config.main, 
        fs.readFileSync(config.main, {encoding:'utf8'})
        .replace(/^satellite/, 'module.exports')
        .replace(/[\r\n]{1,}/g, ''));
      }
      console.info('Build Complete.  Elapsed Time:');
      console.info((((new Date()) - start)/1000)+" seconds");
      console.info('Output File: ');
      console.info(path.join(__dirname, config.main));
    }
  }
}); 
 