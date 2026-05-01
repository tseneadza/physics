(function () {
  const MODES = window.PhysicsCommon.MODES;
  const toRad = window.PhysicsCommon.toRad;
  const modeFromContext = window.PhysicsCommon.modeFromContext;

  function isIntermediate(level) {
    return (level || "basics").toLowerCase() === "intermediate";
  }

  function randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function randStep(min, max, step) {
    const count = Math.floor((max - min) / step);
    const idx = Math.floor(Math.random() * (count + 1));
    return min + idx * step;
  }

  function newProjectileProblem(level) {
    const speed = isIntermediate(level) ? randInt(18, 45) : randInt(12, 25);
    const anglePool = isIntermediate(level)
      ? [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]
      : [30, 35, 40, 45, 50, 55, 60];
    const angle = anglePool[Math.floor(Math.random() * anglePool.length)];
    const gravity = 9.81;
    const range = (speed * speed * Math.sin(2 * toRad(angle))) / gravity;
    return {
      speed,
      angle,
      gravity,
      expected: range,
      mode: MODES.PROJECTILE,
      resultLabel: "Range R",
      unit: "m",
      difficulty: level || "basics",
      statement:
        `A projectile is launched at ${speed} m/s and ${angle} degrees. ` +
        "Ignoring air resistance, estimate its horizontal range (in meters).",
    };
  }

  function newNewtonProblem(level) {
    const m = isIntermediate(level) ? randStep(0.5, 12, 0.5) : randInt(1, 6);
    const f = isIntermediate(level) ? randStep(8, 80, 0.5) : randInt(4, 21);
    const expected = f / m;
    return {
      m,
      f,
      expected,
      mode: MODES.NEWTON_FORCE,
      resultLabel: "Acceleration a",
      unit: "m/s^2",
      difficulty: level || "basics",
      statement: `A net force of ${f} N acts on a ${m} kg object. Estimate acceleration a (m/s^2).`,
    };
  }

  function newElectricFieldProblem(level) {
    const qUc = isIntermediate(level) ? randStep(2, 20, 0.5) : randInt(1, 9);
    const r = isIntermediate(level) ? randStep(0.4, 5, 0.1) : randInt(1, 5);
    const k = 8.9875517923e9;
    const expected = (k * qUc * 1e-6) / (r * r);
    return {
      qUc,
      r,
      expected,
      mode: MODES.ELECTRIC_FIELD,
      resultLabel: "Field E",
      unit: "N/C",
      difficulty: level || "basics",
      statement: `A point charge of ${qUc} microC is observed at ${r} m. Estimate field magnitude E = kq/r^2 (N/C).`,
    };
  }

  function newCircuitProblem(level) {
    const v = isIntermediate(level) ? randStep(5, 48, 0.5) : randInt(6, 20);
    const r = isIntermediate(level) ? randStep(1, 20, 0.5) : randInt(2, 10);
    const expected = v / r;
    return {
      v,
      r,
      expected,
      mode: MODES.CIRCUITS,
      resultLabel: "Current I",
      unit: "A",
      difficulty: level || "basics",
      statement: `A resistor of ${r} ohm is connected to ${v} V. Estimate current I (A).`,
    };
  }

  function newWaveProblem(level) {
    const speed = isIntermediate(level) ? randStep(1.5, 20, 0.1) : randInt(2, 10);
    const freq = isIntermediate(level) ? randStep(0.5, 12, 0.1) : randInt(1, 6);
    const expected = speed / freq;
    return {
      speed,
      freq,
      expected,
      mode: MODES.WAVE,
      resultLabel: "Wavelength lambda",
      unit: "m",
      difficulty: level || "basics",
      statement: `A wave travels at ${speed} m/s with frequency ${freq} Hz. Estimate wavelength lambda (m).`,
    };
  }

  function newSoundProblem(level) {
    const v = isIntermediate(level) ? randStep(300, 360, 0.5) : randInt(330, 360);
    const f = isIntermediate(level) ? randInt(120, 2000) : randInt(200, 800);
    const expected = v / f;
    return {
      v,
      f,
      expected,
      mode: MODES.SOUND,
      resultLabel: "Wavelength lambda",
      unit: "m",
      difficulty: level || "basics",
      statement: `Sound travels at ${v} m/s with frequency ${f} Hz. Estimate wavelength lambda (m).`,
    };
  }

  function newThermoProblem(level) {
    const m = isIntermediate(level) ? randStep(0.5, 8, 0.5) : randInt(1, 4);
    const c = 4200;
    const dT = isIntermediate(level) ? randInt(3, 80) : randInt(5, 34);
    const expected = m * c * dT;
    return {
      m,
      c,
      dT,
      expected,
      mode: MODES.THERMO,
      resultLabel: "Heat Q",
      unit: "J",
      difficulty: level || "basics",
      statement: `Heat ${m} kg of water by ${dT} C. Estimate heat energy Q (J) using Q = m*c*DeltaT.`,
    };
  }

  function newOpticsProblem(level) {
    const f = isIntermediate(level) ? randStep(5, 25, 0.5) : 10;
    const doDist = isIntermediate(level) ? randStep(15, 80, 0.5) : 30;
    const expected = 1 / (1 / f - 1 / doDist);
    return {
      f,
      doDist,
      expected,
      mode: MODES.OPTICS,
      resultLabel: "Image distance di",
      unit: "cm",
      difficulty: level || "basics",
      statement: `For a thin lens with f=${f} cm and object distance do=${doDist} cm, estimate image distance di (cm).`,
    };
  }

  function newRefractionProblem(level) {
    let n1, n2, theta1, sinTheta2;
    // Regenerate parameters if total internal reflection would occur
    do {
      n1 = isIntermediate(level) ? randStep(1, 1.6, 0.1) : 1;
      n2 = isIntermediate(level) ? randStep(1.2, 2.2, 0.1) : 1.5;
      theta1 = isIntermediate(level) ? randInt(20, 70) : randInt(30, 55);
      sinTheta2 = (n1 / n2) * Math.sin(toRad(theta1));
    } while (sinTheta2 > 1);
    const expected = (Math.asin(sinTheta2) * 180) / Math.PI;
    return {
      n1,
      n2,
      theta1,
      expected,
      mode: MODES.OPTICS_REFRACTION,
      resultLabel: "Refracted angle theta2",
      unit: "deg",
      difficulty: level || "basics",
      statement: `Light passes from n1=${n1} to n2=${n2} at incident angle ${theta1} deg. Estimate refracted angle theta2 (deg).`,
    };
  }

  function newIdealGasProblem(level) {
    const pKpa = isIntermediate(level) ? randStep(70, 250, 0.5) : 101.3;
    const vL = isIntermediate(level) ? randStep(5, 40, 0.1) : 22.4;
    const tK = isIntermediate(level) ? randStep(220, 500, 0.5) : 273.15;
    const expected = (pKpa * 1000 * (vL / 1000)) / (8.314 * tK);
    return {
      pKpa,
      vL,
      tK,
      expected,
      mode: MODES.THERMO_GAS,
      resultLabel: "Moles n",
      unit: "mol",
      difficulty: level || "basics",
      statement: `For P=${pKpa} kPa, V=${vL} L, and T=${tK} K, estimate moles n using PV=nRT.`,
    };
  }

  function buildSteps(problem) {
    if (problem.mode === MODES.NEWTON_FORCE) {
      return [
        "Use Newton's second law: a = F/m",
        `F = ${problem.f} N, m = ${problem.m} kg`,
        `a = ${problem.expected.toFixed(2)} m/s^2`,
      ].join("\n");
    }
    if (problem.mode === MODES.ELECTRIC_FIELD) {
      return [
        "Use E = k*q/r^2",
        `k = 8.99e9, q = ${problem.qUc}e-6 C, r = ${problem.r} m`,
        `E = ${(problem.expected).toFixed(2)} N/C`,
      ].join("\n");
    }
    if (problem.mode === MODES.CIRCUITS) {
      return [
        "Use Ohm's law: I = V/R",
        `V = ${problem.v} V, R = ${problem.r} ohm`,
        `I = ${problem.expected.toFixed(2)} A`,
      ].join("\n");
    }
    if (problem.mode === MODES.WAVE) {
      return [
        "Use wave relation: lambda = v/f",
        `v = ${problem.speed} m/s, f = ${problem.freq} Hz`,
        `lambda = ${problem.expected.toFixed(2)} m`,
      ].join("\n");
    }
    if (problem.mode === MODES.SOUND) {
      return [
        "Use lambda = v/f",
        `v = ${problem.v} m/s, f = ${problem.f} Hz`,
        `lambda = ${problem.expected.toFixed(3)} m`,
      ].join("\n");
    }
    if (problem.mode === MODES.THERMO) {
      return [
        "Use Q = m*c*DeltaT",
        `m = ${problem.m} kg, c = ${problem.c} J/kg*K, DeltaT = ${problem.dT}`,
        `Q = ${problem.expected.toFixed(2)} J`,
      ].join("\n");
    }
    if (problem.mode === MODES.OPTICS) {
      return [
        "Use thin lens equation: 1/f = 1/do + 1/di",
        `f = ${problem.f} cm, do = ${problem.doDist} cm`,
        `di = ${problem.expected.toFixed(2)} cm`,
      ].join("\n");
    }
    if (problem.mode === MODES.OPTICS_REFRACTION) {
      return [
        "Use Snell's law: n1*sin(theta1) = n2*sin(theta2)",
        `n1=${problem.n1}, n2=${problem.n2}, theta1=${problem.theta1} deg`,
        `theta2 = ${problem.expected.toFixed(2)} deg`,
      ].join("\n");
    }
    if (problem.mode === MODES.THERMO_GAS) {
      return [
        "Use ideal gas law: n = PV/(RT)",
        `P=${problem.pKpa} kPa, V=${problem.vL} L, T=${problem.tK} K`,
        `n = ${problem.expected.toFixed(3)} mol`,
      ].join("\n");
    }
    return [
      "Use projectile range formula: R = v^2 * sin(2theta) / g",
      `v = ${problem.speed} m/s`,
      `theta = ${problem.angle} degrees`,
      `g = ${problem.gravity} m/s^2`,
      `R = (${problem.speed}^2 * sin(${2 * problem.angle}deg)) / ${problem.gravity}`,
      `R = ${problem.expected.toFixed(2)} m`,
    ].join("\n");
  }

  function drawResult(canvas, range) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const pad = 20;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    const barW = Math.max(10, Math.min(w - 2 * pad, range * 8));
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(pad, h / 2 - 20, barW, 40);
    ctx.strokeStyle = "#0f172a";
    ctx.strokeRect(pad, h / 2 - 20, w - 2 * pad, 40);

    ctx.fillStyle = "#0f172a";
    ctx.font = "14px Arial";
    ctx.fillText(`Computed Range: ${range.toFixed(2)} m`, pad, h / 2 - 28);
  }

  function drawValueBar(canvas, label, value) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const pad = 20;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    const barW = Math.max(10, Math.min(w - 2 * pad, Math.abs(value) * 3));
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(pad, h / 2 - 20, barW, 40);
    ctx.strokeStyle = "#0f172a";
    ctx.strokeRect(pad, h / 2 - 20, w - 2 * pad, 40);

    ctx.fillStyle = "#0f172a";
    ctx.font = "14px Arial";
    ctx.fillText(`${label}: ${formatNumber(value)}`, pad, h / 2 - 28);
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) return "-";
    const abs = Math.abs(value);
    if (abs > 0 && abs < 0.01) return value.toFixed(4);
    return value.toFixed(2);
  }

  function formatWithUnit(value, unit) {
    return unit ? `${formatNumber(value)} ${unit}` : `${formatNumber(value)}`;
  }

  function toleranceFor(problem) {
    const expectedAbs = Math.abs(problem.expected || 0);
    const intermediate = isIntermediate(problem.difficulty);
    const relative = expectedAbs * (intermediate ? 0.03 : 0.08);
    const unit = problem.unit || "";
    if (unit === "A") return Math.max(intermediate ? 0.02 : 0.08, relative);
    if (unit === "N/C") return Math.max(intermediate ? 0.5 : 1, relative);
    if (unit === "J") return Math.max(intermediate ? 20 : 80, relative);
    if (unit === "deg") return Math.max(intermediate ? 0.25 : 0.75, relative);
    if (unit === "mol") return Math.max(intermediate ? 0.01 : 0.03, relative);
    if (unit === "m/s^2") return Math.max(intermediate ? 0.05 : 0.15, relative);
    if (unit === "cm") return Math.max(intermediate ? 0.1 : 0.3, relative);
    return Math.max(intermediate ? 0.05 : 0.15, relative);
  }

  function drawEmptyCanvas(canvas, label) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const pad = 20;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "#0f172a";
    ctx.strokeRect(pad, h / 2 - 20, w - 2 * pad, 40);

    ctx.fillStyle = "#0f172a";
    ctx.font = "14px Arial";
    ctx.fillText(`${label}: ?`, pad, h / 2 - 28);
  }

  function getFormulaAidByMode(mode) {
    if (mode === MODES.NEWTON_FORCE) {
      return {
        name: "Newton's Second Law",
        equation: "a = F/m",
        variables: "a: acceleration, F: net force, m: mass",
        units: "a (m/s^2), F (N), m (kg)",
        rearrangements: ["F = m*a", "m = F/a"],
        whenToUse: "Use for net-force translational motion.",
      };
    }
    if (mode === MODES.CIRCUITS) {
      return {
        name: "Ohm's Law",
        equation: "I = V/R",
        variables: "I: current, V: voltage, R: resistance",
        units: "I (A), V (V), R (ohm)",
        rearrangements: ["V = I*R", "R = V/I"],
        whenToUse: "Use for simple resistive DC circuits.",
      };
    }
    if (mode === MODES.ELECTRIC_FIELD) {
      return {
        name: "Electric Field of Point Charge",
        equation: "E = k*q/r^2",
        variables: "E: field, k: Coulomb constant, q: charge, r: distance",
        units: "E (N/C), q (C), r (m)",
        rearrangements: ["q = E*r^2/k"],
        whenToUse: "Use for point-charge field magnitude.",
      };
    }
    if (mode === MODES.WAVE) {
      return {
        name: "Wave Equation",
        equation: "v = f*lambda",
        variables: "v: speed, f: frequency, lambda: wavelength",
        units: "v (m/s), f (Hz), lambda (m)",
        rearrangements: ["lambda = v/f", "f = v/lambda"],
        whenToUse: "Use for basic wave propagation problems.",
      };
    }
    if (mode === MODES.SOUND) {
      return {
        name: "Sound Wavelength",
        equation: "lambda = v/f",
        variables: "lambda: wavelength, v: sound speed, f: frequency",
        units: "lambda (m), v (m/s), f (Hz)",
        rearrangements: ["v = f*lambda", "f = v/lambda"],
        whenToUse: "Use for sound propagation in a medium.",
      };
    }
    if (mode === MODES.THERMO) {
      return {
        name: "Heat Transfer",
        equation: "Q = m*c*DeltaT",
        variables: "Q: heat, m: mass, c: specific heat, DeltaT: temperature change",
        units: "Q (J), m (kg), c (J/kg*K), DeltaT (K or C)",
        rearrangements: ["DeltaT = Q/(m*c)"],
        whenToUse: "Use for temperature-change heat calculations.",
      };
    }
    if (mode === MODES.OPTICS) {
      return {
        name: "Thin Lens Equation",
        equation: "1/f = 1/do + 1/di",
        variables: "f: focal length, do: object distance, di: image distance",
        units: "f, do, di in same distance units",
        rearrangements: ["di = 1/(1/f - 1/do)"],
        whenToUse: "Use for single thin lens image position.",
      };
    }
    if (mode === MODES.OPTICS_REFRACTION) {
      return {
        name: "Snell's Law",
        equation: "n1*sin(theta1) = n2*sin(theta2)",
        variables: "n1,n2: refractive indices, theta1/theta2: angles from normal",
        units: "n (unitless), theta (deg or rad)",
        rearrangements: ["theta2 = asin((n1/n2)*sin(theta1))"],
        whenToUse: "Use for refraction at a boundary between media.",
      };
    }
    if (mode === MODES.THERMO_GAS) {
      return {
        name: "Ideal Gas Law",
        equation: "PV = nRT",
        variables: "P: pressure, V: volume, n: moles, R: gas constant, T: temperature",
        units: "P (Pa), V (m^3), n (mol), T (K)",
        rearrangements: ["n = PV/(RT)", "P = nRT/V"],
        whenToUse: "Use for ideal gas state relations.",
      };
    }
    return {
      name: "Projectile Range",
      equation: "R = v^2 * sin(2theta) / g",
      variables: "R: horizontal range, v: initial speed, theta: launch angle, g: gravity",
      units: "R (m), v (m/s), g (m/s^2), theta (degrees or radians)",
      rearrangements: ["v = sqrt(R*g/sin(2theta))"],
      whenToUse: "Use when launch and landing heights are the same and air resistance is ignored.",
    };
  }

  function renderFormulaAid(element, mode) {
    if (!element) return;
    const formula = getFormulaAidByMode(mode);
    element.innerHTML = `
      <div class="formula-card">
        <div><strong>${formula.name}</strong></div>
        <div class="equation">${formula.equation}</div>
        <div>${formula.variables}</div>
        <div><em>${formula.units}</em></div>
        <div><strong>When to use:</strong> ${formula.whenToUse}</div>
        <div><strong>Rearrangements:</strong> ${formula.rearrangements.join(", ")}</div>
      </div>
    `;
  }

  function buildHint(problem) {
    if (problem.mode === MODES.NEWTON_FORCE) {
      return `Use a = F/m with F=${problem.f} and m=${problem.m}.`;
    }
    if (problem.mode === MODES.CIRCUITS) {
      return `Use I = V/R with V=${problem.v} and R=${problem.r}.`;
    }
    if (problem.mode === MODES.ELECTRIC_FIELD) {
      return `Use E = k*q/r^2 with q=${problem.qUc} microC and r=${problem.r} m.`;
    }
    if (problem.mode === MODES.WAVE) {
      return `Use lambda = v/f with v=${problem.speed} and f=${problem.freq}.`;
    }
    if (problem.mode === MODES.SOUND) {
      return `Use lambda = v/f with v=${problem.v} and f=${problem.f}.`;
    }
    if (problem.mode === MODES.THERMO) {
      return `Use Q = m*c*DeltaT with m=${problem.m}, c=${problem.c}, DeltaT=${problem.dT}.`;
    }
    if (problem.mode === MODES.OPTICS) {
      return `Use 1/f = 1/do + 1/di with f=${problem.f}, do=${problem.doDist}.`;
    }
    if (problem.mode === MODES.OPTICS_REFRACTION) {
      return `Use n1*sin(theta1)=n2*sin(theta2) with theta1=${problem.theta1} deg.`;
    }
    if (problem.mode === MODES.THERMO_GAS) {
      return `Use n = PV/(RT) with P=${problem.pKpa} kPa, V=${problem.vL} L, T=${problem.tK} K.`;
    }
    return (
      "Start with R = v^2 * sin(2theta) / g. " +
      `Use v=${problem.speed} m/s, theta=${problem.angle} deg, g=${problem.gravity} m/s^2. ` +
      "Evaluate sin(2theta) first, then multiply and divide."
    );
  }

  function initProblemSolver(config) {
    const statementEl = document.getElementById(config.statementId);
    const answerEl = document.getElementById(config.answerInputId);
    const checkBtn = document.getElementById(config.checkButtonId);
    const newBtn = document.getElementById(config.newButtonId);
    const feedbackEl = document.getElementById(config.feedbackId);
    const stepsEl = document.getElementById(config.stepsId);
    const canvas = document.getElementById(config.canvasId);
    const formulaAidEl = document.getElementById(config.formulaAidId);
    const toggleHintBtn = document.getElementById(config.toggleHintButtonId);
    const hintTextEl = document.getElementById(config.hintTextId);
    if (!statementEl || !answerEl || !checkBtn || !newBtn || !feedbackEl || !stepsEl || !canvas || !formulaAidEl || !toggleHintBtn || !hintTextEl) {
      return;
    }

    let current = null;
    let showHint = false;
    let mode = MODES.PROJECTILE;
    let difficulty = "basics";

    function newProblemByMode() {
      if (mode === MODES.NEWTON_FORCE) return newNewtonProblem(difficulty);
      if (mode === MODES.CIRCUITS) return newCircuitProblem(difficulty);
      if (mode === MODES.ELECTRIC_FIELD) return newElectricFieldProblem(difficulty);
      if (mode === MODES.WAVE) return newWaveProblem(difficulty);
      if (mode === MODES.SOUND) return newSoundProblem(difficulty);
      if (mode === MODES.THERMO) return newThermoProblem(difficulty);
      if (mode === MODES.THERMO_GAS) return newIdealGasProblem(difficulty);
      if (mode === MODES.OPTICS) return newOpticsProblem(difficulty);
      if (mode === MODES.OPTICS_REFRACTION) return newRefractionProblem(difficulty);
      return newProjectileProblem(difficulty);
    }

    function loadNew() {
      current = newProblemByMode();
      statementEl.textContent = current.statement;
      feedbackEl.textContent = "";
      stepsEl.textContent = "Submit an answer to see steps.";
      answerEl.value = "";
      hintTextEl.textContent = buildHint(current);
      hintTextEl.hidden = !showHint;
      toggleHintBtn.textContent = showHint ? "Hide Hint" : "Show Hint";
      if (mode === MODES.PROJECTILE) {
        drawResult(canvas, 0);
      } else {
        drawEmptyCanvas(canvas, current.resultLabel || "Expected value");
      }
    }

    function getUnitForMode(mode) {
      if (mode === MODES.PROJECTILE) return "m";
      if (mode === MODES.ELECTRIC_FIELD) return "N/C";
      if (mode === MODES.CIRCUITS) return "A";
      if (mode === MODES.WAVE) return "m";
      if (mode === MODES.THERMO) return "J";
      if (mode === MODES.OPTICS) return "cm";
      return "m";
    }

    function check() {
      if (!current) return;
      const user = Number(answerEl.value);
      if (!Number.isFinite(user)) {
        feedbackEl.textContent = "Enter a numeric answer.";
        return;
      }
      const tol = toleranceFor(current);
      const err = Math.abs(user - current.expected);
      feedbackEl.textContent =
        err <= tol
          ? `Correct! Your answer is within tolerance (+/-${formatWithUnit(tol, current.unit || getUnitForMode(mode))}).`
          : `Not quite. Expected value is about ${formatWithUnit(current.expected, current.unit || getUnitForMode(mode))}.`;
      stepsEl.textContent = buildSteps(current);
      if (mode === MODES.PROJECTILE) {
        drawResult(canvas, current.expected);
      } else {
        drawValueBar(canvas, current.resultLabel || "Expected value", current.expected);
      }

      window.dispatchEvent(
        new CustomEvent("physics:problemChecked", {
          detail: {
            mode,
            difficulty,
            correct: err <= tol,
            expected: current.expected,
            unit: current.unit || "",
          },
        })
      );
    }

    function setContext(context) {
      mode = modeFromContext(context?.discipline || "", context?.topic || "");
      difficulty = context?.level || "basics";
      renderFormulaAid(formulaAidEl, mode);
      loadNew();
    }

    checkBtn.addEventListener("click", check);
    answerEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        check();
      }
    });
    newBtn.addEventListener("click", loadNew);
    toggleHintBtn.addEventListener("click", () => {
      showHint = !showHint;
      hintTextEl.hidden = !showHint;
      toggleHintBtn.textContent = showHint ? "Hide Hint" : "Show Hint";
    });
    setContext({ discipline: "Mechanics", topic: "Kinematics" });

    return {
      setContext,
    };
  }

  window.initProblemSolver = initProblemSolver;
})();
