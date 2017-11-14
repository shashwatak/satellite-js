function jdayInternal(year, mon, day, hr, minute, sec) {
  return (
    ((367.0 * year) - Math.floor((7 * (year + Math.floor((mon + 9) / 12.0))) * 0.25)) +
    Math.floor((275 * mon) / 9.0) +
    day + 1721013.5 +
    (((((sec / 60.0) + minute) / 60.0) + hr) / 24.0) // ut in days
    // # - 0.5*sgn(100.0*year + mon - 190002.5) + 0.5;
  );
}

export default function jday(year, mon, day, hr, minute, sec) {
  if (year instanceof Date) {
    const date = year;
    return jdayInternal(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
    );
  }

  return jdayInternal(year, mon, day, hr, minute, sec);
}
