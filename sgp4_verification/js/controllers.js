/*
Copyright 2012 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Author: Eric Bidelman (ericbidelman@chromium.org)
*/

function errorHandler(e) {
  console.error(e);
}

function readAsText(fileEntry, callback) {
  fileEntry.file(function(file) {
    var reader = new FileReader();

    reader.onerror = errorHandler;
    reader.onload = function(e) {
      callback(e.target.result);
    };

    reader.readAsText(file);
  });
}

function writeFileEntry(writableEntry, opt_blob, callback) {
  if (!writableEntry) {
    output.textContent = 'Nothing selected.';
    return;
  }

  writableEntry.createWriter(function(writer) {

    writer.onerror = errorHandler;
    writer.onwriteend = callback;

    // If we have data, write it to the file. Otherwise, just use the file we
    // loaded.
    if (opt_blob) {
      writer.truncate(opt_blob.size);
      waitForIO(writer, function() {
        writer.seek(0);
        writer.write(opt_blob);
      });
    } else {
      chosenFileEntry.file(function(file) {
        writer.truncate(file.fileSize);
        waitForIO(writer, function() {
          writer.seek(0);
          writer.write(file);
        });
      });
    }
  }, errorHandler);
}

function waitForIO(writer, callback) {
  // set a watchdog to avoid eventual locking:
  var start = performance.now();
  // wait for a few seconds
  var reentrant = function() {
    if (writer.readyState===writer.WRITING && performance.now()-start<4000) {
      setTimeout(reentrant, 100);
      return;
    }
    if (writer.readyState===writer.WRITING) {
      console.error("Write operation taking too long, aborting!"+
        " (current writer readyState is "+writer.readyState+")");
      writer.abort();
    } else {
      callback();
    }
  };
  setTimeout(reentrant, 100);
};

