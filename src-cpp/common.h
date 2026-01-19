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
