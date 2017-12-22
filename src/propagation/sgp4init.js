import {
  pi,
  earthRadius,
  j2,
  j4,
  j3oj2,
  x2o3,
} from '../constants';

import dpper from './dpper';
import dscom from './dscom';
import dsinit from './dsinit';
import initl from './initl';
import sgp4 from './sgp4';

/*-----------------------------------------------------------------------------
 *
 *                             procedure sgp4init
 *
 *  this procedure initializes variables for sgp4.
 *
 *  author        : david vallado                  719-573-2600   28 jun 2005
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
 *    rec      - common values for subsequent calls
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
export default function sgp4init(satrec, options) {
  const rec = { ...satrec };

  const {
    opsmode,
    satn,
    epoch,
    xbstar,
    xecco,
    xargpo,
    xinclo,
    xmo,
    xno,
    xnodeo,
  } = options;

  let cosim;
  let sinim;
  let cc1sq;
  let cc2;
  let cc3;
  let coef;
  let coef1;
  let cosio4;
  let em;
  let emsq;
  let eeta;
  let etasq;
  let argpm;
  let nodem;
  let inclm;
  let mm;
  let nm;
  let perige;
  let pinvsq;
  let psisq;
  let qzms24;
  let s1;
  let s2;
  let s3;
  let s4;
  let s5;
  let sfour;
  let ss1;
  let ss2;
  let ss3;
  let ss4;
  let ss5;
  let sz1;
  let sz3;
  let sz11;
  let sz13;
  let sz21;
  let sz23;
  let sz31;
  let sz33;
  let tc;
  let temp;
  let temp1;
  let temp2;
  let temp3;
  let tsi;
  let xpidot;
  let xhdot1;
  let z1;
  let z3;
  let z11;
  let z13;
  let z21;
  let z23;
  let z31;
  let z33;

  /* ------------------------ initialization --------------------- */
  // sgp4fix divisor for divide by zero check on inclination
  // the old check used 1.0 + Math.cos(pi-1.0e-9), but then compared it to
  // 1.5 e-12, so the threshold was changed to 1.5e-12 for consistency
  const temp4 = 1.5e-12;

  // ----------- set all near earth variables to zero ------------
  rec.isimp = 0; rec.method = 'n'; rec.aycof = 0.0;
  rec.con41 = 0.0; rec.cc1 = 0.0; rec.cc4 = 0.0;
  rec.cc5 = 0.0; rec.d2 = 0.0; rec.d3 = 0.0;
  rec.d4 = 0.0; rec.delmo = 0.0; rec.eta = 0.0;
  rec.argpdot = 0.0; rec.omgcof = 0.0; rec.sinmao = 0.0;
  rec.t = 0.0; rec.t2cof = 0.0; rec.t3cof = 0.0;
  rec.t4cof = 0.0; rec.t5cof = 0.0; rec.x1mth2 = 0.0;
  rec.x7thm1 = 0.0; rec.mdot = 0.0; rec.nodedot = 0.0;
  rec.xlcof = 0.0; rec.xmcof = 0.0; rec.nodecf = 0.0;

  // ----------- set all deep space variables to zero ------------
  rec.irez = 0; rec.d2201 = 0.0; rec.d2211 = 0.0;
  rec.d3210 = 0.0; rec.d3222 = 0.0; rec.d4410 = 0.0;
  rec.d4422 = 0.0; rec.d5220 = 0.0; rec.d5232 = 0.0;
  rec.d5421 = 0.0; rec.d5433 = 0.0; rec.dedt = 0.0;
  rec.del1 = 0.0; rec.del2 = 0.0; rec.del3 = 0.0;
  rec.didt = 0.0; rec.dmdt = 0.0; rec.dnodt = 0.0;
  rec.domdt = 0.0; rec.e3 = 0.0; rec.ee2 = 0.0;
  rec.peo = 0.0; rec.pgho = 0.0; rec.pho = 0.0;
  rec.pinco = 0.0; rec.plo = 0.0; rec.se2 = 0.0;
  rec.se3 = 0.0; rec.sgh2 = 0.0; rec.sgh3 = 0.0;
  rec.sgh4 = 0.0; rec.sh2 = 0.0; rec.sh3 = 0.0;
  rec.si2 = 0.0; rec.si3 = 0.0; rec.sl2 = 0.0;
  rec.sl3 = 0.0; rec.sl4 = 0.0; rec.gsto = 0.0;
  rec.xfact = 0.0; rec.xgh2 = 0.0; rec.xgh3 = 0.0;
  rec.xgh4 = 0.0; rec.xh2 = 0.0; rec.xh3 = 0.0;
  rec.xi2 = 0.0; rec.xi3 = 0.0; rec.xl2 = 0.0;
  rec.xl3 = 0.0; rec.xl4 = 0.0; rec.xlamo = 0.0;
  rec.zmol = 0.0; rec.zmos = 0.0; rec.atime = 0.0;
  rec.xli = 0.0; rec.xni = 0.0;

  // sgp4fix - note the following variables are also passed directly via rec.
  // it is possible to streamline the sgp4init call by deleting the "x"
  // variables, but the user would need to set the rec.* values first. we
  // include the additional assignments in case twoline2rv is not used.

  rec.bstar = xbstar;
  rec.ecco = xecco;
  rec.argpo = xargpo;
  rec.inclo = xinclo;
  rec.mo = xmo;
  rec.no = xno;
  rec.nodeo = xnodeo;

  //  sgp4fix add opsmode
  rec.operationmode = opsmode;

  // ------------------------ earth constants -----------------------
  // sgp4fix identify constants and allow alternate values

  const ss = (78.0 / earthRadius) + 1.0;
  // sgp4fix use multiply for speed instead of pow
  const qzms2ttemp = (120.0 - 78.0) / earthRadius;
  const qzms2t = qzms2ttemp * qzms2ttemp * qzms2ttemp * qzms2ttemp;

  rec.init = 'y';
  rec.t = 0.0;

  const initlOptions = {
    satn,
    ecco: rec.ecco,

    epoch,
    inclo: rec.inclo,
    no: rec.no,

    method: rec.method,
    opsmode: rec.operationmode,
  };

  const initlResult = initl(initlOptions);

  const {
    ao,
    con42,
    cosio,
    cosio2,
    eccsq,
    omeosq,
    posq,
    rp,
    rteosq,
    sinio,
  } = initlResult;

  rec.no = initlResult.no;
  rec.con41 = initlResult.con41;
  rec.gsto = initlResult.gsto;
  rec.error = 0;

  // sgp4fix remove this check as it is unnecessary
  // the mrt check in sgp4 handles decaying satellite cases even if the starting
  // condition is below the surface of te earth
  // if (rp < 1.0)
  // {
  //   printf("// *** satn%d epoch elts sub-orbital ***\n", satn);
  //   rec.error = 5;
  // }

  if (omeosq >= 0.0 || rec.no >= 0.0) {
    rec.isimp = 0;
    if ((rp < 220.0 / earthRadius) + 1.0) {
      rec.isimp = 1;
    }
    sfour = ss;
    qzms24 = qzms2t;
    perige = (rp - 1.0) * earthRadius;

    // - for perigees below 156 km, s and qoms2t are altered -
    if (perige < 156.0) {
      sfour = perige - 78.0;
      if (perige < 98.0) {
        sfour = 20.0;
      }

      // sgp4fix use multiply for speed instead of pow
      const qzms24temp = (120.0 - sfour) / earthRadius;
      qzms24 = qzms24temp * qzms24temp * qzms24temp * qzms24temp;
      sfour = (sfour / earthRadius) + 1.0;
    }
    pinvsq = 1.0 / posq;

    tsi = 1.0 / (ao - sfour);
    rec.eta = ao * rec.ecco * tsi;
    etasq = rec.eta * rec.eta;
    eeta = rec.ecco * rec.eta;
    psisq = Math.abs(1.0 - etasq);
    coef = qzms24 * (tsi ** 4.0);
    coef1 = coef / (psisq ** 3.5);
    cc2 = coef1 * rec.no * ((ao * (1.0 + (1.5 * etasq) + (eeta * (4.0 + etasq)))) +
      (((0.375 * j2 * tsi) / psisq) * rec.con41 *
        (8.0 + (3.0 * etasq * (8.0 + etasq)))));
    rec.cc1 = rec.bstar * cc2;
    cc3 = 0.0;
    if (rec.ecco > 1.0e-4) {
      cc3 = (-2.0 * coef * tsi * j3oj2 * rec.no * sinio) / rec.ecco;
    }
    rec.x1mth2 = 1.0 - cosio2;
    rec.cc4 = 2.0 * rec.no * coef1 * ao * omeosq * (
      ((rec.eta * (2.0 + (0.5 * etasq))) +
        (rec.ecco * (0.5 + (2.0 * etasq)))) -
      (((j2 * tsi) / (ao * psisq)) *
        ((-3.0 * rec.con41 * ((1.0 - (2.0 * eeta)) + (etasq * (1.5 - (0.5 * eeta))))) +
          (0.75 * rec.x1mth2 *
            ((2.0 * etasq) - (eeta * (1.0 + etasq))) *
            Math.cos(2.0 * rec.argpo))))
    );
    rec.cc5 = 2.0 * coef1 * ao * omeosq * (1.0 + (2.75 * (etasq + eeta)) + (eeta * etasq));
    cosio4 = cosio2 * cosio2;
    temp1 = 1.5 * j2 * pinvsq * rec.no;
    temp2 = 0.5 * temp1 * j2 * pinvsq;
    temp3 = -0.46875 * j4 * pinvsq * pinvsq * rec.no;
    rec.mdot = rec.no + (0.5 * temp1 * rteosq * rec.con41) +
      (0.0625 * temp2 * rteosq * ((13.0 - (78.0 * cosio2)) + (137.0 * cosio4)));
    rec.argpdot = (-0.5 * temp1 * con42) +
      (0.0625 * temp2 * ((7.0 - (114.0 * cosio2)) + (395.0 * cosio4))) +
      (temp3 * ((3.0 - (36.0 * cosio2)) + (49.0 * cosio4)));
    xhdot1 = -temp1 * cosio;
    rec.nodedot = xhdot1 + (((0.5 * temp2 * (4.0 - (19.0 * cosio2))) +
      (2.0 * temp3 * (3.0 - (7.0 * cosio2)))) * cosio);
    xpidot = rec.argpdot + rec.nodedot;
    rec.omgcof = rec.bstar * cc3 * Math.cos(rec.argpo);
    rec.xmcof = 0.0;
    if (rec.ecco > 1.0e-4) {
      rec.xmcof = (-x2o3 * coef * rec.bstar) / eeta;
    }
    rec.nodecf = 3.5 * omeosq * xhdot1 * rec.cc1;
    rec.t2cof = 1.5 * rec.cc1;

    // sgp4fix for divide by zero with xinco = 180 deg
    if (Math.abs(cosio + 1.0) > 1.5e-12) {
      rec.xlcof = (-0.25 * j3oj2 * sinio * (3.0 + (5.0 * cosio))) / (1.0 + cosio);
    } else {
      rec.xlcof = (-0.25 * j3oj2 * sinio * (3.0 + (5.0 * cosio))) / temp4;
    }
    rec.aycof = -0.5 * j3oj2 * sinio;

    // sgp4fix use multiply for speed instead of pow
    const delmotemp = 1.0 + (rec.eta * Math.cos(rec.mo));
    rec.delmo = delmotemp * delmotemp * delmotemp;
    rec.sinmao = Math.sin(rec.mo);
    rec.x7thm1 = (7.0 * cosio2) - 1.0;

    // --------------- deep space initialization -------------
    if ((2 * pi) / rec.no >= 225.0) {
      rec.method = 'd';
      rec.isimp = 1;
      tc = 0.0;
      inclm = rec.inclo;

      const dscomOptions = {
        epoch,
        ep: rec.ecco,
        argpp: rec.argpo,
        tc,
        inclp: rec.inclo,
        nodep: rec.nodeo,

        np: rec.no,

        e3: rec.e3,
        ee2: rec.ee2,

        peo: rec.peo,
        pgho: rec.pgho,
        pho: rec.pho,
        pinco: rec.pinco,

        plo: rec.plo,
        se2: rec.se2,
        se3: rec.se3,

        sgh2: rec.sgh2,
        sgh3: rec.sgh3,
        sgh4: rec.sgh4,

        sh2: rec.sh2,
        sh3: rec.sh3,
        si2: rec.si2,
        si3: rec.si3,

        sl2: rec.sl2,
        sl3: rec.sl3,
        sl4: rec.sl4,

        xgh2: rec.xgh2,
        xgh3: rec.xgh3,
        xgh4: rec.xgh4,
        xh2: rec.xh2,

        xh3: rec.xh3,
        xi2: rec.xi2,
        xi3: rec.xi3,
        xl2: rec.xl2,

        xl3: rec.xl3,
        xl4: rec.xl4,

        zmol: rec.zmol,
        zmos: rec.zmos,
      };

      const dscomResult = dscom(dscomOptions);

      rec.e3 = dscomResult.e3;
      rec.ee2 = dscomResult.ee2;

      rec.peo = dscomResult.peo;
      rec.pgho = dscomResult.pgho;
      rec.pho = dscomResult.pho;

      rec.pinco = dscomResult.pinco;
      rec.plo = dscomResult.plo;
      rec.se2 = dscomResult.se2;
      rec.se3 = dscomResult.se3;

      rec.sgh2 = dscomResult.sgh2;
      rec.sgh3 = dscomResult.sgh3;
      rec.sgh4 = dscomResult.sgh4;
      rec.sh2 = dscomResult.sh2;
      rec.sh3 = dscomResult.sh3;

      rec.si2 = dscomResult.si2;
      rec.si3 = dscomResult.si3;
      rec.sl2 = dscomResult.sl2;
      rec.sl3 = dscomResult.sl3;
      rec.sl4 = dscomResult.sl4;

      ({
        sinim,
        cosim,
        em,
        emsq,
        s1,
        s2,
        s3,
        s4,
        s5,
        ss1,
        ss2,
        ss3,
        ss4,
        ss5,
        sz1,
        sz3,
        sz11,
        sz13,
        sz21,
        sz23,
        sz31,
        sz33,
      } = dscomResult);

      rec.xgh2 = dscomResult.xgh2;
      rec.xgh3 = dscomResult.xgh3;
      rec.xgh4 = dscomResult.xgh4;
      rec.xh2 = dscomResult.xh2;
      rec.xh3 = dscomResult.xh3;
      rec.xi2 = dscomResult.xi2;
      rec.xi3 = dscomResult.xi3;
      rec.xl2 = dscomResult.xl2;
      rec.xl3 = dscomResult.xl3;
      rec.xl4 = dscomResult.xl4;
      rec.zmol = dscomResult.zmol;
      rec.zmos = dscomResult.zmos;

      ({
        nm,
        z1,
        z3,
        z11,
        z13,
        z21,
        z23,
        z31,
        z33,
      } = dscomResult);

      const dpperOptions = {
        inclo: inclm,
        init: rec.init,
        ep: rec.ecco,
        inclp: rec.inclo,
        nodep: rec.nodeo,
        argpp: rec.argpo,
        mp: rec.mo,
        opsmode: rec.operationmode,
      };

      const dpperResult = dpper(rec, dpperOptions);

      rec.ecco = dpperResult.ep;
      rec.inclo = dpperResult.inclp;
      rec.nodeo = dpperResult.nodep;
      rec.argpo = dpperResult.argpp;
      rec.mo = dpperResult.mp;

      argpm = 0.0;
      nodem = 0.0;
      mm = 0.0;

      const dsinitOptions = {
        cosim,
        emsq,
        argpo: rec.argpo,
        s1,
        s2,
        s3,
        s4,
        s5,
        sinim,
        ss1,
        ss2,
        ss3,
        ss4,
        ss5,
        sz1,
        sz3,
        sz11,
        sz13,
        sz21,
        sz23,
        sz31,
        sz33,
        t: rec.t,
        tc,
        gsto: rec.gsto,
        mo: rec.mo,
        mdot: rec.mdot,
        no: rec.no,
        nodeo: rec.nodeo,
        nodedot: rec.nodedot,
        xpidot,
        z1,
        z3,
        z11,
        z13,
        z21,
        z23,
        z31,
        z33,
        ecco: rec.ecco,
        eccsq,
        em,
        argpm,
        inclm,
        mm,
        nm,
        nodem,
        irez: rec.irez,
        atime: rec.atime,
        d2201: rec.d2201,
        d2211: rec.d2211,
        d3210: rec.d3210,
        d3222: rec.d3222,
        d4410: rec.d4410,
        d4422: rec.d4422,
        d5220: rec.d5220,
        d5232: rec.d5232,
        d5421: rec.d5421,
        d5433: rec.d5433,
        dedt: rec.dedt,
        didt: rec.didt,
        dmdt: rec.dmdt,
        dnodt: rec.dnodt,
        domdt: rec.domdt,
        del1: rec.del1,
        del2: rec.del2,
        del3: rec.del3,
        xfact: rec.xfact,
        xlamo: rec.xlamo,
        xli: rec.xli,
        xni: rec.xni,
      };

      const dsinitResult = dsinit(dsinitOptions);

      rec.irez = dsinitResult.irez;
      rec.atime = dsinitResult.atime;
      rec.d2201 = dsinitResult.d2201;
      rec.d2211 = dsinitResult.d2211;

      rec.d3210 = dsinitResult.d3210;
      rec.d3222 = dsinitResult.d3222;
      rec.d4410 = dsinitResult.d4410;
      rec.d4422 = dsinitResult.d4422;
      rec.d5220 = dsinitResult.d5220;

      rec.d5232 = dsinitResult.d5232;
      rec.d5421 = dsinitResult.d5421;
      rec.d5433 = dsinitResult.d5433;
      rec.dedt = dsinitResult.dedt;
      rec.didt = dsinitResult.didt;

      rec.dmdt = dsinitResult.dmdt;
      rec.dnodt = dsinitResult.dnodt;
      rec.domdt = dsinitResult.domdt;
      rec.del1 = dsinitResult.del1;

      rec.del2 = dsinitResult.del2;
      rec.del3 = dsinitResult.del3;
      rec.xfact = dsinitResult.xfact;
      rec.xlamo = dsinitResult.xlamo;
      rec.xli = dsinitResult.xli;

      rec.xni = dsinitResult.xni;
    }

    // ----------- set variables if not deep space -----------
    if (rec.isimp !== 1) {
      cc1sq = rec.cc1 * rec.cc1;
      rec.d2 = 4.0 * ao * tsi * cc1sq;
      temp = (rec.d2 * tsi * rec.cc1) / 3.0;
      rec.d3 = ((17.0 * ao) + sfour) * temp;
      rec.d4 = 0.5 * temp * ao * tsi * ((221.0 * ao) + (31.0 * sfour)) * rec.cc1;
      rec.t3cof = rec.d2 + (2.0 * cc1sq);
      rec.t4cof = 0.25 * ((3.0 * rec.d3) + (rec.cc1 * ((12.0 * rec.d2) + (10.0 * cc1sq))));
      rec.t5cof = 0.2 * (
        (3.0 * rec.d4) +
        (12.0 * rec.cc1 * rec.d3) +
        (6.0 * rec.d2 * rec.d2) +
        (15.0 * cc1sq * ((2.0 * rec.d2) + cc1sq))
      );
    }

    /* finally propogate to zero epoch to initialize all others. */
    // sgp4fix take out check to let satellites process until they are actually below earth surface
    // if(rec.error == 0)
  }
  sgp4(rec, 0.0);

  rec.init = 'n';

  // rec.error contains any error codes
  return rec;
}
