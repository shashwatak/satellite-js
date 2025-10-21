#include <stdio.h>
#include <emscripten/emscripten.h>
#include "SGP4.h"

#define pi 3.14159265358979323846

/**
 * This contains code that is needed only for debug mode tests, but unused in user-facing code.
 * It is intended to be excluded from production builds.
 */

extern "C" {
  void twoline2rv(
      char longstr1[130], char longstr2[130],
      char opsmode,
      gravconsttype whichconst,
      elsetrec &satrec)
  {
    const double deg2rad = pi / 180.0;         //   0.0174532925199433
    const double xpdotp = 1440.0 / (2.0 * pi); // 229.1831180523293

    double sec;
    double startsec, stopsec, startdayofyr, stopdayofyr, jdstart, jdstop, jdstartF, jdstopF;
    int startyear, stopyear, startmon, stopmon, startday, stopday,
        starthr, stophr, startmin, stopmin;
    int cardnumb, j;
    // sgp4fix include in satrec
    // long revnum = 0, elnum = 0;
    // char classification, intldesg[11];
    int year = 0;
    int mon, day, hr, minute, nexp, ibexp;

    // sgp4fix no longer needed
    // getgravconst( whichconst, tumin, mu, radiusearthkm, xke, j2, j3, j4, j3oj2 );

    satrec.error = 0;

    // set the implied decimal points since doing a formated read
    // fixes for bad input data values (missing, ...)
    for (j = 10; j <= 15; j++)
      if (longstr1[j] == ' ')
        longstr1[j] = '_';

    if (longstr1[44] != ' ')
      longstr1[43] = longstr1[44];
    longstr1[44] = '.';
    if (longstr1[7] == ' ')
      longstr1[7] = 'U';
    if (longstr1[9] == ' ')
      longstr1[9] = '.';
    for (j = 45; j <= 49; j++)
      if (longstr1[j] == ' ')
        longstr1[j] = '0';
    if (longstr1[51] == ' ')
      longstr1[51] = '0';
    if (longstr1[53] != ' ')
      longstr1[52] = longstr1[53];
    longstr1[53] = '.';
    longstr2[25] = '.';
    for (j = 26; j <= 32; j++)
      if (longstr2[j] == ' ')
        longstr2[j] = '0';
    if (longstr1[62] == ' ')
      longstr1[62] = '0';
    if (longstr1[68] == ' ')
      longstr1[68] = '0';

    sscanf(longstr1, "%2d %5s %1c %10s %2d %12lf %11lf %7lf %2d %7lf %2d %2d %6ld ",
           &cardnumb, satrec.satnum, &satrec.classification, satrec.intldesg, &satrec.epochyr,
           &satrec.epochdays, &satrec.ndot, &satrec.nddot, &nexp, &satrec.bstar,
           &ibexp, &satrec.ephtype, &satrec.elnum);

    // sgp4fix note that the ephtype must be 0 for SGP4. SGP4-XP uses 4.
    if (satrec.ephtype == 0)
    {
      if (longstr2[52] == ' ')
      {
        sscanf(longstr2, "%2d %5s %9lf %9lf %8lf %9lf %9lf %10lf %6ld \n",
               &cardnumb, satrec.satnum, &satrec.inclo,
               &satrec.nodeo, &satrec.ecco, &satrec.argpo, &satrec.mo, &satrec.no_kozai,
               &satrec.revnum);
      }
      else
      {
        sscanf(longstr2, "%2d %5s %9lf %9lf %8lf %9lf %9lf %11lf %6ld \n",
               &cardnumb, satrec.satnum, &satrec.inclo,
               &satrec.nodeo, &satrec.ecco, &satrec.argpo, &satrec.mo, &satrec.no_kozai,
               &satrec.revnum);
      }

      // ---- find no, ndot, nddot ----
      satrec.no_kozai = satrec.no_kozai / xpdotp; //* rad/min
      satrec.nddot = satrec.nddot * pow(10.0, nexp);
      // could multiply by 0.00001, but implied decimal is set in the longstr1 above
      satrec.bstar = satrec.bstar * pow(10.0, ibexp);

      // ---- convert to sgp4 units ----
      // satrec.a    = pow( satrec.no_kozai*tumin , (-2.0/3.0) );
      satrec.ndot = satrec.ndot / (xpdotp * 1440.0); //* ? * minperday
      satrec.nddot = satrec.nddot / (xpdotp * 1440.0 * 1440);

      // ---- find standard orbital elements ----
      satrec.inclo = satrec.inclo * deg2rad;
      satrec.nodeo = satrec.nodeo * deg2rad;
      satrec.argpo = satrec.argpo * deg2rad;
      satrec.mo = satrec.mo * deg2rad;

      // sgp4fix not needed here
      // satrec.alta = satrec.a*(1.0 + satrec.ecco) - 1.0;
      // satrec.altp = satrec.a*(1.0 - satrec.ecco) - 1.0;

      // ----------------------------------------------------------------
      // find sgp4epoch time of element set
      // remember that sgp4 uses units of days from 0 jan 1950 (sgp4epoch)
      // and minutes from the epoch (time)
      // ----------------------------------------------------------------

      // ---------------- temp fix for years from 1957-2056 -------------------
      // --------- correct fix will occur when year is 4-digit in tle ---------
      if (satrec.epochyr < 57)
        year = satrec.epochyr + 2000;
      else
        year = satrec.epochyr + 1900;

      SGP4Funcs::days2mdhms_SGP4(year, satrec.epochdays, mon, day, hr, minute, sec);
      SGP4Funcs::jday_SGP4(year, mon, day, hr, minute, sec, satrec.jdsatepoch, satrec.jdsatepochF);

      // ---------------- initialize the orbit at sgp4epoch -------------------
      SGP4Funcs::sgp4init(whichconst, opsmode, satrec.satnum, (satrec.jdsatepoch + satrec.jdsatepochF) - 2433281.5, satrec.bstar,
                          satrec.ndot, satrec.nddot, satrec.ecco, satrec.argpo, satrec.inclo, satrec.mo, satrec.no_kozai,
                          satrec.nodeo, satrec);
    }
  }

  void EMSCRIPTEN_KEEPALIVE init_satrec_from_tle(elsetrec *satrec_ptr, char *tle_line1, char *tle_line2)
  {
    twoline2rv(tle_line1, tle_line2, 'i', gravconsttype::wgs72, *satrec_ptr);
  }
}