# Seesaw Simulation

A physics-based web application that simulates torque, balance, and gravity. Built with vanilla JavaScript, HTML5, and CSS3 without any external dependencies.

[**View Live Demo**](https://ayberktambay.github.io/seesaw-simulation/)

## Overview

This project visualizes how distance and weight affect balance. Users can drop randomized weights onto a plank, and the system calculates the net torque to determine the tilt angle in real-time.

It features a custom physics implementation for the balance logic and uses the **Web Animations API** for smooth, linear drop animations that can be paused mid-air.

## Features

- **Physics Engine:** Calculates net torque (Force × Distance) to determine precise tilt angles.
- **Dynamic Animation:** Linear drop animations handled via WAAPI.
- **State Persistence:** Automatically saves the current board state and logs to `localStorage`.
- **Audio Feedback:** Procedural sound generation using the Web Audio API (Oscillators) for interactions.
- **Responsive UI:** Fully adaptive layout that works on desktop and mobile viewports.
- **Controls:**
  - **Pause/Resume:** Freezes animations in mid-air.
  - **Undo:** Removes the last placed weight and recalculates physics.
  - **Mute:** Toggles sound effects.
  - **Reset:** Clears the board and local storage.

## The Math

The simulation uses a simplified torque calculation logic:

Torque (τ) = Mass (m) × Distance from Fulcrum (d) Net Torque = Σ(τ_right) - Σ(τ_left)


The tilt angle is derived from the net torque, clamped between -30° and 30°.

## Project Structure

- `index.html`: Main DOM structure and SVG assets.
- `style.css`: CSS variables, flexbox/grid layouts, and responsive media queries.
- `script.js`: Contains the `Seesaw` class which manages:
  - Event listeners (click, hover).
  - Animation logic (Web Animations API).
  - Physics calculations.
  - State management.

## Setup & Usage

Since this is a static project, no build step or package manager (npm/yarn) is required.

1. Clone the repository.
2. Open `index.html` in any modern web browser.

## Browser Support

Requires a browser that supports:
- ES6 Classes
- CSS Custom Properties (Variables)
- Web Animations API
- Web Audio API

Tested on Chrome, Firefox, and Safari.

## License

MIT
