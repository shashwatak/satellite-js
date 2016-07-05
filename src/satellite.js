define([
    './constants',
    './coordinate-transforms/degrees-lat',
    './coordinate-transforms/degrees-long',
    './coordinate-transforms/ecf-to-eci',
    './coordinate-transforms/ecf-to-look-angles',
    './coordinate-transforms/eci-to-ecf',
    './coordinate-transforms/eci-to-geodetic',
    './coordinate-transforms/geodetic-to-ecf',
    './coordinate-transforms/topocentric',
    './coordinate-transforms/topocentric-to-look-angles',
    './doppler-factor',
    './gstime/days2mdhms',
    './gstime/gstime',
    './gstime/jday',
    './propagate/propagate',
    './propagate/twoline2satrec',
    './sgp4'
], function(
    constants,
    degreesLat,
    degreesLong,
    ecfToEci,
    ecfToLookAngles,
    eciToEcf,
    eciToGeodetic,
    geodeticToEcf,
    topocentric,
    topocentricToLookAngles,
    dopplerFactor,
    days2mdhms,
    gstime,
    jday,
    propagate,
    twoline2satrec,
    sgp4
) {
    'use strict';

    return {
        version: '1.2.0',
        constants: constants,

        // Coordinate transforms
        degreesLat: degreesLat,
        degreesLong: degreesLong,
        eciToEcf: eciToEcf,
        ecfToEci: ecfToEci,
        eciToGeodetic: eciToGeodetic,
        ecfToLookAngles: ecfToLookAngles,
        geodeticToEcf: geodeticToEcf,

        dopplerFactor: dopplerFactor,
        gstimeFromJday: gstime,
        gstimeFromDate: function(year, mon, day, hr, minute, sec) {
            return gstime(jday(year, mon, day, hr, minute, sec));
        },
        propagate: propagate,
        parseTwoline: twoline2satrec.parseTwoline,
        prepareSatrec: twoline2satrec.prepareSatrec,
        twoline2satrec: twoline2satrec.twoline2rv,
        sgp4: sgp4
    };
});
