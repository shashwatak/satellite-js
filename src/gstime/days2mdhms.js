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
export default function days2mdhms(year, days) {
  const lmonth = [31, (year % 4) === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const dayofyr = Math.floor(days);

  //  ----------------- find month and day of month ----------------
  let i = 1;
  let inttemp = 0;
  while ((dayofyr > (inttemp + lmonth[i - 1])) && i < 12) {
    inttemp += lmonth[i - 1];
    i += 1;
  }

  const mon = i;
  const day = dayofyr - inttemp;

  //  ----------------- find hours minutes and seconds -------------
  let temp = (days - dayofyr) * 24.0;
  const hr = Math.floor(temp);
  temp = (temp - hr) * 60.0;
  const minute = Math.floor(temp);
  const sec = (temp - minute) * 60.0;

  return {
    mon,
    day,
    hr,
    minute,
    sec,
  };
}