function TestCtrl($scope) {
    $scope.tests = [];
    $scope.run_savage = function () {
      $scope.tests = [];
      for (var i = 0; i < 100; i++) {
        savage_value = 0.0;
        savage_start = performance.now();
        while (savage_value <= 2500.0000) {
          savage_value = Math.tan(Math.atan2(Math.exp(Math.log(Math.sqrt(Math.pow(savage_value, 2)))), 1)) + 1;
        }
        savage_end = performance.now();
        savage_time = savage_end - savage_start;
        $scope.tests.push(savage_time);
      };

      var data  = $scope.tests;
      var w     = 700;
      var h     = 300;
      var max   = d3.max(data);

      var x  = d3.scale.linear().domain([0, data.length - 1]).range([0, w]);
      var y  = d3.scale.linear().domain([0, max]).range([h, 0]);

      var vis = d3.select('#chart')
        .append('svg:svg')
          .attr('width', w)
          .attr('height', h);

      vis.selectAll('path.line')
        .data([data])
        .enter()
        .append("svg:path")
        .attr("d", d3.svg.line().x(function(d, i){return x(i);}).y(y));
    };

    $scope.choose_file = function () {
      var accepts = [{ extensions: ['json'] }];
      chrome.fileSystem.chooseEntry({type: 'openFile', accepts: accepts}, function(testJsonFile) {
        if (!testJsonFile) {
          console.error ('No file selected.');
          return;
        }
        readAsText(testJsonFile, function (result) {
          $scope.tests = angular.fromJson (result);
        });
      });
    };

    $scope.save_file = function () {
      var config = {type: 'saveFile'};
      chrome.fileSystem.chooseEntry(config, function(writableEntry) {
        var blob = new Blob([angular.toJson($scope.tests)], {type: 'text/plain'});
        writeFileEntry(writableEntry, blob);
      });
    };

    $scope.verify_sgp4 = function() {

        var deg2rad = Math.PI / 180.0;
        var rad2deg = 180 / Math.PI;
        for (var tests_itor = 0; tests_itor < $scope.tests.length; tests_itor++) {
            var my_location_gd = {
                longitude : (-122.0308)*deg2rad,
                latitude : (36.9613422)*deg2rad,
                height : .5
            };
            var test = $scope.tests[tests_itor];
            var tle_line_1 = test["tle_line_1"];
            var tle_line_2 = test["tle_line_2"];
            var init_start = performance.now();
            var test_sat = satellite.twoline2satrec (tle_line_1, tle_line_2);
            var init_fin = performance.now();
            var init_time = init_fin - init_start;
            for (var results_itor = 0; results_itor < test["results"].length; results_itor++) {
                var result          = test["results"][results_itor];
                var time            = result["time"];
                var known_pos       = result["known_pos"];
                var known_vel       = result["known_vel"];
                var prpgtion_start  = performance.now();
                var r_v             = satellite.sgp4(test_sat, time);
                var prpgtion_fin    = performance.now();
                var prpgtion_time   = prpgtion_fin - prpgtion_start;
                var test_pos        = r_v["position"];
                var test_vel        = r_v["velocity"];
                var pos_error = {
                    x : Math.abs((known_pos["x"] - test_pos["x"]) / known_pos["x"]),
                    y : Math.abs((known_pos["y"] - test_pos["y"]) / known_pos["y"]),
                    z : Math.abs((known_pos["z"] - test_pos["z"]) / known_pos["z"])
                };
                var vel_error = {
                    x : Math.abs((known_vel["x"] - test_vel["x"]) / known_vel["x"]),
                    y : Math.abs((known_vel["y"] - test_vel["y"]) / known_vel["y"]),
                    z : Math.abs((known_vel["z"] - test_vel["z"]) / known_vel["z"])
                };

                result["test_pos"]      = test_pos;
                result["test_vel"]      = test_vel;
                result["pos_error"]     = pos_error;
                result["vel_error"]     = vel_error;
                result["prpgtion_time"] = prpgtion_time;

                var julian_day = test_sat.jdsatepoch + (time*60);

                var gmst = satellite.gstimeFromJday (julian_day);

                var known_position_ecf = satellite.eciToEcf (known_pos, gmst);
                var known_look_angles = satellite.ecfToLookAngles (my_location_gd, known_position_ecf);

                var test_position_ecf = satellite.eciToEcf (test_pos, gmst);
                var test_look_angles = satellite.ecfToLookAngles (my_location_gd, test_position_ecf);

                result["known_look"]  = known_look_angles;
                result["test_look"]  = test_look_angles;
                var look_angles_error = {
                    azimuth : Math.abs((known_look_angles["azimuth"] - test_look_angles["azimuth"]) / known_look_angles["azimuth"]),
                    elevation : Math.abs((known_look_angles["elevation"] - test_look_angles["elevation"]) / known_look_angles["elevation"]),
                    rangeSat : Math.abs((known_look_angles["rangeSat"] - test_look_angles["rangeSat"]) / known_look_angles["rangeSat"])
                };
                result["look_error"]  = look_angles_error;
            };
        };

    };

    $scope.benchmark_sgp4 = function() {
        for (var tests_itor = 0; tests_itor < $scope.tests.length; tests_itor++) {
            var test = $scope.tests[tests_itor];
            test["time_since_app_launch"] = init_fin - init_start;
            var tle_line_1 = test["tle_line_1"];
            var tle_line_2 = test["tle_line_2"];
            var init_start = performance.now();
            var test_sat = satellite.twoline2satrec (tle_line_1, tle_line_2);
            var init_fin = performance.now();
            test["init_time"] = init_fin - init_start;
            var full_day = 1440;
            var time = 0;
            test["results"] = [];
            var total_prpgtion_time = 0;
            while (time < full_day) {
                var prpgtion_start  = performance.now();
                satellite.sgp4(test_sat, time);
                var prpgtion_fin    = performance.now();
                var prpgtion_time   = prpgtion_fin - prpgtion_start;
                var result          = {};
                result["time"]      = time;
                result["prpgtion_time"] = prpgtion_time;
                total_prpgtion_time += prpgtion_time
                test["results"].push(result);
                time += 1;
            };
            var test_finish = performance.now();

            test["total_time_1440"]     = total_prpgtion_time;
            test["avg_prpgation_time"]  = total_prpgtion_time / full_day;
            test["test_time_span"]      = test_finish - init_start;
            test["prpgtion_time_pct"]   = total_prpgtion_time / test["test_time_span"] * 100;
            test["init_time_pct"]       = test["init_time"] / test["test_time_span"] * 100;

            var total_time_variance = 0;
            var num_tests = test["results"].length;
            for (var i = 0; i < num_tests; i++) {
              var result = test["results"][i];
              total_time_variance += Math.pow(result["prpgtion_time"] - test["avg_prpgation_time"], 2);
            };
            test["prpgtion_time_variance"] = total_time_variance / num_tests;
            test["std_deviation_time"] = Math.sqrt(test["prpgtion_time_variance"]);
        };
    };
};
