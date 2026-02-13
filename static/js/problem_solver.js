(function () {
  const MODES = window.PhysicsCommon.MODES;
  const toRad = window.PhysicsCommon.toRad;
  const modeFromContext = window.PhysicsCommon.modeFromContext;

  function newProjectileProblem() {
    const speed = 12 + Math.floor(Math.random() * 14); // 12..25
    const angle = [30, 35, 40, 45, 50, 55, 60][Math.floor(Math.random() * 7)];
    const gravity = 9.81;
    const range = (speed * speed * Math.sin(2 * toRad(angle))) / gravity;
    return {
      speed,
      angle,
      gravity,
      expected: range,
      mode: MODES.PROJECTILE,
      statement:
        `A projectile is launched at ${speed} m/s and ${angle} degrees. ` +
        "Ignoring air resistance, estimate its horizontal range (in meters).",
    };
  }

  function newElectricFieldProblem() {
    const qUc = 1 + Math.floor(Math.random() * 9);
    const r = 1 + Math.floor(Math.random() * 5);
    const k = 8.9875517923e9;
    const expected = (k * qUc * 1e-6) / (r * r);
    return {
      qUc,
      r,
      expected,
      mode: MODES.ELECTRIC_FIELD,
      statement: `A point charge of ${qUc} microC is observed at ${r} m. Estimate field magnitude E = kq/r^2 (N/C).`,
    };
  }

  function newCircuitProblem() {
    const v = 6 + Math.floor(Math.random() * 15);
    const r = 2 + Math.floor(Math.random() * 9);
    const expected = v / r;
    return {
      v,
      r,
      expected,
      mode: MODES.CIRCUITS,
      statement: `A resistor of ${r} ohm is connected to ${v} V. Estimate current I (A).`,
    };
  }

  function newWaveProblem() {
    const speed = 2 + Math.floor(Math.random() * 9);
    const freq = 1 + Math.floor(Math.random() * 6);
    const expected = speed / freq;
    return {
      speed,
      freq,
      expected,
      mode: MODES.WAVE,
      statement: `A wave travels at ${speed} m/s with frequency ${freq} Hz. Estimate wavelength lambda (m).`,
    };
  }

  function newThermoProblem() {
    const m = 1 + Math.floor(Math.random() * 4);
    const c = 4200;
    const dT = 5 + Math.floor(Math.random() * 30);
    const expected = m * c * dT;
    return {
      m,
      c,
      dT,
      expected,
      mode: MODES.THERMO,
      statement: `Heat ${m} kg of water by ${dT} C. Estimate heat energy Q (J) using Q = m*c*DeltaT.`,
    };
  }

  function newOpticsProblem() {
    const f = 10;
    const doDist = 30;
    const expected = 1 / (1 / f - 1 / doDist);
    return {
      f,
      doDist,
      expected,
      mode: MODES.OPTICS,
      statement: `For a thin lens with f=${f} cm and object distance do=${doDist} cm, estimate image distance di (cm).`,
    };
  }

  function buildSteps(problem) {
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
    ctx.fillText(`${label}: ${value.toFixed(2)}`, pad, h / 2 - 28);
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
    if (problem.mode === MODES.CIRCUITS) {
      return `Use I = V/R with V=${problem.v} and R=${problem.r}.`;
    }
    if (problem.mode === MODES.ELECTRIC_FIELD) {
      return `Use E = k*q/r^2 with q=${problem.qUc} microC and r=${problem.r} m.`;
    }
    if (problem.mode === MODES.WAVE) {
      return `Use lambda = v/f with v=${problem.speed} and f=${problem.freq}.`;
    }
    if (problem.mode === MODES.THERMO) {
      return `Use Q = m*c*DeltaT with m=${problem.m}, c=${problem.c}, DeltaT=${problem.dT}.`;
    }
    if (problem.mode === MODES.OPTICS) {
      return `Use 1/f = 1/do + 1/di with f=${problem.f}, do=${problem.doDist}.`;
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

    function newProblemByMode() {
      if (mode === MODES.CIRCUITS) return newCircuitProblem();
      if (mode === MODES.ELECTRIC_FIELD) return newElectricFieldProblem();
      if (mode === MODES.WAVE) return newWaveProblem();
      if (mode === MODES.THERMO) return newThermoProblem();
      if (mode === MODES.OPTICS) return newOpticsProblem();
      return newProjectileProblem();
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
        drawEmptyCanvas(canvas, "Expected value");
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
      if (!Number.isFinite(user) || user < 0) {
        feedbackEl.textContent = "Enter a numeric answer.";
        return;
      }
      const tol = Math.max(0.5, current.expected * 0.05);
      const err = Math.abs(user - current.expected);
      const unit = getUnitForMode(mode);
      feedbackEl.textContent =
        err <= tol
          ? `Correct! Your answer is within tolerance (+/-${tol.toFixed(2)} ${unit}).`
          : `Not quite. Expected value is about ${current.expected.toFixed(2)} ${unit}.`;
      stepsEl.textContent = buildSteps(current);
      if (mode === MODES.PROJECTILE) {
        drawResult(canvas, current.expected);
      } else {
        drawValueBar(canvas, "Expected value", current.expected);
      }
    }

    function setContext(context) {
      mode = modeFromContext(context?.discipline || "", context?.topic || "");
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
