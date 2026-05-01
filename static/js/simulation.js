(function () {
  const MODES = window.PhysicsCommon.MODES;
  const toRad = window.PhysicsCommon.toRad;

  function computeProjectile(speed, angleDeg, gravity) {
    const angle = toRad(angleDeg);
    const vx = speed * Math.cos(angle);
    const vy = speed * Math.sin(angle);
    const timeFlight = (2 * vy) / gravity;
    const range = vx * timeFlight;
    const maxHeight = (vy * vy) / (2 * gravity);
    return { vx, vy, timeFlight, range, maxHeight };
  }

  function buildProjectileTrajectory(vx, vy, gravity, totalTime, points) {
    const out = [];
    for (let i = 0; i <= points; i += 1) {
      const t = (i / points) * totalTime;
      const x = vx * t;
      const y = vy * t - 0.5 * gravity * t * t;
      out.push({ x, y: Math.max(0, y) });
    }
    return out;
  }

  function drawAxes(ctx, w, h, pad) {
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.moveTo(pad, h - pad);
    ctx.lineTo(pad, pad);
    ctx.stroke();
  }

  function drawProjectile(canvas, traj, range, maxHeight) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const pad = 24;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    drawAxes(ctx, w, h, pad);

    const xScale = (w - 2 * pad) / Math.max(range, 1);
    const yScale = (h - 2 * pad) / Math.max(maxHeight * 1.2, 1);

    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    traj.forEach((p, idx) => {
      const px = pad + p.x * xScale;
      const py = h - pad - p.y * yScale;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }

  function drawCurve(canvas, points, xMax, yMax, color) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const pad = 24;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    drawAxes(ctx, w, h, pad);

    const xScale = (w - 2 * pad) / Math.max(xMax, 1e-6);
    const yScale = (h - 2 * pad) / Math.max(yMax, 1e-6);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((p, idx) => {
      const px = pad + p.x * xScale;
      const py = h - pad - p.y * yScale;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }

  function drawBars(canvas, bars) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const pad = 24;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    const barAreaWidth = w - pad * 2;
    const barWidth = barAreaWidth / (bars.length * 1.7);
    const maxVal = Math.max(...bars.map((b) => b.value), 1e-6);

    bars.forEach((bar, i) => {
      const x = pad + i * (barWidth * 1.7);
      const height = ((h - pad * 2) * bar.value) / maxVal;
      const y = h - pad - height;
      ctx.fillStyle = bar.color;
      ctx.fillRect(x, y, barWidth, height);
      ctx.fillStyle = "#0f172a";
      ctx.font = "12px Arial";
      ctx.fillText(bar.label, x, h - 8);
    });
  }

  const modeFromContext = window.PhysicsCommon.modeFromContext;

  function format(value) {
    if (!Number.isFinite(value)) return "-";
    const abs = Math.abs(value);
    if (abs > 0 && abs < 0.01) return value.toFixed(4);
    return value.toFixed(2);
  }

  function setNumberInput(input, value, step, min, max) {
    input.value = value;
    input.step = step;
    if (min !== undefined) {
      input.min = String(min);
    } else {
      input.removeAttribute("min");
    }
    if (max !== undefined) {
      input.max = String(max);
    } else {
      input.removeAttribute("max");
    }
  }

  function initSimulation(config) {
    const heading = document.getElementById(config.headingId);
    const modeDescription = document.getElementById(config.modeDescriptionId);
    const param1Label = document.getElementById(config.param1LabelId);
    const param2Label = document.getElementById(config.param2LabelId);
    const param3Label = document.getElementById(config.param3LabelId);
    const param1Input = document.getElementById(config.param1InputId);
    const param2Input = document.getElementById(config.param2InputId);
    const param3Input = document.getElementById(config.param3InputId);
    const runButton = document.getElementById(config.runButtonId);
    const metric1Label = document.getElementById(config.metric1LabelId);
    const metric2Label = document.getElementById(config.metric2LabelId);
    const metric3Label = document.getElementById(config.metric3LabelId);
    const metric1Out = document.getElementById(config.metric1OutputId);
    const metric2Out = document.getElementById(config.metric2OutputId);
    const metric3Out = document.getElementById(config.metric3OutputId);
    const canvas = document.getElementById(config.canvasId);
    if (
      !heading ||
      !modeDescription ||
      !param1Label ||
      !param2Label ||
      !param3Label ||
      !param1Input ||
      !param2Input ||
      !param3Input ||
      !runButton ||
      !metric1Label ||
      !metric2Label ||
      !metric3Label ||
      !metric1Out ||
      !metric2Out ||
      !metric3Out ||
      !canvas
    ) {
      return {
        setContext: () => {},
      };
    }

    let mode = MODES.PROJECTILE;

    function setMetrics(label1, value1, label2, value2, label3, value3) {
      metric1Label.textContent = `${label1}:`;
      metric2Label.textContent = `${label2}:`;
      metric3Label.textContent = `${label3}:`;
      metric1Out.textContent = value1;
      metric2Out.textContent = value2;
      metric3Out.textContent = value3;
    }

    function configureUiForMode() {
      if (mode === MODES.PROJECTILE) {
        heading.textContent = "Interactive Simulation (Projectile Motion)";
        modeDescription.textContent = "Mechanics simulation: adjust launch conditions and observe trajectory.";
        param1Label.textContent = "Initial Speed (m/s)";
        param2Label.textContent = "Angle (degrees)";
        param3Label.textContent = "Gravity (m/s^2)";
        setNumberInput(param1Input, 20, "0.1", 0.1, undefined);
        setNumberInput(param2Input, 45, "0.1", 0.1, 89.9);
        setNumberInput(param3Input, 9.81, "0.1", 0.1, undefined);
        return;
      }
      if (mode === MODES.NEWTON_FORCE) {
        heading.textContent = "Interactive Simulation (Newton's Laws)";
        modeDescription.textContent = "Force simulation: explore acceleration and motion from net force and mass.";
        param1Label.textContent = "Mass m (kg)";
        param2Label.textContent = "Net Force F (N)";
        param3Label.textContent = "Time t (s)";
        setNumberInput(param1Input, 2, "0.1", 0.1, undefined);
        setNumberInput(param2Input, 10, "0.1", 0.1, undefined);
        setNumberInput(param3Input, 5, "0.1", 0.1, undefined);
        return;
      }
      if (mode === MODES.ELECTRIC_FIELD) {
        heading.textContent = "Interactive Simulation (Electric Field)";
        modeDescription.textContent = "Electric fields simulation: observe how field strength changes with distance.";
        param1Label.textContent = "Charge Magnitude (uC)";
        param2Label.textContent = "Distance r (m)";
        param3Label.textContent = "Relative Permittivity (epsilon_r)";
        setNumberInput(param1Input, 5, "0.1", 0.1, undefined);
        setNumberInput(param2Input, 1, "0.1", 0.05, undefined);
        setNumberInput(param3Input, 1, "0.1", 1, undefined);
        return;
      }
      if (mode === MODES.CIRCUITS) {
        heading.textContent = "Interactive Simulation (DC Circuits)";
        modeDescription.textContent = "Circuits simulation: see current and power from Ohm's law.";
        param1Label.textContent = "Voltage V (V)";
        param2Label.textContent = "Resistance R (ohm)";
        param3Label.textContent = "Time t (s)";
        setNumberInput(param1Input, 12, "0.1", 0.1, undefined);
        setNumberInput(param2Input, 6, "0.1", 0.1, undefined);
        setNumberInput(param3Input, 10, "0.1", 0.1, undefined);
        return;
      }
      if (mode === MODES.THERMO) {
        heading.textContent = "Interactive Simulation (Thermodynamics)";
        modeDescription.textContent = "Thermo simulation: estimate heat transfer from mass, specific heat, and temperature change.";
        param1Label.textContent = "Mass m (kg)";
        param2Label.textContent = "Specific Heat c (J/kg*K)";
        param3Label.textContent = "Delta T (K)";
        setNumberInput(param1Input, 1, "0.1", 0.1, undefined);
        setNumberInput(param2Input, 4186, "1", 1, undefined);
        setNumberInput(param3Input, 20, "0.1", 0.1, undefined);
        return;
      }
      if (mode === MODES.THERMO_GAS) {
        heading.textContent = "Interactive Simulation (Ideal Gas Basics)";
        modeDescription.textContent = "Ideal gas simulation: estimate moles and state relation using PV = nRT.";
        param1Label.textContent = "Pressure P (kPa)";
        param2Label.textContent = "Volume V (L)";
        param3Label.textContent = "Temperature T (K)";
        setNumberInput(param1Input, 101.3, "0.1", 1, undefined);
        setNumberInput(param2Input, 22.4, "0.1", 0.1, undefined);
        setNumberInput(param3Input, 273.15, "0.1", 1, undefined);
        return;
      }
      if (mode === MODES.OPTICS) {
        heading.textContent = "Interactive Simulation (Optics)";
        modeDescription.textContent = "Optics simulation: compute image distance and magnification for a thin lens.";
        param1Label.textContent = "Focal length f (cm)";
        param2Label.textContent = "Object distance do (cm)";
        param3Label.textContent = "Object height ho (cm)";
        setNumberInput(param1Input, 10, "0.1", 0.1, undefined);
        setNumberInput(param2Input, 30, "0.1", 0.2, undefined);
        setNumberInput(param3Input, 5, "0.1", 0.1, undefined);
        return;
      }
      if (mode === MODES.OPTICS_REFRACTION) {
        heading.textContent = "Interactive Simulation (Reflection and Refraction)";
        modeDescription.textContent = "Snell's law simulation: change media and incidence angle to see refraction.";
        param1Label.textContent = "n1 (incident medium)";
        param2Label.textContent = "n2 (transmission medium)";
        param3Label.textContent = "Incident angle theta1 (deg)";
        setNumberInput(param1Input, 1, "0.01", 1, undefined);
        setNumberInput(param2Input, 1.5, "0.01", 1, undefined);
        setNumberInput(param3Input, 35, "0.1", 0.1, 89.9);
        return;
      }
      if (mode === MODES.SOUND) {
        heading.textContent = "Interactive Simulation (Sound)";
        modeDescription.textContent = "Sound simulation: relate frequency, wavelength, and propagation speed.";
        param1Label.textContent = "Frequency f (Hz)";
        param2Label.textContent = "Speed v (m/s)";
        param3Label.textContent = "Amplitude A";
        setNumberInput(param1Input, 440, "1", 1, undefined);
        setNumberInput(param2Input, 343, "0.1", 1, undefined);
        setNumberInput(param3Input, 1, "0.1", 0.1, undefined);
        return;
      }
      heading.textContent = "Interactive Simulation (Waves)";
      modeDescription.textContent = "Wave simulation: adjust amplitude/frequency and inspect wave profile.";
      param1Label.textContent = "Amplitude A (m)";
      param2Label.textContent = "Frequency f (Hz)";
      param3Label.textContent = "Wave Speed v (m/s)";
      setNumberInput(param1Input, 1.5, "0.1", 0.1, undefined);
      setNumberInput(param2Input, 2, "0.1", 0.1, undefined);
      setNumberInput(param3Input, 6, "0.1", 0.1, undefined);
    }

    function run() {
      const raw1 = Number(param1Input.value);
      const raw2 = Number(param2Input.value);
      const raw3 = Number(param3Input.value);

      if (mode === MODES.PROJECTILE) {
        const speed = Number.isFinite(raw1) ? Math.max(0.1, raw1) : 0.1;
        const angle = Number.isFinite(raw2) ? Math.min(89.9, Math.max(0.1, raw2)) : 45;
        const gravity = Number.isFinite(raw3) ? Math.max(0.1, raw3) : 9.81;
        const result = computeProjectile(speed, angle, gravity);
        const traj = buildProjectileTrajectory(result.vx, result.vy, gravity, result.timeFlight, 120);
        drawProjectile(canvas, traj, result.range, result.maxHeight);
        setMetrics(
          "Time of flight",
          `${format(result.timeFlight)} s`,
          "Range",
          `${format(result.range)} m`,
          "Max height",
          `${format(result.maxHeight)} m`
        );
        return;
      }
      if (mode === MODES.NEWTON_FORCE) {
        const mass = Number.isFinite(raw1) ? Math.max(0.1, raw1) : 1;
        const force = Number.isFinite(raw2) ? Math.max(0.1, raw2) : 1;
        const time = Number.isFinite(raw3) ? Math.max(0.1, raw3) : 1;
        const acceleration = force / mass;
        const finalVelocity = acceleration * time;
        const displacement = 0.5 * acceleration * time * time;
        const points = [];
        for (let i = 0; i <= 80; i += 1) {
          const t = (i / 80) * time;
          points.push({ x: t, y: acceleration * t });
        }
        drawCurve(canvas, points, time, Math.max(finalVelocity * 1.2, 1), "#2563eb");
        setMetrics(
          "Acceleration",
          `${format(acceleration)} m/s^2`,
          "Final velocity",
          `${format(finalVelocity)} m/s`,
          "Displacement",
          `${format(displacement)} m`
        );
        return;
      }

      if (mode === MODES.ELECTRIC_FIELD) {
        const chargeUc = Number.isFinite(raw1) ? Math.max(0.1, raw1) : 1;
        const distance = Number.isFinite(raw2) ? Math.max(0.05, raw2) : 1;
        const epsilonR = Number.isFinite(raw3) ? Math.max(1, raw3) : 1;
        const k = 8.9875517923e9 / epsilonR;
        const q = chargeUc * 1e-6;
        const fieldAtDistance = (k * q) / (distance * distance);
        const potentialAtDistance = (k * q) / distance;
        const forceOn1uC = fieldAtDistance * 1e-6;

        const maxR = Math.max(distance * 3, 3);
        const points = [];
        for (let i = 0; i <= 120; i += 1) {
          const r = 0.05 + (i / 120) * (maxR - 0.05);
          const e = (k * q) / (r * r);
          points.push({ x: r, y: e });
        }
        const yMax = Math.max(...points.map((p) => p.y), fieldAtDistance);
        drawCurve(canvas, points, maxR, yMax, "#7c3aed");
        setMetrics(
          "Field E(r)",
          `${format(fieldAtDistance)} N/C`,
          "Potential V(r)",
          `${format(potentialAtDistance)} V`,
          "Force on +1uC",
          `${format(forceOn1uC)} N`
        );
        return;
      }

      if (mode === MODES.CIRCUITS) {
        const voltage = Number.isFinite(raw1) ? Math.max(0.1, raw1) : 1;
        const resistance = Number.isFinite(raw2) ? Math.max(0.1, raw2) : 1;
        const time = Number.isFinite(raw3) ? Math.max(0.1, raw3) : 1;
        const current = voltage / resistance;
        const power = voltage * current;
        const energy = power * time;
        drawBars(canvas, [
          { label: "I(A)", value: current, color: "#2563eb" },
          { label: "P(W)", value: power, color: "#16a34a" },
          { label: "E(J)", value: energy, color: "#f97316" },
        ]);
        setMetrics(
          "Current",
          `${format(current)} A`,
          "Power",
          `${format(power)} W`,
          "Energy",
          `${format(energy)} J`
        );
        return;
      }
      if (mode === MODES.THERMO) {
        const mass = Number.isFinite(raw1) ? Math.max(0.1, raw1) : 1;
        const specificHeat = Number.isFinite(raw2) ? Math.max(1, raw2) : 4186;
        const deltaT = Number.isFinite(raw3) ? Math.max(0.1, raw3) : 20;
        const heatQ = mass * specificHeat * deltaT;
        const points = [];
        const maxT = Math.max(deltaT * 1.2, 1);
        for (let i = 0; i <= 100; i += 1) {
          const t = (i / 100) * maxT;
          points.push({ x: t, y: mass * specificHeat * t });
        }
        drawCurve(canvas, points, maxT, heatQ * 1.2, "#ea580c");
        setMetrics(
          "Heat Q",
          `${format(heatQ)} J`,
          "Energy per K",
          `${format(mass * specificHeat)} J/K`,
          "Delta T",
          `${format(deltaT)} K`
        );
        return;
      }
      if (mode === MODES.THERMO_GAS) {
        const pressureKpa = Number.isFinite(raw1) ? Math.max(1, raw1) : 101.3;
        const volumeL = Number.isFinite(raw2) ? Math.max(0.1, raw2) : 22.4;
        const tempK = Number.isFinite(raw3) ? Math.max(1, raw3) : 273.15;
        const p = pressureKpa * 1000;
        const v = volumeL / 1000;
        const R = 8.314;
        const moles = (p * v) / (R * tempK);
        const pressureFromState = (moles * R * tempK) / v / 1000;
        const points = [];
        const maxV = Math.max(volumeL * 1.8, 1);
        for (let i = 0; i <= 80; i += 1) {
          const vLit = 0.1 + (i / 80) * (maxV - 0.1);
          const vM3 = vLit / 1000;
          const pKpa = (moles * R * tempK) / vM3 / 1000;
          points.push({ x: vLit, y: pKpa });
        }
        drawCurve(canvas, points, maxV, Math.max(...points.map((pt) => pt.y)), "#f97316");
        setMetrics(
          "Estimated moles n",
          `${format(moles)} mol`,
          "State pressure",
          `${format(pressureFromState)} kPa`,
          "PV product",
          `${format(pressureKpa * volumeL)} kPa*L`
        );
        return;
      }
      if (mode === MODES.OPTICS) {
        const f = Number.isFinite(raw1) ? Math.max(0.1, raw1) : 10;
        const doDist = Number.isFinite(raw2) ? Math.max(0.2, raw2) : 30;
        const ho = Number.isFinite(raw3) ? Math.max(0.1, raw3) : 5;
        const denominator = 1 / f - 1 / doDist;
        const di = Math.abs(denominator) < 1e-9 ? Infinity : 1 / denominator;
        const magnification = Number.isFinite(di) ? -di / doDist : Infinity;
        const hi = Number.isFinite(magnification) ? magnification * ho : Infinity;

        const lensX = canvas.width / 2;
        const yMid = canvas.height / 2;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(20, yMid);
        ctx.lineTo(canvas.width - 20, yMid);
        ctx.moveTo(lensX, 30);
        ctx.lineTo(lensX, canvas.height - 30);
        ctx.stroke();

        const scale = 8;
        const objX = lensX - doDist * scale;
        ctx.strokeStyle = "#2563eb";
        ctx.beginPath();
        ctx.moveTo(objX, yMid);
        ctx.lineTo(objX, yMid - ho * scale);
        ctx.stroke();

        if (Number.isFinite(di) && Number.isFinite(hi)) {
          const imgX = lensX + di * scale;
          ctx.strokeStyle = "#dc2626";
          ctx.beginPath();
          ctx.moveTo(imgX, yMid);
          ctx.lineTo(imgX, yMid - hi * scale);
          ctx.stroke();
        }

        setMetrics(
          "Image distance di",
          Number.isFinite(di) ? `${format(di)} cm` : "Infinity",
          "Magnification m",
          Number.isFinite(magnification) ? `${format(magnification)}x` : "Infinity",
          "Image height hi",
          Number.isFinite(hi) ? `${format(hi)} cm` : "Infinity"
        );
        return;
      }
      if (mode === MODES.OPTICS_REFRACTION) {
        const n1 = Number.isFinite(raw1) ? Math.max(1, raw1) : 1;
        const n2 = Number.isFinite(raw2) ? Math.max(1, raw2) : 1.5;
        const theta1Deg = Number.isFinite(raw3) ? Math.min(89.9, Math.max(0.1, raw3)) : 35;
        const theta1 = toRad(theta1Deg);
        const sinTheta2 = (n1 / n2) * Math.sin(theta1);
        const tir = Math.abs(sinTheta2) > 1;
        const theta2Deg = tir ? NaN : (Math.asin(sinTheta2) * 180) / Math.PI;

        const ctx = canvas.getContext("2d");
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(20, cy);
        ctx.lineTo(w - 20, cy);
        ctx.moveTo(cx, 20);
        ctx.lineTo(cx, h - 20);
        ctx.stroke();

        const rayLen = 160;
        const inX = cx - rayLen * Math.sin(theta1);
        const inY = cy - rayLen * Math.cos(theta1);
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(inX, inY);
        ctx.lineTo(cx, cy);
        ctx.stroke();

        if (tir) {
          const reflX = cx + rayLen * Math.sin(theta1);
          const reflY = cy - rayLen * Math.cos(theta1);
          ctx.strokeStyle = "#dc2626";
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(reflX, reflY);
          ctx.stroke();
        } else {
          const outX = cx + rayLen * Math.sin(toRad(theta2Deg));
          const outY = cy + rayLen * Math.cos(toRad(theta2Deg));
          ctx.strokeStyle = "#16a34a";
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(outX, outY);
          ctx.stroke();
        }

        setMetrics(
          "Incident angle",
          `${format(theta1Deg)} deg`,
          "Refracted angle",
          tir ? "TIR" : `${format(theta2Deg)} deg`,
          "n1/n2 ratio",
          `${format(n1 / n2)}`
        );
        return;
      }
      if (mode === MODES.SOUND) {
        const frequency = Number.isFinite(raw1) ? Math.max(1, raw1) : 440;
        const speed = Number.isFinite(raw2) ? Math.max(1, raw2) : 343;
        const amplitude = Number.isFinite(raw3) ? Math.max(0.1, raw3) : 1;
        const wavelength = speed / frequency;
        const period = 1 / frequency;
        const intensityProxy = amplitude * amplitude * frequency * frequency;
        const points = [];
        const maxX = Math.max(wavelength * 4, 2);
        for (let i = 0; i <= 200; i += 1) {
          const x = (i / 200) * maxX;
          const y = amplitude * Math.sin((2 * Math.PI * x) / wavelength);
          points.push({ x, y: y + amplitude });
        }
        drawCurve(canvas, points, maxX, amplitude * 2, "#0891b2");
        setMetrics(
          "Wavelength",
          `${format(wavelength)} m`,
          "Period",
          `${format(period)} s`,
          "Intensity proxy",
          `${format(intensityProxy)}`
        );
        return;
      }

      const amplitude = Number.isFinite(raw1) ? Math.max(0.1, raw1) : 1;
      const frequency = Number.isFinite(raw2) ? Math.max(0.1, raw2) : 1;
      const speed = Number.isFinite(raw3) ? Math.max(0.1, raw3) : 1;
      const wavelength = speed / frequency;
      const period = 1 / frequency;
      const points = [];
      const maxX = Math.max(wavelength * 2, 4);
      for (let i = 0; i <= 180; i += 1) {
        const x = (i / 180) * maxX;
        const y = amplitude * Math.sin((2 * Math.PI * x) / wavelength);
        points.push({ x, y: y + amplitude });
      }
      drawCurve(canvas, points, maxX, amplitude * 2, "#0891b2");
      setMetrics(
        "Wavelength",
        `${format(wavelength)} m`,
        "Period",
        `${format(period)} s`,
        "Wave speed",
        `${format(speed)} m/s`
      );
    }

    function setContext(context) {
      mode = modeFromContext(context?.discipline || "", context?.topic || "");
      configureUiForMode();
      run();
    }

    runButton.addEventListener("click", run);
    setContext({ discipline: "Mechanics", topic: "Kinematics" });

    return {
      setContext,
    };
  }

  window.initSimulation = initSimulation;
})();
