import { twoPi } from '../constants';

interface DspaceOptions {
  irez: number;
  d2201: number;
  d2211: number;
  d3210: number;
  d3222: number;
  d4410: number;
  d4422: number;
  d5220: number;
  d5232: number;
  d5421: number;
  d5433: number;
  dedt: number;
  del1: number;
  del2: number;
  del3: number;
  didt: number;
  dmdt: number;
  dnodt: number;
  domdt: number;
  argpo: number;
  argpdot: number;
  t: number;
  tc: number;
  gsto: number;
  xfact: number;
  xlamo: number;
  no: number;
  atime: number;
  em: number;
  argpm: number;
  inclm: number;
  xli: number;
  mm: number;
  xni: number;
  nodem: number;
  nm: number;
}

/*-----------------------------------------------------------------------------
 *
 *                           procedure dspace
 *
 *  this procedure provides deep space contributions to mean elements for
 *    perturbing third body.  these effects have been averaged over one
 *    revolution of the sun and moon.  for earth resonance effects, the
 *    effects have been averaged over no revolutions of the satellite.
 *    (mean motion)
 *
 *  author        : david vallado                  719-573-2600   28 jun 2005
 *
 *  inputs        :
 *    d2201, d2211, d3210, d3222, d4410, d4422, d5220, d5232, d5421, d5433 -
 *    dedt        -
 *    del1, del2, del3  -
 *    didt        -
 *    dmdt        -
 *    dnodt       -
 *    domdt       -
 *    irez        - flag for resonance           0-none, 1-one day, 2-half day
 *    argpo       - argument of perigee
 *    argpdot     - argument of perigee dot (rate)
 *    t           - time
 *    tc          -
 *    gsto        - gst
 *    xfact       -
 *    xlamo       -
 *    no          - mean motion
 *    atime       -
 *    em          - eccentricity
 *    ft          -
 *    argpm       - argument of perigee
 *    inclm       - inclination
 *    xli         -
 *    mm          - mean anomaly
 *    xni         - mean motion
 *    nodem       - right ascension of ascending node
 *
 *  outputs       :
 *    atime       -
 *    em          - eccentricity
 *    argpm       - argument of perigee
 *    inclm       - inclination
 *    xli         -
 *    mm          - mean anomaly
 *    xni         -
 *    nodem       - right ascension of ascending node
 *    dndt        -
 *    nm          - mean motion
 *
 *  locals        :
 *    delt        -
 *    ft          -
 *    theta       -
 *    x2li        -
 *    x2omi       -
 *    xl          -
 *    xldot       -
 *    xnddt       -
 *    xndt        -
 *    xomi        -
 *
 *  coupling      :
 *    none        -
 *
 *  references    :
 *    hoots, roehrich, norad spacetrack report #3 1980
 *    hoots, norad spacetrack report #6 1986
 *    hoots, schumacher and glover 2004
 *    vallado, crawford, hujsak, kelso  2006
 ----------------------------------------------------------------------------*/
