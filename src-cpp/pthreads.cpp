#include <pthread.h>
#include <unistd.h>
#include <emscripten/threading.h>
#include <errno.h>
#include <iostream>
#include <stdio.h>
#include "SGP4.h"
#include <vector>
#include "common.h"

#define pi 3.14159265358979323846

typedef struct {
  int datesCount;
  int satellitesCount;
  int threadIndex;
  int threadsCount;
  elsetrec *__restrict satellites;
  double *__restrict jdays;
  double *__restrict eci_positions;
  double *__restrict eci_velocities;
  int8_t *__restrict sgp4_errors;
  pthread_barrier_t *__restrict gstime_barrier;
} ThreadData;

void* thread_function(void* arg) {
  ThreadData* data = (ThreadData*)arg;
  // pthread_barrier_wait(data->gstime_barrier);
  return NULL;
}

extern "C" {
  int EMSCRIPTEN_KEEPALIVE compute(int threads_count, elsetrec *__restrict satellites, int satellites_count, double *__restrict jdays, int dates_count, double *__restrict eci_positions, double *__restrict eci_velocities, int8_t *__restrict sgp4_errors) {
    pthread_t thread[threads_count];
    void* status[threads_count];
    int join_status[threads_count];
    std::cout << "Creating threads" << std::endl;
    std::vector<ThreadData> thread_data(threads_count);
    //pthread_barrier_t barrier;
    //pthread_barrier_init(&barrier, NULL, threads_count);
    for (int i=0; i < threads_count; ++i) {
      thread_data[i] = ThreadData{
        .datesCount = 10,
        .satellitesCount = 10,
        .threadIndex = i,
        .threadsCount = threads_count,
        .satellites = satellites,
        .jdays = jdays,
        .eci_positions = eci_positions,
        .eci_velocities = eci_velocities,
        .sgp4_errors = sgp4_errors
      };
      pthread_create(&thread[i], NULL, thread_function, &thread_data[i]);
      std::cout << "Thread created " << thread[i] << std::endl;
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
    std::cout << "All threads joined" << std::endl;
    for (int i = 0; i < threads_count; ++i) {
      if (status[i] != NULL || join_status[i] != 0) {
        return 1;
      }
    }
    return 228;
  }
}