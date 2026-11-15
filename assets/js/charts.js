/**
 * DANA Aerodynamics Laboratory
 * Interactive DNS Validation Chart for OpenDynamo (KMM87 Re_tau=180 Benchmark)
 */

(function () {
  const canvas = document.getElementById('dns-chart-canvas');
  if (!canvas || typeof OPENDYNAMO_STATS === 'undefined') return;

  const ctx = canvas.getContext('2d');
  let currentMetric = 'velocity'; // 'velocity' or 'stresses'
  let mouseX = -1, mouseY = -1;
  let hoveredPoint = null;

  // Chart dimensions & padding
  let width, height;
  const padding = { top: 40, right: 40, bottom: 55, left: 65 };

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height || 360;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    draw();
  }

  // Coordinate transforms
  function xToPx(yplus, isLog = true) {
    const minVal = isLog ? 0.3 : 0;
    const maxVal = 185;

    if (isLog) {
      const minLog = Math.log10(minVal);
      const maxLog = Math.log10(maxVal);
      const valLog = Math.log10(Math.max(yplus, minVal));
      return padding.left + ((valLog - minLog) / (maxLog - minLog)) * (width - padding.left - padding.right);
    } else {
      return padding.left + (yplus / maxVal) * (width - padding.left - padding.right);
    }
  }

  function yToPx(val, maxVal) {
    const plotHeight = height - padding.top - padding.bottom;
    return padding.top + plotHeight - (val / maxVal) * plotHeight;
  }

  function drawGrid(isLog, maxY, yLabel, xLabel) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    const yTicks = 5;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= yTicks; i++) {
      const val = (i / yTicks) * maxY;
      const py = yToPx(val, maxY);

      ctx.beginPath();
      ctx.moveTo(padding.left, py);
      ctx.lineTo(width - padding.right, py);
      ctx.stroke();

      ctx.fillText(val.toFixed(1), padding.left - 10, py);
    }

    // Vertical grid lines
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    if (isLog) {
      const decades = [0.5, 1, 5, 10, 30, 50, 100, 180];
      decades.forEach(v => {
        const px = xToPx(v, true);
        ctx.beginPath();
        ctx.moveTo(px, padding.top);
        ctx.lineTo(px, height - padding.bottom);
        ctx.stroke();

        ctx.fillText(v.toString(), px, height - padding.bottom + 8);
      });
    } else {
      for (let v = 0; v <= 180; v += 30) {
        const px = xToPx(v, false);
        ctx.beginPath();
        ctx.moveTo(px, padding.top);
        ctx.lineTo(px, height - padding.bottom);
        ctx.stroke();

        ctx.fillText(v.toString(), px, height - padding.bottom + 8);
      }
    }

    // Axes Labels
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = '#00d4ff';
    ctx.fillText(xLabel, padding.left + (width - padding.left - padding.right) / 2, height - 16);

    ctx.save();
    ctx.translate(18, padding.top + (height - padding.top - padding.bottom) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
  }

  function drawVelocityProfile() {
    const maxY = 22;
    drawGrid(true, maxY, 'u⁺ = ⟨u⟩ / u_τ', 'y⁺ = y u_τ / ν (Semi-log scale)');

    // 1. Draw Viscous Sublayer: u+ = y+
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    OPENDYNAMO_STATS.theory_sublayer.forEach((pt, idx) => {
      const px = xToPx(pt.yplus, true);
      const py = yToPx(pt.uplus, maxY);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // 2. Draw Log-Law: u+ = 1/0.41 * ln(y+) + 5.2
    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath();
    OPENDYNAMO_STATS.theory_log.forEach((pt, idx) => {
      const px = xToPx(pt.yplus, true);
      const py = yToPx(pt.uplus, maxY);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Draw OpenDynamo DNS curve
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const pts = [];
    for (let i = 0; i < OPENDYNAMO_STATS.yplus.length; i++) {
      const yp = OPENDYNAMO_STATS.yplus[i];
      const up = OPENDYNAMO_STATS.uplus[i];
      const px = xToPx(yp, true);
      const py = yToPx(up, maxY);
      pts.push({ x: px, y: py, yplus: yp, val: up });

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Draw scatter points
    ctx.fillStyle = '#00d4ff';
    pts.forEach((p, idx) => {
      if (idx % 3 === 0) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Check hover
    checkHover(pts, 'u⁺');
  }

  function drawReynoldsStresses() {
    const maxY = 3.2;
    drawGrid(false, maxY, 'Turbulent Stresses uᵢ⁺ / u_τ', 'y⁺ (Wall-normal distance)');

    // u_rms = sqrt(uu_plus)
    drawLine(OPENDYNAMO_STATS.uu_plus.map(v => Math.sqrt(Math.max(v, 0))), maxY, '#00d4ff', 'u_rms');
    // w_rms = sqrt(ww_plus)
    drawLine(OPENDYNAMO_STATS.ww_plus.map(v => Math.sqrt(Math.max(v, 0))), maxY, '#10b981', 'w_rms');
    // v_rms = sqrt(vv_plus)
    drawLine(OPENDYNAMO_STATS.vv_plus.map(v => Math.sqrt(Math.max(v, 0))), maxY, '#3b82f6', 'v_rms');
    // -uv_plus
    drawLine(OPENDYNAMO_STATS.uv_plus.map(v => Math.max(-v, 0)), maxY, '#f43f5e', '-u′v′');
  }

  function drawLine(values, maxY, color, label) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < OPENDYNAMO_STATS.yplus.length; i++) {
      const yp = OPENDYNAMO_STATS.yplus[i];
      const val = values[i];
      const px = xToPx(yp, false);
      const py = yToPx(val, maxY);

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  function checkHover(pts, label) {
    if (mouseX < 0 || mouseY < 0) return;

    let closest = null;
    let minDist = 30;

    pts.forEach(p => {
      const d = Math.hypot(p.x - mouseX, p.y - mouseY);
      if (d < minDist) {
        minDist = d;
        closest = p;
      }
    });

    if (closest) {
      // Draw crosshair
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(closest.x, padding.top);
      ctx.lineTo(closest.x, height - padding.bottom);
      ctx.moveTo(padding.left, closest.y);
      ctx.lineTo(width - padding.right, closest.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(closest.x, closest.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Tooltip Box
      const text = `y⁺: ${closest.yplus.toFixed(2)}, ${label}: ${closest.val.toFixed(2)}`;
      ctx.font = '12px JetBrains Mono, monospace';
      const textW = ctx.measureText(text).width;

      const tipX = Math.min(Math.max(closest.x - textW / 2 - 10, padding.left + 5), width - padding.right - textW - 20);
      const tipY = Math.max(closest.y - 32, padding.top + 5);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 1;
      ctx.fillRect(tipX, tipY, textW + 20, 24);
      ctx.strokeRect(tipX, tipY, textW + 20, 24);

      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, tipX + 10, tipY + 12);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    if (currentMetric === 'velocity') {
      drawVelocityProfile();
    } else {
      drawReynoldsStresses();
    }
  }

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    draw();
  });

  canvas.addEventListener('mouseleave', () => {
    mouseX = -1;
    mouseY = -1;
    draw();
  });

  window.addEventListener('resize', resize);
  resize();

  // Button toggles
  const btnVel = document.getElementById('chart-btn-velocity');
  const btnStress = document.getElementById('chart-btn-stresses');
  const legendVel = document.getElementById('chart-legend-velocity');
  const legendStress = document.getElementById('chart-legend-stresses');

  if (btnVel && btnStress) {
    btnVel.addEventListener('click', () => {
      currentMetric = 'velocity';
      btnVel.classList.add('active');
      btnStress.classList.remove('active');
      if (legendVel) legendVel.style.display = 'flex';
      if (legendStress) legendStress.style.display = 'none';
      draw();
    });

    btnStress.addEventListener('click', () => {
      currentMetric = 'stresses';
      btnStress.classList.add('active');
      btnVel.classList.remove('active');
      if (legendVel) legendVel.style.display = 'none';
      if (legendStress) legendStress.style.display = 'flex';
      draw();
    });
  }
})();
