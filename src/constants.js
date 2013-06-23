/*
 * satellite-js v1.1
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

var pi = Math.PI;
var twopi = pi * 2;
var deg2rad = pi / 180.0;
var rad2deg = 180 / pi;
var minutes_per_day = 1440.0;
var mu     = 398600.5;            //  in km3 / s2
var radiusearthkm = 6378.137;     //  km
var xke    = 60.0 / Math.sqrt(radiusearthkm*radiusearthkm*radiusearthkm/mu);
var tumin  = 1.0 / xke;
var j2     =   0.00108262998905;
var j3     =  -0.00000253215306;
var j4     =  -0.00000161098761;
var j3oj2  =  j3 / j2;
var x2o3   = 2.0 / 3.0;
