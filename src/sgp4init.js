/*
 * satellite-js v1.2
 * (c) 2013 Shashwat Kandadai and UCSC
 * https://github.com/shashwatak/satellite-js
 * License: MIT
 */

define([
    './constants',
    './dpper',
    './dscom',
    './dsinit',
    './initl',
    './sgp4'
], function(
    constants,
    dpper,
    dscom,
    dsinit,
    initl,
    sgp4
) {
    'use strict';

    return function(satrec, sgp4initParameters) {
        /*-----------------------------------------------------------------------------
         *
         *                             procedure sgp4init
         *
         *  this procedure initializes variables for sgp4.
         *
         *  author        : david vallado                  719-573-2600   28 jun 2005
         *
         *  inputs        :
         *    opsmode     - mode of operation afspc or improved 'a', 'i'
         *    satn        - satellite number
         *    bstar       - sgp4 type drag coefficient              kg/m2er
         *    ecco        - eccentricity
         *    epoch       - epoch time in days from jan 0, 1950. 0 hr
         *    argpo       - argument of perigee (output if ds)
         *    inclo       - inclination
         *    mo          - mean anomaly (output if ds)
         *    no          - mean motion
         *    nodeo       - right ascension of ascending node
         *
         *  outputs       :
         *    satrec      - common values for subsequent calls
         *    return code - non-zero on error.
         *                   1 - mean elements, ecc >= 1.0 or ecc < -0.001 or a < 0.95 er
         *                   2 - mean motion less than 0.0
         *                   3 - pert elements, ecc < 0.0  or  ecc > 1.0
         *                   4 - semi-latus rectum < 0.0
         *                   5 - epoch elements are sub-orbital
         *                   6 - satellite has decayed
         *
         *  locals        :
         *    cnodm  , snodm  , cosim  , sinim  , cosomm , sinomm
         *    cc1sq  , cc2    , cc3
         *    coef   , coef1
         *    cosio4      -
         *    day         -
         *    dndt        -
         *    em          - eccentricity
         *    emsq        - eccentricity squared
         *    eeta        -
         *    etasq       -
         *    gam         -
         *    argpm       - argument of perigee
         *    nodem       -
         *    inclm       - inclination
         *    mm          - mean anomaly
         *    nm          - mean motion
         *    perige      - perigee
         *    pinvsq      -
         *    psisq       -
         *    qzms24      -
         *    rtemsq      -
         *    s1, s2, s3, s4, s5, s6, s7          -
         *    sfour       -
         *    ss1, ss2, ss3, ss4, ss5, ss6, ss7         -
         *    sz1, sz2, sz3
         *    sz11, sz12, sz13, sz21, sz22, sz23, sz31, sz32, sz33        -
         *    tc          -
         *    temp        -
         *    temp1, temp2, temp3       -
         *    tsi         -
         *    xpidot      -
         *    xhdot1      -
         *    z1, z2, z3          -
         *    z11, z12, z13, z21, z22, z23, z31, z32, z33         -
         *
         *  coupling      :
         *    getgravconst-
         *    initl       -
         *    dscom       -
         *    dpper       -
         *    dsinit      -
         *    sgp4        -
         *
         *  references    :
         *    hoots, roehrich, norad spacetrack report #3 1980
         *    hoots, norad spacetrack report #6 1986
         *    hoots, schumacher and glover 2004
         *    vallado, crawford, hujsak, kelso  2006
         ----------------------------------------------------------------------------*/

        var opsmode = sgp4initParameters.opsmode,
            satn    = sgp4initParameters.satn,
            epoch   = sgp4initParameters.epoch,

            xbstar  = sgp4initParameters.xbstar,
            xecco   = sgp4initParameters.xecco,
            xargpo  = sgp4initParameters.xargpo,

            xinclo  = sgp4initParameters.xinclo,
            xmo     = sgp4initParameters.xmo,
            xno     = sgp4initParameters.xno,

            xnodeo  = sgp4initParameters.xnodeo;


        var cnodm,  snodm,  cosim,  sinim,  cosomm, sinomm,
            cc1sq,  cc2,    cc3,    coef,   coef1,  cosio4,
            day,    dndt,
            em, emsq, eeta, etasq,  gam,
            argpm,  nodem,  inclm,  mm,     nm,
            perige, pinvsq, psisq,  qzms24, rtemsq,
            s1,  s2,  s3,  s4,  s5,  s6,  s7,   sfour,
            ss1,ss2,    ss3,    ss4,    ss5,    ss6,    ss7,
            sz1, sz2, sz3,
            sz11, sz12, sz13, sz21, sz22, sz23, sz31, sz32, sz33,
            tc, temp,   temp1,  temp2,  temp3,  temp4, tsi,
            xpidot, xhdot1,
            z1, z2, z3,
            z11, z12, z13, z21, z22, z23, z31, z32, z33;
        /* ------------------------ initialization --------------------- */
        // sgp4fix divisor for divide by zero check on inclination
        // the old check used 1.0 + Math.cos(pi-1.0e-9), but then compared it to
        // 1.5 e-12, so the threshold was changed to 1.5e-12 for consistency

        temp4    =   1.5e-12;

        //  ----------- set all near earth variables to zero ------------
        satrec.isimp   = 0;   satrec.method = 'n'; satrec.aycof    = 0.0;
        satrec.con41   = 0.0; satrec.cc1    = 0.0; satrec.cc4      = 0.0;
        satrec.cc5     = 0.0; satrec.d2     = 0.0; satrec.d3       = 0.0;
        satrec.d4      = 0.0; satrec.delmo  = 0.0; satrec.eta      = 0.0;
        satrec.argpdot = 0.0; satrec.omgcof = 0.0; satrec.sinmao   = 0.0;
        satrec.t       = 0.0; satrec.t2cof  = 0.0; satrec.t3cof    = 0.0;
        satrec.t4cof   = 0.0; satrec.t5cof  = 0.0; satrec.x1mth2   = 0.0;
        satrec.x7thm1  = 0.0; satrec.mdot   = 0.0; satrec.nodedot  = 0.0;
        satrec.xlcof   = 0.0; satrec.xmcof  = 0.0; satrec.nodecf   = 0.0;

        //  ----------- set all deep space variables to zero ------------
        satrec.irez  = 0;   satrec.d2201 = 0.0; satrec.d2211 = 0.0;
        satrec.d3210 = 0.0; satrec.d3222 = 0.0; satrec.d4410 = 0.0;
        satrec.d4422 = 0.0; satrec.d5220 = 0.0; satrec.d5232 = 0.0;
        satrec.d5421 = 0.0; satrec.d5433 = 0.0; satrec.dedt  = 0.0;
        satrec.del1  = 0.0; satrec.del2  = 0.0; satrec.del3  = 0.0;
        satrec.didt  = 0.0; satrec.dmdt  = 0.0; satrec.dnodt = 0.0;
        satrec.domdt = 0.0; satrec.e3    = 0.0; satrec.ee2   = 0.0;
        satrec.peo   = 0.0; satrec.pgho  = 0.0; satrec.pho   = 0.0;
        satrec.pinco = 0.0; satrec.plo   = 0.0; satrec.se2   = 0.0;
        satrec.se3   = 0.0; satrec.sgh2  = 0.0; satrec.sgh3  = 0.0;
        satrec.sgh4  = 0.0; satrec.sh2   = 0.0; satrec.sh3   = 0.0;
        satrec.si2   = 0.0; satrec.si3   = 0.0; satrec.sl2   = 0.0;
        satrec.sl3   = 0.0; satrec.sl4   = 0.0; satrec.gsto  = 0.0;
        satrec.xfact = 0.0; satrec.xgh2  = 0.0; satrec.xgh3  = 0.0;
        satrec.xgh4  = 0.0; satrec.xh2   = 0.0; satrec.xh3   = 0.0;
        satrec.xi2   = 0.0; satrec.xi3   = 0.0; satrec.xl2   = 0.0;
        satrec.xl3   = 0.0; satrec.xl4   = 0.0; satrec.xlamo = 0.0;
        satrec.zmol  = 0.0; satrec.zmos  = 0.0; satrec.atime = 0.0;
        satrec.xli   = 0.0; satrec.xni   = 0.0;


        // sgp4fix - note the following variables are also passed directly via satrec.
        // it is possible to streamline the sgp4init call by deleting the "x"
        // variables, but the user would need to set the satrec.* values first. we
        // include the additional assignments in case twoline2rv is not used.

        satrec.bstar   = xbstar;
        satrec.ecco    = xecco;
        satrec.argpo   = xargpo;
        satrec.inclo   = xinclo;
        satrec.mo      = xmo;
        satrec.no      = xno;
        satrec.nodeo   = xnodeo;

        //  sgp4fix add opsmode
        satrec.operationmode = opsmode;

        //  ------------------------ earth constants -----------------------
        //  sgp4fix identify constants and allow alternate values


        var ss     = 78.0 / constants.earthRadius + 1.0;
        //  sgp4fix use multiply for speed instead of pow
        var qzms2ttemp = (120.0 - 78.0) / constants.earthRadius;
        var qzms2t = qzms2ttemp * qzms2ttemp * qzms2ttemp * qzms2ttemp;
        var x2o3   =  2.0 / 3.0;

        satrec.init = 'y';
        satrec.t    = 0.0;

        var initlParameters = {
            satn : satn,
            ecco : satrec.ecco,

            epoch : epoch,
            inclo : satrec.inclo,
            no : satrec.no,

            method : satrec.method,
            opsmode : satrec.operationmode
        };

        var initlResult= initl(initlParameters);

        satrec.no       = initlResult.no;

        // TODO: defined but never used
        //var method      = initlResult.method;
        //var ainv        = initlResult.ainv;

        var ao          = initlResult.ao;
        satrec.con41    = initlResult.con41;
        var con42       = initlResult.con42;
        var cosio       = initlResult.cosio;
        var cosio2      = initlResult.cosio2;
        var eccsq       = initlResult.eccsq;
        var omeosq      = initlResult.omeosq;
        var posq        = initlResult.posq;
        var rp          = initlResult.rp;
        var rteosq      = initlResult.rteosq;
        var sinio       = initlResult.sinio;
        satrec.gsto     = initlResult.gsto;

        satrec.error = 0;

        // sgp4fix remove this check as it is unnecessary
        // the mrt check in sgp4 handles decaying satellite cases even if the starting
        // condition is below the surface of te earth
        //     if (rp < 1.0)
        //       {
        //         printf("// *** satn%d epoch elts sub-orbital ***\n", satn);
        //         satrec.error = 5;
        //       }


        if (omeosq >= 0.0 || satrec.no >= 0.0){
            satrec.isimp = 0;
            if (rp < 220.0 / constants.earthRadius + 1.0){
                satrec.isimp = 1;
            }
            sfour  = ss;
            qzms24 = qzms2t;
            perige = (rp - 1.0) * constants.earthRadius;

            //  - for perigees below 156 km, s and qoms2t are altered -
            if (perige < 156.0){
                sfour = perige - 78.0;
                if (perige < 98.0){
                    sfour = 20.0;
                }
                //  sgp4fix use multiply for speed instead of pow
                var qzms24temp =  (120.0 - sfour) / constants.earthRadius;
                qzms24 = qzms24temp * qzms24temp * qzms24temp * qzms24temp;
                sfour  = sfour / constants.earthRadius + 1.0;
            }
            pinvsq = 1.0 / posq;

            tsi  = 1.0 / (ao - sfour);
            satrec.eta  = ao * satrec.ecco * tsi;
            etasq = satrec.eta * satrec.eta;
            eeta  = satrec.ecco * satrec.eta;
            psisq = Math.abs(1.0 - etasq);
            coef  = qzms24 * Math.pow(tsi, 4.0);
            coef1 = coef / Math.pow(psisq, 3.5);
            cc2   = coef1 * satrec.no * (ao * (1.0 + 1.5 * etasq + eeta *
                    (4.0 + etasq)) + 0.375 * constants.j2 * tsi / psisq * satrec.con41 *
                    (8.0 + 3.0 * etasq * (8.0 + etasq)));
            satrec.cc1   = satrec.bstar * cc2;
            cc3   = 0.0;
            if (satrec.ecco > 1.0e-4) {
                cc3 = -2.0 * coef * tsi * constants.j3oj2 * satrec.no * sinio / satrec.ecco;
            }
            satrec.x1mth2 = 1.0 - cosio2;
            satrec.cc4    = 2.0 * satrec.no * coef1 * ao * omeosq *
                            (satrec.eta * (2.0 + 0.5 * etasq) + satrec.ecco *
                            (0.5 + 2.0 * etasq) - constants.j2 * tsi / (ao * psisq) *
                            (-3.0 * satrec.con41 * (1.0 - 2.0 * eeta + etasq *
                            (1.5 - 0.5 * eeta)) + 0.75 * satrec.x1mth2 *
                            (2.0 * etasq - eeta * (1.0 + etasq)) * Math.cos(2.0 * satrec.argpo)));
            satrec.cc5 =    2.0 * coef1 * ao * omeosq * (1.0 + 2.75 *
                            (etasq + eeta) + eeta * etasq);
            cosio4 = cosio2 * cosio2;
            temp1 = 1.5 * constants.j2 * pinvsq * satrec.no;
            temp2 = 0.5 * temp1 * constants.j2 * pinvsq;
            temp3 = -0.46875 * constants.j4 * pinvsq * pinvsq * satrec.no;
            satrec.mdot   = satrec.no + 0.5 * temp1 * rteosq * satrec.con41 + 0.0625 *
                            temp2 * rteosq * (13.0 - 78.0 * cosio2 + 137.0 * cosio4);
            satrec.argpdot = (-0.5 * temp1 * con42 + 0.0625 * temp2 *
                            (7.0 - 114.0 * cosio2 + 395.0 * cosio4) +
            temp3 * (3.0 - 36.0 * cosio2 + 49.0 * cosio4));
            xhdot1 = -temp1 * cosio;
            satrec.nodedot = xhdot1 + (0.5 * temp2 * (4.0 - 19.0 * cosio2) +
                            2.0 * temp3 * (3.0 - 7.0 * cosio2)) * cosio;
            xpidot =  satrec.argpdot+ satrec.nodedot;
            satrec.omgcof   = satrec.bstar * cc3 * Math.cos(satrec.argpo);
            satrec.xmcof    = 0.0;
            if (satrec.ecco > 1.0e-4) {
                satrec.xmcof = -x2o3 * coef * satrec.bstar / eeta;
            }
            satrec.nodecf = 3.5 * omeosq * xhdot1 * satrec.cc1;
            satrec.t2cof   = 1.5 * satrec.cc1;
            //  sgp4fix for divide by zero with xinco = 180 deg
            if (Math.abs(cosio+1.0) > 1.5e-12){
                satrec.xlcof = -0.25 * constants.j3oj2 * sinio * (3.0 + 5.0 * cosio) / (1.0 + cosio);
            }
            else{
                satrec.xlcof = -0.25 * constants.j3oj2 * sinio * (3.0 + 5.0 * cosio) / temp4;
            }
            satrec.aycof   = -0.5 * constants.j3oj2 * sinio;
            //  sgp4fix use multiply for speed instead of pow
            var delmotemp = 1.0 + satrec.eta * Math.cos(satrec.mo);
            satrec.delmo   = delmotemp * delmotemp * delmotemp;
            satrec.sinmao  = Math.sin(satrec.mo);
            satrec.x7thm1  = 7.0 * cosio2 - 1.0;

            //  --------------- deep space initialization -------------
            if (2*constants.pi / satrec.no >= 225.0){
                satrec.method = 'd';
                satrec.isimp  = 1;
                tc    =  0.0;
                inclm = satrec.inclo;

                var dscomParameters = {
                    epoch : epoch,
                    ep : satrec.ecco,
                    argpp : satrec.argpo,
                    tc : tc,
                    inclp : satrec.inclo,
                    nodep : satrec.nodeo,

                    np : satrec.no,

                    e3 : satrec.e3,
                    ee2 : satrec.ee2,

                    peo : satrec.peo,
                    pgho : satrec.pgho,
                    pho : satrec.pho,
                    pinco : satrec.pinco,

                    plo : satrec.plo,
                    se2 : satrec.se2,
                    se3 : satrec.se3,

                    sgh2 : satrec.sgh2,
                    sgh3 : satrec.sgh3,
                    sgh4 : satrec.sgh4,

                    sh2 : satrec.sh2,
                    sh3 : satrec.sh3,
                    si2 : satrec.si2,
                    si3 : satrec.si3,

                    sl2 : satrec.sl2,
                    sl3 : satrec.sl3,
                    sl4 : satrec.sl4,

                    xgh2 : satrec.xgh2,
                    xgh3 : satrec.xgh3,
                    xgh4 : satrec.xgh4,
                    xh2 : satrec.xh2,

                    xh3 : satrec.xh3,
                    xi2 : satrec.xi2,
                    xi3 : satrec.xi3,
                    xl2 : satrec.xl2,

                    xl3 : satrec.xl3,
                    xl4 : satrec.xl4,

                    zmol : satrec.zmol,
                    zmos : satrec.zmos
                };

                var dscomResult = dscom(dscomParameters);

                snodm = dscomResult.snodm;
                cnodm = dscomResult.cnodm;
                sinim = dscomResult.sinim;
                cosim = dscomResult.cosim;
                sinomm = dscomResult.sinomm;

                cosomm = dscomResult.cosomm;
                day = dscomResult.day;
                satrec.e3 = dscomResult.e3;
                satrec.ee2 = dscomResult.ee2;
                em = dscomResult.em;

                emsq = dscomResult.emsq;
                gam = dscomResult.gam;
                satrec.peo = dscomResult.peo;
                satrec.pgho = dscomResult.pgho;
                satrec.pho = dscomResult.pho;

                satrec.pinco = dscomResult.pinco;
                satrec.plo = dscomResult.plo;
                rtemsq = dscomResult.rtemsq;
                satrec.se2 = dscomResult.se2;
                satrec.se3 = dscomResult.se3;

                satrec.sgh2 = dscomResult.sgh2;
                satrec.sgh3 = dscomResult.sgh3;
                satrec.sgh4 = dscomResult.sgh4;
                satrec.sh2 = dscomResult.sh2;
                satrec.sh3 = dscomResult.sh3;

                satrec.si2 = dscomResult.si2;
                satrec.si3 = dscomResult.si3;
                satrec.sl2 = dscomResult.sl2;
                satrec.sl3 = dscomResult.sl3;
                satrec.sl4 = dscomResult.sl4;

                s1 = dscomResult.s1;
                s2 = dscomResult.s2;
                s3 = dscomResult.s3;
                s4 = dscomResult.s4;
                s5 = dscomResult.s5;

                s6 = dscomResult.s6;
                s7 = dscomResult.s7;
                ss1 = dscomResult.ss1;
                ss2 = dscomResult.ss2;
                ss3 = dscomResult.ss3;

                ss4 = dscomResult.ss4;
                ss5 = dscomResult.ss5;
                ss6 = dscomResult.ss6;
                ss7 = dscomResult.ss7;
                sz1 = dscomResult.sz1;

                sz2 = dscomResult.sz2;
                sz3 = dscomResult.sz3;
                sz11 = dscomResult.sz11;
                sz12 = dscomResult.sz12;
                sz13 = dscomResult.sz13;

                sz21 = dscomResult.sz21;
                sz22 = dscomResult.sz22;
                sz23 = dscomResult.sz23;
                sz31 = dscomResult.sz31;
                sz32 = dscomResult.sz32;

                sz33 = dscomResult.sz33;
                satrec.xgh2 = dscomResult.xgh2;
                satrec.xgh3 = dscomResult.xgh3;
                satrec.xgh4 = dscomResult.xgh4;
                satrec.xh2 = dscomResult.xh2;

                satrec.xh3 = dscomResult.xh3;
                satrec.xi2 = dscomResult.xi2;
                satrec.xi3 = dscomResult.xi3;
                satrec.xl2 = dscomResult.xl2;
                satrec.xl3 = dscomResult.xl3;

                satrec.xl4 = dscomResult.xl4;
                nm = dscomResult.nm;
                z1 = dscomResult.z1;
                z2 = dscomResult.z2;
                z3 = dscomResult.z3;

                z11 = dscomResult.z11;
                z12 = dscomResult.z12;
                z13 = dscomResult.z13;
                z21 = dscomResult.z21;
                z22 = dscomResult.z22;

                z23 = dscomResult.z23;
                z31 = dscomResult.z31;
                z32 = dscomResult.z32;
                z33 = dscomResult.z33;
                satrec.zmol = dscomResult.zmol;
                satrec.zmos = dscomResult.zmos;

                var dpperParameters = {
                    inclo : inclm,
                    init : satrec.init,
                    ep : satrec.ecco,
                    inclp : satrec.inclo,
                    nodep : satrec.nodeo,
                    argpp : satrec.argpo,
                    mp : satrec.mo,
                    opsmode : satrec.operationmode
                };

                var dpperResult = dpper(satrec, dpperParameters);

                satrec.ecco = dpperResult.ep;
                satrec.inclo = dpperResult.inclp;
                satrec.nodeo = dpperResult.nodep;
                satrec.argpo = dpperResult.argpp;
                satrec.mo = dpperResult.mp;

                argpm  = 0.0;
                nodem  = 0.0;
                mm     = 0.0;

                var dsinitParameters = {
                    cosim : cosim,
                    emsq : emsq,
                    argpo : satrec.argpo,
                    s1 : s1,
                    s2 : s2,
                    s3 : s3,
                    s4 : s4,
                    s5 : s5,
                    sinim : sinim,
                    ss1 : ss1,
                    ss2 : ss2,
                    ss3 : ss3,
                    ss4 : ss4,
                    ss5 : ss5,
                    sz1 : sz1,
                    sz3 : sz3,
                    sz11 : sz11,
                    sz13 : sz13,
                    sz21 : sz21,
                    sz23 : sz23,
                    sz31 : sz31,
                    sz33 : sz33,
                    t : satrec.t,
                    tc : tc,
                    gsto : satrec.gsto,
                    mo : satrec.mo,
                    mdot : satrec.mdot,
                    no : satrec.no,
                    nodeo : satrec.nodeo,
                    nodedot : satrec.nodedot,
                    xpidot : xpidot,
                    z1 : z1,
                    z3 : z3,
                    z11 : z11,
                    z13 : z13,
                    z21 : z21,
                    z23 : z23,
                    z31 : z31,
                    z33 : z33,
                    ecco : satrec.ecco,
                    eccsq : eccsq,
                    em : em,
                    argpm : argpm,
                    inclm : inclm,
                    mm : mm,
                    nm : nm,
                    nodem : nodem,
                    irez : satrec.irez,
                    atime : satrec.atime,
                    d2201 : satrec.d2201,
                    d2211 : satrec.d2211,
                    d3210 : satrec.d3210,
                    d3222 : satrec.d3222 ,
                    d4410 : satrec.d4410,
                    d4422 : satrec.d4422,
                    d5220 : satrec.d5220,
                    d5232 : satrec.d5232,
                    d5421 : satrec.d5421,
                    d5433 : satrec.d5433,
                    dedt : satrec.dedt,
                    didt : satrec.didt,
                    dmdt : satrec.dmdt,
                    dnodt : satrec.dnodt,
                    domdt : satrec.domdt,
                    del1 : satrec.del1,
                    del2 : satrec.del2,
                    del3 : satrec.del3,
                    xfact : satrec.xfact,
                    xlamo : satrec.xlamo,
                    xli : satrec.xli,
                    xni : satrec.xni
                };

                var dsinitResult = dsinit( dsinitParameters );

                em              = dsinitResult.em;
                argpm           = dsinitResult.argpm;
                inclm           = dsinitResult.inclm;
                mm              = dsinitResult.mm;
                nm              = dsinitResult.nm;

                nodem           = dsinitResult.nodem;
                satrec.irez     = dsinitResult.irez;
                satrec.atime    = dsinitResult.atime;
                satrec.d2201    = dsinitResult.d2201;
                satrec.d2211    = dsinitResult.d2211;

                satrec.d3210    = dsinitResult.d3210;
                satrec.d3222    = dsinitResult.d3222;
                satrec.d4410    = dsinitResult.d4410;
                satrec.d4422    = dsinitResult.d4422;
                satrec.d5220    = dsinitResult.d5220;

                satrec.d5232    = dsinitResult.d5232;
                satrec.d5421    = dsinitResult.d5421;
                satrec.d5433    = dsinitResult.d5433;
                satrec.dedt     = dsinitResult.dedt;
                satrec.didt     = dsinitResult.didt;

                satrec.dmdt     = dsinitResult.dmdt;
                dndt            = dsinitResult.dndt;
                satrec.dnodt    = dsinitResult.dnodt;
                satrec.domdt    = dsinitResult.domdt;
                satrec.del1     = dsinitResult.del1;

                satrec.del2     = dsinitResult.del2;
                satrec.del3     = dsinitResult.del3;
                satrec.xfact    = dsinitResult.xfact;
                satrec.xlamo    = dsinitResult.xlamo;
                satrec.xli      = dsinitResult.xli;

                satrec.xni      = dsinitResult.xni;
            }

            //----------- set variables if not deep space -----------
            if (satrec.isimp !== 1){
                cc1sq       = satrec.cc1 * satrec.cc1;
                satrec.d2   = 4.0 * ao * tsi * cc1sq;
                temp        = satrec.d2 * tsi * satrec.cc1 / 3.0;
                satrec.d3   = (17.0 * ao + sfour) * temp;
                satrec.d4   = 0.5 * temp * ao * tsi * (221.0 * ao + 31.0 * sfour) * satrec.cc1;
                satrec.t3cof= satrec.d2 + 2.0 * cc1sq;
                satrec.t4cof= 0.25 * (3.0 * satrec.d3 + satrec.cc1 *
                (12.0 * satrec.d2 + 10.0 * cc1sq));
                satrec.t5cof= 0.2 * (3.0 * satrec.d4 +
                12.0 * satrec.cc1 * satrec.d3 +
                6.0 * satrec.d2 * satrec.d2 +
                15.0 * cc1sq * (2.0 * satrec.d2 + cc1sq));
            }


            /* finally propogate to zero epoch to initialize all others. */
            // sgp4fix take out check to let satellites process until they are actually below earth surface
            //  if(satrec.error == 0)
        }
        sgp4(satrec, 0.0);

        satrec.init = 'n';

        // sgp4fix return boolean. satrec.error contains any error codes
        return true;
    };
});