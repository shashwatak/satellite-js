/*
 * satellite-js v1.2
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

define([
    './constants'
], function(
    constants
) {
    'use strict';

    return function(satrec, dpperParameters) {
        /* -----------------------------------------------------------------------------
         *
         *                           procedure dpper
         *
         *  this procedure provides deep space long period periodic contributions
         *    to the mean elements.  by design, these periodics are zero at epoch.
         *    this used to be dscom which included initialization, but it's really a
         *    recurring function.
         *
         *  author        : david vallado                  719-573-2600   28 jun 2005
         *
         *  inputs        :
         *    e3          -
         *    ee2         -
         *    peo         -
         *    pgho        -
         *    pho         -
         *    pinco       -
         *    plo         -
         *    se2 , se3 , sgh2, sgh3, sgh4, sh2, sh3, si2, si3, sl2, sl3, sl4 -
         *    t           -
         *    xh2, xh3, xi2, xi3, xl2, xl3, xl4 -
         *    zmol        -
         *    zmos        -
         *    ep          - eccentricity                           0.0 - 1.0
         *    inclo       - inclination - needed for lyddane modification
         *    nodep       - right ascension of ascending node
         *    argpp       - argument of perigee
         *    mp          - mean anomaly
         *
         *  outputs       :
         *    ep          - eccentricity                           0.0 - 1.0
         *    inclp       - inclination
         *    nodep        - right ascension of ascending node
         *    argpp       - argument of perigee
         *    mp          - mean anomaly
         *
         *  locals        :
         *    alfdp       -
         *    betdp       -
         *    cosip  , sinip  , cosop  , sinop  ,
         *    dalf        -
         *    dbet        -
         *    dls         -
         *    f2, f3      -
         *    pe          -
         *    pgh         -
         *    ph          -
         *    pinc        -
         *    pl          -
         *    sel   , ses   , sghl  , sghs  , shl   , shs   , sil   , sinzf , sis   ,
         *    sll   , sls
         *    xls         -
         *    xnoh        -
         *    zf          -
         *    zm          -
         *
         *  coupling      :
         *    none.
         *
         *  references    :
         *    hoots, roehrich, norad spacetrack report #3 1980
         *    hoots, norad spacetrack report #6 1986
         *    hoots, schumacher and glover 2004
         *    vallado, crawford, hujsak, kelso  2006
         ----------------------------------------------------------------------------*/

        // TODO: defined but never used
        //var inclo   = dpperParameters.inclo;

        var init    = dpperParameters.init,
            ep      = dpperParameters.ep,
            inclp   = dpperParameters.inclp,
            nodep   = dpperParameters.nodep,
            argpp   = dpperParameters.argpp,
            mp      = dpperParameters.mp,
            opsmode = dpperParameters.opsmode;


        // Copy satellite attributes into local variables for convenience
        // and symmetry in writing formulae.

        var alfdp, betdp,
            cosip, sinip, cosop, sinop,
            dalf, dbet, dls,
            f2, f3,
            pe, pgh, ph, pinc, pl,
            sel, ses, sghl, sghs, shs, sil, sinzf, sis,  sll, sls,
            xls, xnoh, zf, zm, shll;

        // TODO: defined but never used
        //var shl;

        var e3      = satrec.e3;
        var ee2     = satrec.ee2;
        var peo     = satrec.peo;
        var pgho    = satrec.pgho;
        var pho     = satrec.pho;
        var pinco   = satrec.pinco;
        var plo     = satrec.plo;
        var se2     = satrec.se2;
        var se3     = satrec.se3;
        var sgh2    = satrec.sgh2;
        var sgh3    = satrec.sgh3;
        var sgh4    = satrec.sgh4;
        var sh2     = satrec.sh2;
        var sh3     = satrec.sh3;
        var si2     = satrec.si2;
        var si3     = satrec.si3;
        var sl2     = satrec.sl2;
        var sl3     = satrec.sl3;
        var sl4     = satrec.sl4;
        var t       = satrec.t;
        var xgh2    = satrec.xgh2;
        var xgh3    = satrec.xgh3;
        var xgh4    = satrec.xgh4;
        var xh2     = satrec.xh2;
        var xh3     = satrec.xh3;
        var xi2     = satrec.xi2;
        var xi3     = satrec.xi3;
        var xl2     = satrec.xl2;
        var xl3     = satrec.xl3;
        var xl4     = satrec.xl4;
        var zmol    = satrec.zmol;
        var zmos    = satrec.zmos;

        //  ---------------------- constants -----------------------------
        var zns     = 1.19459e-5;
        var zes     = 0.01675;
        var znl     = 1.5835218e-4;
        var zel     = 0.05490;

        //  --------------- calculate time varying periodics -----------
        zm      = zmos + zns * t;
        // be sure that the initial call has time set to zero
        if (init === 'y') {
            zm      = zmos;
        }
        zf      = zm    + 2.0   * zes   * Math.sin(zm);
        sinzf   = Math.sin(zf);
        f2      =  0.5  * sinzf * sinzf - 0.25;
        f3      = -0.5  * sinzf * Math.cos(zf);
        ses     = se2   * f2    + se3   * f3;
        sis     = si2   * f2    + si3   * f3;
        sls     = sl2   * f2    + sl3   * f3    + sl4   * sinzf;
        sghs    = sgh2  * f2    + sgh3  * f3    + sgh4  * sinzf;
        shs     = sh2   * f2    + sh3   * f3;
        zm          = zmol  + znl   * t;
        if (init === 'y') {
            zm      = zmol;
        }

        zf          = zm    + 2.0   * zel   * Math.sin(zm);
        sinzf       = Math.sin(zf);
        f2          =  0.5  * sinzf * sinzf - 0.25;
        f3          = -0.5  * sinzf * Math.cos(zf);
        sel     = ee2   * f2    + e3    * f3;
        sil     = xi2   * f2    + xi3   * f3;
        sll     = xl2   * f2    + xl3   * f3    + xl4 * sinzf;
        sghl    = xgh2  * f2    + xgh3  * f3    + xgh4 * sinzf;
        shll    = xh2   * f2    + xh3   * f3;
        pe      = ses   + sel;
        pinc    = sis   + sil;
        pl      = sls   + sll;
        pgh     = sghs  + sghl;
        ph      = shs   + shll;

        if (init === 'n'){
            pe      = pe    - peo;
            pinc    = pinc  - pinco;
            pl      = pl    - plo;
            pgh     = pgh   - pgho;
            ph      = ph    - pho;
            inclp   = inclp + pinc;
            ep      = ep    + pe;
            sinip = Math.sin(inclp);
            cosip = Math.cos(inclp);

            /* ----------------- apply periodics directly ------------ */
            //  sgp4fix for lyddane choice
            //  strn3 used original inclination - this is technically feasible
            //  gsfc used perturbed inclination - also technically feasible
            //  probably best to readjust the 0.2 limit value and limit discontinuity
            //  0.2 rad = 11.45916 deg
            //  use next line for original strn3 approach and original inclination
            //  if (inclo >= 0.2)
            //  use next line for gsfc version and perturbed inclination
            if (inclp >= 0.2) {
                ph      = ph    / sinip;
                pgh     = pgh   - cosip     * ph;
                argpp   = argpp + pgh;
                nodep   = nodep + ph;
                mp      = mp    + pl;
            }
            else {
                //  ---- apply periodics with lyddane modification ----
                sinop   = Math.sin(nodep);
                cosop   = Math.cos(nodep);
                alfdp   = sinip * sinop;
                betdp   = sinip * cosop;
                dalf    =  ph   * cosop + pinc * cosip * sinop;
                dbet    = -ph   * sinop + pinc * cosip * cosop;
                alfdp       = alfdp + dalf;
                betdp       = betdp + dbet;
                nodep       = nodep % constants.twoPi;
                //  sgp4fix for afspc written intrinsic functions
                //  nodep used without a trigonometric function ahead
                if (nodep < 0.0 && opsmode === 'a') {
                    nodep   = nodep + constants.twoPi;
                }
                xls     = mp    + argpp + cosip * nodep;
                dls     = pl    + pgh   - pinc  * nodep * sinip;
                xls         = xls   + dls;
                xnoh    = nodep;
                nodep       = Math.atan2(alfdp, betdp);
                //  sgp4fix for afspc written intrinsic functions
                //  nodep used without a trigonometric function ahead
                if (nodep < 0.0 && opsmode === 'a'){
                    nodep = nodep + constants.twoPi;
                }
                if (Math.abs(xnoh - nodep) > constants.pi) {
                    if (nodep < xnoh){
                        nodep = nodep + constants.twoPi;
                    }
                    else{
                        nodep = nodep - constants.twoPi;
                    }
                }
                mp    = mp  + pl;
                argpp = xls - mp - cosip * nodep;
            }
        }
        var dpperResult = {
            ep : ep,
            inclp : inclp,
            nodep : nodep,
            argpp : argpp,
            mp : mp
        };
        return dpperResult;
    };
});