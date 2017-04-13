(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["satellite"] = factory();
	else
		root["satellite"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 19);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var pi = exports.pi = Math.PI;
var twoPi = exports.twoPi = pi * 2;
var deg2rad = exports.deg2rad = pi / 180.0;
var rad2deg = exports.rad2deg = 180 / pi;
var minutesPerDay = exports.minutesPerDay = 1440.0;
var mu = exports.mu = 398600.5; // in km3 / s2
var earthRadius = exports.earthRadius = 6378.137; // in km
var xke = exports.xke = 60.0 / Math.sqrt(earthRadius * earthRadius * earthRadius / mu);
var j2 = exports.j2 = 0.00108262998905;
var j3 = exports.j3 = -0.00000253215306;
var j4 = exports.j4 = -0.00000161098761;
var j3oj2 = exports.j3oj2 = j3 / j2;
var x2o3 = exports.x2o3 = 2.0 / 3.0;

exports.default = {
  pi: pi,
  twoPi: twoPi,
  deg2rad: deg2rad,
  rad2deg: rad2deg,
  minutesPerDay: minutesPerDay,
  mu: mu,
  earthRadius: earthRadius,
  xke: xke,
  j2: j2,
  j3: j3,
  j4: j4,
  j3oj2: j3oj2,
  x2o3: x2o3
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = jday;
function jdayInternal(year, mon, day, hr, minute, sec) {
  /*
  return (
    (367.0 * year) -
    (Math.floor((7 * (year + Math.floor((mon + 9) / 12.0))) * 0.25) +
    Math.floor((275 * mon) / 9.0) +
    day + 1721013.5 +
    (((((sec / 60.0) + minute) / 60.0) + hr) / 24.0)) // ut in days
    // # - 0.5*sgn(100.0*year + mon - 190002.5) + 0.5;
  );
  */

  return 367.0 * year - Math.floor(7 * (year + Math.floor((mon + 9) / 12.0)) * 0.25) + Math.floor(275 * mon / 9.0) + day + 1721013.5 + ((sec / 60.0 + minute) / 60.0 + hr) / 24.0 //  ut in days
  //#  - 0.5*sgn(100.0*year + mon - 190002.5) + 0.5;
  ;
}

function jday(year, mon, day, hr, minute, sec) {
  if (year instanceof Date) {
    var date = year;
    return jdayInternal(date.getUTCFullYear(), date.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
    date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
  }

  return jdayInternal(year, mon, day, hr, minute, sec);
}
module.exports = exports["default"];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sgp4;

var _dpper = __webpack_require__(5);

var _dpper2 = _interopRequireDefault(_dpper);

var _dspace = __webpack_require__(17);

var _dspace2 = _interopRequireDefault(_dspace);

var _constants = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*-----------------------------------------------------------------------------
 *
 *                             procedure sgp4
 *
 *  this procedure is the sgp4 prediction model from space command. this is an
 *    updated and combined version of sgp4 and sdp4, which were originally
 *    published separately in spacetrack report //3. this version follows the
 *    methodology from the aiaa paper (2006) describing the history and
 *    development of the code.
 *
 *  author        : david vallado                  719-573-2600   28 jun 2005
 *
 *  inputs        :
 *    satrec  - initialised structure from sgp4init() call.
 *    tsince  - time since epoch (minutes)
 *
 *  outputs       :
 *    r           - position vector                     km
 *    v           - velocity                            km/sec
 *  return code - non-zero on error.
 *                   1 - mean elements, ecc >= 1.0 or ecc < -0.001 or a < 0.95 er
 *                   2 - mean motion less than 0.0
 *                   3 - pert elements, ecc < 0.0  or  ecc > 1.0
 *                   4 - semi-latus rectum < 0.0
 *                   5 - epoch elements are sub-orbital
 *                   6 - satellite has decayed
 *
 *  locals        :
 *    am          -
 *    axnl, aynl        -
 *    betal       -
 *    cosim   , sinim   , cosomm  , sinomm  , cnod    , snod    , cos2u   ,
 *    sin2u   , coseo1  , sineo1  , cosi    , sini    , cosip   , sinip   ,
 *    cosisq  , cossu   , sinsu   , cosu    , sinu
 *    delm        -
 *    delomg      -
 *    dndt        -
 *    eccm        -
 *    emsq        -
 *    ecose       -
 *    el2         -
 *    eo1         -
 *    eccp        -
 *    esine       -
 *    argpm       -
 *    argpp       -
 *    omgadf      -
 *    pl          -
 *    r           -
 *    rtemsq      -
 *    rdotl       -
 *    rl          -
 *    rvdot       -
 *    rvdotl      -
 *    su          -
 *    t2  , t3   , t4    , tc
 *    tem5, temp , temp1 , temp2  , tempa  , tempe  , templ
 *    u   , ux   , uy    , uz     , vx     , vy     , vz
 *    inclm       - inclination
 *    mm          - mean anomaly
 *    nm          - mean motion
 *    nodem       - right asc of ascending node
 *    xinc        -
 *    xincp       -
 *    xl          -
 *    xlm         -
 *    mp          -
 *    xmdf        -
 *    xmx         -
 *    xmy         -
 *    nodedf      -
 *    xnode       -
 *    nodep       -
 *    np          -
 *
 *  coupling      :
 *    getgravconst-
 *    dpper
 *    dspace
 *
 *  references    :
 *    hoots, roehrich, norad spacetrack report //3 1980
 *    hoots, norad spacetrack report //6 1986
 *    hoots, schumacher and glover 2004
 *    vallado, crawford, hujsak, kelso  2006
 ----------------------------------------------------------------------------*/
function sgp4(satrec, tsince) {
  var am = void 0,
      axnl = void 0,
      aynl = void 0,
      betal = void 0,
      cosim = void 0,
      sinim = void 0,
      cnod = void 0,
      snod = void 0,
      cos2u = void 0,
      sin2u = void 0,
      coseo1 = void 0,
      sineo1 = void 0,
      cosi = void 0,
      sini = void 0,
      cosip = void 0,
      sinip = void 0,
      cosisq = void 0,
      cossu = void 0,
      sinsu = void 0,
      cosu = void 0,
      sinu = void 0,
      delm = void 0,
      delomg = void 0,
      dndt = void 0,
      emsq = void 0,
      ecose = void 0,
      el2 = void 0,
      eo1 = void 0,
      esine = void 0,
      argpm = void 0,
      argpp = void 0,
      pl = void 0,
      r = void 0,
      v = void 0,
      rdotl = void 0,
      rl = void 0,
      rvdot = void 0,
      rvdotl = void 0,
      su = void 0,
      t2 = void 0,
      t3 = void 0,
      t4 = void 0,
      tc = void 0,
      tem5 = void 0,
      temp = void 0,
      temp1 = void 0,
      temp2 = void 0,
      tempa = void 0,
      tempe = void 0,
      templ = void 0,
      u = void 0,
      ux = void 0,
      uy = void 0,
      uz = void 0,
      vx = void 0,
      vy = void 0,
      vz = void 0,
      inclm = void 0,
      mm = void 0,
      nm = void 0,
      nodem = void 0,
      xinc = void 0,
      xincp = void 0,
      xl = void 0,
      xlm = void 0,
      mp = void 0,
      xmdf = void 0,
      xmx = void 0,
      xmy = void 0,
      nodedf = void 0,
      xnode = void 0,
      nodep = void 0;

  // TODO: defined but never used
  // var cosomm, sinomm, eccm, eccp, omgadf, rtemsq, np;

  var mrt = 0.0;

  /* ------------------ set mathematical constants --------------- */
  // sgp4fix divisor for divide by zero check on inclination
  // the old check used 1.0 + cos(pi-1.0e-9), but then compared it to
  // 1.5 e-12, so the threshold was changed to 1.5e-12 for consistency

  var temp4 = 1.5e-12;

  var vkmpersec = _constants.earthRadius * _constants.xke / 60.0;

  //  --------------------- clear sgp4 error flag -----------------
  satrec.t = tsince;
  satrec.error = 0;

  //  ------- update for secular gravity and atmospheric drag -----
  xmdf = satrec.mo + satrec.mdot * satrec.t;
  var argpdf = satrec.argpo + satrec.argpdot * satrec.t;
  nodedf = satrec.nodeo + satrec.nodedot * satrec.t;
  argpm = argpdf;
  mm = xmdf;
  t2 = satrec.t * satrec.t;
  nodem = nodedf + satrec.nodecf * t2;
  tempa = 1.0 - satrec.cc1 * satrec.t;
  tempe = satrec.bstar * satrec.cc4 * satrec.t;
  templ = satrec.t2cof * t2;

  if (satrec.isimp !== 1) {
    delomg = satrec.omgcof * satrec.t;
    //  sgp4fix use mutliply for speed instead of pow
    var delmtemp = 1.0 + satrec.eta * Math.cos(xmdf);
    delm = satrec.xmcof * (delmtemp * delmtemp * delmtemp - satrec.delmo);
    temp = delomg + delm;
    mm = xmdf + temp;
    argpm = argpdf - temp;
    t3 = t2 * satrec.t;
    t4 = t3 * satrec.t;
    tempa = tempa - satrec.d2 * t2 - satrec.d3 * t3 - satrec.d4 * t4;
    tempe += satrec.bstar * satrec.cc5 * (Math.sin(mm) - satrec.sinmao);
    templ = templ + satrec.t3cof * t3 + t4 * (satrec.t4cof + satrec.t * satrec.t5cof);
  }
  nm = satrec.no;
  var em = satrec.ecco;
  inclm = satrec.inclo;
  if (satrec.method === 'd') {
    tc = satrec.t;

    var dspaceParameters = {
      irez: satrec.irez,
      d2201: satrec.d2201,
      d2211: satrec.d2211,
      d3210: satrec.d3210,
      d3222: satrec.d3222,
      d4410: satrec.d4410,
      d4422: satrec.d4422,
      d5220: satrec.d5220,
      d5232: satrec.d5232,
      d5421: satrec.d5421,
      d5433: satrec.d5433,
      dedt: satrec.dedt,
      del1: satrec.del1,
      del2: satrec.del2,
      del3: satrec.del3,
      didt: satrec.didt,
      dmdt: satrec.dmdt,
      dnodt: satrec.dnodt,
      domdt: satrec.domdt,
      argpo: satrec.argpo,
      argpdot: satrec.argpdot,
      t: satrec.t,
      tc: tc,
      gsto: satrec.gsto,
      xfact: satrec.xfact,
      xlamo: satrec.xlamo,
      no: satrec.no,
      atime: satrec.atime,
      em: em,
      argpm: argpm,
      inclm: inclm,
      xli: satrec.xli,
      mm: mm,
      xni: satrec.xni,
      nodem: nodem,
      nm: nm
    };

    var dspaceResult = (0, _dspace2.default)(dspaceParameters);

    // TODO: defined but never used
    // var atime = dspaceResult.atime;

    em = dspaceResult.em;
    argpm = dspaceResult.argpm;
    inclm = dspaceResult.inclm;

    // TODO: defined but never used
    // var xli = dspaceResult.xli;

    mm = dspaceResult.mm;

    // TODO: defined but never used
    // var xni = dspaceResult.xni;

    nodem = dspaceResult.nodem;
    dndt = dspaceResult.dndt;
    nm = dspaceResult.nm;
  }

  if (nm <= 0.0) {
    //  printf("// error nm %f\n", nm);
    satrec.error = 2;
    //  sgp4fix add return
    return [false, false];
  }
  am = Math.pow(_constants.xke / nm, _constants.x2o3) * tempa * tempa;
  nm = _constants.xke / Math.pow(am, 1.5);
  em -= tempe;

  //  fix tolerance for error recognition
  //  sgp4fix am is fixed from the previous nm check
  if (em >= 1.0 || em < -0.001) {
    // || (am < 0.95)
    //  printf("// error em %f\n", em);
    satrec.error = 1;
    //  sgp4fix to return if there is an error in eccentricity
    return [false, false];
  }
  //  sgp4fix fix tolerance to avoid a divide by zero
  if (em < 1.0e-6) {
    em = 1.0e-6;
  }
  mm += satrec.no * templ;
  xlm = mm + argpm + nodem;
  emsq = em * em;
  temp = 1.0 - emsq;

  nodem %= _constants.twoPi;
  argpm %= _constants.twoPi;
  xlm %= _constants.twoPi;
  mm = (xlm - argpm - nodem) % _constants.twoPi;

  //  ----------------- compute extra mean quantities -------------
  sinim = Math.sin(inclm);
  cosim = Math.cos(inclm);

  //  -------------------- add lunar-solar periodics --------------
  var ep = em;
  xincp = inclm;
  argpp = argpm;
  nodep = nodem;
  mp = mm;
  sinip = sinim;
  cosip = cosim;
  if (satrec.method === 'd') {
    var dpperParameters = {
      inclo: satrec.inclo,
      init: 'n',
      ep: ep,
      inclp: xincp,
      nodep: nodep,
      argpp: argpp,
      mp: mp,
      opsmode: satrec.operationmod
    };

    var dpperResult = (0, _dpper2.default)(satrec, dpperParameters);
    ep = dpperResult.ep;
    xincp = dpperResult.inclp;
    nodep = dpperResult.nodep;
    argpp = dpperResult.argpp;
    mp = dpperResult.mp;

    if (xincp < 0.0) {
      xincp = -xincp;
      nodep += _constants.pi;
      argpp -= _constants.pi;
    }
    if (ep < 0.0 || ep > 1.0) {
      //  printf("// error ep %f\n", ep);
      satrec.error = 3;
      //  sgp4fix add return
      return [false, false];
    }
  }
  //  -------------------- long period periodics ------------------
  if (satrec.method === 'd') {
    sinip = Math.sin(xincp);
    cosip = Math.cos(xincp);
    satrec.aycof = -0.5 * _constants.j3oj2 * sinip;
    //  sgp4fix for divide by zero for xincp = 180 deg
    if (Math.abs(cosip + 1.0) > 1.5e-12) {
      satrec.xlcof = -0.25 * _constants.j3oj2 * sinip * (3.0 + 5.0 * cosip) / (1.0 + cosip);
    } else {
      satrec.xlcof = -0.25 * _constants.j3oj2 * sinip * (3.0 + 5.0 * cosip) / temp4;
    }
  }
  axnl = ep * Math.cos(argpp);
  temp = 1.0 / (am * (1.0 - ep * ep));
  aynl = ep * Math.sin(argpp) + temp * satrec.aycof;
  xl = mp + argpp + nodep + temp * satrec.xlcof * axnl;

  //  --------------------- solve kepler's equation ---------------
  u = (xl - nodep) % _constants.twoPi;
  eo1 = u;
  tem5 = 9999.9;
  var ktr = 1;
  //    sgp4fix for kepler iteration
  //    the following iteration needs better limits on corrections
  while (Math.abs(tem5) >= 1.0e-12 && ktr <= 10) {
    sineo1 = Math.sin(eo1);
    coseo1 = Math.cos(eo1);
    tem5 = 1.0 - coseo1 * axnl - sineo1 * aynl;
    tem5 = (u - aynl * coseo1 + axnl * sineo1 - eo1) / tem5;
    if (Math.abs(tem5) >= 0.95) {
      if (tem5 > 0.0) {
        tem5 = 0.95;
      } else {
        tem5 = -0.95;
      }
    }
    eo1 += tem5;
    ktr += 1;
  }
  //  ------------- short period preliminary quantities -----------
  ecose = axnl * coseo1 + aynl * sineo1;
  esine = axnl * sineo1 - aynl * coseo1;
  el2 = axnl * axnl + aynl * aynl;
  pl = am * (1.0 - el2);
  if (pl < 0.0) {
    //  printf("// error pl %f\n", pl);
    satrec.error = 4;
    //  sgp4fix add return
    return [false, false];
  }

  rl = am * (1.0 - ecose);
  rdotl = Math.sqrt(am) * esine / rl;
  rvdotl = Math.sqrt(pl) / rl;
  betal = Math.sqrt(1.0 - el2);
  temp = esine / (1.0 + betal);
  sinu = am / rl * (sineo1 - aynl - axnl * temp);
  cosu = am / rl * (coseo1 - axnl + aynl * temp);
  su = Math.atan2(sinu, cosu);
  sin2u = (cosu + cosu) * sinu;
  cos2u = 1.0 - 2.0 * sinu * sinu;
  temp = 1.0 / pl;
  temp1 = 0.5 * _constants.j2 * temp;
  temp2 = temp1 * temp;

  //  -------------- update for short period periodics ------------
  if (satrec.method === 'd') {
    cosisq = cosip * cosip;
    satrec.con41 = 3.0 * cosisq - 1.0;
    satrec.x1mth2 = 1.0 - cosisq;
    satrec.x7thm1 = 7.0 * cosisq - 1.0;
  }
  mrt = rl * (1.0 - 1.5 * temp2 * betal * satrec.con41) + 0.5 * temp1 * satrec.x1mth2 * cos2u;
  su -= 0.25 * temp2 * satrec.x7thm1 * sin2u;
  xnode = nodep + 1.5 * temp2 * cosip * sin2u;
  xinc = xincp + 1.5 * temp2 * cosip * sinip * cos2u;
  var mvt = rdotl - nm * temp1 * satrec.x1mth2 * sin2u / _constants.xke;
  rvdot = rvdotl + nm * temp1 * (satrec.x1mth2 * cos2u + 1.5 * satrec.con41) / _constants.xke;

  //  --------------------- orientation vectors -------------------
  sinsu = Math.sin(su);
  cossu = Math.cos(su);
  snod = Math.sin(xnode);
  cnod = Math.cos(xnode);
  sini = Math.sin(xinc);
  cosi = Math.cos(xinc);
  xmx = -snod * cosi;
  xmy = cnod * cosi;
  ux = xmx * sinsu + cnod * cossu;
  uy = xmy * sinsu + snod * cossu;
  uz = sini * sinsu;
  vx = xmx * cossu - cnod * sinsu;
  vy = xmy * cossu - snod * sinsu;
  vz = sini * cossu;

  //  --------- position and velocity (in km and km/sec) ----------
  r = { x: 0.0, y: 0.0, z: 0.0 };
  r.x = mrt * ux * _constants.earthRadius;
  r.y = mrt * uy * _constants.earthRadius;
  r.z = mrt * uz * _constants.earthRadius;
  v = { x: 0.0, y: 0.0, z: 0.0 };
  v.x = (mvt * ux + rvdot * vx) * vkmpersec;
  v.y = (mvt * uy + rvdot * vy) * vkmpersec;
  v.z = (mvt * uz + rvdot * vz) * vkmpersec;

  //  sgp4fix for decaying satellites
  if (mrt < 1.0) {
    // printf("// decay condition %11.6f \n",mrt);
    satrec.error = 6;
    return { position: false, velocity: false };
  }
  return { position: r, velocity: v };
}
module.exports = exports['default'];

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = gstime;

var _constants = __webpack_require__(0);

/* -----------------------------------------------------------------------------
 *
 *                           function gstime
 *
 *  this function finds the greenwich sidereal time.
 *
 *  author        : david vallado                  719-573-2600    1 mar 2001
 *
 *  inputs          description                    range / units
 *    jdut1       - julian date in ut1             days from 4713 bc
 *
 *  outputs       :
 *    gstime      - greenwich sidereal time        0 to 2pi rad
 *
 *  locals        :
 *    temp        - temporary variable for doubles   rad
 *    tut1        - julian centuries from the
 *                  jan 1, 2000 12 h epoch (ut1)
 *
 *  coupling      :
 *    none
 *
 *  references    :
 *    vallado       2004, 191, eq 3-45
 * --------------------------------------------------------------------------- */
function gstime(jdut1) {
  var tut1 = (jdut1 - 2451545.0) / 36525.0;

  var temp = -6.2e-6 * tut1 * tut1 * tut1 + 0.093104 * tut1 * tut1 + (876600.0 * 3600 + 8640184.812866) * tut1 + 67310.54841; // # sec
  temp = temp * _constants.deg2rad / 240.0 % _constants.twoPi; // 360/86400 = 1/240, to deg, to rad

  //  ------------------------ check quadrants ---------------------
  if (temp < 0.0) {
    temp += _constants.twoPi;
  }

  return temp;
}
module.exports = exports['default'];

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = geodeticToEcf;
function geodeticToEcf(geodeticCoords) {
  var longitude = geodeticCoords.longitude;
  var latitude = geodeticCoords.latitude;
  var height = geodeticCoords.height;
  var a = 6378.137;
  var b = 6356.7523142;
  var f = (a - b) / a;
  var e2 = 2 * f - f * f;
  var normal = a / Math.sqrt(1 - e2 * (Math.sin(latitude) * Math.sin(latitude)));

  var x = (normal + height) * Math.cos(latitude) * Math.cos(longitude);
  var y = (normal + height) * Math.cos(latitude) * Math.sin(longitude);
  var z = (normal * (1 - e2) + height) * Math.sin(latitude);

  return {
    x: x,
    y: y,
    z: z
  };
}
module.exports = exports["default"];

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dpper;

var _constants = __webpack_require__(0);

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
function dpper(satrec, options) {
  var e3 = satrec.e3,
      ee2 = satrec.ee2,
      peo = satrec.peo,
      pgho = satrec.pgho,
      pho = satrec.pho,
      pinco = satrec.pinco,
      plo = satrec.plo,
      se2 = satrec.se2,
      se3 = satrec.se3,
      sgh2 = satrec.sgh2,
      sgh3 = satrec.sgh3,
      sgh4 = satrec.sgh4,
      sh2 = satrec.sh2,
      sh3 = satrec.sh3,
      si2 = satrec.si2,
      si3 = satrec.si3,
      sl2 = satrec.sl2,
      sl3 = satrec.sl3,
      sl4 = satrec.sl4,
      t = satrec.t,
      xgh2 = satrec.xgh2,
      xgh3 = satrec.xgh3,
      xgh4 = satrec.xgh4,
      xh2 = satrec.xh2,
      xh3 = satrec.xh3,
      xi2 = satrec.xi2,
      xi3 = satrec.xi3,
      xl2 = satrec.xl2,
      xl3 = satrec.xl3,
      xl4 = satrec.xl4,
      zmol = satrec.zmol,
      zmos = satrec.zmos;
  var init = options.init,
      opsmode = options.opsmode;
  var ep = options.ep,
      inclp = options.inclp,
      nodep = options.nodep,
      argpp = options.argpp,
      mp = options.mp;

  // Copy satellite attributes into local variables for convenience
  // and symmetry in writing formulae.

  var alfdp = void 0;
  var betdp = void 0;
  var cosip = void 0;
  var sinip = void 0;
  var cosop = void 0;
  var sinop = void 0;
  var dalf = void 0;
  var dbet = void 0;
  var dls = void 0;
  var f2 = void 0;
  var f3 = void 0;
  var pe = void 0;
  var pgh = void 0;
  var ph = void 0;
  var pinc = void 0;
  var pl = void 0;
  var sinzf = void 0;
  var xls = void 0;
  var xnoh = void 0;
  var zf = void 0;
  var zm = void 0;

  //  ---------------------- constants -----------------------------
  var zns = 1.19459e-5;
  var zes = 0.01675;
  var znl = 1.5835218e-4;
  var zel = 0.05490;

  //  --------------- calculate time varying periodics -----------
  zm = zmos + zns * t;

  // be sure that the initial call has time set to zero
  if (init === 'y') {
    zm = zmos;
  }
  zf = zm + 2.0 * zes * Math.sin(zm);
  sinzf = Math.sin(zf);
  f2 = 0.5 * sinzf * sinzf - 0.25;
  f3 = -0.5 * sinzf * Math.cos(zf);

  var ses = se2 * f2 + se3 * f3;
  var sis = si2 * f2 + si3 * f3;
  var sls = sl2 * f2 + sl3 * f3 + sl4 * sinzf;
  var sghs = sgh2 * f2 + sgh3 * f3 + sgh4 * sinzf;
  var shs = sh2 * f2 + sh3 * f3;

  zm = zmol + znl * t;
  if (init === 'y') {
    zm = zmol;
  }

  zf = zm + 2.0 * zel * Math.sin(zm);
  sinzf = Math.sin(zf);
  f2 = 0.5 * sinzf * sinzf - 0.25;
  f3 = -0.5 * sinzf * Math.cos(zf);

  var sel = ee2 * f2 + e3 * f3;
  var sil = xi2 * f2 + xi3 * f3;
  var sll = xl2 * f2 + xl3 * f3 + xl4 * sinzf;
  var sghl = xgh2 * f2 + xgh3 * f3 + xgh4 * sinzf;
  var shll = xh2 * f2 + xh3 * f3;

  pe = ses + sel;
  pinc = sis + sil;
  pl = sls + sll;
  pgh = sghs + sghl;
  ph = shs + shll;

  if (init === 'n') {
    pe -= peo;
    pinc -= pinco;
    pl -= plo;
    pgh -= pgho;
    ph -= pho;
    inclp += pinc;
    ep += pe;
    sinip = Math.sin(inclp);
    cosip = Math.cos(inclp);

    /* ----------------- apply periodics directly ------------ */
    // sgp4fix for lyddane choice
    // strn3 used original inclination - this is technically feasible
    // gsfc used perturbed inclination - also technically feasible
    // probably best to readjust the 0.2 limit value and limit discontinuity
    // 0.2 rad = 11.45916 deg
    // use next line for original strn3 approach and original inclination
    // if (inclo >= 0.2)
    // use next line for gsfc version and perturbed inclination
    if (inclp >= 0.2) {
      ph /= sinip;
      pgh -= cosip * ph;
      argpp += pgh;
      nodep += ph;
      mp += pl;
    } else {
      //  ---- apply periodics with lyddane modification ----
      sinop = Math.sin(nodep);
      cosop = Math.cos(nodep);
      alfdp = sinip * sinop;
      betdp = sinip * cosop;
      dalf = ph * cosop + pinc * cosip * sinop;
      dbet = -ph * sinop + pinc * cosip * cosop;
      alfdp += dalf;
      betdp += dbet;
      nodep %= _constants.twoPi;

      //  sgp4fix for afspc written intrinsic functions
      //  nodep used without a trigonometric function ahead
      if (nodep < 0.0 && opsmode === 'a') {
        nodep += _constants.twoPi;
      }
      xls = mp + argpp + cosip * nodep;
      dls = pl + pgh - pinc * nodep * sinip;
      xls += dls;
      xnoh = nodep;
      nodep = Math.atan2(alfdp, betdp);

      //  sgp4fix for afspc written intrinsic functions
      //  nodep used without a trigonometric function ahead
      if (nodep < 0.0 && opsmode === 'a') {
        nodep += _constants.twoPi;
      }
      if (Math.abs(xnoh - nodep) > _constants.pi) {
        if (nodep < xnoh) {
          nodep += _constants.twoPi;
        } else {
          nodep -= _constants.twoPi;
        }
      }
      mp += pl;
      argpp = xls - mp - cosip * nodep;
    }
  }

  return {
    ep: ep,
    inclp: inclp,
    nodep: nodep,
    argpp: argpp,
    mp: mp
  };
}
module.exports = exports['default'];

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dopplerFactor;
function dopplerFactor(location, position, velocity) {
  var currentRange = Math.sqrt(Math.pow(position.x - location.x, 2) + Math.pow(position.y - location.y, 2) + Math.pow(position.z - location.z, 2));

  var nextPos = {
    x: position.x + velocity.x,
    y: position.y + velocity.y,
    z: position.z + velocity.z
  };

  var nextRange = Math.sqrt(Math.pow(nextPos.x - location.x, 2) + Math.pow(nextPos.y - location.y, 2) + Math.pow(nextPos.z - location.z, 2));

  var rangeRate = nextRange - currentRange;

  function sign(value) {
    return value >= 0 ? 1 : -1;
  }

  rangeRate *= sign(rangeRate);
  var c = 299792.458; // Speed of light in km/s
  return 1 + rangeRate / c;
}
module.exports = exports["default"];

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = propagate;

var _sgp = __webpack_require__(2);

var _sgp2 = _interopRequireDefault(_sgp);

var _jday = __webpack_require__(1);

var _jday2 = _interopRequireDefault(_jday);

var _constants = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function propagate() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  // Return a position and velocity vector for a given date and time.
  var satrec = args[0];
  var date = Array.prototype.slice.call(args, 1);
  var j = _jday2.default.apply(undefined, _toConsumableArray(date));
  var m = (j - satrec.jdsatepoch) * _constants.minutesPerDay;
  return (0, _sgp2.default)(satrec, m);
}
module.exports = exports['default'];

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = twoline2satrec;

var _constants = __webpack_require__(0);

var _sgp4init = __webpack_require__(21);

var _sgp4init2 = _interopRequireDefault(_sgp4init);

var _days2mdhms = __webpack_require__(18);

var _days2mdhms2 = _interopRequireDefault(_days2mdhms);

var _jday = __webpack_require__(1);

var _jday2 = _interopRequireDefault(_jday);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Return a Satellite imported from two lines of TLE data.
 *
 * Provide the two TLE lines as strings `longstr1` and `longstr2`,
 * and select which standard set of gravitational constants you want
 * by providing `gravity_constants`:
 *
 * `sgp4.propagation.wgs72` - Standard WGS 72 model
 * `sgp4.propagation.wgs84` - More recent WGS 84 model
 * `sgp4.propagation.wgs72old` - Legacy support for old SGP4 behavior
 *
 * Normally, computations are made using letious recent improvements
 * to the algorithm.  If you want to turn some of these off and go
 * back into "afspc" mode, then set `afspc_mode` to `True`.
 */
function twoline2satrec(longstr1, longstr2) {
  var opsmode = 'i';
  var xpdotp = 1440.0 / (2.0 * _constants.pi); // 229.1831180523293;
  var year = 0;

  var satrec = {};
  satrec.error = 0;

  satrec.satnum = longstr1.substring(2, 7);

  satrec.epochyr = parseInt(longstr1.substring(18, 20), 10);
  satrec.epochdays = parseFloat(longstr1.substring(20, 32));
  satrec.ndot = parseFloat(longstr1.substring(33, 43));
  satrec.nddot = parseFloat('.' + parseInt(longstr1.substring(44, 50), 10) + 'E' + longstr1.substring(50, 52));
  satrec.bstar = parseFloat(longstr1.substring(53, 54) + '.' + parseInt(longstr1.substring(54, 59), 10) + 'E' + longstr1.substring(59, 61));

  // satrec.satnum   = longstr2.substring(2, 7);
  satrec.inclo = parseFloat(longstr2.substring(8, 16));
  satrec.nodeo = parseFloat(longstr2.substring(17, 25));
  satrec.ecco = parseFloat('.' + longstr2.substring(26, 33));
  satrec.argpo = parseFloat(longstr2.substring(34, 42));
  satrec.mo = parseFloat(longstr2.substring(43, 51));
  satrec.no = parseFloat(longstr2.substring(52, 63));

  //  ---- find no, ndot, nddot ----
  satrec.no /= xpdotp; //   rad/min
  // satrec.nddot= satrec.nddot * Math.pow(10.0, nexp);
  // satrec.bstar= satrec.bstar * Math.pow(10.0, ibexp);

  //  ---- convert to sgp4 units ----
  satrec.a = Math.pow(satrec.no * _constants.tumin, -2.0 / 3.0);
  satrec.ndot /= xpdotp * 1440.0; //   ? * minperday
  satrec.nddot /= xpdotp * 1440.0 * 1440;

  //  ---- find standard orbital elements ----
  satrec.inclo *= _constants.deg2rad;
  satrec.nodeo *= _constants.deg2rad;
  satrec.argpo *= _constants.deg2rad;
  satrec.mo *= _constants.deg2rad;

  satrec.alta = satrec.a * (1.0 + satrec.ecco) - 1.0;
  satrec.altp = satrec.a * (1.0 - satrec.ecco) - 1.0;

  // ----------------------------------------------------------------
  // find sgp4epoch time of element set
  // remember that sgp4 uses units of days from 0 jan 1950 (sgp4epoch)
  // and minutes from the epoch (time)
  // ----------------------------------------------------------------

  // ---------------- temp fix for years from 1957-2056 -------------------
  // --------- correct fix will occur when year is 4-digit in tle ---------

  if (satrec.epochyr < 57) {
    year = satrec.epochyr + 2000;
  } else {
    year = satrec.epochyr + 1900;
  }

  var mdhmsResult = (0, _days2mdhms2.default)(year, satrec.epochdays);
  var mon = mdhmsResult.mon;
  var day = mdhmsResult.day;
  var hr = mdhmsResult.hr;
  var minute = mdhmsResult.minute;
  var sec = mdhmsResult.sec;
  satrec.jdsatepoch = (0, _jday2.default)(year, mon, day, hr, minute, sec);

  //  ---------------- initialize the orbit at sgp4epoch -------------------
  (0, _sgp4init2.default)(satrec, {
    opsmode: opsmode,
    satn: satrec.satnum,
    epoch: satrec.jdsatepoch - 2433281.5,
    xbstar: satrec.bstar,

    xecco: satrec.ecco,
    xargpo: satrec.argpo,
    xinclo: satrec.inclo,
    xmo: satrec.mo,
    xno: satrec.no,

    xnodeo: satrec.nodeo
  });

  return satrec;
}
module.exports = exports['default'];

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = degreesLat;

var _constants = __webpack_require__(0);

function degreesLat(radians) {
  if (radians > _constants.pi / 2 || radians < -_constants.pi / 2) {
    return 'Err';
  }
  return radians / (_constants.pi * 180);
}
module.exports = exports['default'];

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = degreesLong;

var _constants = __webpack_require__(0);

function degreesLong(radians) {
  var degrees = radians / (_constants.pi * 180) % 360;
  if (degrees > 180) {
    degrees = 360 - degrees;
  } else if (degrees < -180) {
    degrees = 360 + degrees;
  }
  return degrees;
}
module.exports = exports['default'];

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ecfToEci;
function ecfToEci(ecfCoords, gmst) {
  // ccar.colorado.edu/ASEN5070/handouts/coordsys.doc
  //
  // [X]     [C -S  0][X]
  // [Y]  =  [S  C  0][Y]
  // [Z]eci  [0  0  1][Z]ecf
  //
  var X = ecfCoords.x * Math.cos(gmst) - ecfCoords.y * Math.sin(gmst);
  var Y = ecfCoords.x * Math.sin(gmst) + ecfCoords.y * Math.cos(gmst);
  var Z = ecfCoords.z;
  return { x: X, y: Y, z: Z };
}
module.exports = exports["default"];

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ecfToLookAngles;

var _topocentric = __webpack_require__(22);

var _topocentric2 = _interopRequireDefault(_topocentric);

var _topocentricToLookAngles = __webpack_require__(23);

var _topocentricToLookAngles2 = _interopRequireDefault(_topocentricToLookAngles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ecfToLookAngles(observerCoordsEcf, satelliteCoordsEcf) {
  var topocentricCoords = (0, _topocentric2.default)(observerCoordsEcf, satelliteCoordsEcf);
  return (0, _topocentricToLookAngles2.default)(topocentricCoords);
}
module.exports = exports['default'];

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = eciToEcf;
function eciToEcf(eciCoords, gmst) {
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

  var x = eciCoords.x * Math.cos(gmst) + eciCoords.y * Math.sin(gmst);
  var y = eciCoords.x * -Math.sin(gmst) + eciCoords.y * Math.cos(gmst);
  var z = eciCoords.z;

  return {
    x: x,
    y: y,
    z: z
  };
}
module.exports = exports["default"];

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = eciToGeodetic;
function eciToGeodetic(eciCoords, gmst) {
  // http://www.celestrak.com/columns/v02n03/
  var a = 6378.137;
  var b = 6356.7523142;
  var R = Math.sqrt(eciCoords.x * eciCoords.x + eciCoords.y * eciCoords.y);
  var f = (a - b) / a;
  var e2 = 2 * f - f * f;
  var longitude = Math.atan2(eciCoords.y, eciCoords.x) - gmst;
  var kmax = 20;
  var k = 0;
  var latitude = Math.atan2(eciCoords.z, Math.sqrt(eciCoords.x * eciCoords.x + eciCoords.y * eciCoords.y));
  var C = void 0;
  while (k < kmax) {
    C = 1 / Math.sqrt(1 - e2 * (Math.sin(latitude) * Math.sin(latitude)));
    latitude = Math.atan2(eciCoords.z + a * C * e2 * Math.sin(latitude), R);
    k += 1;
  }
  var height = R / Math.cos(latitude) - a * C;
  return { longitude: longitude, latitude: latitude, height: height };
}
module.exports = exports["default"];

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dscom;

var _constants = __webpack_require__(0);

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
function dscom(options) {
  var epoch = options.epoch,
      ep = options.ep,
      argpp = options.argpp,
      tc = options.tc,
      inclp = options.inclp,
      nodep = options.nodep,
      np = options.np;


  var a1 = void 0;
  var a2 = void 0;
  var a3 = void 0;
  var a4 = void 0;
  var a5 = void 0;
  var a6 = void 0;
  var a7 = void 0;
  var a8 = void 0;
  var a9 = void 0;
  var a10 = void 0;
  var cc = void 0;
  var x1 = void 0;
  var x2 = void 0;
  var x3 = void 0;
  var x4 = void 0;
  var x5 = void 0;
  var x6 = void 0;
  var x7 = void 0;
  var x8 = void 0;
  var zcosg = void 0;
  var zsing = void 0;
  var zcosh = void 0;
  var zsinh = void 0;
  var zcosi = void 0;
  var zsini = void 0;

  var ss1 = void 0;
  var ss2 = void 0;
  var ss3 = void 0;
  var ss4 = void 0;
  var ss5 = void 0;
  var ss6 = void 0;
  var ss7 = void 0;
  var sz1 = void 0;
  var sz2 = void 0;
  var sz3 = void 0;
  var sz11 = void 0;
  var sz12 = void 0;
  var sz13 = void 0;
  var sz21 = void 0;
  var sz22 = void 0;
  var sz23 = void 0;
  var sz31 = void 0;
  var sz32 = void 0;
  var sz33 = void 0;
  var s1 = void 0;
  var s2 = void 0;
  var s3 = void 0;
  var s4 = void 0;
  var s5 = void 0;
  var s6 = void 0;
  var s7 = void 0;
  var z1 = void 0;
  var z2 = void 0;
  var z3 = void 0;
  var z11 = void 0;
  var z12 = void 0;
  var z13 = void 0;
  var z21 = void 0;
  var z22 = void 0;
  var z23 = void 0;
  var z31 = void 0;
  var z32 = void 0;
  var z33 = void 0;

  // -------------------------- constants -------------------------
  var zes = 0.01675;
  var zel = 0.05490;
  var c1ss = 2.9864797e-6;
  var c1l = 4.7968065e-7;
  var zsinis = 0.39785416;
  var zcosis = 0.91744867;
  var zcosgs = 0.1945905;
  var zsings = -0.98088458;

  //  --------------------- local variables ------------------------
  var nm = np;
  var em = ep;
  var snodm = Math.sin(nodep);
  var cnodm = Math.cos(nodep);
  var sinomm = Math.sin(argpp);
  var cosomm = Math.cos(argpp);
  var sinim = Math.sin(inclp);
  var cosim = Math.cos(inclp);
  var emsq = em * em;
  var betasq = 1.0 - emsq;
  var rtemsq = Math.sqrt(betasq);

  //  ----------------- initialize lunar solar terms ---------------
  var peo = 0.0;
  var pinco = 0.0;
  var plo = 0.0;
  var pgho = 0.0;
  var pho = 0.0;
  var day = epoch + 18261.5 + tc / 1440.0;
  var xnodce = (4.5236020 - 9.2422029e-4 * day) % _constants.twoPi;
  var stem = Math.sin(xnodce);
  var ctem = Math.cos(xnodce);
  var zcosil = 0.91375164 - 0.03568096 * ctem;
  var zsinil = Math.sqrt(1.0 - zcosil * zcosil);
  var zsinhl = 0.089683511 * stem / zsinil;
  var zcoshl = Math.sqrt(1.0 - zsinhl * zsinhl);
  var gam = 5.8351514 + 0.0019443680 * day;
  var zx = 0.39785416 * stem / zsinil;
  var zy = zcoshl * ctem + 0.91744867 * zsinhl * stem;
  zx = Math.atan2(zx, zy);
  zx += gam - xnodce;
  var zcosgl = Math.cos(zx);
  var zsingl = Math.sin(zx);

  //  ------------------------- do solar terms ---------------------
  zcosg = zcosgs;
  zsing = zsings;
  zcosi = zcosis;
  zsini = zsinis;
  zcosh = cnodm;
  zsinh = snodm;
  cc = c1ss;
  var xnoi = 1.0 / nm;

  var lsflg = 0;
  while (lsflg < 2) {
    lsflg += 1;
    a1 = zcosg * zcosh + zsing * zcosi * zsinh;
    a3 = -zsing * zcosh + zcosg * zcosi * zsinh;
    a7 = -zcosg * zsinh + zsing * zcosi * zcosh;
    a8 = zsing * zsini;
    a9 = zsing * zsinh + zcosg * zcosi * zcosh;
    a10 = zcosg * zsini;
    a2 = cosim * a7 + sinim * a8;
    a4 = cosim * a9 + sinim * a10;
    a5 = -sinim * a7 + cosim * a8;
    a6 = -sinim * a9 + cosim * a10;

    x1 = a1 * cosomm + a2 * sinomm;
    x2 = a3 * cosomm + a4 * sinomm;
    x3 = -a1 * sinomm + a2 * cosomm;
    x4 = -a3 * sinomm + a4 * cosomm;
    x5 = a5 * sinomm;
    x6 = a6 * sinomm;
    x7 = a5 * cosomm;
    x8 = a6 * cosomm;

    z31 = 12.0 * x1 * x1 - 3.0 * x3 * x3;
    z32 = 24.0 * x1 * x2 - 6.0 * x3 * x4;
    z33 = 12.0 * x2 * x2 - 3.0 * x4 * x4;

    z1 = 3.0 * (a1 * a1 + a2 * a2) + z31 * emsq;
    z2 = 6.0 * (a1 * a3 + a2 * a4) + z32 * emsq;
    z3 = 3.0 * (a3 * a3 + a4 * a4) + z33 * emsq;

    z11 = -6.0 * a1 * a5 + emsq * (-24.0 * x1 * x7 - 6.0 * x3 * x5);
    z12 = -6.0 * (a1 * a6 + a3 * a5) + emsq * (-24.0 * (x2 * x7 + x1 * x8)) + -6.0 * (x3 * x6 + x4 * x5);
    z13 = -6.0 * a3 * a6 + emsq * (-24.0 * x2 * x8 - 6.0 * x4 * x6);

    z21 = 6.0 * a2 * a5 + emsq * (24.0 * x1 * x5 - 6.0 * x3 * x7);
    z22 = 6.0 * (a4 * a5 + a2 * a6) + emsq * 24.0 * (x2 * x5 + x1 * x6) - 6.0 * (x4 * x7 + x3 * x8);
    z23 = 6.0 * a4 * a6 + emsq * (24.0 * x2 * x6 - 6.0 * x4 * x8);

    z1 = z1 + z1 + betasq * z31;
    z2 = z2 + z2 + betasq * z32;
    z3 = z3 + z3 + betasq * z33;
    s3 = cc * xnoi;
    s2 = -0.5 * s3 / rtemsq;
    s4 = s3 * rtemsq;
    s1 = -15.0 * em * s4;
    s5 = x1 * x3 + x2 * x4;
    s6 = x2 * x3 + x1 * x4;
    s7 = x2 * x4 - x1 * x3;

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
      zcosh = zcoshl * cnodm + zsinhl * snodm;
      zsinh = snodm * zcoshl - cnodm * zsinhl;
      cc = c1l;
    }
  }

  var zmol = (4.7199672 + (0.22997150 * day - gam)) % _constants.twoPi;
  var zmos = (6.2565837 + 0.017201977 * day) % _constants.twoPi;

  //  ------------------------ do solar terms ----------------------
  var se2 = 2.0 * ss1 * ss6;
  var se3 = 2.0 * ss1 * ss7;
  var si2 = 2.0 * ss2 * sz12;
  var si3 = 2.0 * ss2 * (sz13 - sz11);
  var sl2 = -2.0 * ss3 * sz2;
  var sl3 = -2.0 * ss3 * (sz3 - sz1);
  var sl4 = -2.0 * ss3 * (-21.0 - 9.0 * emsq) * zes;
  var sgh2 = 2.0 * ss4 * sz32;
  var sgh3 = 2.0 * ss4 * (sz33 - sz31);
  var sgh4 = -18.0 * ss4 * zes;
  var sh2 = -2.0 * ss2 * sz22;
  var sh3 = -2.0 * ss2 * (sz23 - sz21);

  //  ------------------------ do lunar terms ----------------------
  var ee2 = 2.0 * s1 * s6;
  var e3 = 2.0 * s1 * s7;
  var xi2 = 2.0 * s2 * z12;
  var xi3 = 2.0 * s2 * (z13 - z11);
  var xl2 = -2.0 * s3 * z2;
  var xl3 = -2.0 * s3 * (z3 - z1);
  var xl4 = -2.0 * s3 * (-21.0 - 9.0 * emsq) * zel;
  var xgh2 = 2.0 * s4 * z32;
  var xgh3 = 2.0 * s4 * (z33 - z31);
  var xgh4 = -18.0 * s4 * zel;
  var xh2 = -2.0 * s2 * z22;
  var xh3 = -2.0 * s2 * (z23 - z21);

  return {
    snodm: snodm,
    cnodm: cnodm,
    sinim: sinim,
    cosim: cosim,
    sinomm: sinomm,

    cosomm: cosomm,
    day: day,
    e3: e3,
    ee2: ee2,
    em: em,

    emsq: emsq,
    gam: gam,
    peo: peo,
    pgho: pgho,
    pho: pho,

    pinco: pinco,
    plo: plo,
    rtemsq: rtemsq,
    se2: se2,
    se3: se3,

    sgh2: sgh2,
    sgh3: sgh3,
    sgh4: sgh4,
    sh2: sh2,
    sh3: sh3,

    si2: si2,
    si3: si3,
    sl2: sl2,
    sl3: sl3,
    sl4: sl4,

    s1: s1,
    s2: s2,
    s3: s3,
    s4: s4,
    s5: s5,

    s6: s6,
    s7: s7,
    ss1: ss1,
    ss2: ss2,
    ss3: ss3,

    ss4: ss4,
    ss5: ss5,
    ss6: ss6,
    ss7: ss7,
    sz1: sz1,

    sz2: sz2,
    sz3: sz3,
    sz11: sz11,
    sz12: sz12,
    sz13: sz13,

    sz21: sz21,
    sz22: sz22,
    sz23: sz23,
    sz31: sz31,
    sz32: sz32,

    sz33: sz33,
    xgh2: xgh2,
    xgh3: xgh3,
    xgh4: xgh4,
    xh2: xh2,

    xh3: xh3,
    xi2: xi2,
    xi3: xi3,
    xl2: xl2,
    xl3: xl3,

    xl4: xl4,
    nm: nm,
    z1: z1,
    z2: z2,
    z3: z3,

    z11: z11,
    z12: z12,
    z13: z13,
    z21: z21,
    z22: z22,

    z23: z23,
    z31: z31,
    z32: z32,
    z33: z33,
    zmol: zmol,

    zmos: zmos
  };
}
module.exports = exports['default'];

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dsinit;
/*-----------------------------------------------------------------------------
 *
 *                           procedure dsinit
 *
 *  this procedure provides deep space contributions to mean motion dot due
 *    to geopotential resonance with half day and one day orbits.
 *
 *  author        : david vallado                  719-573-2600   28 jun 2005
 *
 *  inputs        :
 *    cosim, sinim-
 *    emsq        - eccentricity squared
 *    argpo       - argument of perigee
 *    s1, s2, s3, s4, s5      -
 *    ss1, ss2, ss3, ss4, ss5 -
 *    sz1, sz3, sz11, sz13, sz21, sz23, sz31, sz33 -
 *    t           - time
 *    tc          -
 *    gsto        - greenwich sidereal time                   rad
 *    mo          - mean anomaly
 *    mdot        - mean anomaly dot (rate)
 *    no          - mean motion
 *    nodeo       - right ascension of ascending node
 *    nodedot     - right ascension of ascending node dot (rate)
 *    xpidot      -
 *    z1, z3, z11, z13, z21, z23, z31, z33 -
 *    eccm        - eccentricity
 *    argpm       - argument of perigee
 *    inclm       - inclination
 *    mm          - mean anomaly
 *    xn          - mean motion
 *    nodem       - right ascension of ascending node
 *
 *  outputs       :
 *    em          - eccentricity
 *    argpm       - argument of perigee
 *    inclm       - inclination
 *    mm          - mean anomaly
 *    nm          - mean motion
 *    nodem       - right ascension of ascending node
 *    irez        - flag for resonance           0-none, 1-one day, 2-half day
 *    atime       -
 *    d2201, d2211, d3210, d3222, d4410, d4422, d5220, d5232, d5421, d5433    -
 *    dedt        -
 *    didt        -
 *    dmdt        -
 *    dndt        -
 *    dnodt       -
 *    domdt       -
 *    del1, del2, del3        -
 *    ses  , sghl , sghs , sgs  , shl  , shs  , sis  , sls
 *    theta       -
 *    xfact       -
 *    xlamo       -
 *    xli         -
 *    xni
 *
 *  locals        :
 *    ainv2       -
 *    aonv        -
 *    cosisq      -
 *    eoc         -
 *    f220, f221, f311, f321, f322, f330, f441, f442, f522, f523, f542, f543  -
 *    g200, g201, g211, g300, g310, g322, g410, g422, g520, g521, g532, g533  -
 *    sini2       -
 *    temp        -
 *    temp1       -
 *    theta       -
 *    xno2        -
 *
 *  coupling      :
 *    getgravconst
 *
 *  references    :
 *    hoots, roehrich, norad spacetrack report #3 1980
 *    hoots, norad spacetrack report #6 1986
 *    hoots, schumacher and glover 2004
 *    vallado, crawford, hujsak, kelso  2006
 ----------------------------------------------------------------------------*/
function dsinit(options) {
  var cosim = options.cosim,
      emsq = options.emsq,
      argpo = options.argpo,
      s1 = options.s1,
      s2 = options.s2,
      s3 = options.s3,
      s4 = options.s4,
      s5 = options.s5,
      sinim = options.sinim,
      ss1 = options.ss1,
      ss2 = options.ss2,
      ss3 = options.ss3,
      ss4 = options.ss4,
      ss5 = options.ss5,
      sz1 = options.sz1,
      sz3 = options.sz3,
      sz11 = options.sz11,
      sz13 = options.sz13,
      sz21 = options.sz21,
      sz23 = options.sz23,
      sz31 = options.sz31,
      sz33 = options.sz33,
      t = options.t,
      tc = options.tc,
      gsto = options.gsto,
      mo = options.mo,
      mdot = options.mdot,
      no = options.no,
      nodeo = options.nodeo,
      nodedot = options.nodedot,
      xpidot = options.xpidot,
      z1 = options.z1,
      z3 = options.z3,
      z11 = options.z11,
      z13 = options.z13,
      z21 = options.z21,
      z23 = options.z23,
      z31 = options.z31,
      z33 = options.z33,
      ecco = options.ecco,
      eccsq = options.eccsq,
      em = options.em,
      argpm = options.argpm,
      inclm = options.inclm,
      mm = options.mm,
      nm = options.nm,
      nodem = options.nodem,
      irez = options.irez,
      atime = options.atime,
      d2201 = options.d2201,
      d2211 = options.d2211,
      d3210 = options.d3210,
      d3222 = options.d3222,
      d4410 = options.d4410,
      d4422 = options.d4422,
      d5220 = options.d5220,
      d5232 = options.d5232,
      d5421 = options.d5421,
      d5433 = options.d5433,
      dedt = options.dedt,
      didt = options.didt,
      dmdt = options.dmdt,
      dnodt = options.dnodt,
      domdt = options.domdt,
      del1 = options.del1,
      del2 = options.del2,
      del3 = options.del3,
      xfact = options.xfact,
      xlamo = options.xlamo,
      xli = options.xli,
      xni = options.xni;

  var f220 = void 0,
      f221 = void 0,
      f311 = void 0,
      f321 = void 0,
      f322 = void 0,
      f330 = void 0,
      f441 = void 0,
      f442 = void 0,
      f522 = void 0,
      f523 = void 0,
      f542 = void 0,
      f543 = void 0;
  var g200 = void 0,
      g201 = void 0,
      g211 = void 0,
      g300 = void 0,
      g310 = void 0,
      g322 = void 0,
      g410 = void 0,
      g422 = void 0,
      g520 = void 0,
      g521 = void 0,
      g532 = void 0,
      g533 = void 0;
  var sini2 = void 0,
      temp = void 0,
      temp1 = void 0,
      theta = void 0,
      xno2 = void 0,
      ainv2 = void 0,
      aonv = void 0,
      cosisq = void 0,
      eoc = void 0;

  var q22 = 1.7891679e-6;
  var q31 = 2.1460748e-6;
  var q33 = 2.2123015e-7;
  var root22 = 1.7891679e-6;
  var root44 = 7.3636953e-9;
  var root54 = 2.1765803e-9;
  var rptim = 4.37526908801129966e-3; // equates to 7.29211514668855e-5 rad/sec
  var root32 = 3.7393792e-7;
  var root52 = 1.1428639e-7;
  var x2o3 = 2.0 / 3.0;
  var znl = 1.5835218e-4;
  var zns = 1.19459e-5;

  //  -------------------- deep space initialization ------------
  irez = 0;
  if (nm > 0.0034906585 < 0.0052359877) {
    irez = 1;
  }
  if (nm >= 8.26e-3 <= 9.24e-3 && em >= 0.5) {
    irez = 2;
  }

  //  ------------------------ do solar terms -------------------
  var ses = ss1 * zns * ss5;
  var sis = ss2 * zns * (sz11 + sz13);
  var sls = -zns * ss3 * (sz1 + sz3 - 14.0 - 6.0 * emsq);
  var sghs = ss4 * zns * (sz31 + sz33 - 6.0);
  var shs = -zns * ss2 * (sz21 + sz23);

  //  sgp4fix for 180 deg incl
  if (inclm < 5.2359877e-2 || inclm > constants.pi - 5.2359877e-2) {
    shs = 0.0;
  }
  if (sinim !== 0.0) {
    shs /= sinim;
  }
  var sgs = sghs - cosim * shs;

  //  ------------------------- do lunar terms ------------------
  dedt = ses + s1 * znl * s5;
  didt = sis + s2 * znl * (z11 + z13);
  dmdt = sls - znl * s3 * (z1 + z3 - 14.0 - 6.0 * emsq);
  var sghl = s4 * znl * (z31 + z33 - 6.0);
  var shll = -znl * s2 * (z21 + z23);
  //  sgp4fix for 180 deg incl
  if (inclm < 5.2359877e-2 || inclm > constants.pi - 5.2359877e-2) {
    shll = 0.0;
  }
  domdt = sgs + sghl;
  dnodt = shs;
  if (sinim !== 0.0) {
    domdt -= cosim / sinim * shll;
    dnodt += shll / sinim;
  }

  //  ----------- calculate deep space resonance effects --------
  var dndt = 0.0;
  theta = (gsto + tc * rptim) % constants.twoPi;
  em += dedt * t;
  inclm += didt * t;
  argpm += domdt * t;
  nodem += dnodt * t;
  mm += dmdt * t;

  //   sgp4fix for negative inclinations
  //   the following if statement should be commented out
  // if (inclm < 0.0)
  //  {
  //    inclm  = -inclm;
  //    argpm  = argpm - pi;
  //    nodem = nodem + pi;
  //  }


  //  -------------- initialize the resonance terms -------------
  if (irez !== 0) {
    aonv = Math.pow(nm / constants.xke, x2o3);
    //  ---------- geopotential resonance for 12 hour orbits ------
    if (irez === 2) {
      cosisq = cosim * cosim;
      var emo = em;
      em = ecco;
      var emsqo = emsq;
      emsq = eccsq;
      eoc = em * emsq;
      g201 = -0.306 - (em - 0.64) * 0.440;

      if (em <= 0.65) {
        g211 = 3.616 - 13.2470 * em + 16.2900 * emsq;
        g310 = -19.302 + 117.3900 * em - 228.4190 * emsq + 156.5910 * eoc;
        g322 = -18.9068 + 109.7927 * em - 214.6334 * emsq + 146.5816 * eoc;
        g410 = -41.122 + 242.6940 * em - 471.0940 * emsq + 313.9530 * eoc;
        g422 = -146.407 + 841.8800 * em - 1629.014 * emsq + 1083.4350 * eoc;
        g520 = -532.114 + 3017.977 * em - 5740.032 * emsq + 3708.2760 * eoc;
      } else {
        g211 = -72.099 + 331.819 * em - 508.738 * emsq + 266.724 * eoc;
        g310 = -346.844 + 1582.851 * em - 2415.925 * emsq + 1246.113 * eoc;
        g322 = -342.585 + 1554.908 * em - 2366.899 * emsq + 1215.972 * eoc;
        g410 = -1052.797 + 4758.686 * em - 7193.992 * emsq + 3651.957 * eoc;
        g422 = -3581.690 + 16178.110 * em - 24462.770 * emsq + 12422.520 * eoc;
        if (em > 0.715) {
          g520 = -5149.66 + 29936.92 * em - 54087.36 * emsq + 31324.56 * eoc;
        } else {
          g520 = 1464.74 - 4664.75 * em + 3763.64 * emsq;
        }
      }
      if (em < 0.7) {
        g533 = -919.22770 + 4988.6100 * em - 9064.7700 * emsq + 5542.21 * eoc;
        g521 = -822.71072 + 4568.6173 * em - 8491.4146 * emsq + 5337.524 * eoc;
        g532 = -853.66600 + 4690.2500 * em - 8624.7700 * emsq + 5341.4 * eoc;
      } else {
        g533 = -37995.780 + 161616.52 * em - 229838.20 * emsq + 109377.94 * eoc;
        g521 = -51752.104 + 218913.95 * em - 309468.16 * emsq + 146349.42 * eoc;
        g532 = -40023.880 + 170470.89 * em - 242699.48 * emsq + 115605.82 * eoc;
      }
      sini2 = sinim * sinim;
      f220 = 0.75 * (1.0 + 2.0 * cosim + cosisq);
      f221 = 1.5 * sini2;
      f321 = 1.875 * sinim * (1.0 - 2.0 * cosim - 3.0 * cosisq);
      f322 = -1.875 * sinim * (1.0 + 2.0 * cosim - 3.0 * cosisq);
      f441 = 35.0 * sini2 * f220;
      f442 = 39.3750 * sini2 * sini2;
      f522 = 9.84375 * sinim * (sini2 * (1.0 - 2.0 * cosim - 5.0 * cosisq) + 0.33333333 * (-2.0 + 4.0 * cosim + 6.0 * cosisq));
      f523 = sinim * (4.92187512 * sini2 * (-2.0 - 4.0 * cosim + 10.0 * cosisq) + 6.56250012 * (1.0 + 2.0 * cosim - 3.0 * cosisq));
      f542 = 29.53125 * sinim * (2.0 - 8.0 * cosim + cosisq * (-12.0 + 8.0 * cosim + 10.0 * cosisq));
      f543 = 29.53125 * sinim * (-2.0 - 8.0 * cosim + cosisq * (12.0 + 8.0 * cosim - 10.0 * cosisq));

      xno2 = nm * nm;
      ainv2 = aonv * aonv;
      temp1 = 3.0 * xno2 * ainv2;
      temp = temp1 * root22;
      d2201 = temp * f220 * g201;
      d2211 = temp * f221 * g211;
      temp1 *= aonv;
      temp = temp1 * root32;
      d3210 = temp * f321 * g310;
      d3222 = temp * f322 * g322;
      temp1 *= aonv;
      temp = 2.0 * temp1 * root44;
      d4410 = temp * f441 * g410;
      d4422 = temp * f442 * g422;
      temp1 *= aonv;
      temp = temp1 * root52;
      d5220 = temp * f522 * g520;
      d5232 = temp * f523 * g532;
      temp = 2.0 * temp1 * root54;
      d5421 = temp * f542 * g521;
      d5433 = temp * f543 * g533;
      xlamo = (mo + nodeo + nodeo - theta - theta) % constants.twoPi;
      xfact = mdot + dmdt + 2.0 * (nodedot + dnodt - rptim) - no;
      em = emo;
      emsq = emsqo;
    }
    //  ---------------- synchronous resonance terms --------------
    if (irez === 1) {
      g200 = 1.0 + emsq * (-2.5 + 0.8125 * emsq);
      g310 = 1.0 + 2.0 * emsq;
      g300 = 1.0 + emsq * (-6.0 + 6.60937 * emsq);
      f220 = 0.75 * (1.0 + cosim) * (1.0 + cosim);
      f311 = 0.9375 * sinim * sinim * (1.0 + 3.0 * cosim) - 0.75 * (1.0 + cosim);
      f330 = 1.0 + cosim;
      f330 = 1.875 * f330 * f330 * f330;
      del1 = 3.0 * nm * nm * aonv * aonv;
      del2 = 2.0 * del1 * f220 * g200 * q22;
      del3 = 3.0 * del1 * f330 * g300 * q33 * aonv;
      del1 = del1 * f311 * g310 * q31 * aonv;
      xlamo = (mo + nodeo + argpo - theta) % constants.twoPi;
      xfact = mdot + xpidot - rptim + dmdt + domdt + dnodt - no;
    }
    //  ------------ for sgp4, initialize the integrator ----------
    xli = xlamo;
    xni = no;
    atime = 0.0;
    nm = no + dndt;
  }

  return {
    em: em,
    argpm: argpm,
    inclm: inclm,
    mm: mm,
    nm: nm,
    nodem: nodem,

    irez: irez,
    atime: atime,

    d2201: d2201,
    d2211: d2211,
    d3210: d3210,
    d3222: d3222,
    d4410: d4410,

    d4422: d4422,
    d5220: d5220,
    d5232: d5232,
    d5421: d5421,
    d5433: d5433,

    dedt: dedt,
    didt: didt,
    dmdt: dmdt,
    dndt: dndt,
    dnodt: dnodt,
    domdt: domdt,

    del1: del1,
    del2: del2,
    del3: del3,

    xfact: xfact,
    xlamo: xlamo,
    xli: xli,
    xni: xni
  };
}
module.exports = exports["default"];

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dspace;

var _constants = __webpack_require__(0);

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
function dspace(options) {
  var irez = options.irez,
      d2201 = options.d2201,
      d2211 = options.d2211,
      d3210 = options.d3210,
      d3222 = options.d3222,
      d4410 = options.d4410,
      d4422 = options.d4422,
      d5220 = options.d5220,
      d5232 = options.d5232,
      d5421 = options.d5421,
      d5433 = options.d5433,
      dedt = options.dedt,
      del1 = options.del1,
      del2 = options.del2,
      del3 = options.del3,
      didt = options.didt,
      dmdt = options.dmdt,
      dnodt = options.dnodt,
      domdt = options.domdt,
      argpo = options.argpo,
      argpdot = options.argpdot,
      t = options.t,
      tc = options.tc,
      gsto = options.gsto,
      xfact = options.xfact,
      xlamo = options.xlamo,
      no = options.no;
  var atime = options.atime,
      em = options.em,
      argpm = options.argpm,
      inclm = options.inclm,
      xli = options.xli,
      mm = options.mm,
      xni = options.xni,
      nodem = options.nodem,
      nm = options.nm;


  var fasx2 = 0.13130908;
  var fasx4 = 2.8843198;
  var fasx6 = 0.37448087;
  var g22 = 5.7686396;
  var g32 = 0.95240898;
  var g44 = 1.8014998;
  var g52 = 1.0508330;
  var g54 = 4.4108898;
  var rptim = 4.37526908801129966e-3; // equates to 7.29211514668855e-5 rad/sec
  var stepp = 720.0;
  var stepn = -720.0;
  var step2 = 259200.0;

  var delt = void 0;
  var x2li = void 0;
  var x2omi = void 0;
  var xl = void 0;
  var xldot = void 0;
  var xnddt = void 0;
  var xndt = void 0;
  var xomi = void 0;
  var dndt = 0.0;
  var ft = 0.0;

  //  ----------- calculate deep space resonance effects -----------
  var theta = (gsto + tc * rptim) % _constants.twoPi;
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

    var iretn = 381; // added for do loop
    while (iretn === 381) {
      //  ------------------- dot terms calculated -------------
      //  ----------- near - synchronous resonance terms -------
      if (irez !== 2) {
        xndt = del1 * Math.sin(xli - fasx2) + del2 * Math.sin(2.0 * (xli - fasx4)) + del3 * Math.sin(3.0 * (xli - fasx6));
        xldot = xni + xfact;
        xnddt = del1 * Math.cos(xli - fasx2) + 2.0 * del2 * Math.cos(2.0 * (xli - fasx4)) + 3.0 * del3 * Math.cos(3.0 * (xli - fasx6));
        xnddt *= xldot;
      } else {
        // --------- near - half-day resonance terms --------
        xomi = argpo + argpdot * atime;
        x2omi = xomi + xomi;
        x2li = xli + xli;
        xndt = d2201 * Math.sin(x2omi + xli - g22) + d2211 * Math.sin(xli - g22) + d3210 * Math.sin(xomi + xli - g32) + d3222 * Math.sin(-xomi + xli - g32) + d4410 * Math.sin(x2omi + x2li - g44) + d4422 * Math.sin(x2li - g44) + d5220 * Math.sin(xomi + xli - g52) + d5232 * Math.sin(-xomi + xli - g52) + d5421 * Math.sin(xomi + x2li - g54) + d5433 * Math.sin(-xomi + x2li - g54);
        xldot = xni + xfact;
        xnddt = d2201 * Math.cos(x2omi + xli - g22) + d2211 * Math.cos(xli - g22) + d3210 * Math.cos(xomi + xli - g32) + d3222 * Math.cos(-xomi + xli - g32) + d5220 * Math.cos(xomi + xli - g52) + d5232 * Math.cos(-xomi + xli - g52) + 2.0 * d4410 * Math.cos(x2omi + x2li - g44) + d4422 * Math.cos(x2li - g44) + d5421 * Math.cos(xomi + x2li - g54) + d5433 * Math.cos(-xomi + x2li - g54);
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
        xli += xldot * delt + xndt * step2;
        xni += xndt * delt + xnddt * step2;
        atime += delt;
      }
    }

    nm = xni + xndt * ft + xnddt * ft * ft * 0.5;
    xl = xli + xldot * ft + xndt * ft * ft * 0.5;
    if (irez !== 1) {
      mm = xl - (2.0 * nodem + 2.0 * theta);
      dndt = nm - no;
    } else {
      mm = xl - nodem - argpm + theta;
      dndt = nm - no;
    }
    nm = no + dndt;
  }

  return {
    atime: atime,
    em: em,
    argpm: argpm,
    inclm: inclm,
    xli: xli,
    mm: mm,
    xni: xni,
    nodem: nodem,
    dndt: dndt,
    nm: nm
  };
}
module.exports = exports['default'];

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = days2mdhms;
/* -----------------------------------------------------------------------------
 *
 *                           procedure days2mdhms
 *
 *  this procedure converts the day of the year, days, to the equivalent month
 *    day, hour, minute and second.
 *
 *  algorithm     : set up array for the number of days per month
 *                  find leap year - use 1900 because 2000 is a leap year
 *                  loop through a temp value while the value is < the days
 *                  perform int conversions to the correct day and month
 *                  convert remainder into h m s using type conversions
 *
 *  author        : david vallado                  719-573-2600    1 mar 2001
 *
 *  inputs          description                    range / units
 *    year        - year                           1900 .. 2100
 *    days        - julian day of the year         0.0  .. 366.0
 *
 *  outputs       :
 *    mon         - month                          1 .. 12
 *    day         - day                            1 .. 28,29,30,31
 *    hr          - hour                           0 .. 23
 *    min         - minute                         0 .. 59
 *    sec         - second                         0.0 .. 59.999
 *
 *  locals        :
 *    dayofyr     - day of year
 *    temp        - temporary extended values
 *    inttemp     - temporary int value
 *    i           - index
 *    lmonth[12]  - int array containing the number of days per month
 *
 *  coupling      :
 *    none.
 * --------------------------------------------------------------------------- */
function days2mdhms(year, days) {
  var lmonth = [31, year % 4 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var dayofyr = Math.floor(days);

  //  ----------------- find month and day of month ----------------
  var i = 1;
  var inttemp = 0;
  while (dayofyr > inttemp + lmonth[i - 1] && i < 12) {
    inttemp += lmonth[i - 1];
    i += 1;
  }

  var mon = i;
  var day = dayofyr - inttemp;

  //  ----------------- find hours minutes and seconds -------------
  var temp = (days - dayofyr) * 24.0;
  var hr = Math.floor(temp);
  temp = (temp - hr) * 60.0;
  var minute = Math.floor(temp);
  var sec = (temp - minute) * 60.0;

  return {
    mon: mon,
    day: day,
    hr: hr,
    minute: minute,
    sec: sec
  };
}
module.exports = exports["default"];

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = __webpack_require__(0);

var _constants2 = _interopRequireDefault(_constants);

var _degreesLat = __webpack_require__(9);

var _degreesLat2 = _interopRequireDefault(_degreesLat);

var _degreesLong = __webpack_require__(10);

var _degreesLong2 = _interopRequireDefault(_degreesLong);

var _eciToEcf = __webpack_require__(13);

var _eciToEcf2 = _interopRequireDefault(_eciToEcf);

var _ecfToEci = __webpack_require__(11);

var _ecfToEci2 = _interopRequireDefault(_ecfToEci);

var _eciToGeodetic = __webpack_require__(14);

var _eciToGeodetic2 = _interopRequireDefault(_eciToGeodetic);

var _ecfToLookAngles = __webpack_require__(12);

var _ecfToLookAngles2 = _interopRequireDefault(_ecfToLookAngles);

var _geodeticToEcf = __webpack_require__(4);

var _geodeticToEcf2 = _interopRequireDefault(_geodeticToEcf);

var _dopplerFactor = __webpack_require__(6);

var _dopplerFactor2 = _interopRequireDefault(_dopplerFactor);

var _gstime = __webpack_require__(3);

var _gstime2 = _interopRequireDefault(_gstime);

var _jday = __webpack_require__(1);

var _jday2 = _interopRequireDefault(_jday);

var _propagate = __webpack_require__(7);

var _propagate2 = _interopRequireDefault(_propagate);

var _twoline2satrec = __webpack_require__(8);

var _twoline2satrec2 = _interopRequireDefault(_twoline2satrec);

var _sgp = __webpack_require__(2);

var _sgp2 = _interopRequireDefault(_sgp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  version: '1.4.0',
  constants: _constants2.default,

  // Coordinate transforms
  degreesLat: _degreesLat2.default,
  degreesLong: _degreesLong2.default,
  eciToEcf: _eciToEcf2.default,
  ecfToEci: _ecfToEci2.default,
  eciToGeodetic: _eciToGeodetic2.default,
  ecfToLookAngles: _ecfToLookAngles2.default,
  geodeticToEcf: _geodeticToEcf2.default,

  dopplerFactor: _dopplerFactor2.default,

  gstimeFromJday: _gstime2.default,
  gstimeFromDate: function gstimeFromDate() {
    return (0, _gstime2.default)(_jday2.default.apply(undefined, arguments));
  },
  jday: _jday2.default,

  propagate: _propagate2.default,
  twoline2satrec: _twoline2satrec2.default,
  sgp4: _sgp2.default
};
module.exports = exports['default'];

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initl;

var _gstime = __webpack_require__(3);

var _gstime2 = _interopRequireDefault(_gstime);

var _constants = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function initl(initlParameters) {
  var ecco = initlParameters.ecco,
      epoch = initlParameters.epoch,
      inclo = initlParameters.inclo,
      no = initlParameters.no,
      method = initlParameters.method,
      opsmode = initlParameters.opsmode;

  var ak = void 0,
      d1 = void 0,
      adel = void 0,
      po = void 0,
      gsto = void 0;

  // sgp4fix use old way of finding gst
  //  ----------------------- earth constants ----------------------
  //  sgp4fix identify constants and allow alternate values

  //  ------------- calculate auxillary epoch quantities ----------
  var eccsq = ecco * ecco;
  var omeosq = 1.0 - eccsq;
  var rteosq = Math.sqrt(omeosq);
  var cosio = Math.cos(inclo);
  var cosio2 = cosio * cosio;

  //  ------------------ un-kozai the mean motion -----------------
  ak = Math.pow(_constants.xke / no, _constants.x2o3);
  d1 = 0.75 * _constants.j2 * (3.0 * cosio2 - 1.0) / (rteosq * omeosq);
  var delPrime = d1 / (ak * ak);
  adel = ak * (1.0 - delPrime * delPrime - delPrime * (1.0 / 3.0 + 134.0 * delPrime * delPrime / 81.0));
  delPrime = d1 / (adel * adel);
  no /= 1.0 + delPrime;

  var ao = Math.pow(_constants.xke / no, _constants.x2o3);
  var sinio = Math.sin(inclo);
  po = ao * omeosq;
  var con42 = 1.0 - 5.0 * cosio2;
  var con41 = -con42 - cosio2 - cosio2;
  var ainv = 1.0 / ao;
  var posq = po * po;
  var rp = ao * (1.0 - ecco);
  method = 'n';

  //  sgp4fix modern approach to finding sidereal time
  if (opsmode === 'a') {
    //  sgp4fix use old way of finding gst
    //  count integer number of days from 0 jan 1970
    var ts70 = epoch - 7305.0;
    var ds70 = Math.floor(ts70 + 1.0e-8);
    var tfrac = ts70 - ds70;
    //  find greenwich location at epoch
    var c1 = 1.72027916940703639e-2;
    var thgr70 = 1.7321343856509374;
    var fk5r = 5.07551419432269442e-15;
    var c1p2p = c1 + _constants.twoPi;
    gsto = (thgr70 + c1 * ds70 + c1p2p * tfrac + ts70 * ts70 * fk5r) % _constants.twoPi;
    if (gsto < 0.0) {
      gsto += _constants.twoPi;
    }
  } else {
    gsto = (0, _gstime2.default)(epoch + 2433281.5);
  }

  return {
    no: no,

    method: method,

    ainv: ainv,
    ao: ao,
    con41: con41,
    con42: con42,
    cosio: cosio,

    cosio2: cosio2,
    eccsq: eccsq,
    omeosq: omeosq,
    posq: posq,

    rp: rp,
    rteosq: rteosq,
    sinio: sinio,
    gsto: gsto
  };
}
module.exports = exports['default'];

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sgp4init;

var _dpper = __webpack_require__(5);

var _dpper2 = _interopRequireDefault(_dpper);

var _dscom = __webpack_require__(15);

var _dscom2 = _interopRequireDefault(_dscom);

var _dsinit = __webpack_require__(16);

var _dsinit2 = _interopRequireDefault(_dsinit);

var _initl = __webpack_require__(20);

var _initl2 = _interopRequireDefault(_initl);

var _sgp = __webpack_require__(2);

var _sgp2 = _interopRequireDefault(_sgp);

var _constants = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function sgp4init(satrec, options) {
  var opsmode = options.opsmode,
      satn = options.satn,
      epoch = options.epoch,
      xbstar = options.xbstar,
      xecco = options.xecco,
      xargpo = options.xargpo,
      xinclo = options.xinclo,
      xmo = options.xmo,
      xno = options.xno,
      xnodeo = options.xnodeo;

  var cnodm = void 0,
      snodm = void 0,
      cosim = void 0,
      sinim = void 0,
      cosomm = void 0,
      sinomm = void 0,
      cc1sq = void 0,
      cc2 = void 0,
      cc3 = void 0,
      coef = void 0,
      coef1 = void 0,
      cosio4 = void 0,
      day = void 0,
      dndt = void 0,
      em = void 0,
      emsq = void 0,
      eeta = void 0,
      etasq = void 0,
      gam = void 0,
      argpm = void 0,
      nodem = void 0,
      inclm = void 0,
      mm = void 0,
      nm = void 0,
      perige = void 0,
      pinvsq = void 0,
      psisq = void 0,
      qzms24 = void 0,
      rtemsq = void 0,
      s1 = void 0,
      s2 = void 0,
      s3 = void 0,
      s4 = void 0,
      s5 = void 0,
      s6 = void 0,
      s7 = void 0,
      sfour = void 0,
      ss1 = void 0,
      ss2 = void 0,
      ss3 = void 0,
      ss4 = void 0,
      ss5 = void 0,
      ss6 = void 0,
      ss7 = void 0,
      sz1 = void 0,
      sz2 = void 0,
      sz3 = void 0,
      sz11 = void 0,
      sz12 = void 0,
      sz13 = void 0,
      sz21 = void 0,
      sz22 = void 0,
      sz23 = void 0,
      sz31 = void 0,
      sz32 = void 0,
      sz33 = void 0,
      tc = void 0,
      temp = void 0,
      temp1 = void 0,
      temp2 = void 0,
      temp3 = void 0,
      temp4 = void 0,
      tsi = void 0,
      xpidot = void 0,
      xhdot1 = void 0,
      z1 = void 0,
      z2 = void 0,
      z3 = void 0,
      z11 = void 0,
      z12 = void 0,
      z13 = void 0,
      z21 = void 0,
      z22 = void 0,
      z23 = void 0,
      z31 = void 0,
      z32 = void 0,
      z33 = void 0;
  /* ------------------------ initialization --------------------- */
  // sgp4fix divisor for divide by zero check on inclination
  // the old check used 1.0 + Math.cos(pi-1.0e-9), but then compared it to
  // 1.5 e-12, so the threshold was changed to 1.5e-12 for consistency

  temp4 = 1.5e-12;

  //  ----------- set all near earth variables to zero ------------
  satrec.isimp = 0;satrec.method = 'n';satrec.aycof = 0.0;
  satrec.con41 = 0.0;satrec.cc1 = 0.0;satrec.cc4 = 0.0;
  satrec.cc5 = 0.0;satrec.d2 = 0.0;satrec.d3 = 0.0;
  satrec.d4 = 0.0;satrec.delmo = 0.0;satrec.eta = 0.0;
  satrec.argpdot = 0.0;satrec.omgcof = 0.0;satrec.sinmao = 0.0;
  satrec.t = 0.0;satrec.t2cof = 0.0;satrec.t3cof = 0.0;
  satrec.t4cof = 0.0;satrec.t5cof = 0.0;satrec.x1mth2 = 0.0;
  satrec.x7thm1 = 0.0;satrec.mdot = 0.0;satrec.nodedot = 0.0;
  satrec.xlcof = 0.0;satrec.xmcof = 0.0;satrec.nodecf = 0.0;

  //  ----------- set all deep space variables to zero ------------
  satrec.irez = 0;satrec.d2201 = 0.0;satrec.d2211 = 0.0;
  satrec.d3210 = 0.0;satrec.d3222 = 0.0;satrec.d4410 = 0.0;
  satrec.d4422 = 0.0;satrec.d5220 = 0.0;satrec.d5232 = 0.0;
  satrec.d5421 = 0.0;satrec.d5433 = 0.0;satrec.dedt = 0.0;
  satrec.del1 = 0.0;satrec.del2 = 0.0;satrec.del3 = 0.0;
  satrec.didt = 0.0;satrec.dmdt = 0.0;satrec.dnodt = 0.0;
  satrec.domdt = 0.0;satrec.e3 = 0.0;satrec.ee2 = 0.0;
  satrec.peo = 0.0;satrec.pgho = 0.0;satrec.pho = 0.0;
  satrec.pinco = 0.0;satrec.plo = 0.0;satrec.se2 = 0.0;
  satrec.se3 = 0.0;satrec.sgh2 = 0.0;satrec.sgh3 = 0.0;
  satrec.sgh4 = 0.0;satrec.sh2 = 0.0;satrec.sh3 = 0.0;
  satrec.si2 = 0.0;satrec.si3 = 0.0;satrec.sl2 = 0.0;
  satrec.sl3 = 0.0;satrec.sl4 = 0.0;satrec.gsto = 0.0;
  satrec.xfact = 0.0;satrec.xgh2 = 0.0;satrec.xgh3 = 0.0;
  satrec.xgh4 = 0.0;satrec.xh2 = 0.0;satrec.xh3 = 0.0;
  satrec.xi2 = 0.0;satrec.xi3 = 0.0;satrec.xl2 = 0.0;
  satrec.xl3 = 0.0;satrec.xl4 = 0.0;satrec.xlamo = 0.0;
  satrec.zmol = 0.0;satrec.zmos = 0.0;satrec.atime = 0.0;
  satrec.xli = 0.0;satrec.xni = 0.0;

  // sgp4fix - note the following variables are also passed directly via satrec.
  // it is possible to streamline the sgp4init call by deleting the "x"
  // variables, but the user would need to set the satrec.* values first. we
  // include the additional assignments in case twoline2rv is not used.

  satrec.bstar = xbstar;
  satrec.ecco = xecco;
  satrec.argpo = xargpo;
  satrec.inclo = xinclo;
  satrec.mo = xmo;
  satrec.no = xno;
  satrec.nodeo = xnodeo;

  //  sgp4fix add opsmode
  satrec.operationmode = opsmode;

  //  ------------------------ earth constants -----------------------
  //  sgp4fix identify constants and allow alternate values


  var ss = 78.0 / _constants.earthRadius + 1.0;
  //  sgp4fix use multiply for speed instead of pow
  var qzms2ttemp = (120.0 - 78.0) / _constants.earthRadius;
  var qzms2t = qzms2ttemp * qzms2ttemp * qzms2ttemp * qzms2ttemp;
  var x2o3 = 2.0 / 3.0;

  satrec.init = 'y';
  satrec.t = 0.0;

  var initlParameters = {
    satn: satn,
    ecco: satrec.ecco,

    epoch: epoch,
    inclo: satrec.inclo,
    no: satrec.no,

    method: satrec.method,
    opsmode: satrec.operationmode
  };

  var initlResult = (0, _initl2.default)(initlParameters);

  satrec.no = initlResult.no;

  // TODO: defined but never used
  // var method      = initlResult.method;
  // var ainv        = initlResult.ainv;

  var ao = initlResult.ao;
  satrec.con41 = initlResult.con41;
  var con42 = initlResult.con42;
  var cosio = initlResult.cosio;
  var cosio2 = initlResult.cosio2;
  var eccsq = initlResult.eccsq;
  var omeosq = initlResult.omeosq;
  var posq = initlResult.posq;
  var rp = initlResult.rp;
  var rteosq = initlResult.rteosq;
  var sinio = initlResult.sinio;
  satrec.gsto = initlResult.gsto;

  satrec.error = 0;

  // sgp4fix remove this check as it is unnecessary
  // the mrt check in sgp4 handles decaying satellite cases even if the starting
  // condition is below the surface of te earth
  //     if (rp < 1.0)
  //       {
  //         printf("// *** satn%d epoch elts sub-orbital ***\n", satn);
  //         satrec.error = 5;
  //       }


  if (omeosq >= 0.0 || satrec.no >= 0.0) {
    satrec.isimp = 0;
    if (rp < 220.0 / _constants.earthRadius + 1.0) {
      satrec.isimp = 1;
    }
    sfour = ss;
    qzms24 = qzms2t;
    perige = (rp - 1.0) * _constants.earthRadius;

    //  - for perigees below 156 km, s and qoms2t are altered -
    if (perige < 156.0) {
      sfour = perige - 78.0;
      if (perige < 98.0) {
        sfour = 20.0;
      }
      //  sgp4fix use multiply for speed instead of pow
      var qzms24temp = (120.0 - sfour) / _constants.earthRadius;
      qzms24 = qzms24temp * qzms24temp * qzms24temp * qzms24temp;
      sfour = sfour / _constants.earthRadius + 1.0;
    }
    pinvsq = 1.0 / posq;

    tsi = 1.0 / (ao - sfour);
    satrec.eta = ao * satrec.ecco * tsi;
    etasq = satrec.eta * satrec.eta;
    eeta = satrec.ecco * satrec.eta;
    psisq = Math.abs(1.0 - etasq);
    coef = qzms24 * Math.pow(tsi, 4.0);
    coef1 = coef / Math.pow(psisq, 3.5);
    cc2 = coef1 * satrec.no * (ao * (1.0 + 1.5 * etasq + eeta * (4.0 + etasq)) + 0.375 * _constants.j2 * tsi / psisq * satrec.con41 * (8.0 + 3.0 * etasq * (8.0 + etasq)));
    satrec.cc1 = satrec.bstar * cc2;
    cc3 = 0.0;
    if (satrec.ecco > 1.0e-4) {
      cc3 = -2.0 * coef * tsi * _constants.j3oj2 * satrec.no * sinio / satrec.ecco;
    }
    satrec.x1mth2 = 1.0 - cosio2;
    satrec.cc4 = 2.0 * satrec.no * coef1 * ao * omeosq * (satrec.eta * (2.0 + 0.5 * etasq) + satrec.ecco * (0.5 + 2.0 * etasq) - _constants.j2 * tsi / (ao * psisq) * (-3.0 * satrec.con41 * (1.0 - 2.0 * eeta + etasq * (1.5 - 0.5 * eeta)) + 0.75 * satrec.x1mth2 * (2.0 * etasq - eeta * (1.0 + etasq)) * Math.cos(2.0 * satrec.argpo)));
    satrec.cc5 = 2.0 * coef1 * ao * omeosq * (1.0 + 2.75 * (etasq + eeta) + eeta * etasq);
    cosio4 = cosio2 * cosio2;
    temp1 = 1.5 * _constants.j2 * pinvsq * satrec.no;
    temp2 = 0.5 * temp1 * _constants.j2 * pinvsq;
    temp3 = -0.46875 * _constants.j4 * pinvsq * pinvsq * satrec.no;
    satrec.mdot = satrec.no + 0.5 * temp1 * rteosq * satrec.con41 + 0.0625 * temp2 * rteosq * (13.0 - 78.0 * cosio2 + 137.0 * cosio4);
    satrec.argpdot = -0.5 * temp1 * con42 + 0.0625 * temp2 * (7.0 - 114.0 * cosio2 + 395.0 * cosio4) + temp3 * (3.0 - 36.0 * cosio2 + 49.0 * cosio4);
    xhdot1 = -temp1 * cosio;
    satrec.nodedot = xhdot1 + (0.5 * temp2 * (4.0 - 19.0 * cosio2) + 2.0 * temp3 * (3.0 - 7.0 * cosio2)) * cosio;
    xpidot = satrec.argpdot + satrec.nodedot;
    satrec.omgcof = satrec.bstar * cc3 * Math.cos(satrec.argpo);
    satrec.xmcof = 0.0;
    if (satrec.ecco > 1.0e-4) {
      satrec.xmcof = -x2o3 * coef * satrec.bstar / eeta;
    }
    satrec.nodecf = 3.5 * omeosq * xhdot1 * satrec.cc1;
    satrec.t2cof = 1.5 * satrec.cc1;
    //  sgp4fix for divide by zero with xinco = 180 deg
    if (Math.abs(cosio + 1.0) > 1.5e-12) {
      satrec.xlcof = -0.25 * _constants.j3oj2 * sinio * (3.0 + 5.0 * cosio) / (1.0 + cosio);
    } else {
      satrec.xlcof = -0.25 * _constants.j3oj2 * sinio * (3.0 + 5.0 * cosio) / temp4;
    }
    satrec.aycof = -0.5 * _constants.j3oj2 * sinio;
    //  sgp4fix use multiply for speed instead of pow
    var delmotemp = 1.0 + satrec.eta * Math.cos(satrec.mo);
    satrec.delmo = delmotemp * delmotemp * delmotemp;
    satrec.sinmao = Math.sin(satrec.mo);
    satrec.x7thm1 = 7.0 * cosio2 - 1.0;

    //  --------------- deep space initialization -------------
    if (2 * _constants.pi / satrec.no >= 225.0) {
      satrec.method = 'd';
      satrec.isimp = 1;
      tc = 0.0;
      inclm = satrec.inclo;

      var dscomParameters = {
        epoch: epoch,
        ep: satrec.ecco,
        argpp: satrec.argpo,
        tc: tc,
        inclp: satrec.inclo,
        nodep: satrec.nodeo,

        np: satrec.no,

        e3: satrec.e3,
        ee2: satrec.ee2,

        peo: satrec.peo,
        pgho: satrec.pgho,
        pho: satrec.pho,
        pinco: satrec.pinco,

        plo: satrec.plo,
        se2: satrec.se2,
        se3: satrec.se3,

        sgh2: satrec.sgh2,
        sgh3: satrec.sgh3,
        sgh4: satrec.sgh4,

        sh2: satrec.sh2,
        sh3: satrec.sh3,
        si2: satrec.si2,
        si3: satrec.si3,

        sl2: satrec.sl2,
        sl3: satrec.sl3,
        sl4: satrec.sl4,

        xgh2: satrec.xgh2,
        xgh3: satrec.xgh3,
        xgh4: satrec.xgh4,
        xh2: satrec.xh2,

        xh3: satrec.xh3,
        xi2: satrec.xi2,
        xi3: satrec.xi3,
        xl2: satrec.xl2,

        xl3: satrec.xl3,
        xl4: satrec.xl4,

        zmol: satrec.zmol,
        zmos: satrec.zmos
      };

      var dscomResult = (0, _dscom2.default)(dscomParameters);

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
        inclo: inclm,
        init: satrec.init,
        ep: satrec.ecco,
        inclp: satrec.inclo,
        nodep: satrec.nodeo,
        argpp: satrec.argpo,
        mp: satrec.mo,
        opsmode: satrec.operationmode
      };

      var dpperResult = (0, _dpper2.default)(satrec, dpperParameters);

      satrec.ecco = dpperResult.ep;
      satrec.inclo = dpperResult.inclp;
      satrec.nodeo = dpperResult.nodep;
      satrec.argpo = dpperResult.argpp;
      satrec.mo = dpperResult.mp;

      argpm = 0.0;
      nodem = 0.0;
      mm = 0.0;

      var dsinitParameters = {
        cosim: cosim,
        emsq: emsq,
        argpo: satrec.argpo,
        s1: s1,
        s2: s2,
        s3: s3,
        s4: s4,
        s5: s5,
        sinim: sinim,
        ss1: ss1,
        ss2: ss2,
        ss3: ss3,
        ss4: ss4,
        ss5: ss5,
        sz1: sz1,
        sz3: sz3,
        sz11: sz11,
        sz13: sz13,
        sz21: sz21,
        sz23: sz23,
        sz31: sz31,
        sz33: sz33,
        t: satrec.t,
        tc: tc,
        gsto: satrec.gsto,
        mo: satrec.mo,
        mdot: satrec.mdot,
        no: satrec.no,
        nodeo: satrec.nodeo,
        nodedot: satrec.nodedot,
        xpidot: xpidot,
        z1: z1,
        z3: z3,
        z11: z11,
        z13: z13,
        z21: z21,
        z23: z23,
        z31: z31,
        z33: z33,
        ecco: satrec.ecco,
        eccsq: eccsq,
        em: em,
        argpm: argpm,
        inclm: inclm,
        mm: mm,
        nm: nm,
        nodem: nodem,
        irez: satrec.irez,
        atime: satrec.atime,
        d2201: satrec.d2201,
        d2211: satrec.d2211,
        d3210: satrec.d3210,
        d3222: satrec.d3222,
        d4410: satrec.d4410,
        d4422: satrec.d4422,
        d5220: satrec.d5220,
        d5232: satrec.d5232,
        d5421: satrec.d5421,
        d5433: satrec.d5433,
        dedt: satrec.dedt,
        didt: satrec.didt,
        dmdt: satrec.dmdt,
        dnodt: satrec.dnodt,
        domdt: satrec.domdt,
        del1: satrec.del1,
        del2: satrec.del2,
        del3: satrec.del3,
        xfact: satrec.xfact,
        xlamo: satrec.xlamo,
        xli: satrec.xli,
        xni: satrec.xni
      };

      var dsinitResult = (0, _dsinit2.default)(dsinitParameters);

      em = dsinitResult.em;
      argpm = dsinitResult.argpm;
      inclm = dsinitResult.inclm;
      mm = dsinitResult.mm;
      nm = dsinitResult.nm;

      nodem = dsinitResult.nodem;
      satrec.irez = dsinitResult.irez;
      satrec.atime = dsinitResult.atime;
      satrec.d2201 = dsinitResult.d2201;
      satrec.d2211 = dsinitResult.d2211;

      satrec.d3210 = dsinitResult.d3210;
      satrec.d3222 = dsinitResult.d3222;
      satrec.d4410 = dsinitResult.d4410;
      satrec.d4422 = dsinitResult.d4422;
      satrec.d5220 = dsinitResult.d5220;

      satrec.d5232 = dsinitResult.d5232;
      satrec.d5421 = dsinitResult.d5421;
      satrec.d5433 = dsinitResult.d5433;
      satrec.dedt = dsinitResult.dedt;
      satrec.didt = dsinitResult.didt;

      satrec.dmdt = dsinitResult.dmdt;
      dndt = dsinitResult.dndt;
      satrec.dnodt = dsinitResult.dnodt;
      satrec.domdt = dsinitResult.domdt;
      satrec.del1 = dsinitResult.del1;

      satrec.del2 = dsinitResult.del2;
      satrec.del3 = dsinitResult.del3;
      satrec.xfact = dsinitResult.xfact;
      satrec.xlamo = dsinitResult.xlamo;
      satrec.xli = dsinitResult.xli;

      satrec.xni = dsinitResult.xni;
    }

    // ----------- set variables if not deep space -----------
    if (satrec.isimp !== 1) {
      cc1sq = satrec.cc1 * satrec.cc1;
      satrec.d2 = 4.0 * ao * tsi * cc1sq;
      temp = satrec.d2 * tsi * satrec.cc1 / 3.0;
      satrec.d3 = (17.0 * ao + sfour) * temp;
      satrec.d4 = 0.5 * temp * ao * tsi * (221.0 * ao + 31.0 * sfour) * satrec.cc1;
      satrec.t3cof = satrec.d2 + 2.0 * cc1sq;
      satrec.t4cof = 0.25 * (3.0 * satrec.d3 + satrec.cc1 * (12.0 * satrec.d2 + 10.0 * cc1sq));
      satrec.t5cof = 0.2 * (3.0 * satrec.d4 + 12.0 * satrec.cc1 * satrec.d3 + 6.0 * satrec.d2 * satrec.d2 + 15.0 * cc1sq * (2.0 * satrec.d2 + cc1sq));
    }

    /* finally propogate to zero epoch to initialize all others. */
    // sgp4fix take out check to let satellites process until they are actually below earth surface
    //  if(satrec.error == 0)
  }
  (0, _sgp2.default)(satrec, 0.0);

  satrec.init = 'n';

  // sgp4fix return boolean. satrec.error contains any error codes
  return true;
}
module.exports = exports['default'];

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = topocentric;

var _geodeticToEcf = __webpack_require__(4);

var _geodeticToEcf2 = _interopRequireDefault(_geodeticToEcf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function topocentric(observerCoords, satelliteCoords) {
  // http://www.celestrak.com/columns/v02n02/
  // TS Kelso's method, except I'm using ECF frame
  // and he uses ECI.

  var longitude = observerCoords.longitude;
  var latitude = observerCoords.latitude;

  var observerEcf = (0, _geodeticToEcf2.default)(observerCoords);

  var rx = satelliteCoords.x - observerEcf.x;
  var ry = satelliteCoords.y - observerEcf.y;
  var rz = satelliteCoords.z - observerEcf.z;

  var topS = Math.sin(latitude) * Math.cos(longitude) * rx + Math.sin(latitude) * Math.sin(longitude) * ry - Math.cos(latitude) * rz;

  var topE = -Math.sin(longitude) * rx + Math.cos(longitude) * ry;

  var topZ = Math.cos(latitude) * Math.cos(longitude) * rx + Math.cos(latitude) * Math.sin(longitude) * ry + Math.sin(latitude) * rz;

  return { topS: topS, topE: topE, topZ: topZ };
}
module.exports = exports['default'];

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (topocentric) {
  var topS = topocentric.topS,
      topE = topocentric.topE,
      topZ = topocentric.topZ;

  var rangeSat = Math.sqrt(topS * topS + topE * topE + topZ * topZ);
  var El = Math.asin(topZ / rangeSat);
  var Az = Math.atan2(-topE, topS) + _constants.pi;

  return {
    azimuth: Az,
    elevation: El,
    rangeSat: rangeSat };
};

var _constants = __webpack_require__(0);

module.exports = exports['default'];

/**
 * @param {Object} topocentric
 * @param {Number} topocentric.topS Positive horizontal vector S due south.
 * @param {Number} topocentric.topE Positive horizontal vector E due east.
 * @param {Number} topocentric.topZ Vector Z normal to the surface of the earth (up).
 * @returns {Object}
 */

/***/ })
/******/ ]);
});
//# sourceMappingURL=satellite.js.map