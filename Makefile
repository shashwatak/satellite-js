SGP4SOURCES = constants.js dpper.js dscom.js dsinit.js dspace.js gstime.js initl.js sgp4init.js propagate.js sgp4.js
COORDINATES = coordinate-transforms.js
DOPPLER     = doppler.js

FINAL       = satellite.js

all : ${FINAL}

${FINAL} : ${SGP4SOURCES} ${COORDINATES} ${DOPPLER}
	cat ${SGP4SOURCES} ${COORDINATES} ${DOPPLER} > ${FINAL}

clean :
	rm ${FINAL}

