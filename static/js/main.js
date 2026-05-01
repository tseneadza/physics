async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) {
        message = body.error;
      }
    } catch (_err) {
      // Ignore parse errors and keep generic message.
    }
    throw new Error(message);
  }
  return res.json();
}

function setOptions(select, items) {
  select.innerHTML = "";
  items.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item;
    opt.textContent = item;
    select.appendChild(opt);
  });
}

let simulationController = null;
let problemController = null;
let progressTracker = null;

function disciplineKey(name) {
  if (name === "Electricity and Magnetism") return "electricity";
  if (name === "Mechanics") return "mechanics";
  if (name === "Waves") return "waves";
  if (name === "Thermodynamics") return "thermo";
  if (name === "Optics") return "optics";
  return "mechanics";
}

function applyDisciplineBackground(disciplineName) {
  document.body.dataset.discipline = disciplineKey(disciplineName);
}

function renderFormulaCards(container, formulas) {
  if (!container) return;
  if (!Array.isArray(formulas) || !formulas.length) {
    container.textContent = "No formulas available for this topic yet.";
    return;
  }
  container.innerHTML = formulas
    .map(
      (f) => `
      <div class="formula-card">
        <div><strong>${f.name}</strong></div>
        <div class="equation">${f.equation}</div>
        <div>${f.variables}</div>
        <div><em>${f.units}</em></div>
        <div><strong>When to use:</strong> ${f.when_to_use || "General topic formula."}</div>
        ${
          Array.isArray(f.rearrangements) && f.rearrangements.length
            ? `<div><strong>Rearrangements:</strong><ul>${f.rearrangements.map((r) => `<li>${r}</li>`).join("")}</ul></div>`
            : ""
        }
      </div>
    `
    )
    .join("");
}

async function initTopicLearning() {
  const disciplineSelect = document.getElementById("disciplineSelect");
  const topicSelect = document.getElementById("topicSelect");
  const levelSelect = document.getElementById("levelSelect");
  const heading = document.getElementById("lessonHeading");
  const text = document.getElementById("lessonText");
  const diagram = document.getElementById("lessonDiagram");
  const lessonFormulaList = document.getElementById("lessonFormulaList");
  if (!disciplineSelect || !topicSelect || !levelSelect || !heading || !text || !diagram || !lessonFormulaList) {
    throw new Error("Topic learning UI is missing required elements.");
  }

  const data = await getJson("/api/disciplines");
  const disciplines = data.disciplines || [];
  if (!disciplines.length) {
    text.textContent = "No disciplines available.";
    return;
  }

  const byName = new Map(disciplines.map((d) => [d.name, d.topics]));
  if (progressTracker && typeof progressTracker.setCatalog === "function") {
    progressTracker.setCatalog(disciplines);
  }
  setOptions(
    disciplineSelect,
    disciplines.map((d) => d.name)
  );

  function syncSimulationContext() {
    if (!simulationController || typeof simulationController.setContext !== "function") return;
    simulationController.setContext({
      discipline: disciplineSelect.value,
      topic: topicSelect.value,
    });
  }

  function syncProblemContext() {
    if (!problemController || typeof problemController.setContext !== "function") return;
    problemController.setContext({
      discipline: disciplineSelect.value,
      topic: topicSelect.value,
      level: levelSelect.value,
    });
  }

  function updateTopics() {
    const topics = byName.get(disciplineSelect.value) || [];
    setOptions(topicSelect, topics);
    applyDisciplineBackground(disciplineSelect.value);
    syncSimulationContext();
    syncProblemContext();
    if (progressTracker && typeof progressTracker.render === "function") {
      progressTracker.render(disciplineSelect.value);
    }
    loadLesson().catch((err) => {
      text.textContent = `Failed to load lesson: ${err.message}`;
    });
  }

  disciplineSelect.addEventListener("change", updateTopics);
  topicSelect.addEventListener("change", () => {
    syncSimulationContext();
    syncProblemContext();
    loadLesson().catch((err) => {
      text.textContent = `Failed to load lesson: ${err.message}`;
    });
  });
  levelSelect.addEventListener("change", () => {
    syncProblemContext();
    loadLesson().catch((err) => {
      text.textContent = `Failed to load lesson: ${err.message}`;
    });
  });
  updateTopics();

  async function loadLesson() {
    if (!disciplineSelect.value || !topicSelect.value) {
      throw new Error("Select both discipline and topic.");
    }
    const discipline = encodeURIComponent(disciplineSelect.value);
    const topic = encodeURIComponent(topicSelect.value);
    const level = encodeURIComponent(levelSelect.value);
    const [lesson, formulaData] = await Promise.all([
      getJson(`/api/lesson?discipline=${discipline}&topic=${topic}&level=${level}`),
      getJson(`/api/formulas?discipline=${discipline}&topic=${topic}`),
    ]);
    heading.textContent = `${lesson.discipline} - ${lesson.topic} (${lesson.level})`;
    text.textContent = lesson.lesson;
    diagram.alt = `${lesson.discipline} ${lesson.topic} diagram`;
    diagram.src = `/api/diagram?discipline=${discipline}&topic=${topic}&t=${Date.now()}`;
    renderFormulaCards(lessonFormulaList, formulaData.formulas || []);
    if (progressTracker && typeof progressTracker.markViewed === "function") {
      progressTracker.markViewed(lesson.discipline, lesson.topic);
    }
  }

  await loadLesson();

  window.addEventListener("physics:problemChecked", () => {
    if (progressTracker && typeof progressTracker.markPracticed === "function") {
      progressTracker.markPracticed(disciplineSelect.value, topicSelect.value);
    }
  });
}

function initModules() {
  if (typeof window.initProblemSolver !== "function") {
    throw new Error("Problem solver module failed to load.");
  }

  problemController = window.initProblemSolver({
    statementId: "problemStatement",
    answerInputId: "problemAnswer",
    checkButtonId: "checkProblemBtn",
    newButtonId: "newProblemBtn",
    feedbackId: "problemFeedback",
    stepsId: "problemSteps",
    canvasId: "problemCanvas",
    formulaAidId: "problemFormulaAid",
    toggleHintButtonId: "toggleHintBtn",
    hintTextId: "problemHint",
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.createProgressTracker === "function") {
    progressTracker = window.createProgressTracker({
      summaryId: "progressSummary",
      listId: "progressList",
      resetButtonId: "resetProgressBtn",
    });
  }

  try {
    simulationController = window.initSimulation({
      headingId: "simHeading",
      modeDescriptionId: "simModeDescription",
      param1LabelId: "simParam1Label",
      param2LabelId: "simParam2Label",
      param3LabelId: "simParam3Label",
      param1InputId: "simParam1",
      param2InputId: "simParam2",
      param3InputId: "simParam3",
      runButtonId: "simRunBtn",
      metric1LabelId: "simMetric1Label",
      metric2LabelId: "simMetric2Label",
      metric3LabelId: "simMetric3Label",
      metric1OutputId: "simMetric1",
      metric2OutputId: "simMetric2",
      metric3OutputId: "simMetric3",
      canvasId: "simCanvas",
    });
  } catch (err) {
    const text = document.getElementById("lessonText");
    if (text) {
      text.textContent = `Simulation initialization error: ${err.message}`;
    }
  }

  initTopicLearning().catch((err) => {
    const text = document.getElementById("lessonText");
    if (text) {
      text.textContent = `Initialization error: ${err.message}`;
    }
  });
  initModules();
});
