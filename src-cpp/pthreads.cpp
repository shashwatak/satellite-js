#include <pthread.h>
#include <unistd.h>
#include <emscripten/threading.h>
#include <errno.h>
#include <vector>
#include "common.h"

typedef struct ThreadData {
  int threadIndex;
  int threadsCount;
  pthread_barrier_t *__restrict gstimeBarrier;
  const RunData* runData;
} ThreadData;

void* thread_function(void* arg) {
  const ThreadData* const data = (ThreadData*)arg;
  const int satCount = data->runData->satellitesCount;
  const int dateCount = data->runData->jdaysCount;
  const int satellitesStart = (satCount * data->threadIndex) / data->threadsCount;
  const int satellitesEnd = (satCount * (data->threadIndex + 1)) / data->threadsCount;
  const int datesStart = (dateCount * data->threadIndex) / data->threadsCount;
  const int datesEnd = (dateCount * (data->threadIndex + 1)) / data->threadsCount;

  calculate_eci(
    data->runData->satellitesPointer,
    satellitesStart, satellitesEnd,
    data->runData->jdaysPointer,
    0, dateCount, dateCount,
    data->runData->eciPositions,
    data->runData->eciVelocities,
    data->runData->sgp4Errors);

  if (data->runData->gmstEnabled)
  {
    const int jdaysStart = (data->datesCount * data->threadIndex) / data->threadsCount;
    const int jdaysEnd = (data->datesCount * (data->threadIndex + 1)) / data->threadsCount;
    calculate_gmst(
      data->runData->jdaysPointer,
      datesStart, datesEnd,
      data->runData->gmstValues);
    pthread_barrier_wait(data->gstimeBarrier);
  }

  if (data->runData->ecfPositionEnabled)
  {
    calculate_ecf_position_or_velocity(
      data->runData->eciPositions,
      satellitesStart, satellitesEnd,
      data->runData->gmstValues,
      0, dateCount, dateCount,
      data->runData->ecfPositions);
  }

  if (data->runData->ecfVelocityEnabled)
  {
    calculate_ecf_position_or_velocity(
      data->runData->eciVelocities,
      satellitesStart, satellitesEnd,
      data->runData->gmstValues,
      0, dateCount, dateCount,
      data->runData->ecfVelocities);
  }

  if (data->runData->geodeticPositionEnabled)
  {
    calculate_geodetic_positions(
      data->runData->eciPositions,
      satellitesStart, satellitesEnd,
      data->runData->gmstValues,
      0, dateCount, dateCount,
      data->runData->geodeticPositions);
  }

  if (data->runData->lookAnglesEnabled)
  {
    calculate_look_angles(
      data->runData->ecfPositions,
      satellitesStart, satellitesEnd,
      0, dateCount, dateCount,
      data->runData->longitudeRadians,
      data->runData->latitudeRadians,
      data->runData->heightKm,
      data->runData->lookAngles);
  }

  if (data->runData->dopplerFactorEnabled)
  {
    calculate_doppler_factor(
      data->runData->ecfPositions,
      data->runData->ecfVelocities,
      satellitesStart, satellitesEnd,
      0, dateCount, dateCount,
      data->runData->observerEcfX,
      data->runData->observerEcfY,
      data->runData->observerEcfZ,
      data->runData->dopplerFactors);
  }
  return NULL;
}

extern "C" {
  int EMSCRIPTEN_KEEPALIVE compute(int threads_count, const RunData* __restrict runData) {
    pthread_t thread[threads_count];
    void* status[threads_count];
    int join_status[threads_count];
    ThreadData thread_data[threads_count];
    pthread_barrier_t gstimeBarrier;
    pthread_barrier_init(&gstimeBarrier, NULL, threads_count);
    for (int i=0; i < threads_count; ++i) {
      thread_data[i] = ThreadData{
        .threadIndex = i,
        .threadsCount = threads_count,
        .gstimeBarrier = &gstimeBarrier,
        .runData = runData,
      };
      pthread_create(&thread[i], NULL, thread_function, &thread_data[i]);
    }
    for (int i = 0; i < threads_count; ++i) {
      while (true) {
        join_status[i] = pthread_tryjoin_np(thread[i], &status[i]);
        if (join_status[i] != EBUSY) {
          break;
        }
        emscripten_sleep(0);
      }
    }
    pthread_barrier_destroy(&gstimeBarrier);
    for (int i = 0; i < threads_count; ++i) {
      if (status[i] != NULL || join_status[i] != 0) {
        return 1;
      }
    }
    return 0;
  }
}
