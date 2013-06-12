function doppler_factor (my_location, position, velocity) {
    var current_range = Math.sqrt(
                        Math.pow(position[0] - my_location[0], 2) +
                        Math.pow(position[1] - my_location[1], 2) +
                        Math.pow(position[2] - my_location[2], 2));
    var next_pos   = [position[0] + velocity[0],
                      position[1] + velocity[1],
                      position[2] + velocity[2]];
    var next_range =  Math.sqrt(
                      Math.pow(next_pos[0] - my_location[0], 2) +
                      Math.pow(next_pos[1] - my_location[1], 2) +
                      Math.pow(next_pos[2] - my_location[2], 2));
    var range_rate =  next_range - current_range;

    function sign (value) {if (value >= 0) {return 1;} else {return -1;}};
    range_rate *= sign(range_rate);
    var c = 299792.458; // Speed of light in km/s
    var factor = (1 + range_rate/c);
    return factor;
}

satellite.doppler_factor = doppler_factor;
