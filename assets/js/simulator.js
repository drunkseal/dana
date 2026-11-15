/**
 * DANA Aerodynamics Laboratory
 * Real-Time Interactive Flow Simulator (Airfoil & Vortex Dynamics)
 */

(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Simulator State
  let width, height;
  let angleOfAttack = 6; // degrees
  let flowSpeed = 3.5;
  let displayMode = 'particles'; // 'particles', 'streamlines', 'vectors'
  let isRunning = true;

  // Airfoil Parameters (NACA 0012 representation)
  const chord = 160;
  let cx, cy; // Airfoil center coordinates

  // Particles
  const numParticles = 450;
  const particles = [];

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
    cx = width * 0.42;
    cy = height * 0.52;
    initParticles();
  }

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: flowSpeed,
        vy: 0,
        age: Math.random() * 100,
        life: 80 + Math.random() * 60,
        speed: 1
      });
    }
  }

  // Airfoil geometry points (rotated by alpha)
  function getAirfoilPoints(samples = 40) {
    const points = [];
    const rad = (-angleOfAttack * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    // Upper and lower surfaces using NACA 0012 thickness distribution
    for (let i = 0; i <= samples; i++) {
      const beta = (i / samples) * Math.PI;
      const xNorm = 0.5 * (1 - Math.cos(beta)); // Chebychev spacing
      const yt = 0.6 * (0.2969 * Math.sqrt(xNorm) - 0.1260 * xNorm - 0.3516 * xNorm**2 + 0.2843 * xNorm**3 - 0.1015 * xNorm**4);
      
      const px = (xNorm - 0.35) * chord;
      const py = -yt * chord;

      points.push({
        x: cx + px * cosA - py * sinA,
        y: cy + px * sinA + py * cosA
      });
    }

    for (let i = samples; i >= 0; i--) {
      const beta = (i / samples) * Math.PI;
      const xNorm = 0.5 * (1 - Math.cos(beta));
      const yt = 0.6 * (0.2969 * Math.sqrt(xNorm) - 0.1260 * xNorm - 0.3516 * xNorm**2 + 0.2843 * xNorm**3 - 0.1015 * xNorm**4);
      
      const px = (xNorm - 0.35) * chord;
      const py = yt * chord;

      points.push({
        x: cx + px * cosA - py * sinA,
        y: cy + px * sinA + py * cosA
      });
    }

    return points;
  }

  // Aerodynamic Velocity Field calculation (Conformal Joukowsky / Vortex model)
  function getVelocity(px, py) {
    const rad = (-angleOfAttack * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    // Transform to airfoil-aligned coordinates centered at quarter-chord
    const dx = px - cx;
    const dy = py - cy;
    const xAligned = dx * cosA + dy * sinA;
    const yAligned = -dx * sinA + dy * cosA;

    const r2 = (xAligned / 0.8)**2 + (yAligned * 3.5)**2;
    const dist = Math.sqrt(r2);

    let u = flowSpeed;
    let v = 0;

    // Circulation Gamma based on thin airfoil theory (Kutta condition: 2 * pi * alpha)
    const gamma = 2.8 * flowSpeed * Math.sin(rad) * chord * 0.5;

    // Induced velocity from bound vortex & doublet obstruction
    if (dist > 12) {
      // Vortex induced velocity
      const invR2 = 1 / (xAligned**2 + yAligned**2 + 300);
      const vVortexU = -gamma * yAligned * invR2 * 0.12;
      const vVortexV = gamma * xAligned * invR2 * 0.12;

      // Doublet displacement (obstacle effect)
      const a = chord * 0.28;
      const doubletU = -flowSpeed * (a**2) * (xAligned**2 - yAligned**2) / (xAligned**2 + yAligned**2 + 800)**1.5;
      const doubletV = -flowSpeed * (a**2) * (2 * xAligned * yAligned) / (xAligned**2 + yAligned**2 + 800)**1.5;

      const uLocal = flowSpeed + vVortexU + doubletU;
      const vLocal = vVortexV + doubletV;

      // Transform back to world coordinates
      u = uLocal * cosA - vLocal * sinA;
      v = uLocal * sinA + vLocal * cosA;

      // Stall separation wake modeling at high angles
      if (Math.abs(angleOfAttack) > 12 && xAligned > 0 && Math.abs(yAligned) < 45) {
        const stallTurbulence = Math.sin(Date.now() * 0.01 + px * 0.05) * 1.5;
        v += stallTurbulence * (Math.abs(angleOfAttack) / 15);
      }
    } else {
      // Inside airfoil boundary - damp velocity
      u = 0.1;
      v = 0;
    }

    return { u, v };
  }

  function drawAirfoil() {
    const points = getAirfoilPoints(50);
    ctx.save();

    // Draw flow shadow
    ctx.shadowColor = 'rgba(0, 212, 255, 0.4)';
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();

    // Airfoil body gradient
    const grad = ctx.createLinearGradient(cx - chord/2, cy, cx + chord/2, cy);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.3, '#0284c7');
    grad.addColorStop(1, '#0f172a');

    ctx.fillStyle = grad;
    ctx.fill();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#00d4ff';
    ctx.stroke();

    // Stagnation and suction indicators
    ctx.restore();
  }

  function updateAndDrawParticles() {
    ctx.lineWidth = 1.2;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const vel = getVelocity(p.x, p.y);

      const oldX = p.x;
      const oldY = p.y;

      p.x += vel.u;
      p.y += vel.v;
      p.age++;

      // Velocity magnitude for colormap (blue -> cyan -> yellow)
      const speed = Math.sqrt(vel.u**2 + vel.v**2);
      const normalizedSpeed = Math.min(Math.max((speed - 1) / (flowSpeed * 1.8), 0), 1);

      let strokeColor;
      if (normalizedSpeed < 0.4) {
        strokeColor = `rgba(59, 130, 246, ${0.4 + normalizedSpeed * 0.5})`;
      } else if (normalizedSpeed < 0.75) {
        strokeColor = `rgba(0, 212, 255, ${0.6 + normalizedSpeed * 0.4})`;
      } else {
        strokeColor = `rgba(245, 158, 11, ${0.8})`;
      }

      ctx.strokeStyle = strokeColor;
      ctx.beginPath();
      ctx.moveTo(oldX, oldY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      // Reset particles that exit boundary or die
      if (p.x > width + 20 || p.x < -20 || p.y < -20 || p.y > height + 20 || p.age > p.life) {
        p.x = -10 + Math.random() * 20;
        p.y = Math.random() * height;
        p.age = 0;
        p.life = 70 + Math.random() * 60;
      }
    }
  }

  function drawStreamlines() {
    const numLines = 26;
    ctx.lineWidth = 1.2;

    for (let l = 0; l < numLines; l++) {
      let px = 5;
      let py = (l / (numLines - 1)) * height;

      ctx.beginPath();
      ctx.moveTo(px, py);

      for (let s = 0; s < 180; s++) {
        const vel = getVelocity(px, py);
        px += vel.u * 2.5;
        py += vel.v * 2.5;

        if (px > width || py < 0 || py > height) break;
        ctx.lineTo(px, py);
      }

      ctx.strokeStyle = `rgba(0, 212, 255, ${0.35 + 0.3 * Math.sin(l * 0.3)})`;
      ctx.stroke();
    }
  }

  function render() {
    if (!isRunning) return;

    // Semi-transparent clearing for particle motion blur
    ctx.fillStyle = displayMode === 'particles' ? 'rgba(4, 8, 16, 0.28)' : 'rgba(4, 8, 16, 0.9)';
    ctx.fillRect(0, 0, width, height);

    if (displayMode === 'particles') {
      updateAndDrawParticles();
    } else if (displayMode === 'streamlines') {
      drawStreamlines();
    }

    drawAirfoil();
    requestAnimationFrame(render);
  }

  // Setup DOM Controls
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  render();

  // Control Listeners
  const aoaSlider = document.getElementById('sim-aoa');
  const aoaVal = document.getElementById('sim-aoa-val');
  if (aoaSlider && aoaVal) {
    aoaSlider.addEventListener('input', (e) => {
      angleOfAttack = parseFloat(e.target.value);
      aoaVal.textContent = `${angleOfAttack > 0 ? '+' : ''}${angleOfAttack}°`;
    });
  }

  const speedSlider = document.getElementById('sim-speed');
  const speedVal = document.getElementById('sim-speed-val');
  if (speedSlider && speedVal) {
    speedSlider.addEventListener('input', (e) => {
      flowSpeed = parseFloat(e.target.value);
      speedVal.textContent = `${flowSpeed.toFixed(1)}x`;
    });
  }

  const btnParticles = document.getElementById('sim-btn-particles');
  const btnStreamlines = document.getElementById('sim-btn-streamlines');

  if (btnParticles && btnStreamlines) {
    btnParticles.addEventListener('click', () => {
      displayMode = 'particles';
      btnParticles.classList.add('active');
      btnStreamlines.classList.remove('active');
    });

    btnStreamlines.addEventListener('click', () => {
      displayMode = 'streamlines';
      btnStreamlines.classList.add('active');
      btnParticles.classList.remove('active');
    });
  }
})();
