# Physics App PRD

## Overview
Create a web app that teaches core physics concepts across multiple disciplines. Users choose a discipline, pick a topic, and learn through short lessons, interactive simulations, and problem-solving activities. Visual aids support both concept understanding and worked results.

Primary audience is mixed (K-12, intro undergrad, and self-learners), so topics should support at least two difficulty levels:
- Basics
- Intermediate

Core learning loop:
1. Choose discipline
2. Choose topic
3. Read lesson with diagram(s)
4. Try an interactive simulation
5. Solve a problem and review step-by-step solution with a result visual

## Tech Stack
Python backend with a web app frontend (browser-based). Frontend can be minimal HTML/JS or a lightweight framework. Backend handles content, problem logic, and image generation.

## Port
4000

## Disciplines and Topics
Users should be able to choose any discipline and dive into a topic directly.

- Mechanics: Kinematics (1D/2D), Newton's laws, work and energy, momentum, circular motion, simple harmonic motion
- Waves: Wave properties, superposition, sound, standing waves
- Electricity and Magnetism: Coulomb's law, electric fields, DC circuits, magnetism basics, Faraday's law
- Thermodynamics: Temperature, heat transfer, ideal gas concepts, first law
- Optics: Reflection, refraction, lenses, simple ray diagrams

Each topic should include at least one lesson, optional simulation, and a problem set.

## Features
- Lessons: Short, scannable topic content with static diagrams (for example, free-body diagrams, wave snapshots, and ray diagrams)
- Interactive simulations: Parameterized scenarios with live-updating visuals (graphs or simple animations)
- Problem-solving flow: Present problem -> user answer -> step-by-step solution -> result graphic
- Graphics: Use both static and dynamic visuals; support server-generated images (for example, matplotlib) and interactive client-side views where needed

## Audience and Levels
- Provide at least two levels (Basics and Intermediate)
- Let users set level per session or per topic
- No authentication required for v1 level selection

## Non-Goals (V1)
- No user accounts or grade persistence
- No full curriculum sequencing; focus on topic-based discovery and learning

## Parallel Tasks
- [ ] Build content structure and one sample lesson with at least one static diagram
- [ ] Build one interactive simulation (for example, projectile or wave)
- [ ] Build one problem engine flow with step-by-step solution and result graph

## Sequential Tasks
- [ ] Wire discipline/topic chooser UI to topic content
- [ ] Add level selector and apply it to at least one topic
- [ ] Integrate core flows and verify Hub discovery

## Success Criteria
- [ ] App runs on port 4000
- [ ] Discoverable by Hub
- [ ] User can select a discipline and topic and view a lesson with at least one static diagram
- [ ] At least one topic includes an interactive simulation with visual updates from parameter changes
- [ ] At least one topic includes a full problem flow: problem, user answer, step-by-step solution, and result graphic
- [ ] All tests pass

## Completion
Output `COMPLETE` when all tasks done and criteria met.

---
*This PRD will be updated when ready to continue development.*