export default function dspace(options: DspaceOptions) {
  const {
    irez,
    d2201,
    d2211,
    d3210,
    d3222,
    d4410,
    d4422,
    d5220,
    d5232,
    d5421,
    d5433,
    dedt,
    del1,
    del2,
    del3,
    didt,
    dmdt,
    dnodt,
    domdt,
    argpo,
    argpdot,
    t,
    tc,
    gsto,
    xfact,
    xlamo,
    no,
  } = options;

  let {
    atime,
    em,
    argpm,
    inclm,
    xli,
    mm,
    xni,
    nodem,
    nm,
  } = options;

  const fasx2 = 0.13130908;
  const fasx4 = 2.8843198;
  const fasx6 = 0.37448087;
  const g22 = 5.7686396;
  const g32 = 0.95240898;
  const g44 = 1.8014998;
  const g52 = 1.0508330;
  const g54 = 4.4108898;
  // eslint-disable-next-line no-loss-of-precision
  const rptim = 4.37526908801129966e-3; // equates to 7.29211514668855e-5 rad/sec
  const stepp = 720.0;
  const stepn = -720.0;
  const step2 = 259200.0;

  let delt;
  let x2li;
  let x2omi;
  let xl;
  let xldot;
  let xnddt;
  let xndt;
  let xomi;
  let dndt = 0.0;
  let ft = 0.0;

  //  ----------- calculate deep space resonance effects -----------
  const theta = (gsto + (tc * rptim)) % twoPi;
  em += dedt * t;

  inclm += didt * t;
  argpm += domdt * t;
  nodem += dnodt * t;
  mm += dmdt * t;

  // sgp4fix for negative inclinations
  // the following if statement should be commented out
  // if (inclm < 0.0)
  // {
  //   inclm = -inclm;
  //   argpm = argpm - pi;
  //   nodem = nodem + pi;
  // }

  /* - update resonances : numerical (euler-maclaurin) integration - */
  /* ------------------------- epoch restart ----------------------  */
  //   sgp4fix for propagator problems
  //   the following integration works for negative time steps and periods
  //   the specific changes are unknown because the original code was so convoluted

  // sgp4fix take out atime = 0.0 and fix for faster operation

  if (irez !== 0) {
    //  sgp4fix streamline check
    if (atime === 0.0 || t * atime <= 0.0 || Math.abs(t) < Math.abs(atime)) {
      atime = 0.0;
      xni = no;
      xli = xlamo;
    }

    // sgp4fix move check outside loop
    if (t > 0.0) {
      delt = stepp;
    } else {
      delt = stepn;
    }

    let iretn = 381; // added for do loop
    while (iretn === 381) {
      //  ------------------- dot terms calculated -------------
      //  ----------- near - synchronous resonance terms -------
      if (irez !== 2) {
        xndt = (del1 * Math.sin(xli - fasx2))
          + (del2 * Math.sin(2.0 * (xli - fasx4)))
          + (del3 * Math.sin(3.0 * (xli - fasx6)));
        xldot = xni + xfact;
        xnddt = (del1 * Math.cos(xli - fasx2))
          + (2.0 * del2 * Math.cos(2.0 * (xli - fasx4)))
          + (3.0 * del3 * Math.cos(3.0 * (xli - fasx6)));
        xnddt *= xldot;
      } else {
        // --------- near - half-day resonance terms --------
        xomi = argpo + (argpdot * atime);
        x2omi = xomi + xomi;
        x2li = xli + xli;
        xndt = (d2201 * Math.sin((x2omi + xli) - g22))
          + (d2211 * Math.sin(xli - g22))
          + (d3210 * Math.sin((xomi + xli) - g32))
          + (d3222 * Math.sin((-xomi + xli) - g32))
          + (d4410 * Math.sin((x2omi + x2li) - g44))
          + (d4422 * Math.sin(x2li - g44))
          + (d5220 * Math.sin((xomi + xli) - g52))
          + (d5232 * Math.sin((-xomi + xli) - g52))
          + (d5421 * Math.sin((xomi + x2li) - g54))
          + (d5433 * Math.sin((-xomi + x2li) - g54));
        xldot = xni + xfact;
        xnddt = (d2201 * Math.cos((x2omi + xli) - g22))
          + (d2211 * Math.cos(xli - g22))
          + (d3210 * Math.cos((xomi + xli) - g32))
          + (d3222 * Math.cos((-xomi + xli) - g32))
          + (d5220 * Math.cos((xomi + xli) - g52))
          + (d5232 * Math.cos((-xomi + xli) - g52))
          + 2.0 * ((d4410 * Math.cos((x2omi + x2li) - g44))
          + (d4422 * Math.cos(x2li - g44))
          + (d5421 * Math.cos((xomi + x2li) - g54))
          + (d5433 * Math.cos((-xomi + x2li) - g54)));
        xnddt *= xldot;
      }

      //  ----------------------- integrator -------------------
      //  sgp4fix move end checks to end of routine
      if (Math.abs(t - atime) >= stepp) {
        iretn = 381;
      } else {
        ft = t - atime;
        iretn = 0;
      }

      if (iretn === 381) {
        xli += (xldot * delt) + (xndt * step2);
        xni += (xndt * delt) + (xnddt * step2);
        atime += delt;
      }
    }

    nm = xni + (xndt! * ft) + (xnddt! * ft * ft * 0.5);
    xl = xli + (xldot! * ft) + (xndt! * ft * ft * 0.5);
    if (irez !== 1) {
      mm = (xl - (2.0 * nodem)) + (2.0 * theta);
      dndt = nm - no;
    } else {
      mm = (xl - nodem - argpm) + theta;
      dndt = nm - no;
    }
    nm = no + dndt;
  }

  return {
    atime,
    em,
    argpm,
    inclm,
    xli,
    mm,
    xni,
    nodem,
    dndt,
    nm,
  };
}
