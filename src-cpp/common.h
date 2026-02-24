/**
 * This file contains common functions and structures used by different compilations of SGP4 to Bulk Propagator API.
 * 
 * It is included into base and pthreads builds.
 */

#include "SGP4.h"
#include "iostream"
#include "stdio.h"
#include <emscripten/emscripten.h>

#define pi 3.14159265358979323846

typedef struct {
  // inputs
  elsetrec *__restrict satellitesPointer;
  int satellitesCount;
  double *__restrict jdaysPointer;
  int jdaysCount;

  // outputs and output-specific parameters
  // ECI is enabled by default (no eciPositionEnabled flag)
  double *__restrict eciPositions;
  double *__restrict eciVelocities;
  int8_t *__restrict sgp4Errors;

  // keeping flags together to save struct memory space
  bool gmstEnabled;
  bool ecfPositionEnabled;
  bool ecfVelocityEnabled;
  bool geodeticPositionEnabled;
  bool lookAnglesEnabled;
  bool dopplerFactorEnabled;

  double *__restrict gmstValues;

  double *__restrict ecfPositions;

  double *__restrict ecfVelocities;

  double *__restrict geodeticPositions;

  double longitudeRadians;
  double latitudeRadians;
  double heightKm;
  double *__restrict lookAngles;

  double observerEcfX;
  double observerEcfY;
  double observerEcfZ;
  double *__restrict dopplerFactors;
} RunData;

extern "C"
{
  size_t EMSCRIPTEN_KEEPALIVE get_elsetrec_size();

  size_t EMSCRIPTEN_KEEPALIVE get_rundata_size();

  char *EMSCRIPTEN_KEEPALIVE create_elsetrec_struct_layout_string_pointer();

  char *EMSCRIPTEN_KEEPALIVE create_rundata_struct_layout_string_pointer();

  void EMSCRIPTEN_KEEPALIVE free_struct_layout_string(char *str);

  inline double jday_from_unix(double unix_ms);

  void EMSCRIPTEN_KEEPALIVE sgp4forJs(
      elsetrec &satrec, double jday,
      double r[3], double v[3], int8_t &error);

  void* EMSCRIPTEN_KEEPALIVE calloc_one(int size);
}

// Transform functions shared between base and pthreads builds.
// All functions accept start/end range parameters for both satellite and date
// dimensions, allowing partitioned execution across threads.
// The total dates_count parameter is used as stride for 2D output indexing.

void calculate_eci(
    elsetrec *__restrict satellites, int satellites_start, int satellites_end,
    double *__restrict jdays, int jdays_start, int jdays_end, int jdays_count,
    double *__restrict eci_positions, double *__restrict eci_velocities,
    int8_t *__restrict sgp4_errors);

void calculate_gmst(
    double *__restrict jdays, int jdays_start, int jdays_end,
    double *__restrict gmst_values);

void calculate_ecf_position_or_velocity(
    double *__restrict eci_vectors,
    int satellites_start, int satellites_end,
    double *__restrict gmst_values,
    int dates_start, int dates_end, int dates_count,
    double *__restrict ecf_vectors);

void calculate_geodetic_positions(
    double *__restrict eci_positions,
    int satellites_start, int satellites_end,
    double *__restrict gmst_values,
    int dates_start, int dates_end, int dates_count,
    double *__restrict geodetic_positions);

void calculate_look_angles(
    double *__restrict ecf_positions,
    int satellites_start, int satellites_end,
    int dates_start, int dates_end, int dates_count,
    double longitude, double latitude, double height,
    double *__restrict look_angles);

void calculate_doppler_factor(
    double *__restrict ecf_positions, double *__restrict ecf_velocities,
    int satellites_start, int satellites_end,
    int dates_start, int dates_end, int dates_count,
    double observer_ecf_x, double observer_ecf_y, double observer_ecf_z,
    double *__restrict doppler_factors);
