import { deg2rad, twoPi } from './constants';

////////////////////////////////////////////////////////////////////////////////////
/* Line by Line MATLAB-to-Javascript conversion of "sun.mat" from Vallado package */
////////////////////////////////////////////////////////////////////////////////////
/* -----------------------------------------------------------------------------
 *
 *                              function sunPos
 *
 *  this function calculates the geocentric equatorial position vector
 *      the sun given the julian date.  this is the low precision formula and
 *      is valid for years from 1950 to 2050.  accuaracy of apparent coordinates
 *      is 0.01  degrees.  notice many of the calculations are performed in
 *      degrees, and are not changed until later.  this is due to the fact that
 *      the almanac uses degrees exclusively in their formulations.
 * 
 *  author        : david vallado                  719-573-2600    1 mar 2001
 * 
 *  inputs          description                       range / units
 *      jd          - julian date                       days from 4713 bc
 * 
 *  outputs       :
 *      rsun        - ijk position vector of the sun    au
 *      rtasc       - right ascension                   rad
 *      decl        - declination                       rad
 * 
 *  coupling      :
 *      -
 * 
 *  references    :
 *      VALLADO, DAVID A. (2022) ‘Computer software in MATLAB’, in Fundamentals of astrodynamics and applications. 5th edn.
 *      Computer software in MATLAB: http://celestrak.org/software/vallado-sw.php 
 *  --------------------------------------------------------------------------- */

export function sunPos(jd) {
  
    // -------------------------  implementation   -----------------
    // -------------------  initialize values   --------------------
    const tut1 = ( jd - 2451545.0  ) / 36525.0;
  
    const meanlong = (280.460  + 36000.77 * tut1) % 360.0; //deg
  
    const ttdb = tut1; // is this declaration required instead of replacing `ttdb` with `tut1`
 
    if (meananomaly < 0.0 ) {
        const meananomaly = twoPi + ((357.5277233  + 35999.05034 * ttdb) * deg2rad) % twoPi; //rad;
    } else {
        const meananomaly = ((357.5277233  + 35999.05034 * ttdb) * deg2rad) % twoPi; //rad;
    }
  
    const eclplong_raw = ((meanlong + 1.914666471 * Math.sin(meananomaly) + 0.019994643 * Math.sin(2.0 * meananomaly)) % 360.0) * deg2rad; //rad
  
    const obliquity = (23.439291 - 0.0130042 * ttdb) * deg2rad; //rad
  
    // --------- find magnitude of sun vector, and it's components ------
    const magr = 1.000140612  - 0.016708617 * Math.cos( meananomaly ) - 0.000139589 * Math.cos( 2.0 * meananomaly ); // in au's
  
    const rsun = [
        magr*Math.cos(eclplong_raw), 
        magr*Math.cos(obliquity)*Math.sin(eclplong_raw), 
        magr*Math.sin(obliquity)*Math.sin(eclplong_raw)
    ];
  
    const rtasc_raw = Math.atan( Math.cos(obliquity) * Math.tan(eclplong_raw) );
  
    // --- check that rtasc is in the same quadrant as eclplong_raw ----
    if ( eclplong_raw < 0.0  ) {
        const eclplong = eclplong_raw + twoPi;    // make sure it's in 0 to 2pi range
    } else {
        const eclplong = eclplong_raw;
    }

    if ( Math.abs( eclplong_raw - rtasc_raw ) > pi*0.5  ) {
        const rtasc = rtasc_raw + 0.5 *pi*Math.round( (eclplong_raw - rtasc_raw)/(0.5 *pi));
    } else {
        const rtasc = rtasc_raw;
    }
    
    const decl = Math.asin( Math.sin(obliquity) * Math.sin(eclplong_raw) );
  
    return {rsun, rtasc, decl}
  }
  
  
  /* Original MATLAB code for Sun position from Vallado package (sun.mat)  */
  /*
  function [rsun,rtasc,decl] = sun ( jd );
  
          twopi      =     2.0*pi;
          deg2rad    =     pi/180.0;
          show = 'n';
  
          % -------------------------  implementation   -----------------
          % -------------------  initialize values   --------------------
          tut1= ( jd - 2451545.0  )/ 36525.0;
  
          if show == 'y'
              fprintf(1,'tut1 %14.9f \n',tut1);
          end
  
          meanlong= 280.460  + 36000.77*tut1;
          meanlong= rem( meanlong,360.0  );  %deg
  
          ttdb= tut1;
          meananomaly= 357.5277233  + 35999.05034 *ttdb;
          meananomaly= rem( meananomaly*deg2rad,twopi );  %rad
          if ( meananomaly < 0.0  )
              meananomaly= twopi + meananomaly;
          end
  
          eclplong_raw= meanlong + 1.914666471 *sin(meananomaly) ...
                      + 0.019994643 *sin(2.0 *meananomaly); %deg
          eclplong_raw= rem( eclplong_raw,360.0  );  %deg
  
          obliquity= 23.439291  - 0.0130042 *ttdb;  %deg
  
          eclplong_raw = eclplong_raw *deg2rad;
          obliquity= obliquity *deg2rad;
  
          % --------- find magnitude of sun vector, )   components ------
          magr= 1.000140612  - 0.016708617 *cos( meananomaly ) ...
                                - 0.000139589 *cos( 2.0 *meananomaly );    % in au's
  
          rsun(1)= magr*cos( eclplong_raw );
          rsun(2)= magr*cos(obliquity)*sin(eclplong_raw);
          rsun(3)= magr*sin(obliquity)*sin(eclplong_raw);
  
          if show == 'y'
              fprintf(1,'meanlon %11.6f meanan %11.6f eclplon %11.6f obli %11.6f \n', ...
                      meanlong,meananomaly/deg2rad,eclplong_raw/deg2rad,obliquity/deg2rad);
              fprintf(1,'rs %11.9f %11.9f %11.9f \n',rsun);
              fprintf(1,'magr %14.7f \n',magr);
          end
  
          rtasc= atan( cos(obliquity)*tan(eclplong_raw) );
  
          % --- check that rtasc is in the same quadrant as eclplong_raw ----
          if ( eclplong_raw < 0.0  )
              eclplong_raw= eclplong_raw + twopi;    % make sure it's in 0 to 2pi range
          end
          if ( abs( eclplong_raw-rtasc ) > pi*0.5  )
              rtasc= rtasc + 0.5 *pi*round( (eclplong_raw-rtasc)/(0.5 *pi));
          end
          decl = asin( sin(obliquity)*sin(eclplong_raw) );
  */
