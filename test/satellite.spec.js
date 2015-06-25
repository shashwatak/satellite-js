define([
    'satellite',
    'json!test/sgp4.json'
], function(
    satellite,
    sgp4data
) {
    'use strict';

    describe('Satellite test suite', function() {
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

                    expect(sgp4.position.x).toBeCloseTo(result.position.x, precision);
                    expect(sgp4.position.y).toBeCloseTo(result.position.y, precision);
                    expect(sgp4.position.z).toBeCloseTo(result.position.z, precision);

                    expect(sgp4.velocity.x).toBeCloseTo(result.velocity.x, precision);
                    expect(sgp4.velocity.y).toBeCloseTo(result.velocity.y, precision);
                    expect(sgp4.velocity.z).toBeCloseTo(result.velocity.z, precision);
                }
            }
        });
    });
});