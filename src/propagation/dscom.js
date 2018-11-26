import { twoPi } from '../constants';

/*-----------------------------------------------------------------------------
 *
 *                           procedure dscom
 *
 *  this procedure provides deep space common items used by both the secular
 *    and periodics subroutines.  input is provided as shown. this routine
 *    used to be called dpper, but the functions inside weren't well organized.
 *
 *  author        : david vallado                  719-573-2600   28 jun 2005
 *
 *  inputs        :
 *    epoch       -
 *    ep          - eccentricity
 *    argpp       - argument of perigee
 *    tc          -
 *    inclp       - inclination
 *    nodep       - right ascension of ascending node
 *    np          - mean motion
 *
 *  outputs       :
 *    sinim  , cosim  , sinomm , cosomm , snodm  , cnodm
 *    day         -
 *    e3          -
 *    ee2         -
 *    em          - eccentricity
 *    emsq        - eccentricity squared
 *    gam         -
 *    peo         -
 *    pgho        -
 *    pho         -
 *    pinco       -
 *    plo         -
 *    rtemsq      -
 *    se2, se3         -
 *    sgh2, sgh3, sgh4        -
 *    sh2, sh3, si2, si3, sl2, sl3, sl4         -
 *    s1, s2, s3, s4, s5, s6, s7          -
 *    ss1, ss2, ss3, ss4, ss5, ss6, ss7, sz1, sz2, sz3         -
 *    sz11, sz12, sz13, sz21, sz22, sz23, sz31, sz32, sz33        -
 *    xgh2, xgh3, xgh4, xh2, xh3, xi2, xi3, xl2, xl3, xl4         -
 *    nm          - mean motion
 *    z1, z2, z3, z11, z12, z13, z21, z22, z23, z31, z32, z33         -
 *    zmol        -
 *    zmos        -
 *
 *  locals        :
 *    a1, a2, a3, a4, a5, a6, a7, a8, a9, a10         -
 *    betasq      -
 *    cc          -
 *    ctem, stem        -
 *    x1, x2, x3, x4, x5, x6, x7, x8          -
 *    xnodce      -
 *    xnoi        -
 *    zcosg  , zsing  , zcosgl , zsingl , zcosh  , zsinh  , zcoshl , zsinhl ,
 *    zcosi  , zsini  , zcosil , zsinil ,
 *    zx          -
 *    zy          -
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
export default function dscom(options) {
  const {
    epoch,
    ep,
    argpp,
    tc,
    inclp,
    nodep,
    np,
  } = options;

  let a1;
  let a2;
  let a3;
  let a4;
  let a5;
  let a6;
  let a7;
  let a8;
  let a9;
  let a10;
  let cc;
  let x1;
  let x2;
  let x3;
  let x4;
  let x5;
  let x6;
  let x7;
  let x8;
  let zcosg;
  let zsing;
  let zcosh;
  let zsinh;
  let zcosi;
  let zsini;

  let ss1;
  let ss2;
  let ss3;
  let ss4;
  let ss5;
  let ss6;
  let ss7;
  let sz1;
  let sz2;
  let sz3;
  let sz11;
  let sz12;
  let sz13;
  let sz21;
  let sz22;
  let sz23;
  let sz31;
  let sz32;
  let sz33;
  let s1;
  let s2;
  let s3;
  let s4;
  let s5;
  let s6;
  let s7;
  let z1;
  let z2;
  let z3;
  let z11;
  let z12;
  let z13;
  let z21;
  let z22;
  let z23;
  let z31;
  let z32;
  let z33;

  // -------------------------- constants -------------------------
  const zes = 0.01675;
  const zel = 0.05490;
  const c1ss = 2.9864797e-6;
  const c1l = 4.7968065e-7;
  const zsinis = 0.39785416;
  const zcosis = 0.91744867;
  const zcosgs = 0.1945905;
  const zsings = -0.98088458;

  //  --------------------- local variables ------------------------
  const nm = np;
  const em = ep;
  const snodm = Math.sin(nodep);
  const cnodm = Math.cos(nodep);
  const sinomm = Math.sin(argpp);
  const cosomm = Math.cos(argpp);
  const sinim = Math.sin(inclp);
  const cosim = Math.cos(inclp);
  const emsq = em * em;
  const betasq = 1.0 - emsq;
  const rtemsq = Math.sqrt(betasq);

  //  ----------------- initialize lunar solar terms ---------------
  const peo = 0.0;
  const pinco = 0.0;
  const plo = 0.0;
  const pgho = 0.0;
  const pho = 0.0;
  const day = epoch + 18261.5 + (tc / 1440.0);
  const xnodce = (4.5236020 - (9.2422029e-4 * day)) % twoPi;
  const stem = Math.sin(xnodce);
  const ctem = Math.cos(xnodce);
  const zcosil = 0.91375164 - (0.03568096 * ctem);
  const zsinil = Math.sqrt(1.0 - (zcosil * zcosil));
  const zsinhl = (0.089683511 * stem) / zsinil;
  const zcoshl = Math.sqrt(1.0 - (zsinhl * zsinhl));
  const gam = 5.8351514 + (0.0019443680 * day);
  let zx = (0.39785416 * stem) / zsinil;
  const zy = (zcoshl * ctem) + (0.91744867 * zsinhl * stem);
  zx = Math.atan2(zx, zy);
  zx += gam - xnodce;
  const zcosgl = Math.cos(zx);
  const zsingl = Math.sin(zx);

  //  ------------------------- do solar terms ---------------------
  zcosg = zcosgs;
  zsing = zsings;
  zcosi = zcosis;
  zsini = zsinis;
  zcosh = cnodm;
  zsinh = snodm;
  cc = c1ss;
  const xnoi = 1.0 / nm;

  let lsflg = 0;
  while (lsflg < 2) {
    lsflg += 1;
    a1 = (zcosg * zcosh) + (zsing * zcosi * zsinh);
    a3 = (-zsing * zcosh) + (zcosg * zcosi * zsinh);
    a7 = (-zcosg * zsinh) + (zsing * zcosi * zcosh);
    a8 = zsing * zsini;
    a9 = (zsing * zsinh) + (zcosg * zcosi * zcosh);
    a10 = zcosg * zsini;
    a2 = (cosim * a7) + (sinim * a8);
    a4 = (cosim * a9) + (sinim * a10);
    a5 = (-sinim * a7) + (cosim * a8);
    a6 = (-sinim * a9) + (cosim * a10);

    x1 = (a1 * cosomm) + (a2 * sinomm);
    x2 = (a3 * cosomm) + (a4 * sinomm);
    x3 = (-a1 * sinomm) + (a2 * cosomm);
    x4 = (-a3 * sinomm) + (a4 * cosomm);
    x5 = a5 * sinomm;
    x6 = a6 * sinomm;
    x7 = a5 * cosomm;
    x8 = a6 * cosomm;

    z31 = (12.0 * x1 * x1) - (3.0 * x3 * x3);
    z32 = (24.0 * x1 * x2) - (6.0 * x3 * x4);
    z33 = (12.0 * x2 * x2) - (3.0 * x4 * x4);

    z1 = (3.0 * ((a1 * a1) + (a2 * a2))) + (z31 * emsq);
    z2 = (6.0 * ((a1 * a3) + (a2 * a4))) + (z32 * emsq);
    z3 = (3.0 * ((a3 * a3) + (a4 * a4))) + (z33 * emsq);

    z11 = (-6.0 * a1 * a5)
      + (emsq * ((-24.0 * x1 * x7) - (6.0 * x3 * x5)));
    z12 = (-6.0 * ((a1 * a6) + (a3 * a5)))
      + (emsq * ((-24.0 * ((x2 * x7) + (x1 * x8))) + (-6.0 * ((x3 * x6) + (x4 * x5)))));

    z13 = (-6.0 * a3 * a6)
      + (emsq * ((-24.0 * x2 * x8) - (6.0 * x4 * x6)));

    z21 = (6.0 * a2 * a5)
      + (emsq * ((24.0 * x1 * x5) - (6.0 * x3 * x7)));
    z22 = (6.0 * ((a4 * a5) + (a2 * a6)))
      + (emsq * ((24.0 * ((x2 * x5) + (x1 * x6))) - (6.0 * ((x4 * x7) + (x3 * x8)))));
    z23 = (6.0 * a4 * a6)
      + (emsq * ((24.0 * x2 * x6) - (6.0 * x4 * x8)));

    z1 = z1 + z1 + (betasq * z31);
    z2 = z2 + z2 + (betasq * z32);
    z3 = z3 + z3 + (betasq * z33);
    s3 = cc * xnoi;
    s2 = (-0.5 * s3) / rtemsq;
    s4 = s3 * rtemsq;
    s1 = -15.0 * em * s4;
    s5 = (x1 * x3) + (x2 * x4);
    s6 = (x2 * x3) + (x1 * x4);
    s7 = (x2 * x4) - (x1 * x3);

    //  ----------------------- do lunar terms -------------------
    if (lsflg === 1) {
      ss1 = s1;
      ss2 = s2;
      ss3 = s3;
      ss4 = s4;
      ss5 = s5;
      ss6 = s6;
      ss7 = s7;
      sz1 = z1;
      sz2 = z2;
      sz3 = z3;
      sz11 = z11;
      sz12 = z12;
      sz13 = z13;
      sz21 = z21;
      sz22 = z22;
      sz23 = z23;
      sz31 = z31;
      sz32 = z32;
      sz33 = z33;
      zcosg = zcosgl;
      zsing = zsingl;
      zcosi = zcosil;
      zsini = zsinil;
      zcosh = (zcoshl * cnodm) + (zsinhl * snodm);
      zsinh = (snodm * zcoshl) - (cnodm * zsinhl);
      cc = c1l;
    }
  }

  const zmol = (4.7199672 + ((0.22997150 * day) - gam)) % twoPi;
  const zmos = (6.2565837 + (0.017201977 * day)) % twoPi;

  //  ------------------------ do solar terms ----------------------
  const se2 = 2.0 * ss1 * ss6;
  const se3 = 2.0 * ss1 * ss7;
  const si2 = 2.0 * ss2 * sz12;
  const si3 = 2.0 * ss2 * (sz13 - sz11);
  const sl2 = -2.0 * ss3 * sz2;
  const sl3 = -2.0 * ss3 * (sz3 - sz1);
  const sl4 = -2.0 * ss3 * (-21.0 - (9.0 * emsq)) * zes;
  const sgh2 = 2.0 * ss4 * sz32;
  const sgh3 = 2.0 * ss4 * (sz33 - sz31);
  const sgh4 = -18.0 * ss4 * zes;
  const sh2 = -2.0 * ss2 * sz22;
  const sh3 = -2.0 * ss2 * (sz23 - sz21);

  //  ------------------------ do lunar terms ----------------------
  const ee2 = 2.0 * s1 * s6;
  const e3 = 2.0 * s1 * s7;
  const xi2 = 2.0 * s2 * z12;
  const xi3 = 2.0 * s2 * (z13 - z11);
  const xl2 = -2.0 * s3 * z2;
  const xl3 = -2.0 * s3 * (z3 - z1);
  const xl4 = -2.0 * s3 * (-21.0 - (9.0 * emsq)) * zel;
  const xgh2 = 2.0 * s4 * z32;
  const xgh3 = 2.0 * s4 * (z33 - z31);
  const xgh4 = -18.0 * s4 * zel;
  const xh2 = -2.0 * s2 * z22;
  const xh3 = -2.0 * s2 * (z23 - z21);

  return {
    snodm,
    cnodm,
    sinim,
    cosim,
    sinomm,

    cosomm,
    day,
    e3,
    ee2,
    em,

    emsq,
    gam,
    peo,
    pgho,
    pho,

    pinco,
    plo,
    rtemsq,
    se2,
    se3,

    sgh2,
    sgh3,
    sgh4,
    sh2,
    sh3,

    si2,
    si3,
    sl2,
    sl3,
    sl4,

    s1,
    s2,
    s3,
    s4,
    s5,

    s6,
    s7,
    ss1,
    ss2,
    ss3,

    ss4,
    ss5,
    ss6,
    ss7,
    sz1,

    sz2,
    sz3,
    sz11,
    sz12,
    sz13,

    sz21,
    sz22,
    sz23,
    sz31,
    sz32,

    sz33,
    xgh2,
    xgh3,
    xgh4,
    xh2,

    xh3,
    xi2,
    xi3,
    xl2,
    xl3,

    xl4,
    nm,
    z1,
    z2,
    z3,

    z11,
    z12,
    z13,
    z21,
    z22,

    z23,
    z31,
    z32,
    z33,
    zmol,

    zmos,
  };
}
