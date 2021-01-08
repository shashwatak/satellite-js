/**
 * https://celestrak.com/publications/AIAA/2006-6753/AIAA-2006-6753-Rev3.pdf
 * Kaya et al. (2001, 2004) focuses on the difficulties encountered when mixing WGS-72 and WGS-84 constants.
 * Because the SGP4 codes contain references to WGS-72, AFSPC may have updated the constants to WGS-84, but
 * there is no other documentation supporting this so we present the development in case new official documentation is
 * released. However, because many operational sites may still have embedded software containing a version of SGP4
 * using WGS-72, and the fact that the accuracy of the theory would not really be impacted, AFSPC may well have
 * chosen to retain the older set of constants to better maintain interoperability with its internal resources. 
 * We use WGS72 as the default value. As with other changes we discuss, this is only necessary to interface with external programs,
 * but it will cause a difference in ephemeris results.
 */

/** WGS-72 Low Precision Constants -- These are useful if using historical TLEs from  */
// export const mu = 398600.79964; // in km3 / s2
// export const earthRadius = 6378.135; // in km
// export const xke = 0.0743669161;
// export const tumin = 1.0 / xke;
// export const j2 = 0.001082616;
// export const j3 = -0.00000253881;
// export const j4 = -0.00000165597;
// export const j3oj2 = j3 / j2;


/** WGS-72 Constants -- These are the current standard in Revisiting Spacetrack Report #3: Rev 3 */
export const mu = 398600.8; // in km3 / s2
export const earthRadius = 6378.135; // in km
export const xke = 60.0 / Math.sqrt((earthRadius * earthRadius * earthRadius) / mu);
export const tumin = 1.0 / xke;
export const j2 = 0.001082616;
export const j3 = -0.00000253881;
export const j4 = -0.00000165597;
export const j3oj2 = j3 / j2;

/** WGS-84 Constants -- More accurate, but less useful if your TLEs were generated using WGS-72 */
// export const mu = 398600.5; // in km3 / s2
// export const earthRadius = 6378.137; // in km
// export const xke = 60.0 / Math.sqrt((earthRadius * earthRadius * earthRadius) / mu);
// export const tumin = 1.0 / xke;
// export const j2 = 0.00108262998905;
// export const j3 = -0.00000253215306;
// export const j4 = -0.00000161098761;
// export const j3oj2 = j3 / j2;

export const pi = Math.PI;
export const twoPi = pi * 2;
export const deg2rad = pi / 180.0;
export const rad2deg = 180 / pi;
export const minutesPerDay = 1440.0;
export const vkmpersec = (earthRadius * xke) / 60.0;
export const x2o3 = 2.0 / 3.0;