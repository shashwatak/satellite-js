function eci_to_geodetic (eci_coords, gmst) {
    'use strict';
    // http://www.celestrak.com/columns/v02n03/
    var a   = 6378.137;
    var b   = 6356.7523142;
    var R   = Math.sqrt( (eci_coords[0]*eci_coords[0]) + (eci_coords[1]*eci_coords[1]) );
    var f   = (a - b)/a;
    var e2  = ((2*f) - (f*f));
    var longitude = Math.atan2(eci_coords[1], eci_coords[0]) - gmst;
    var kmax = 20;
    var k = 0;
    var latitude = Math.atan2(eci_coords[2],
                   Math.sqrt(eci_coords[0]*eci_coords[0] +
                                eci_coords[1]*eci_coords[1]));
    var C;
    while (k < kmax){
        C = 1 / Math.sqrt( 1 - e2*(Math.sin(latitude)*Math.sin(latitude)) );
        latitude = Math.atan2 (eci_coords[2] + (a*C*e2*Math.sin(latitude)), R);
        k += 1;
    }
    var h = (R/Math.cos(latitude)) - (a*C);
    return [longitude, latitude, h];
}

function eci_to_ecf (eci_coords, gmst){
    'use strict';
    // ccar.colorado.edu/ASEN5070/handouts/coordsys.doc
    //
    // [X]     [C -S  0][X]
    // [Y]  =  [S  C  0][Y]
    // [Z]eci  [0  0  1][Z]ecf
    //
    //
    // Inverse:
    // [X]     [C  S  0][X]
    // [Y]  =  [-S C  0][Y]
    // [Z]ecf  [0  0  1][Z]eci

    var X = (eci_coords[0] * Math.cos(gmst))    + (eci_coords[1] * Math.sin(gmst));
    var Y = (eci_coords[0] * (-Math.sin(gmst))) + (eci_coords[1] * Math.cos(gmst));
    var Z =  eci_coords[2];
    return [X, Y, Z];
}

function ecf_to_eci (ecf_coords, gmst){
    'use strict';
    // ccar.colorado.edu/ASEN5070/handouts/coordsys.doc
    //
    // [X]     [C -S  0][X]
    // [Y]  =  [S  C  0][Y]
    // [Z]eci  [0  0  1][Z]ecf
    //
    var X = (ecf_coords[0] * Math.cos(gmst))    - (ecf_coords[1] * Math.sin(gmst));
    var Y = (ecf_coords[0] * (Math.sin(gmst)))  + (ecf_coords[1] * Math.cos(gmst));
    var Z =  ecf_coords[2];
    return [X, Y, Z];
}

function geodetic_to_ecf (geodetic_coords){
    'use strict';
    var longitude   = geodetic_coords[0];
    var latitude    = geodetic_coords[1];
    var height      = geodetic_coords[2];
    var a           = 6378.137;
    var b           = 6356.7523142;
    var f           = (a - b)/a;
    var e2          = ((2*f) - (f*f));
    var normal      = a / Math.sqrt( 1 - (e2*(Math.sin(latitude)*Math.sin(latitude))));

    var X           = (normal + height) * Math.cos (latitude) * Math.cos (longitude);
    var Y           = (normal + height) * Math.cos (latitude) * Math.sin (longitude);
    var Z           = ((normal*(1-e2)) + height) * Math.sin (latitude);
    return [X, Y, Z];
}

function ecf_to_topocentric (observer_coords, satellite_coords){
    // http://www.celestrak.com/columns/v02n02/
    // TS Kelso's method, except I'm using ECF frame
    // and he uses ECI.
    //
    'use strict';
    var longitude   = observer_coords[0];
    var latitude    = observer_coords[1];
    var height      = observer_coords[2];

    var observer_ecf = geodetic_to_ecf (observer_coords);

    var rx      = satellite_coords[0] - observer_ecf[0];
    var ry      = satellite_coords[1] - observer_ecf[1];
    var rz      = satellite_coords[2] - observer_ecf[2];

    var top_s   = ( (Math.sin(latitude) * Math.cos(longitude) * rx) +
                  (Math.sin(latitude) * Math.sin(longitude) * ry) -
                  (Math.cos(latitude) * rz));
    var top_e   = ( -Math.sin(longitude) * rx) + (Math.cos(longitude) * ry);
    var top_z   = ( (Math.cos(latitude)*Math.cos(longitude)*rx) +
                  (Math.cos(latitude)*Math.sin(longitude)*ry) +
                  (Math.sin(latitude)*rz));
    return [top_s, top_e, top_z];
}

function topocentric_to_look_angles  (topocentric){
    'use strict';
    var top_s = topocentric[0];
    var top_e = topocentric[1];
    var top_z = topocentric[2];
    var range_sat    = Math.sqrt((top_s*top_s) + (top_e*top_e) + (top_z*top_z));
    var El      = Math.asin (top_z/range_sat);
    var Az      = Math.atan2 (-top_e, top_s) + pi;
    return [Az, El, range_sat];
}

function degrees_long                (radians){
    'use strict';
    var degrees = (radians/pi*180) % (360);
    if (degrees > 180){
        degrees = 360 - degrees;
    }
    else if (degrees < -180){
        degrees = 360 + degrees;
    }
    return degrees;
}

function degrees_lat                 (radians){
    'use strict';
    if (radians > pi/2 || radians < (-pi/2)){
        return "Err";
    }
    var degrees = (radians/pi*180);
    if (degrees < 0){
        degrees = degrees;
    }
    else{
        degrees = degrees;
    }
    return degrees;
}

satellite.eci_to_geodetic = function (eci_coords, gmst) {
    return eci_to_geodetic (eci_coords, gmst);
}
satellite.degrees_lat = function                 (radians) {
    return degrees_lat (radians);
}
satellite.degrees_long = function                (radians) {
    return degrees_long (radians);
}
satellite.topocentric_to_look_angles = function  (topocentric) {
    return topocentric_to_look_angles (topocentric);
}
satellite.ecf_to_topocentric = function (observer_coords, satellite_coords) {
    return ecf_to_topocentric (observer_coords, satellite_coords);
}
satellite.geodetic_to_ecf = function (geodetic_coords) {
    return geodetic_to_ecf (geodetic_coords);
}
satellite.ecf_to_eci = function (ecf_coords, gmst) {
    return ecf_to_eci (ecf_coords, gmst);
}
satellite.eci_to_ecf = function (eci_coords, gmst) {
    return eci_to_ecf (eci_coords, gmst);
}
