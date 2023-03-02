"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var constants = _interopRequireWildcard(require("./constants"));
var _ext = require("./ext");
var _io = _interopRequireDefault(require("./io"));
var _propagation = require("./propagation");
var _dopplerFactor = _interopRequireDefault(require("./dopplerFactor"));
var _transforms = require("./transforms");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var _default = {
  constants: constants,
  // Propagation
  propagate: _propagation.propagate,
  sgp4: _propagation.sgp4,
  twoline2satrec: _io["default"],
  gstime: _propagation.gstime,
  jday: _ext.jday,
  invjday: _ext.invjday,
  dopplerFactor: _dopplerFactor["default"],
  // Coordinate transforms
  radiansToDegrees: _transforms.radiansToDegrees,
  degreesToRadians: _transforms.degreesToRadians,
  degreesLat: _transforms.degreesLat,
  degreesLong: _transforms.degreesLong,
  radiansLat: _transforms.radiansLat,
  radiansLong: _transforms.radiansLong,
  geodeticToEcf: _transforms.geodeticToEcf,
  eciToGeodetic: _transforms.eciToGeodetic,
  eciToEcf: _transforms.eciToEcf,
  ecfToEci: _transforms.ecfToEci,
  ecfToLookAngles: _transforms.ecfToLookAngles
};
exports["default"] = _default;