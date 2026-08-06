#include "common.h"

extern "C" {
  void EMSCRIPTEN_KEEPALIVE compute(RunData* __restrict runData)
  {
    const int satCount = runData->satellitesCount;
    const int dateCount = runData->jdaysCount;

    calculate_eci(
        runData->satellitesPointer,
        0, satCount,
        runData->jdaysPointer,
        0, dateCount, dateCount,
        runData->eciPositions,
        runData->eciVelocities,
        runData->sgp4Errors,
        runData->communityDecayCheckEnabled);

    if (runData->gmstEnabled)
    {
      calculate_gmst(
          runData->jdaysPointer,
          0, dateCount,
          runData->gmstValues);
    }

    if (runData->ecfPositionEnabled)
    {
      calculate_ecf_position_or_velocity(
          runData->eciPositions,
          0, satCount,
          runData->gmstValues,
          0, dateCount, dateCount,
          runData->ecfPositions);
    }

    if (runData->ecfVelocityEnabled)
    {
      calculate_ecf_position_or_velocity(
          runData->eciVelocities,
          0, satCount,
          runData->gmstValues,
          0, dateCount, dateCount,
          runData->ecfVelocities);
    }

    if (runData->geodeticPositionEnabled)
    {
      calculate_geodetic_positions(
          runData->eciPositions,
          0, satCount,
          runData->gmstValues,
          0, dateCount, dateCount,
          runData->geodeticPositions);
    }

    if (runData->lookAnglesEnabled)
    {
      calculate_look_angles(
          runData->ecfPositions,
          0, satCount,
          0, dateCount, dateCount,
          runData->longitudeRadians,
          runData->latitudeRadians,
          runData->heightKm,
          runData->lookAngles);
    }

    if (runData->dopplerFactorEnabled)
    {
      calculate_doppler_factor(
          runData->ecfPositions,
          runData->ecfVelocities,
          0, satCount,
          0, dateCount, dateCount,
          runData->observerEcfX,
          runData->observerEcfY,
          runData->observerEcfZ,
          runData->dopplerFactors);
    }

    if (runData->sunPositionEnabled)
    {
      calculate_sun_positions(
          runData->jdaysPointer,
          0, dateCount,
          runData->sunPositions);
    }

    if (runData->shadowFractionEnabled)
    {
      calculate_shadow_fraction(
          runData->eciPositions,
          runData->sunPositions,
          0, satCount,
          0, dateCount, dateCount,
          runData->shadowFractionValues);
    }
  }
}