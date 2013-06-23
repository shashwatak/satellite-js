/*
 * satellite-js v1.1
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

function initl(initl_parameters){
    /*-----------------------------------------------------------------------------
    *
    *                           procedure initl
    *
    *  this procedure initializes the spg4 propagator. all the initialization is
    *    consolidated here instead of having multiple loops inside other routines.
    *
    *  author        : david vallado                  719-573-2600   28 jun 2005
    *
    *  inputs        :
    *    ecco        - eccentricity                           0.0 - 1.0
    *    epoch       - epoch time in days from jan 0, 1950. 0 hr
    *    inclo       - inclination of satellite
    *    no          - mean motion of satellite
    *    satn        - satellite number
    *
    *  outputs       :
    *    ainv        - 1.0 / a
    *    ao          - semi major axis
    *    con41       -
    *    con42       - 1.0 - 5.0 cos(i)
    *    cosio       - cosine of inclination
    *    cosio2      - cosio squared
    *    eccsq       - eccentricity squared
    *    method      - flag for deep space                    'd', 'n'
    *    omeosq      - 1.0 - ecco * ecco
    *    posq        - semi-parameter squared
    *    rp          - radius of perigee
    *    rteosq      - square root of (1.0 - ecco*ecco)
    *    sinio       - sine of inclination
    *    gsto        - gst at time of observation               rad
    *    no          - mean motion of satellite
    *
    *  locals        :
    *    ak          -
    *    d1          -
    *    del         -
    *    adel        -
    *    po          -
    *
    *  coupling      :
    *    getgravconst
    *    gstime      - find greenwich sidereal time from the julian date
    *
    *  references    :
    *    hoots, roehrich, norad spacetrack report #3 1980
    *    hoots, norad spacetrack report #6 1986
    *    hoots, schumacher and glover 2004
    *    vallado, crawford, hujsak, kelso  2006
      ----------------------------------------------------------------------------*/

    'use strict';
    var satn    = initl_parameters.satn,
        ecco    = initl_parameters.ecco,
        epoch   = initl_parameters.epoch,
        inclo   = initl_parameters.inclo,
        no      = initl_parameters.no,
        method  = initl_parameters.method,
        opsmode = initl_parameters.opsmode;

    var ak, d1,  del,  adel, po, gsto;

    // sgp4fix use old way of finding gst
    //  ----------------------- earth constants ----------------------
    //  sgp4fix identify constants and allow alternate values

    //  ------------- calculate auxillary epoch quantities ----------
    var eccsq  = ecco * ecco;
    var omeosq = 1.0 - eccsq;
    var rteosq = Math.sqrt(omeosq);
    var cosio  = Math.cos(inclo);
    var cosio2 = cosio * cosio;

    //  ------------------ un-kozai the mean motion -----------------
    ak    = Math.pow(xke / no, x2o3);
    d1    = 0.75 * j2 * (3.0 * cosio2 - 1.0) / (rteosq * omeosq);
    var del_prime  = d1 / (ak * ak);
    adel  = ak * (1.0 - del_prime * del_prime - del_prime *
             (1.0 / 3.0 + 134.0 * del_prime * del_prime / 81.0));
    del_prime  = d1/(adel * adel);
    no    = no / (1.0 + del_prime);

    var ao    = Math.pow(xke / no, x2o3);
    var sinio = Math.sin(inclo);
    po    = ao * omeosq;
    var con42 = 1.0 - 5.0 * cosio2;
    var con41 = -con42-cosio2-cosio2;
    var ainv  = 1.0 / ao;
    var posq  = po * po;
    var rp    = ao * (1.0 - ecco);
    method = 'n';

    //  sgp4fix modern approach to finding sidereal time
    if (opsmode === 'a') {
        //  sgp4fix use old way of finding gst
        //  count integer number of days from 0 jan 1970
        var ts70  = epoch - 7305.0;
        var ds70 = Math.floor(ts70 + 1.0e-8);
        var tfrac = ts70 - ds70;
        //  find greenwich location at epoch
        var c1    = 1.72027916940703639e-2;
        var thgr70= 1.7321343856509374;
        var fk5r  = 5.07551419432269442e-15;
        var c1p2p = c1 + twopi;
        gsto  = ( thgr70 + c1*ds70 + c1p2p*tfrac + ts70*ts70*fk5r) % twopi;
        if (gsto < 0.0){
            gsto = gsto + twopi;
        }
    }
    else {
       gsto = gstime(epoch + 2433281.5);
    }

    var initl_results = {
        no : no,

        method : method,

        ainv : ainv,
        ao : ao,
        con41 : con41,
        con42 : con42,
        cosio : cosio,

        cosio2 : cosio2,
        eccsq : eccsq,
        omeosq : omeosq,
        posq : posq,

        rp : rp,
        rteosq : rteosq,
        sinio : sinio ,
        gsto : gsto
    };
    return initl_results;
}
