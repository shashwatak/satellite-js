define([
    'satellite',
    'json!test/sgp4.json'
], function(
    satellite,
    sgp4data
) {
    'use strict';

    function compareVectors(vector1, vector2, precision) {
        precision = precision || 0;
        if (precision === 0) {
            expect(vector1.x).toBe(vector2.x);
            expect(vector1.y).toBe(vector2.y);
            expect(vector1.z).toBe(vector2.z);
        }
        else {
            expect(vector1.x).toBeCloseTo(vector2.x, precision);
            expect(vector1.y).toBeCloseTo(vector2.y, precision);
            expect(vector1.z).toBeCloseTo(vector2.z, precision);
        }
    }

    describe('Satellite test suite', function() {
        it('Julian day', function() {
            var now = new Date();
            expect(satellite.jday(now)).toBe(satellite.jday(
                now.getUTCFullYear(),
                now.getUTCMonth() + 1,
                now.getUTCDate(),
                now.getUTCHours(),
                now.getUTCMinutes(),
                now.getUTCSeconds()
            ));
            expect(satellite.gstimeFromDate(now)).toBe(satellite.gstimeFromDate(
                now.getUTCFullYear(),
                now.getUTCMonth() + 1,
                now.getUTCDate(),
                now.getUTCHours(),
                now.getUTCMinutes(),
                now.getUTCSeconds()
            ));

            var date = new Date(2016, 7, 22),
                tleLine1 = '1 27424U 02022A   16235.86686911  .00000105  00000-0  33296-4 0  9990',
                tleLine2 = '2 27424  98.2022 175.3843 0001285  39.9183  23.2024 14.57119903760831',
                satrec = satellite.twoline2satrec(tleLine1, tleLine2);

            var propagationByDate = satellite.propagate(satrec, date),
                propagationByDateItems = satellite.propagate(
                    satrec,
                    date.getUTCFullYear(),
                    date.getUTCMonth() + 1,
                    date.getUTCDate(),
                    date.getUTCHours(),
                    date.getUTCMinutes(),
                    date.getUTCSeconds()
                );

            compareVectors(propagationByDate.position, propagationByDateItems.position);
            compareVectors(propagationByDate.velocity, propagationByDateItems.velocity);
        });

        it('sgp4', function() {
            var sgp4, sgp4dataItem,
                satrec, result,
                precision = 7;

            for (var i = 0; i < sgp4data.length; i += 1) {
                sgp4dataItem = sgp4data[i];

                // Fetching satellite record from TLE lines
                satrec = satellite.twoline2satrec(sgp4dataItem.tleLine1, sgp4dataItem.tleLine2);

                for (var j = 0; j < sgp4dataItem.results.length; j += 1) {
                    result = sgp4dataItem.results[j];
                    sgp4 = satellite.sgp4(satrec, result.time);
                    compareVectors(sgp4.position, result.position, precision);
                    compareVectors(sgp4.velocity, result.velocity, precision);
                }
            }
        });
    });
});