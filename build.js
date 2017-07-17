var compressor = require('node-minify');
var config = require('./package.json');
var path = require('path');
var fs = require('fs');
var uglify = process.argv.indexOf('--compress')>-1;

var start = new Date();


compressor.minify({
  compressor:(uglify)?'uglifyjs':'no-compress',
  input: [
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
  output: config.main,
  callback: function(err,min){
    if(err){
      console.error(err);
    }else{
      var final = fs.readFileSync(config.main, {encoding:'utf8'})
                    .replace(/[\r\n]{1,}/g, '');
      final = ["var _src='",final,"';(typeof module !== 'undefined' && module.exports)?module.exports = function(){new Function(_src)(); satellite._src = _src;return satellite;}():function(){new Function(_src)();satellite._src = _src}();"].join("");
      
      fs.writeFileSync(config.main, final);
      console.info('Build Complete.  Elapsed Time:');
      console.info((((new Date()) - start)/1000)+" seconds");
      console.info('Output File: ');
      console.info(path.join(__dirname, config.main));
    }
  }
}); 
 