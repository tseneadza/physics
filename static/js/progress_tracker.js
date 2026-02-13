(function () {
  const STORAGE_KEY = "physics.progress.v1";

  function readStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_err) {
      return {};
    }
  }

  function writeStore(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function ensureTopic(data, discipline, topic) {
    if (!data[discipline]) data[discipline] = {};
    if (!data[discipline][topic]) {
      data[discipline][topic] = {
        viewed: false,
        practiced: false,
        viewedAt: null,
        practicedAt: null,
      };
    }
    return data[discipline][topic];
  }

  function createProgressTracker(config) {
    const summaryEl = document.getElementById(config.summaryId);
    const listEl = document.getElementById(config.listId);
    const resetBtn = document.getElementById(config.resetButtonId);
    if (!summaryEl || !listEl || !resetBtn) {
      return {
        setCatalog: () => {},
        markViewed: () => {},
        markPracticed: () => {},
        render: () => {},
      };
    }

    let catalog = [];

    function setCatalog(disciplines) {
      catalog = Array.isArray(disciplines) ? disciplines : [];
      render();
    }

    function markViewed(discipline, topic) {
      if (!discipline || !topic) return;
      const data = readStore();
      const entry = ensureTopic(data, discipline, topic);
      entry.viewed = true;
      entry.viewedAt = Date.now();
      writeStore(data);
      render(discipline);
    }

    function markPracticed(discipline, topic) {
      if (!discipline || !topic) return;
      const data = readStore();
      const entry = ensureTopic(data, discipline, topic);
      entry.practiced = true;
      entry.practicedAt = Date.now();
      writeStore(data);
      render(discipline);
    }

    function summarize(data) {
      let totalTopics = 0;
      let viewed = 0;
      let practiced = 0;
      catalog.forEach((d) => {
        const topics = Array.isArray(d.topics) ? d.topics : [];
        totalTopics += topics.length;
        topics.forEach((topic) => {
          const state = data[d.name]?.[topic];
          if (state?.viewed) viewed += 1;
          if (state?.practiced) practiced += 1;
        });
      });
      return { totalTopics, viewed, practiced };
    }

    function render(currentDiscipline) {
      const data = readStore();
      const stats = summarize(data);
      summaryEl.textContent = `Viewed: ${stats.viewed}/${stats.totalTopics} topics, Practiced: ${stats.practiced}/${stats.totalTopics} topics.`;

      const disciplineToShow =
        currentDiscipline || (catalog[0] && catalog[0].name) || null;
      const selected = catalog.find((d) => d.name === disciplineToShow);
      if (!selected) {
        listEl.textContent = "No topics available.";
        return;
      }

      const html = selected.topics
        .map((topic) => {
          const state = data[selected.name]?.[topic] || {};
          const viewed = state.viewed ? "Viewed" : "Not viewed";
          const practiced = state.practiced ? "Practiced" : "Not practiced";
          return `
            <div class="progress-topic-item">
              <span>${topic}</span>
              <span class="progress-status">${viewed} · ${practiced}</span>
            </div>
          `;
        })
        .join("");
      listEl.innerHTML = `<div class="progress-topic-list">${html}</div>`;
    }

    resetBtn.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      render();
    });

    return {
      setCatalog,
      markViewed,
      markPracticed,
      render,
    };
  }

  window.createProgressTracker = createProgressTracker;
})();
