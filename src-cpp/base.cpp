#include "common.h"

extern "C" {
  void calculate_eci_base(elsetrec *__restrict satellites, int satellites_count, double *__restrict jdays, int jdays_count, double *__restrict eci_positions, double *__restrict eci_velocities, int8_t *__restrict sgp4_errors)
  {
    for (int i = 0; i < satellites_count; i++)
    {
      for (int j = 0; j < jdays_count; j++)
      {
        int output_index = (i * jdays_count + j) * 3;
        sgp4forJs(satellites[i], jdays[j], &eci_positions[output_index], &eci_velocities[output_index], sgp4_errors[output_index / 3]);
      }
    }
  }

  void calculate_gmst(double *__restrict jdays, int jdays_count, double *__restrict gmst_values)
  {
    for (int i = 0; i < jdays_count; i++)
    {
      gmst_values[i] = SGP4Funcs::gstime_SGP4(jdays[i]);
    }
  }

  void calculate_ecf_position_or_velocity(double *__restrict eci_vectors, int satellites_count, double *__restrict gmst_values, int gmst_count, double *__restrict ecf_vectors)
  {
    for (int i = 0; i < satellites_count; i++)
    {
      for (int j = 0; j < gmst_count; j++)
      {
        int input_vector_index = (i * gmst_count + j) * 3;
        double x = eci_vectors[input_vector_index] * cos(gmst_values[j]) + eci_vectors[input_vector_index + 1] * sin(gmst_values[j]);
        double y = eci_vectors[input_vector_index] * (-sin(gmst_values[j])) + eci_vectors[input_vector_index + 1] * cos(gmst_values[j]);
        double z = eci_vectors[input_vector_index + 2];
        ecf_vectors[input_vector_index] = x;
        ecf_vectors[input_vector_index + 1] = y;
        ecf_vectors[input_vector_index + 2] = z;
      }
    }
  }

  void calculate_geodetic_positions(double *__restrict eci_positions, int satellites_count, double *__restrict gmst_values, int gmst_count, double *__restrict geodetic_positions)
  {
    // http://www.celestrak.com/columns/v02n03/
    double a = 6378.137,
           b = 6356.7523142,
           f = (a - b) / a,
           e2 = ((2 * f) - (f * f));
    for (int i = 0; i < satellites_count; i++)
    {
      for (int j = 0; j < gmst_count; j++)
      {
        int position_index = (i * gmst_count + j) * 3;
        double R = sqrt((eci_positions[position_index] * eci_positions[position_index]) + (eci_positions[position_index + 1] * eci_positions[position_index + 1]));
        double longitude = atan2(eci_positions[position_index + 1], eci_positions[position_index]) - gmst_values[j];
        while (longitude < -pi)
        {
          longitude += pi * 2;
        }
        while (longitude > pi)
        {
          longitude -= pi * 2;
        }

        int kmax = 20,
            k = 0;
        double latitude = atan2(
            eci_positions[position_index + 2],
            sqrt((eci_positions[position_index] * eci_positions[position_index]) + (eci_positions[position_index + 1] * eci_positions[position_index + 1])));
        double C;
        while (k++ < kmax)
        {
          C = 1 / sqrt(1 - (e2 * (sin(latitude) * sin(latitude))));
          latitude = atan2(eci_positions[position_index + 2] + (a * C * e2 * sin(latitude)), R);
        }
        double height = (R / cos(latitude)) - (a * C);
        geodetic_positions[position_index] = longitude;
        geodetic_positions[position_index + 1] = latitude;
        geodetic_positions[position_index + 2] = height;
      }
    }
  }

  void calculate_look_angles(double *__restrict ecf_positions, int satellites_count, int dates_count, double longitude, double latitude, double height, double *__restrict look_angles)
  {
    double a = 6378.137;
    double b = 6356.7523142;
    double f = (a - b) / a;
    double e2 = ((2 * f) - (f * f));
    double normal = a / sqrt(1 - (e2 * (sin(latitude) * sin(latitude))));

    double observerEcfX = (normal + height) * cos(latitude) * cos(longitude);
    double observerEcfY = (normal + height) * cos(latitude) * sin(longitude);
    double observerEcfZ = ((normal * (1 - e2)) + height) * sin(latitude);

    for (int i = 0; i < satellites_count; i++)
    {
      for (int j = 0; j < dates_count; j++)
      {
        int position_index = (i * dates_count + j) * 3;
        double satelliteEcfX = ecf_positions[position_index];
        double satelliteEcfY = ecf_positions[position_index + 1];
        double satelliteEcfZ = ecf_positions[position_index + 2];

        double rx = satelliteEcfX - observerEcfX;
        double ry = satelliteEcfY - observerEcfY;
        double rz = satelliteEcfZ - observerEcfZ;

        double topS = ((sin(latitude) * cos(longitude) * rx) + (sin(latitude) * sin(longitude) * ry)) - (cos(latitude) * rz);

        double topE = (-sin(longitude) * rx) + (cos(longitude) * ry);

        double topZ = (cos(latitude) * cos(longitude) * rx) + (cos(latitude) * sin(longitude) * ry) + (sin(latitude) * rz);

        double rangeSat = sqrt((topS * topS) + (topE * topE) + (topZ * topZ));
        double El = asin(topZ / rangeSat);
        double Az = atan2(-topE, topS) + pi;

        look_angles[position_index] = Az;
        look_angles[position_index + 1] = El;
        look_angles[position_index + 2] = rangeSat;
      }
    }
  }

  void calculate_doppler_factor(double *__restrict ecf_positions, double *__restrict ecf_velocities, int satellites_count, int dates_count, double observer_ecf_x, double observer_ecf_y, double observer_ecf_z, double *__restrict doppler_factors)
  {
    double earthRotation = 7.292115E-5,
           c = 299792.458;
    for (int i = 0; i < satellites_count; i++)
    {
      for (int j = 0; j < dates_count; j++)
      {
        int doppler_factor_index = (i * dates_count + j);
        int position_velocity_index = doppler_factor_index * 3;
        double rangeX = ecf_positions[position_velocity_index] - observer_ecf_x;
        double rangeY = ecf_positions[position_velocity_index + 1] - observer_ecf_y;
        double rangeZ = ecf_positions[position_velocity_index + 2] - observer_ecf_z;

        double length = sqrt(rangeX * rangeX + rangeY * rangeY + rangeZ * rangeZ);
        double rangeVelX = ecf_velocities[position_velocity_index] + earthRotation * observer_ecf_y;
        double rangeVelY = ecf_velocities[position_velocity_index + 1] - earthRotation * observer_ecf_x;
        double rangeVelZ = ecf_velocities[position_velocity_index + 2];

        double rangeRate = (rangeX * rangeVelX + rangeY * rangeVelY + rangeZ * rangeVelZ) / length;

        doppler_factors[doppler_factor_index] = 1.0 - rangeRate / c;
      }
    }
  }

  void EMSCRIPTEN_KEEPALIVE compute(RunData* __restrict runData)
  {
    calculate_eci_base(
        runData->satellitesPointer,
        runData->satellitesCount,
        runData->jdaysPointer,
        runData->jdaysCount,
        runData->eciPositions,
        runData->eciVelocities,
        runData->sgp4Errors);

    if (runData->gmstEnabled)
    {
      calculate_gmst(
          runData->jdaysPointer,
          runData->jdaysCount,
          runData->gmstValues);
    }

    if (runData->ecfPositionEnabled)
    {
      calculate_ecf_position_or_velocity(
          runData->eciPositions,
          runData->satellitesCount,
          runData->gmstValues,
          runData->jdaysCount,
          runData->ecfPositions);
    }

    if (runData->ecfVelocityEnabled)
    {
      calculate_ecf_position_or_velocity(
          runData->eciVelocities,
          runData->satellitesCount,
          runData->gmstValues,
          runData->jdaysCount,
          runData->ecfVelocities);
    }

    if (runData->geodeticPositionEnabled)
    {
      calculate_geodetic_positions(
          runData->eciPositions,
          runData->satellitesCount,
          runData->gmstValues,
          runData->jdaysCount,
          runData->geodeticPositions);
    }

    if (runData->lookAnglesEnabled)
    {
      calculate_look_angles(
          runData->ecfPositions,
          runData->satellitesCount,
          runData->jdaysCount,
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
          runData->satellitesCount,
          runData->jdaysCount,
          runData->observerEcfX,
          runData->observerEcfY,
          runData->observerEcfZ,
          runData->dopplerFactors);
    }
  }
}