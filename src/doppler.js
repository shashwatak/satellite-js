/*
 * satellite-js v1.1
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

function doppler_factor (my_location, position, velocity) {
    var current_range = Math.sqrt(
                        Math.pow(position["x"] - my_location["x"], 2) +
                        Math.pow(position["y"] - my_location["y"], 2) +
                        Math.pow(position["z"] - my_location["z"], 2));
    var next_pos   = {
                        x : position["x"] + velocity["x"],
                        y : position["y"] + velocity["y"],
                        z : position["z"] + velocity["z"]
                    };
    var next_range =  Math.sqrt(
                      Math.pow(next_pos["x"] - my_location["x"], 2) +
                      Math.pow(next_pos["y"] - my_location["y"], 2) +
                      Math.pow(next_pos["z"] - my_location["z"], 2));
    var range_rate =  next_range - current_range;

    function sign (value) {if (value >= 0) {return 1;} else {return -1;}};
    range_rate *= sign(range_rate);
    var c = 299792.458; // Speed of light in km/s
    var factor = (1 + range_rate/c);
    return factor;
}

satellite.doppler_factor = doppler_factor;
