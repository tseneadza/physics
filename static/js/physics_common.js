/**
 * Shared physics constants and utilities for simulation and problem solver modules.
 */
(function () {
  const MODES = {
    PROJECTILE: "projectile",
    NEWTON_FORCE: "newton_force",
    ELECTRIC_FIELD: "electric_field",
    CIRCUITS: "circuits",
    WAVE: "wave",
    SOUND: "sound",
    THERMO: "thermo",
    THERMO_GAS: "thermo_gas",
    OPTICS: "optics",
    OPTICS_REFRACTION: "optics_refraction",
  };

  function toRad(deg) {
    return (deg * Math.PI) / 180;
  }

  function modeFromContext(discipline, topic) {
    if (topic === "Newton's Laws") return MODES.NEWTON_FORCE;
    if (topic === "Sound") return MODES.SOUND;
    if (topic === "Ideal Gas Basics") return MODES.THERMO_GAS;
    if (topic === "Reflection and Refraction") return MODES.OPTICS_REFRACTION;
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
