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
  elsetrec* __restrict satellitesPointer;
  int satellitesCount;
  double* __restrict jdaysPointer;
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

  double observerEcfX;
  double observerEcfY;
  double observerEcfZ;
  double *__restrict dopplerFactors;
} RunData;

extern "C"
{
  size_t EMSCRIPTEN_KEEPALIVE get_elsetrec_size()
  {
    return sizeof(elsetrec);
  }

  size_t EMSCRIPTEN_KEEPALIVE get_rundata_size()
  {
    return sizeof(RunData);
  }

  char *EMSCRIPTEN_KEEPALIVE create_elsetrec_struct_layout_string_pointer()
  {
    elsetrec *zero_rec = ((elsetrec *)0);
    std::string result = "[";
    result += "[\"satnum\",\"char[]\"," + std::to_string(offsetof(elsetrec, satnum)) + "," + std::to_string(sizeof(zero_rec->satnum)) + "],";
    result += "[\"epochyr\",\"int\"," + std::to_string(offsetof(elsetrec, epochyr)) + "," + std::to_string(sizeof(zero_rec->epochyr)) + "],";
    result += "[\"epochtynumrev\",\"int\"," + std::to_string(offsetof(elsetrec, epochtynumrev)) + "," + std::to_string(sizeof(zero_rec->epochtynumrev)) + "],";
    result += "[\"error\",\"int\"," + std::to_string(offsetof(elsetrec, error)) + "," + std::to_string(sizeof(zero_rec->error)) + "],";
    result += "[\"operationmode\",\"char\"," + std::to_string(offsetof(elsetrec, operationmode)) + "," + std::to_string(sizeof(zero_rec->operationmode)) + "],";
    result += "[\"init\",\"char\"," + std::to_string(offsetof(elsetrec, init)) + "," + std::to_string(sizeof(zero_rec->init)) + "],";
    result += "[\"method\",\"char\"," + std::to_string(offsetof(elsetrec, method)) + "," + std::to_string(sizeof(zero_rec->method)) + "],";
    result += "[\"isimp\",\"int\"," + std::to_string(offsetof(elsetrec, isimp)) + "," + std::to_string(sizeof(zero_rec->isimp)) + "],";
    result += "[\"aycof\",\"double\"," + std::to_string(offsetof(elsetrec, aycof)) + "," + std::to_string(sizeof(zero_rec->aycof)) + "],";
    result += "[\"con41\",\"double\"," + std::to_string(offsetof(elsetrec, con41)) + "," + std::to_string(sizeof(zero_rec->con41)) + "],";
    result += "[\"cc1\",\"double\"," + std::to_string(offsetof(elsetrec, cc1)) + "," + std::to_string(sizeof(zero_rec->cc1)) + "],";
    result += "[\"cc4\",\"double\"," + std::to_string(offsetof(elsetrec, cc4)) + "," + std::to_string(sizeof(zero_rec->cc4)) + "],";
    result += "[\"cc5\",\"double\"," + std::to_string(offsetof(elsetrec, cc5)) + "," + std::to_string(sizeof(zero_rec->cc5)) + "],";
    result += "[\"d2\",\"double\"," + std::to_string(offsetof(elsetrec, d2)) + "," + std::to_string(sizeof(zero_rec->d2)) + "],";
    result += "[\"d3\",\"double\"," + std::to_string(offsetof(elsetrec, d3)) + "," + std::to_string(sizeof(zero_rec->d3)) + "],";
    result += "[\"d4\",\"double\"," + std::to_string(offsetof(elsetrec, d4)) + "," + std::to_string(sizeof(zero_rec->d4)) + "],";
    result += "[\"delmo\",\"double\"," + std::to_string(offsetof(elsetrec, delmo)) + "," + std::to_string(sizeof(zero_rec->delmo)) + "],";
    result += "[\"eta\",\"double\"," + std::to_string(offsetof(elsetrec, eta)) + "," + std::to_string(sizeof(zero_rec->eta)) + "],";
    result += "[\"argpdot\",\"double\"," + std::to_string(offsetof(elsetrec, argpdot)) + "," + std::to_string(sizeof(zero_rec->argpdot)) + "],";
    result += "[\"omgcof\",\"double\"," + std::to_string(offsetof(elsetrec, omgcof)) + "," + std::to_string(sizeof(zero_rec->omgcof)) + "],";
    result += "[\"sinmao\",\"double\"," + std::to_string(offsetof(elsetrec, sinmao)) + "," + std::to_string(sizeof(zero_rec->sinmao)) + "],";
    result += "[\"t\",\"double\"," + std::to_string(offsetof(elsetrec, t)) + "," + std::to_string(sizeof(zero_rec->t)) + "],";
    result += "[\"t2cof\",\"double\"," + std::to_string(offsetof(elsetrec, t2cof)) + "," + std::to_string(sizeof(zero_rec->t2cof)) + "],";
    result += "[\"t3cof\",\"double\"," + std::to_string(offsetof(elsetrec, t3cof)) + "," + std::to_string(sizeof(zero_rec->t3cof)) + "],";
    result += "[\"t4cof\",\"double\"," + std::to_string(offsetof(elsetrec, t4cof)) + "," + std::to_string(sizeof(zero_rec->t4cof)) + "],";
    result += "[\"t5cof\",\"double\"," + std::to_string(offsetof(elsetrec, t5cof)) + "," + std::to_string(sizeof(zero_rec->t5cof)) + "],";
    result += "[\"x1mth2\",\"double\"," + std::to_string(offsetof(elsetrec, x1mth2)) + "," + std::to_string(sizeof(zero_rec->x1mth2)) + "],";
    result += "[\"x7thm1\",\"double\"," + std::to_string(offsetof(elsetrec, x7thm1)) + "," + std::to_string(sizeof(zero_rec->x7thm1)) + "],";
    result += "[\"mdot\",\"double\"," + std::to_string(offsetof(elsetrec, mdot)) + "," + std::to_string(sizeof(zero_rec->mdot)) + "],";
    result += "[\"nodedot\",\"double\"," + std::to_string(offsetof(elsetrec, nodedot)) + "," + std::to_string(sizeof(zero_rec->nodedot)) + "],";
    result += "[\"xlcof\",\"double\"," + std::to_string(offsetof(elsetrec, xlcof)) + "," + std::to_string(sizeof(zero_rec->xlcof)) + "],";
    result += "[\"xmcof\",\"double\"," + std::to_string(offsetof(elsetrec, xmcof)) + "," + std::to_string(sizeof(zero_rec->xmcof)) + "],";
    result += "[\"nodecf\",\"double\"," + std::to_string(offsetof(elsetrec, nodecf)) + "," + std::to_string(sizeof(zero_rec->nodecf)) + "],";
    result += "[\"irez\",\"int\"," + std::to_string(offsetof(elsetrec, irez)) + "," + std::to_string(sizeof(zero_rec->irez)) + "],";
    result += "[\"d2201\",\"double\"," + std::to_string(offsetof(elsetrec, d2201)) + "," + std::to_string(sizeof(zero_rec->d2201)) + "],";
    result += "[\"d2211\",\"double\"," + std::to_string(offsetof(elsetrec, d2211)) + "," + std::to_string(sizeof(zero_rec->d2211)) + "],";
    result += "[\"d3210\",\"double\"," + std::to_string(offsetof(elsetrec, d3210)) + "," + std::to_string(sizeof(zero_rec->d3210)) + "],";
    result += "[\"d3222\",\"double\"," + std::to_string(offsetof(elsetrec, d3222)) + "," + std::to_string(sizeof(zero_rec->d3222)) + "],";
    result += "[\"d4410\",\"double\"," + std::to_string(offsetof(elsetrec, d4410)) + "," + std::to_string(sizeof(zero_rec->d4410)) + "],";
    result += "[\"d4422\",\"double\"," + std::to_string(offsetof(elsetrec, d4422)) + "," + std::to_string(sizeof(zero_rec->d4422)) + "],";
    result += "[\"d5220\",\"double\"," + std::to_string(offsetof(elsetrec, d5220)) + "," + std::to_string(sizeof(zero_rec->d5220)) + "],";
    result += "[\"d5232\",\"double\"," + std::to_string(offsetof(elsetrec, d5232)) + "," + std::to_string(sizeof(zero_rec->d5232)) + "],";
    result += "[\"d5421\",\"double\"," + std::to_string(offsetof(elsetrec, d5421)) + "," + std::to_string(sizeof(zero_rec->d5421)) + "],";
    result += "[\"d5433\",\"double\"," + std::to_string(offsetof(elsetrec, d5433)) + "," + std::to_string(sizeof(zero_rec->d5433)) + "],";
    result += "[\"dedt\",\"double\"," + std::to_string(offsetof(elsetrec, dedt)) + "," + std::to_string(sizeof(zero_rec->dedt)) + "],";
    result += "[\"del1\",\"double\"," + std::to_string(offsetof(elsetrec, del1)) + "," + std::to_string(sizeof(zero_rec->del1)) + "],";
    result += "[\"del2\",\"double\"," + std::to_string(offsetof(elsetrec, del2)) + "," + std::to_string(sizeof(zero_rec->del2)) + "],";
    result += "[\"del3\",\"double\"," + std::to_string(offsetof(elsetrec, del3)) + "," + std::to_string(sizeof(zero_rec->del3)) + "],";
    result += "[\"didt\",\"double\"," + std::to_string(offsetof(elsetrec, didt)) + "," + std::to_string(sizeof(zero_rec->didt)) + "],";
    result += "[\"dmdt\",\"double\"," + std::to_string(offsetof(elsetrec, dmdt)) + "," + std::to_string(sizeof(zero_rec->dmdt)) + "],";
    result += "[\"dnodt\",\"double\"," + std::to_string(offsetof(elsetrec, dnodt)) + "," + std::to_string(sizeof(zero_rec->dnodt)) + "],";
    result += "[\"domdt\",\"double\"," + std::to_string(offsetof(elsetrec, domdt)) + "," + std::to_string(sizeof(zero_rec->domdt)) + "],";
    result += "[\"e3\",\"double\"," + std::to_string(offsetof(elsetrec, e3)) + "," + std::to_string(sizeof(zero_rec->e3)) + "],";
    result += "[\"ee2\",\"double\"," + std::to_string(offsetof(elsetrec, ee2)) + "," + std::to_string(sizeof(zero_rec->ee2)) + "],";
    result += "[\"peo\",\"double\"," + std::to_string(offsetof(elsetrec, peo)) + "," + std::to_string(sizeof(zero_rec->peo)) + "],";
    result += "[\"pgho\",\"double\"," + std::to_string(offsetof(elsetrec, pgho)) + "," + std::to_string(sizeof(zero_rec->pgho)) + "],";
    result += "[\"pho\",\"double\"," + std::to_string(offsetof(elsetrec, pho)) + "," + std::to_string(sizeof(zero_rec->pho)) + "],";
    result += "[\"pinco\",\"double\"," + std::to_string(offsetof(elsetrec, pinco)) + "," + std::to_string(sizeof(zero_rec->pinco)) + "],";
    result += "[\"plo\",\"double\"," + std::to_string(offsetof(elsetrec, plo)) + "," + std::to_string(sizeof(zero_rec->plo)) + "],";
    result += "[\"se2\",\"double\"," + std::to_string(offsetof(elsetrec, se2)) + "," + std::to_string(sizeof(zero_rec->se2)) + "],";
    result += "[\"se3\",\"double\"," + std::to_string(offsetof(elsetrec, se3)) + "," + std::to_string(sizeof(zero_rec->se3)) + "],";
    result += "[\"sgh2\",\"double\"," + std::to_string(offsetof(elsetrec, sgh2)) + "," + std::to_string(sizeof(zero_rec->sgh2)) + "],";
    result += "[\"sgh3\",\"double\"," + std::to_string(offsetof(elsetrec, sgh3)) + "," + std::to_string(sizeof(zero_rec->sgh3)) + "],";
    result += "[\"sgh4\",\"double\"," + std::to_string(offsetof(elsetrec, sgh4)) + "," + std::to_string(sizeof(zero_rec->sgh4)) + "],";
    result += "[\"sh2\",\"double\"," + std::to_string(offsetof(elsetrec, sh2)) + "," + std::to_string(sizeof(zero_rec->sh2)) + "],";
    result += "[\"sh3\",\"double\"," + std::to_string(offsetof(elsetrec, sh3)) + "," + std::to_string(sizeof(zero_rec->sh3)) + "],";
    result += "[\"si2\",\"double\"," + std::to_string(offsetof(elsetrec, si2)) + "," + std::to_string(sizeof(zero_rec->si2)) + "],";
    result += "[\"si3\",\"double\"," + std::to_string(offsetof(elsetrec, si3)) + "," + std::to_string(sizeof(zero_rec->si3)) + "],";
    result += "[\"sl2\",\"double\"," + std::to_string(offsetof(elsetrec, sl2)) + "," + std::to_string(sizeof(zero_rec->sl2)) + "],";
    result += "[\"sl3\",\"double\"," + std::to_string(offsetof(elsetrec, sl3)) + "," + std::to_string(sizeof(zero_rec->sl3)) + "],";
    result += "[\"sl4\",\"double\"," + std::to_string(offsetof(elsetrec, sl4)) + "," + std::to_string(sizeof(zero_rec->sl4)) + "],";
    result += "[\"gsto\",\"double\"," + std::to_string(offsetof(elsetrec, gsto)) + "," + std::to_string(sizeof(zero_rec->gsto)) + "],";
    result += "[\"xfact\",\"double\"," + std::to_string(offsetof(elsetrec, xfact)) + "," + std::to_string(sizeof(zero_rec->xfact)) + "],";
    result += "[\"xgh2\",\"double\"," + std::to_string(offsetof(elsetrec, xgh2)) + "," + std::to_string(sizeof(zero_rec->xgh2)) + "],";
    result += "[\"xgh3\",\"double\"," + std::to_string(offsetof(elsetrec, xgh3)) + "," + std::to_string(sizeof(zero_rec->xgh3)) + "],";
    result += "[\"xgh4\",\"double\"," + std::to_string(offsetof(elsetrec, xgh4)) + "," + std::to_string(sizeof(zero_rec->xgh4)) + "],";
    result += "[\"xh2\",\"double\"," + std::to_string(offsetof(elsetrec, xh2)) + "," + std::to_string(sizeof(zero_rec->xh2)) + "],";
    result += "[\"xh3\",\"double\"," + std::to_string(offsetof(elsetrec, xh3)) + "," + std::to_string(sizeof(zero_rec->xh3)) + "],";
    result += "[\"xi2\",\"double\"," + std::to_string(offsetof(elsetrec, xi2)) + "," + std::to_string(sizeof(zero_rec->xi2)) + "],";
    result += "[\"xi3\",\"double\"," + std::to_string(offsetof(elsetrec, xi3)) + "," + std::to_string(sizeof(zero_rec->xi3)) + "],";
    result += "[\"xl2\",\"double\"," + std::to_string(offsetof(elsetrec, xl2)) + "," + std::to_string(sizeof(zero_rec->xl2)) + "],";
    result += "[\"xl3\",\"double\"," + std::to_string(offsetof(elsetrec, xl3)) + "," + std::to_string(sizeof(zero_rec->xl3)) + "],";
    result += "[\"xl4\",\"double\"," + std::to_string(offsetof(elsetrec, xl4)) + "," + std::to_string(sizeof(zero_rec->xl4)) + "],";
    result += "[\"xlamo\",\"double\"," + std::to_string(offsetof(elsetrec, xlamo)) + "," + std::to_string(sizeof(zero_rec->xlamo)) + "],";
    result += "[\"zmol\",\"double\"," + std::to_string(offsetof(elsetrec, zmol)) + "," + std::to_string(sizeof(zero_rec->zmol)) + "],";
    result += "[\"zmos\",\"double\"," + std::to_string(offsetof(elsetrec, zmos)) + "," + std::to_string(sizeof(zero_rec->zmos)) + "],";
    result += "[\"atime\",\"double\"," + std::to_string(offsetof(elsetrec, atime)) + "," + std::to_string(sizeof(zero_rec->atime)) + "],";
    result += "[\"xli\",\"double\"," + std::to_string(offsetof(elsetrec, xli)) + "," + std::to_string(sizeof(zero_rec->xli)) + "],";
    result += "[\"xni\",\"double\"," + std::to_string(offsetof(elsetrec, xni)) + "," + std::to_string(sizeof(zero_rec->xni)) + "],";
    result += "[\"a\",\"double\"," + std::to_string(offsetof(elsetrec, a)) + "," + std::to_string(sizeof(zero_rec->a)) + "],";
    result += "[\"altp\",\"double\"," + std::to_string(offsetof(elsetrec, altp)) + "," + std::to_string(sizeof(zero_rec->altp)) + "],";
    result += "[\"alta\",\"double\"," + std::to_string(offsetof(elsetrec, alta)) + "," + std::to_string(sizeof(zero_rec->alta)) + "],";
    result += "[\"epochdays\",\"double\"," + std::to_string(offsetof(elsetrec, epochdays)) + "," + std::to_string(sizeof(zero_rec->epochdays)) + "],";
    result += "[\"jdsatepoch\",\"double\"," + std::to_string(offsetof(elsetrec, jdsatepoch)) + "," + std::to_string(sizeof(zero_rec->jdsatepoch)) + "],";
    result += "[\"jdsatepochF\",\"double\"," + std::to_string(offsetof(elsetrec, jdsatepochF)) + "," + std::to_string(sizeof(zero_rec->jdsatepochF)) + "],";
    result += "[\"nddot\",\"double\"," + std::to_string(offsetof(elsetrec, nddot)) + "," + std::to_string(sizeof(zero_rec->nddot)) + "],";
    result += "[\"ndot\",\"double\"," + std::to_string(offsetof(elsetrec, ndot)) + "," + std::to_string(sizeof(zero_rec->ndot)) + "],";
    result += "[\"bstar\",\"double\"," + std::to_string(offsetof(elsetrec, bstar)) + "," + std::to_string(sizeof(zero_rec->bstar)) + "],";
    result += "[\"rcse\",\"double\"," + std::to_string(offsetof(elsetrec, rcse)) + "," + std::to_string(sizeof(zero_rec->rcse)) + "],";
    result += "[\"inclo\",\"double\"," + std::to_string(offsetof(elsetrec, inclo)) + "," + std::to_string(sizeof(zero_rec->inclo)) + "],";
    result += "[\"nodeo\",\"double\"," + std::to_string(offsetof(elsetrec, nodeo)) + "," + std::to_string(sizeof(zero_rec->nodeo)) + "],";
    result += "[\"ecco\",\"double\"," + std::to_string(offsetof(elsetrec, ecco)) + "," + std::to_string(sizeof(zero_rec->ecco)) + "],";
    result += "[\"argpo\",\"double\"," + std::to_string(offsetof(elsetrec, argpo)) + "," + std::to_string(sizeof(zero_rec->argpo)) + "],";
    result += "[\"mo\",\"double\"," + std::to_string(offsetof(elsetrec, mo)) + "," + std::to_string(sizeof(zero_rec->mo)) + "],";
    result += "[\"no_kozai\",\"double\"," + std::to_string(offsetof(elsetrec, no_kozai)) + "," + std::to_string(sizeof(zero_rec->no_kozai)) + "],";
    result += "[\"classification\",\"char\"," + std::to_string(offsetof(elsetrec, classification)) + "," + std::to_string(sizeof(zero_rec->classification)) + "],";
    result += "[\"intldesg\",\"char[]\"," + std::to_string(offsetof(elsetrec, intldesg)) + "," + std::to_string(sizeof(zero_rec->intldesg)) + "],";
    result += "[\"ephtype\",\"int\"," + std::to_string(offsetof(elsetrec, ephtype)) + "," + std::to_string(sizeof(zero_rec->ephtype)) + "],";
    result += "[\"elnum\",\"long\"," + std::to_string(offsetof(elsetrec, elnum)) + "," + std::to_string(sizeof(zero_rec->elnum)) + "],";
    result += "[\"revnum\",\"long\"," + std::to_string(offsetof(elsetrec, revnum)) + "," + std::to_string(sizeof(zero_rec->revnum)) + "],";
    result += "[\"no_unkozai\",\"double\"," + std::to_string(offsetof(elsetrec, no_unkozai)) + "," + std::to_string(sizeof(zero_rec->no_unkozai)) + "],";
    result += "[\"am\",\"double\"," + std::to_string(offsetof(elsetrec, am)) + "," + std::to_string(sizeof(zero_rec->am)) + "],";
    result += "[\"em\",\"double\"," + std::to_string(offsetof(elsetrec, em)) + "," + std::to_string(sizeof(zero_rec->em)) + "],";
    result += "[\"im\",\"double\"," + std::to_string(offsetof(elsetrec, im)) + "," + std::to_string(sizeof(zero_rec->im)) + "],";
    result += "[\"Om\",\"double\"," + std::to_string(offsetof(elsetrec, Om)) + "," + std::to_string(sizeof(zero_rec->Om)) + "],";
    result += "[\"om\",\"double\"," + std::to_string(offsetof(elsetrec, om)) + "," + std::to_string(sizeof(zero_rec->om)) + "],";
    result += "[\"mm\",\"double\"," + std::to_string(offsetof(elsetrec, mm)) + "," + std::to_string(sizeof(zero_rec->mm)) + "],";
    result += "[\"nm\",\"double\"," + std::to_string(offsetof(elsetrec, nm)) + "," + std::to_string(sizeof(zero_rec->nm)) + "],";
    result += "[\"tumin\",\"double\"," + std::to_string(offsetof(elsetrec, tumin)) + "," + std::to_string(sizeof(zero_rec->tumin)) + "],";
    result += "[\"mus\",\"double\"," + std::to_string(offsetof(elsetrec, mus)) + "," + std::to_string(sizeof(zero_rec->mus)) + "],";
    result += "[\"radiusearthkm\",\"double\"," + std::to_string(offsetof(elsetrec, radiusearthkm)) + "," + std::to_string(sizeof(zero_rec->radiusearthkm)) + "],";
    result += "[\"xke\",\"double\"," + std::to_string(offsetof(elsetrec, xke)) + "," + std::to_string(sizeof(zero_rec->xke)) + "],";
    result += "[\"j2\",\"double\"," + std::to_string(offsetof(elsetrec, j2)) + "," + std::to_string(sizeof(zero_rec->j2)) + "],";
    result += "[\"j3\",\"double\"," + std::to_string(offsetof(elsetrec, j3)) + "," + std::to_string(sizeof(zero_rec->j3)) + "],";
    result += "[\"j4\",\"double\"," + std::to_string(offsetof(elsetrec, j4)) + "," + std::to_string(sizeof(zero_rec->j4)) + "],";
    result += "[\"j3oj2\",\"double\"," + std::to_string(offsetof(elsetrec, j3oj2)) + "," + std::to_string(sizeof(zero_rec->j3oj2)) + "],";
    result += "[\"dia_mm\",\"long\"," + std::to_string(offsetof(elsetrec, dia_mm)) + "," + std::to_string(sizeof(zero_rec->dia_mm)) + "],";
    result += "[\"period_sec\",\"double\"," + std::to_string(offsetof(elsetrec, period_sec)) + "," + std::to_string(sizeof(zero_rec->period_sec)) + "],";
    result += "[\"active\",\"unsigned char\"," + std::to_string(offsetof(elsetrec, active)) + "," + std::to_string(sizeof(zero_rec->active)) + "],";
    result += "[\"not_orbital\",\"unsigned char\"," + std::to_string(offsetof(elsetrec, not_orbital)) + "," + std::to_string(sizeof(zero_rec->not_orbital)) + "],";
    result += "[\"rcs_m2\",\"double\"," + std::to_string(offsetof(elsetrec, rcs_m2)) + "," + std::to_string(sizeof(zero_rec->rcs_m2)) + "]";
    result += "]";

    char *return_string = new char[result.length() + 1];
    std::strcpy(return_string, result.c_str());

    return return_string;
  }

  char *EMSCRIPTEN_KEEPALIVE create_run_data_struct_layout_string_pointer()
  {
    RunData *zero_rec = ((RunData *)0);
    std::string result = "[";

    result += "[\"satellitesPointer\",\"int\"," + std::to_string(offsetof(RunData, satellitesPointer)) + "," + std::to_string(sizeof(zero_rec->satellitesPointer)) + "],";
    result += "[\"satellitesCount\",\"int\"," + std::to_string(offsetof(RunData, satellitesCount)) + "," + std::to_string(sizeof(zero_rec->satellitesCount)) + "],";
    result += "[\"jdaysPointer\",\"int\"," + std::to_string(offsetof(RunData, jdaysPointer)) + "," + std::to_string(sizeof(zero_rec->jdaysPointer)) + "],";
    result += "[\"jdaysCount\",\"int\"," + std::to_string(offsetof(RunData, jdaysCount)) + "," + std::to_string(sizeof(zero_rec->jdaysCount)) + "],";

    result += "[\"eciPositions\",\"int\"," + std::to_string(offsetof(RunData, eciPositions)) + "," + std::to_string(sizeof(zero_rec->eciPositions)) + "],";
    result += "[\"eciVelocities\",\"int\"," + std::to_string(offsetof(RunData, eciVelocities)) + "," + std::to_string(sizeof(zero_rec->eciVelocities)) + "],";
    result += "[\"sgp4Errors\",\"int\"," + std::to_string(offsetof(RunData, sgp4Errors)) + "," + std::to_string(sizeof(zero_rec->sgp4Errors)) + "],";

    result += "[\"gmstEnabled\",\"bool\"," + std::to_string(offsetof(RunData, gmstEnabled)) + "," + std::to_string(sizeof(zero_rec->gmstEnabled)) + "],";
    result += "[\"gmstValues\",\"int\"," + std::to_string(offsetof(RunData, gmstValues)) + "," + std::to_string(sizeof(zero_rec->gmstValues)) + "],";

    result += "[\"ecfPositionEnabled\",\"bool\"," + std::to_string(offsetof(RunData, ecfPositionEnabled)) + "," + std::to_string(sizeof(zero_rec->ecfPositionEnabled)) + "],";
    result += "[\"ecfPositions\",\"int\"," + std::to_string(offsetof(RunData, ecfPositions)) + "," + std::to_string(sizeof(zero_rec->ecfPositions)) + "],";

    result += "[\"ecfVelocityEnabled\",\"bool\"," + std::to_string(offsetof(RunData, ecfVelocityEnabled)) + "," + std::to_string(sizeof(zero_rec->ecfVelocityEnabled)) + "],";
    result += "[\"ecfVelocities\",\"int\"," + std::to_string(offsetof(RunData, ecfVelocities)) + "," + std::to_string(sizeof(zero_rec->ecfVelocities)) + "],";

    result += "[\"geodeticPositionEnabled\",\"bool\"," + std::to_string(offsetof(RunData, geodeticPositionEnabled)) + "," + std::to_string(sizeof(zero_rec->geodeticPositionEnabled)) + "],";
    result += "[\"geodeticPositions\",\"int\"," + std::to_string(offsetof(RunData, geodeticPositions)) + "," + std::to_string(sizeof(zero_rec->geodeticPositions)) + "],";

    result += "[\"lookAnglesEnabled\",\"bool\"," + std::to_string(offsetof(RunData, lookAnglesEnabled)) + "," + std::to_string(sizeof(zero_rec->lookAnglesEnabled)) + "],";
    result += "[\"longitudeRadians\",\"double\"," + std::to_string(offsetof(RunData, longitudeRadians)) + "," + std::to_string(sizeof(zero_rec->longitudeRadians)) + "],";
    result += "[\"latitudeRadians\",\"double\"," + std::to_string(offsetof(RunData, latitudeRadians)) + "," + std::to_string(sizeof(zero_rec->latitudeRadians)) + "],";
    result += "[\"heightKm\",\"double\"," + std::to_string(offsetof(RunData, heightKm)) + "," + std::to_string(sizeof(zero_rec->heightKm)) + "],";

    result += "[\"dopplerFactorEnabled\",\"bool\"," + std::to_string(offsetof(RunData, dopplerFactorEnabled)) + "," + std::to_string(sizeof(zero_rec->dopplerFactorEnabled)) + "],";
    result += "[\"observerEcfX\",\"double\"," + std::to_string(offsetof(RunData, observerEcfX)) + "," + std::to_string(sizeof(zero_rec->observerEcfX)) + "],";
    result += "[\"observerEcfY\",\"double\"," + std::to_string(offsetof(RunData, observerEcfY)) + "," + std::to_string(sizeof(zero_rec->observerEcfY)) + "],";
    result += "[\"observerEcfZ\",\"double\"," + std::to_string(offsetof(RunData, observerEcfZ)) + "," + std::to_string(sizeof(zero_rec->observerEcfZ)) + "],";
    result += "[\"dopplerFactors\",\"int\"," + std::to_string(offsetof(RunData, dopplerFactors)) + "," + std::to_string(sizeof(zero_rec->dopplerFactors)) + "]";

    result += "]";

    char *return_string = new char[result.length() + 1];
    std::strcpy(return_string, result.c_str());

    return return_string;
  }

  void EMSCRIPTEN_KEEPALIVE free_struct_layout_string(char *str)
  {
    delete[] str;
  }

  inline double jday_from_unix(double unix_ms)
  {
    return (unix_ms / 1000.0 / 86400.0) + 2440587.5;
  }

  // sgp4forJs function is a modified version of the original sgp4 function
  // based on SGP4 Version 2020-07-13

  // changes from the original sgp4 function:
  // 1. tsince parameter is replaced with unix_ms
  // and local tsince is calculated from unix_ms and satrec.jdsatepoch(F)
  // 2. returns void instead of boolean indicating propagation success
  // 3. `if (mrt < 1.0)` check was moved into a place right after `mrt` calculation, instead of the very end of the sgp4 function.
  void EMSCRIPTEN_KEEPALIVE sgp4forJs(
      elsetrec &satrec, double jday,
      double r[3], double v[3], int8_t &error)
  {
    double am, axnl, aynl, betal, cosim, cnod,
        cos2u, coseo1, cosi, cosip, cosisq, cossu, cosu,
        delm, delomg, em, emsq, ecose, el2, eo1,
        ep, esine, argpm, argpp, argpdf, pl, mrt = 0.0,
                                             mvt, rdotl, rl, rvdot, rvdotl, sinim,
                                             sin2u, sineo1, sini, sinip, sinsu, sinu,
                                             snod, su, t2, t3, t4, tem5, temp,
                                             temp1, temp2, tempa, tempe, templ, u, ux,
                                             uy, uz, vx, vy, vz, inclm, mm,
                                             nm, nodem, xinc, xincp, xl, xlm, mp,
                                             xmdf, xmx, xmy, nodedf, xnode, nodep, tc, dndt,
                                             twopi, x2o3, vkmpersec, delmtemp;
    int ktr;

    double tsince = (jday - (satrec.jdsatepoch + satrec.jdsatepochF)) * 1440.0;

    /* ------------------ set mathematical constants --------------- */
    // sgp4fix divisor for divide by zero check on inclination
    // the old check used 1.0 + cos(pi-1.0e-9), but then compared it to
    // 1.5 e-12, so the threshold was changed to 1.5e-12 for consistency
    const double temp4 = 1.5e-12;
    twopi = 2.0 * pi;
    x2o3 = 2.0 / 3.0;
    // sgp4fix identify constants and allow alternate values
    // getgravconst( whichconst, tumin, mu, radiusearthkm, xke, j2, j3, j4, j3oj2 );
    vkmpersec = satrec.radiusearthkm * satrec.xke / 60.0;

    /* --------------------- clear sgp4 error flag ----------------- */
    satrec.t = tsince;
    satrec.error = 0;

    /* ------- update for secular gravity and atmospheric drag ----- */
    xmdf = satrec.mo + satrec.mdot * satrec.t;
    argpdf = satrec.argpo + satrec.argpdot * satrec.t;
    nodedf = satrec.nodeo + satrec.nodedot * satrec.t;
    argpm = argpdf;
    mm = xmdf;
    t2 = satrec.t * satrec.t;
    nodem = nodedf + satrec.nodecf * t2;
    tempa = 1.0 - satrec.cc1 * satrec.t;
    tempe = satrec.bstar * satrec.cc4 * satrec.t;
    templ = satrec.t2cof * t2;

    if (satrec.isimp != 1)
    {
      delomg = satrec.omgcof * satrec.t;
      // sgp4fix use mutliply for speed instead of pow
      delmtemp = 1.0 + satrec.eta * cos(xmdf);
      delm = satrec.xmcof *
             (delmtemp * delmtemp * delmtemp -
              satrec.delmo);
      temp = delomg + delm;
      mm = xmdf + temp;
      argpm = argpdf - temp;
      t3 = t2 * satrec.t;
      t4 = t3 * satrec.t;
      tempa = tempa - satrec.d2 * t2 - satrec.d3 * t3 -
              satrec.d4 * t4;
      tempe = tempe + satrec.bstar * satrec.cc5 * (sin(mm) - satrec.sinmao);
      templ = templ + satrec.t3cof * t3 + t4 * (satrec.t4cof + satrec.t * satrec.t5cof);
    }

    nm = satrec.no_unkozai;
    em = satrec.ecco;
    inclm = satrec.inclo;
    if (satrec.method == 'd')
    {
      tc = satrec.t;
      SGP4Funcs::dspace(
          satrec.irez,
          satrec.d2201, satrec.d2211, satrec.d3210,
          satrec.d3222, satrec.d4410, satrec.d4422,
          satrec.d5220, satrec.d5232, satrec.d5421,
          satrec.d5433, satrec.dedt, satrec.del1,
          satrec.del2, satrec.del3, satrec.didt,
          satrec.dmdt, satrec.dnodt, satrec.domdt,
          satrec.argpo, satrec.argpdot, satrec.t, tc,
          satrec.gsto, satrec.xfact, satrec.xlamo,
          satrec.no_unkozai, satrec.atime,
          em, argpm, inclm, satrec.xli, mm, satrec.xni,
          nodem, dndt, nm);
    } // if method = d

    if (nm <= 0.0)
    {
      //         printf("# error nm %f\n", nm);
      error = 2;
      // sgp4fix add return
      return;
    }
    am = pow((satrec.xke / nm), x2o3) * tempa * tempa;
    nm = satrec.xke / pow(am, 1.5);
    em = em - tempe;

    // fix tolerance for error recognition
    // sgp4fix am is fixed from the previous nm check
    if ((em >= 1.0) || (em < -0.001) /* || (am < 0.95)*/)
    {
      //         printf("# error em %f\n", em);
      error = 1;
      // sgp4fix to return if there is an error in eccentricity
      return;
    }
    // sgp4fix fix tolerance to avoid a divide by zero
    if (em < 1.0e-6)
      em = 1.0e-6;
    mm = mm + satrec.no_unkozai * templ;
    xlm = mm + argpm + nodem;
    emsq = em * em;
    temp = 1.0 - emsq;

    nodem = fmod(nodem, twopi);
    argpm = fmod(argpm, twopi);
    xlm = fmod(xlm, twopi);
    mm = fmod(xlm - argpm - nodem, twopi);

    // sgp4fix recover singly averaged mean elements
    satrec.am = am;
    satrec.em = em;
    satrec.im = inclm;
    satrec.Om = nodem;
    satrec.om = argpm;
    satrec.mm = mm;
    satrec.nm = nm;

    /* ----------------- compute extra mean quantities ------------- */
    sinim = sin(inclm);
    cosim = cos(inclm);

    /* -------------------- add lunar-solar periodics -------------- */
    ep = em;
    xincp = inclm;
    argpp = argpm;
    nodep = nodem;
    mp = mm;
    sinip = sinim;
    cosip = cosim;
    if (satrec.method == 'd')
    {
      SGP4Funcs::dpper(
          satrec.e3, satrec.ee2, satrec.peo,
          satrec.pgho, satrec.pho, satrec.pinco,
          satrec.plo, satrec.se2, satrec.se3,
          satrec.sgh2, satrec.sgh3, satrec.sgh4,
          satrec.sh2, satrec.sh3, satrec.si2,
          satrec.si3, satrec.sl2, satrec.sl3,
          satrec.sl4, satrec.t, satrec.xgh2,
          satrec.xgh3, satrec.xgh4, satrec.xh2,
          satrec.xh3, satrec.xi2, satrec.xi3,
          satrec.xl2, satrec.xl3, satrec.xl4,
          satrec.zmol, satrec.zmos, satrec.inclo,
          'n', ep, xincp, nodep, argpp, mp, satrec.operationmode);
      if (xincp < 0.0)
      {
        xincp = -xincp;
        nodep = nodep + pi;
        argpp = argpp - pi;
      }
      if ((ep < 0.0) || (ep > 1.0))
      {
        //            printf("# error ep %f\n", ep);
        error = 3;
        // sgp4fix add return
        return;
      }
    } // if method = d

    /* -------------------- long period periodics ------------------ */
    if (satrec.method == 'd')
    {
      sinip = sin(xincp);
      cosip = cos(xincp);
      satrec.aycof = -0.5 * satrec.j3oj2 * sinip;
      // sgp4fix for divide by zero for xincp = 180 deg
      if (fabs(cosip + 1.0) > 1.5e-12)
        satrec.xlcof = -0.25 * satrec.j3oj2 * sinip * (3.0 + 5.0 * cosip) / (1.0 + cosip);
      else
        satrec.xlcof = -0.25 * satrec.j3oj2 * sinip * (3.0 + 5.0 * cosip) / temp4;
    }
    axnl = ep * cos(argpp);
    temp = 1.0 / (am * (1.0 - ep * ep));
    aynl = ep * sin(argpp) + temp * satrec.aycof;
    xl = mp + argpp + nodep + temp * satrec.xlcof * axnl;

    /* --------------------- solve kepler's equation --------------- */
    u = fmod(xl - nodep, twopi);
    eo1 = u;
    tem5 = 9999.9;
    ktr = 1;
    //   sgp4fix for kepler iteration
    //   the following iteration needs better limits on corrections
    while ((fabs(tem5) >= 1.0e-12) && (ktr <= 10))
    {
      sineo1 = sin(eo1);
      coseo1 = cos(eo1);
      tem5 = 1.0 - coseo1 * axnl - sineo1 * aynl;
      tem5 = (u - aynl * coseo1 + axnl * sineo1 - eo1) / tem5;
      if (fabs(tem5) >= 0.95)
        tem5 = tem5 > 0.0 ? 0.95 : -0.95;
      eo1 = eo1 + tem5;
      ktr = ktr + 1;
    }

    /* ------------- short period preliminary quantities ----------- */
    ecose = axnl * coseo1 + aynl * sineo1;
    esine = axnl * sineo1 - aynl * coseo1;
    el2 = axnl * axnl + aynl * aynl;
    pl = am * (1.0 - el2);
    if (pl < 0.0)
    {
      //         printf("# error pl %f\n", pl);
      error = 4;
      // sgp4fix add return
      return;
    }
    else
    {
      rl = am * (1.0 - ecose);
      rdotl = sqrt(am) * esine / rl;
      rvdotl = sqrt(pl) / rl;
      betal = sqrt(1.0 - el2);
      temp = esine / (1.0 + betal);
      sinu = am / rl * (sineo1 - aynl - axnl * temp);
      cosu = am / rl * (coseo1 - axnl + aynl * temp);
      su = atan2(sinu, cosu);
      sin2u = (cosu + cosu) * sinu;
      cos2u = 1.0 - 2.0 * sinu * sinu;
      temp = 1.0 / pl;
      temp1 = 0.5 * satrec.j2 * temp;
      temp2 = temp1 * temp;

      /* -------------- update for short period periodics ------------ */
      if (satrec.method == 'd')
      {
        cosisq = cosip * cosip;
        satrec.con41 = 3.0 * cosisq - 1.0;
        satrec.x1mth2 = 1.0 - cosisq;
        satrec.x7thm1 = 7.0 * cosisq - 1.0;
      }
      mrt = rl * (1.0 - 1.5 * temp2 * betal * satrec.con41) +
            0.5 * temp1 * satrec.x1mth2 * cos2u;
      // sgp4fix for decaying satellites
      if (mrt < 1.0)
      {
        //         printf("# decay condition %11.6f \n",mrt);
        error = 6;
        return;
      }

      su = su - 0.25 * temp2 * satrec.x7thm1 * sin2u;
      xnode = nodep + 1.5 * temp2 * cosip * sin2u;
      xinc = xincp + 1.5 * temp2 * cosip * sinip * cos2u;
      mvt = rdotl - nm * temp1 * satrec.x1mth2 * sin2u / satrec.xke;
      rvdot = rvdotl + nm * temp1 * (satrec.x1mth2 * cos2u + 1.5 * satrec.con41) / satrec.xke;

      /* --------------------- orientation vectors ------------------- */
      sinsu = sin(su);
      cossu = cos(su);
      snod = sin(xnode);
      cnod = cos(xnode);
      sini = sin(xinc);
      cosi = cos(xinc);
      xmx = -snod * cosi;
      xmy = cnod * cosi;
      ux = xmx * sinsu + cnod * cossu;
      uy = xmy * sinsu + snod * cossu;
      uz = sini * sinsu;
      vx = xmx * cossu - cnod * sinsu;
      vy = xmy * cossu - snod * sinsu;
      vz = sini * cossu;

      /* --------- position and velocity (in km and km/sec) ---------- */
      r[0] = (mrt * ux) * satrec.radiusearthkm;
      r[1] = (mrt * uy) * satrec.radiusearthkm;
      r[2] = (mrt * uz) * satrec.radiusearthkm;
      v[0] = (mvt * ux + rvdot * vx) * vkmpersec;
      v[1] = (mvt * uy + rvdot * vy) * vkmpersec;
      v[2] = (mvt * uz + rvdot * vz) * vkmpersec;
      error = 0;
    } // if pl > 0

    // #include "debug7.cpp"
    return;
  }

  // void EMSCRIPTEN_KEEPALIVE propagate_many(elsetrec* __restrict satrecs, int count, double unix_ms, double* __restrict positions, double* __restrict velocities) {
  //   for (int i = 0; i < count; i++) {
  //     sgp4forJs(satrecs[i], unix_ms, &positions[i * 3], &velocities[i * 3]);
  //   }
  // }
}
