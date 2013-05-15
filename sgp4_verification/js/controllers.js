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

      console.log($scope.tests);
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
          console.log ('No file selected.');
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
        writeFileEntry(writableEntry, blob, function(e) {
          console.log("Write complete :)");
        });
      });
    };

    $scope.verify_sgp4 = function() {

        var deg2rad = Math.PI / 180.0;
        var rad2deg = 180 / Math.PI;
        for (var tests_itor = 0; tests_itor < $scope.tests.length; tests_itor++) {
            var my_location_gd = [(-122.0308)*deg2rad, (36.9613422)*deg2rad, .5];
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
                var test_pos        = r_v[0];
                var test_vel        = r_v[1];
                var pos_error = [Math.abs((known_pos[0] - test_pos[0]) / known_pos[0]),
                                 Math.abs((known_pos[1] - test_pos[1]) / known_pos[1]),
                                 Math.abs((known_pos[2] - test_pos[2]) / known_pos[2])];
                var vel_error = [Math.abs((known_vel[0] - test_vel[0]) / known_vel[0]),
                                 Math.abs((known_vel[1] - test_vel[1]) / known_vel[1]),
                                 Math.abs((known_vel[2] - test_vel[2]) / known_vel[2])];

                result["test_pos"]   = [test_pos[0], test_pos[1], test_pos[2]];
                result["test_vel"]   = [test_vel[0], test_vel[1], test_vel[2]];
                result["pos_error"]  = [pos_error[0], pos_error[1], pos_error[2]];
                result["vel_error"]  = [vel_error[0], vel_error[1], vel_error[2]];
                result["prpgtion_time"]  = prpgtion_time;

                var julian_day = test_sat.jdsatepoch + (time*60);
                var gmst = satellite.gstime_from_jday (julian_day);

                var test_position_ecf = satellite.eci_to_ecf (test_pos, gmst);
                var test_look_angles = satellite.ecf_to_look_angles (my_location_gd, test_position_ecf);

                var known_position_ecf = satellite.eci_to_ecf (known_pos, gmst);
                var known_look_angles = satellite.satellite.ecf_to_look_angles (my_location_gd, known_position_ecf);

                var look_angles_error = [Math.abs((known_look_angles[0] - test_look_angles[0]) / known_look_angles[0]),
                                         Math.abs((known_look_angles[1] - test_look_angles[1]) / known_look_angles[1]),
                                         Math.abs((known_look_angles[2] - test_look_angles[2]) / known_look_angles[2])];
                result["look_angles_error"]  = [look_angles_error[0], look_angles_error[1], look_angles_error[2]];

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
                var r_v             = satellite.sgp4(test_sat, time);
                var prpgtion_fin    = performance.now();
                var prpgtion_time   = prpgtion_fin - prpgtion_start;
                var test_pos        = r_v[0];
                var test_vel        = r_v[1];
                var result          = {};
                result["time"]      = time;
                result["prpgtion_time"] = prpgtion_time;
                total_prpgtion_time += prpgtion_time
                test["results"].push(result);
                time += 1;
            };
            var test_finish = performance.now();
            test["total_time_1440"] = total_prpgtion_time;
            test["avg_prpgation_time"] = total_prpgtion_time / full_day;
            test["test_time_span"] = test_finish - init_start;
            test["prpgtion_time_pct"] = total_prpgtion_time / test["test_time_span"] * 100;
            test["init_time_pct"] = test["init_time"] / test["test_time_span"] * 100;
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
