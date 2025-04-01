/**
   * Type alias documents units are kilometer (km)
   */
export type Kilometer = number;

/**
 * Type alias documents units are kilometer per second (km/s)
 */
export type KilometerPerSecond = number;

/**
   * Type alias documents units are radians
   */
export type Radians = number;

/**
 * Type alias documents units are degrees
 */
export type Degrees = number;

/**
 * Type alias documents units for mean motion are radians per minute
 */
export type RadiansPerMinute = number;

/**
 * Type alias documents units for semi-major axis (earth radii)
 */
export type EarthRadii = number;

/**
   * Coordinate frame Earth Centered Inertial (ECI)
   * https://en.wikipedia.org/wiki/Earth-centered_inertial
   */
export interface EciVec3<T> {
  x: T;
  y: T;
  z: T;
}

/**
 * Coordinate frame Earth Centered Fixed (ECF)
 * https://en.wikipedia.org/wiki/ECEF
 */
export interface EcfVec3<T> {
  x: T;
  y: T;
  z: T;
}

/**
   * A set of "singly averaged mean elements" that describe shape of the
   * satellite’s orbit at the propagation date. They are averaged
   * with respect to the mean anomaly and include the effects of secular
   * gravity, atmospheric drag, and - in Deep Space mode - of those
   * pertubations from the Sun and Moon that SGP4 averages over an entire
   * revolution of each of those bodies. They omit both the shorter-term
   * and longer-term periodic pertubations from the Sun and Moon that
   * SGP4 applies right before computing each position.
   */
export type MeanElements = {
  /**
   * Average semi-major axis (earth radii).
   */
  am: EarthRadii;
  /**
   * Average eccentricity.
   */
  em: number;
  /**
   * Average inclination (radians).
   */
  im: Radians;
  /**
   * Average right ascension of ascending node (radians).
   */
  Om: Radians;
  /**
   * Average argument of perigee (radians).
   */
  om: Radians;
  /**
   * Average mean anomaly (radians).
   */
  mm: Radians;
  /**
   * Average mean motion (radians/minute).
   */
  nm: RadiansPerMinute;
}

/**
 * The position_velocity result is a key-value pair of ECI coordinates.
 * These are the base results from which all other coordinates are derived.
 * If there is an error the position and velocity will be false.
 * The meanElements are the averaged elements of the orbit at the
 * moment of propagation.
 */
export interface PositionAndVelocity {
  position: EciVec3<Kilometer>  |false;
  velocity: EciVec3<KilometerPerSecond> | false;
  meanElements: MeanElements | false;
}

/**
   * https://en.wikipedia.org/wiki/Geographic_coordinate_system#Latitude_and_longitude
   */
export interface GeodeticLocation {
  longitude: Radians;
  latitude: Radians;
  height: Kilometer;
}

/**
 * You will need GMST for some of the coordinate transforms.
 * GMST - Greenwich Mean Sidereal Time
 * http://en.wikipedia.org/wiki/Sidereal_time#Definition
 */
export type GMSTime = number;

/**
   * https://en.wikipedia.org/wiki/Azimuth
   */
export interface LookAngles {
  azimuth: Radians;
  elevation: Radians;
  rangeSat: Kilometer;
}

type StartsWith<T extends string> = `${T}${string}`

/**
 * This is the base interface for the OMM JSON object as specified in Orbit Data Messages
 * recommended standard, version 3.0.
 * 
 * Note that this is not a 1:1 mapping. Only the fields that are necessary to propagate
 * a satellite orbit are made required. For example, CCSDS_OMM_VERS is required by the spec,
 * but is not present in Celestrak OMM output, and is not required to propagate the satellite,
 * so it is made optional here.
 * 
 * Numeric fields may be represented as strings or numbers in the original json, depending on
 * the source. This is because the spec doesn't specify the type, and different sources use
 * different types: at the time of writing, Celestrak uses numbers, while SpaceTrack uses strings.
 */
export interface OMMJsonObjectV3 {
  /**
   * The version is restricted in TypeScript to only among the ones this library supports.
   * Versions are incremented on breaking changes, so it is adviced you validate this field.
   * 
   * NOTE: This is required field in OMM spec, but Celestrak omits it, so we make it optional
   * and assume version 3.0 if not present.
   */
  CCSDS_OMM_VERS?: StartsWith<'3.'>;
  COMMENT?: string;
  CLASSIFICATION?: string;
  OBJECT_NAME: string;
  /**
   * Recommended, but not required, to be an International spacecraft designator.
   */
  OBJECT_ID: string;
  /**
   * NOTE: This is required field in OMM spec, but Celestrak omits it, so we make it optional.
   * If present, it is restricted to only the value this library supports.
   */
  CENTER_NAME?: 'EARTH';
  /**
   * NOTE: This is required field in OMM spec, but Celestrak omits it, so we make it optional.
   * If present, it is restricted to only 'TEME' as it is the only value that can come with
   * SGP ephemeris type.
   */
  REF_FRAME?: 'TEME';
  
  /**
   * NOTE: This is required field in OMM spec, but Celestrak omits it, so we make it optional
   */
  REF_FRAME_EPOCH?: string;
  /**
   * NOTE: This is required field in OMM spec, but Celestrak omits it, so we make it optional
   */
  TIME_SYSTEM?: 'UTC';

  /**
   * NOTE: This is required field in OMM spec, but Celestrak omits it, so we make it optional
   */
  MEAN_ELEMENT_THEORY?: 'SGP4';
  /**
   * NOTE: This is required field in OMM spec, but Celestrak omits it, so we make it optional
   */
  CREATION_DATE?: string;
  /**
   * NOTE: This is required field in OMM spec, but Celestrak omits it, so we make it optional
   */
  ORIGINATOR?: string;

  /**
   * ISO datetime
   */
  EPOCH: string;

  MEAN_MOTION: string | number;

  ECCENTRICITY: string | number;
  /**
   * Degrees
   */
  INCLINATION: number | string;
  /*
   * Degrees
   */
  RA_OF_ASC_NODE: number | string;

  /**
   * Degrees
   */
  ARG_OF_PERICENTER: number | string;

  /**
   * Degrees
   */
  MEAN_ANOMALY: number | string;

  /**
   * The only value supported by this library
   */
  EPHEMERIS_TYPE?: 0 | "0";

  CLASSIFICATION_TYPE?: "U" | "C";

  NORAD_CAT_ID: string | number;
  ELEMENT_SET_NO: string | number;
  REV_AT_EPOCH: string | number;
  BSTAR: string | number;
  MEAN_MOTION_DOT: string | number;
  MEAN_MOTION_DDOT: string | number;
  /**
   * This handles additional metadata, such as OBJECT_TYPE, COUNTRY_CODE etc
   */
  [key: string]: unknown;
}

// add here additional supported OMM versions via union type in future
export type OMMJsonObject = OMMJsonObjectV3;

export type SupportedOMMVersion = NonNullable<OMMJsonObject['CCSDS_OMM_VERS']>
