SAT_HEADER  = src/satellite-head.js
SGP4SOURCES = src/constants.js src/dpper.js src/dscom.js src/dsinit.js src/dspace.js src/gstime.js src/initl.js src/sgp4init.js src/propagate.js src/sgp4.js
COORDINATES = src/coordinate-transforms.js
DOPPLER     = src/doppler.js
SAT_TAIL    = src/satellite-tail.js


FINAL       = satellite.js

all : ${FINAL}

${FINAL} : ${SAT_HEADER} ${SGP4SOURCES} ${COORDINATES} ${DOPPLER} ${SAT_TAIL}
	cat ${SAT_HEADER} ${SGP4SOURCES} ${COORDINATES} ${DOPPLER} ${SAT_TAIL} > ${FINAL}

test : ${FINAL}
	cp satellite.js sgp4_verification/lib/sgp4/satellite.js

clean :
	rm ${FINAL}

