/**
 * Shared physics constants and utilities for simulation and problem solver modules.
 */
(function () {
  const MODES = {
    PROJECTILE: "projectile",
    ELECTRIC_FIELD: "electric_field",
    CIRCUITS: "circuits",
    WAVE: "wave",
    THERMO: "thermo",
    OPTICS: "optics",
  };

  function toRad(deg) {
    return (deg * Math.PI) / 180;
  }

  function modeFromContext(discipline, topic) {
    if (discipline === "Mechanics" || topic === "Kinematics") return MODES.PROJECTILE;
    if (discipline === "Electricity and Magnetism") {
      if (topic === "DC Circuits") return MODES.CIRCUITS;
      return MODES.ELECTRIC_FIELD;
    }
    if (discipline === "Waves") return MODES.WAVE;
    if (discipline === "Thermodynamics") return MODES.THERMO;
    if (discipline === "Optics") return MODES.OPTICS;
    return MODES.PROJECTILE;
  }

  window.PhysicsCommon = {
    MODES: MODES,
    toRad: toRad,
    modeFromContext: modeFromContext,
  };
})();
