/**
 * DUNE / LBNF NEUTRINO BEAM — Canvas Animation
 * Transparent background version — blends with the site.
 */

(function () {
  const canvas = document.getElementById('dune-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const TWO_PI = Math.PI * 2;

  let W, H;

  // Colors — darker tones so they read on the light blue bg
  const RING_COLOR = { r: 116, g: 140, b: 171 };  // Dusty Denim
  const BEAM_A     = { r: 116, g: 140, b: 171 };  // Dusty Denim
  const BEAM_B     = { r: 62, g: 92, b: 118 };    // Blue Slate

  const COLL_COLORS = [
    [240, 235, 216],  // Eggshell
    [116, 140, 171],  // Dusty Denim
    [62, 92, 118],    // Blue Slate
    [180, 190, 200],  // Light slate
    [200, 195, 175],  // Warm cream
  ];

  let FNAL, SURF;
  let beamNeutrinos        = [];
  let detectorHits         = [];
  let acceleratorParticles = [];

  function oscProb(progress) {
    return 0.5 - 0.5 * Math.cos(Math.PI * progress * 1.6);
  }

  function flavorColor(progress) {
    const o = Math.min(1, oscProb(progress));
    // Dusty Denim → Eggshell
    return [
      Math.round(116 + (240 - 116) * o),
      Math.round(140 + (235 - 140) * o),
      Math.round(171 + (216 - 171) * o),
    ];
  }

  function resize() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    FNAL = { x: W * 0.14, y: H * 0.48 };
    SURF = { x: W * 0.86, y: H * 0.48 };

    initAccelerator();
  }

  function initAccelerator() {
    acceleratorParticles = [];
    for (let i = 0; i < 28; i++) {
      acceleratorParticles.push({
        phase: (i / 28) * TWO_PI,
        speed: 0.04 + Math.random() * 0.02,
        r:     Math.random() * 1.4 + 0.5,
      });
    }
  }

  function drawAccelerator() {
    const rx = W * 0.055;
    const ry = W * 0.022;
    const ax = FNAL.x;
    const ay = FNAL.y - H * 0.09;

    // Outer glow
    ctx.beginPath();
    ctx.ellipse(ax, ay, rx + 4, ry + 2, 0, 0, TWO_PI);
    ctx.strokeStyle = `rgba(${RING_COLOR.r},${RING_COLOR.g},${RING_COLOR.b},0.12)`;
    ctx.lineWidth = 10;
    ctx.stroke();

    // Main ring
    ctx.beginPath();
    ctx.ellipse(ax, ay, rx, ry, 0, 0, TWO_PI);
    ctx.strokeStyle = `rgba(${RING_COLOR.r},${RING_COLOR.g},${RING_COLOR.b},0.6)`;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner ring
    ctx.beginPath();
    ctx.ellipse(ax, ay, rx * 0.72, ry * 0.72, 0, 0, TWO_PI);
    ctx.strokeStyle = `rgba(${RING_COLOR.r},${RING_COLOR.g},${RING_COLOR.b},0.25)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Orbiting particles
    for (const ap of acceleratorParticles) {
      const px  = ax + rx * Math.cos(ap.phase);
      const py  = ay + ry * Math.sin(ap.phase);
      const col = ap.phase < Math.PI ? BEAM_A : BEAM_B;
      ctx.beginPath();
      ctx.arc(px, py, ap.r, 0, TWO_PI);
      ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},0.9)`;
      ctx.fill();
    }

    // Extraction / decay pipe — dotted
    ctx.beginPath();
    ctx.moveTo(ax + rx * 0.9, ay + ry * 0.3);
    ctx.quadraticCurveTo(FNAL.x + W * 0.04, FNAL.y - H * 0.01, FNAL.x, FNAL.y);
    ctx.strokeStyle = `rgba(${BEAM_A.r},${BEAM_A.g},${BEAM_A.b},0.4)`;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '400 9px monospace';
    ctx.fillStyle = `rgba(${BEAM_A.r},${BEAM_A.g},${BEAM_A.b},0.6)`;
    ctx.textAlign = 'left';
    //ctx.fillText('decay pipe →  νμ', FNAL.x + W * 0.015, FNAL.y - H * 0.03);
  }

  function beamPoint(prog) {
    const x   = FNAL.x + (SURF.x - FNAL.x) * prog;
    const sag = H * 0.10 * Math.sin(Math.PI * prog);
    return { x, y: FNAL.y + sag };
  }

  function drawBeamTunnel() {
    const steps = 80;

    // Outer glow
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const bp = beamPoint(i / steps);
      i === 0 ? ctx.moveTo(bp.x, bp.y) : ctx.lineTo(bp.x, bp.y);
    }
    ctx.strokeStyle = `rgba(${BEAM_B.r},${BEAM_B.g},${BEAM_B.b},0.08)`;
    ctx.lineWidth = 14;
    ctx.stroke();

    // Dotted tunnel line (no solid line)
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const bp = beamPoint(i / steps);
      i === 0 ? ctx.moveTo(bp.x, bp.y) : ctx.lineTo(bp.x, bp.y);
    }
    ctx.strokeStyle = `rgba(${BEAM_A.r},${BEAM_A.g},${BEAM_A.b},0.25)`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Ground line — dotted only, no solid
  function drawGroundLine() {
    const groundY = H * 0.56;

    // Dotted ground line
    //ctx.beginPath();
    //ctx.moveTo(0, groundY);
    //ctx.lineTo(W, groundY);
    //ctx.strokeStyle = `rgba(${RING_COLOR.r},${RING_COLOR.g},${RING_COLOR.b},0.2)`;
    //ctx.lineWidth = 0.8;
    //ctx.setLineDash([6, 8]);
    //ctx.stroke();
    //ctx.setLineDash([]);

    // Bedrock texture — dotted
    for (let i = 1; i <= 3; i++) {
      const ly = groundY + (H - groundY) * i / 4;
      ctx.beginPath();
      ctx.moveTo(0, ly);
      ctx.lineTo(W, ly);
      ctx.strokeStyle = `rgba(${RING_COLOR.r},${RING_COLOR.g},${RING_COLOR.b},0.06)`;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([8, 18]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 1300 km baseline annotation — dotted
    const midX = (FNAL.x + SURF.x) / 2;
    ctx.beginPath();
    ctx.moveTo(FNAL.x, groundY + 14);
    ctx.lineTo(SURF.x, groundY + 14);
    ctx.strokeStyle = `rgba(${RING_COLOR.r},${RING_COLOR.g},${RING_COLOR.b},0.3)`;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    for (const tx of [FNAL.x, SURF.x]) {
      ctx.beginPath();
      ctx.moveTo(tx, groundY + 10);
      ctx.lineTo(tx, groundY + 18);
      ctx.strokeStyle = `rgba(${RING_COLOR.r},${RING_COLOR.g},${RING_COLOR.b},0.35)`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    ctx.font = '500 10px monospace';
    ctx.fillStyle = `rgba(${RING_COLOR.r},${RING_COLOR.g},${RING_COLOR.b},0.55)`;
    ctx.textAlign = 'center';
    ctx.fillText('1300 km baseline', midX, groundY + 28);
  }

  // Site labels — simplified
  function drawSiteLabels() {
    ctx.font = '500 14px monospace';
    ctx.fillStyle = `rgba(${RING_COLOR.r},${RING_COLOR.g},${RING_COLOR.b},0.9)`;
    ctx.textAlign = 'center';
    ctx.fillText('Fermilab', FNAL.x, FNAL.y - H * 0.21);
    ctx.font = '400 10px monospace';
    ctx.fillStyle = `rgba(${RING_COLOR.r},${RING_COLOR.g},${RING_COLOR.b},0.55)`;
    ctx.fillText('Batavia, IL', FNAL.x + 1, FNAL.y - H * 0.17);

    // DUNE label — simplified
    ctx.font = '500 14px monospace';
    ctx.fillStyle = `rgba(${BEAM_A.r},${BEAM_A.g},${BEAM_A.b},0.9)`;
    ctx.textAlign = 'center';
    ctx.fillText('DUNE', SURF.x, SURF.y - H * 0.19);
    ctx.font = '400 10px monospace';
    ctx.fillStyle = `rgba(${BEAM_A.r},${BEAM_A.g},${BEAM_A.b},0.55)`;
    ctx.fillText('1480 m deep', SURF.x, SURF.y - H * 0.15);

    // Near detector
    const ndPos = beamPoint(0.05);
    ctx.beginPath();
    ctx.arc(ndPos.x, ndPos.y, 3.5, 0, TWO_PI);
    ctx.fillStyle = 'rgba(240,235,216,0.8)';
    ctx.fill();
    ctx.font = '400 9px monospace';
    ctx.fillStyle = 'rgba(240,235,216,0.75)';
    ctx.textAlign = 'left';
    ctx.fillText('ND (0.5 km)', ndPos.x + 6, ndPos.y - 8);
  }

  function drawDetectorBuilding() {
    const x       = SURF.x;
    const groundY = H * 0.56;
    const cavTop  = SURF.y - H * 0.06;

    // Shaft — dotted
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x, cavTop);
    ctx.strokeStyle = `rgba(${RING_COLOR.r},${RING_COLOR.g},${RING_COLOR.b},0.25)`;
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Cavern box
    const bw = W * 0.07;
    const bh = H * 0.10;
    const bx = x - bw / 2;
    const by = SURF.y - bh / 2;

    ctx.fillStyle = `rgba(${RING_COLOR.r},${RING_COLOR.g},${RING_COLOR.b},0.06)`;
    ctx.strokeStyle = `rgba(${BEAM_A.r},${BEAM_A.g},${BEAM_A.b},0.5)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 3);
    ctx.fill();
    ctx.stroke();

    // Module dividers
    for (let m = 1; m <= 3; m++) {
      ctx.beginPath();
      ctx.moveTo(bx + bw * m / 4, by + 2);
      ctx.lineTo(bx + bw * m / 4, by + bh - 2);
      ctx.strokeStyle = `rgba(${BEAM_A.r},${BEAM_A.g},${BEAM_A.b},0.18)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    ctx.font = '500 9px monospace';
    ctx.fillStyle = `rgba(${BEAM_A.r},${BEAM_A.g},${BEAM_A.b},0.7)`;
    ctx.textAlign = 'center';
    ctx.fillText('40 kt LArTPC', x, by + bh + 13);
  }

  // Neutrinos
  let lastSpawn = 0;

  function spawnNeutrino(time) {
    if (time - lastSpawn < 120) return;
    lastSpawn = time;
    beamNeutrinos.push({
      prog:  0,
      speed: 0.0018 + Math.random() * 0.0006,
      trail: [],
      size:  Math.random() * 1.5 + 0.8,
    });
  }

  function drawNeutrinos() {
    for (const n of beamNeutrinos) {
      if (n.trail.length < 2) continue;

      for (let i = 1; i < n.trail.length; i++) {
        const a = n.trail[i - 1], b = n.trail[i];
        const [r, g, bl] = flavorColor(b.prog);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${r},${g},${bl},${(i / n.trail.length) * 0.6})`;
        ctx.lineWidth = n.size * 0.7;
        ctx.stroke();
      }

      const pos = beamPoint(n.prog);
      const [r, g, bl] = flavorColor(n.prog);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, n.size + 0.5, 0, TWO_PI);
      ctx.fillStyle = `rgba(${r},${g},${bl},0.95)`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, (n.size + 0.5) * 3, 0, TWO_PI);
      ctx.fillStyle = `rgba(${r},${g},${bl},0.1)`;
      ctx.fill();
    }
  }

  function spawnHit(pos) {
    const count = 4 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * TWO_PI;
      const spd   = Math.random() * 2.5 + 0.8;
      const col   = COLL_COLORS[Math.floor(Math.random() * COLL_COLORS.length)];
      detectorHits.push({
        x: pos.x, y: pos.y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life:  1,
        decay: 0.018 + Math.random() * 0.014,
        size:  Math.random() * 3 + 1,
        color: col,
      });
    }
  }

  function drawDetectorHits() {
    for (const h of detectorHits) {
      const [r, g, b] = h.color;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.size * h.life, 0, TWO_PI);
      ctx.fillStyle = `rgba(${r},${g},${b},${h.life * 0.85})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.size * h.life * 3, 0, TWO_PI);
      ctx.fillStyle = `rgba(${r},${g},${b},${h.life * 0.08})`;
      ctx.fill();
    }
  }

  // Legend — transparent bg to match site
  function drawOscillationLegend() {
    const lx = W / 2, ly = H * 0.13;
    const bw = W * 0.22, bh = H * 0.07;
    const x0 = lx - bw / 2, y0 = ly - bh / 2;

    ctx.fillStyle = 'rgba(13, 19, 33, 0.7)';
    ctx.beginPath();
    ctx.roundRect(x0, y0, bw, bh, 4);
    ctx.fill();
    ctx.strokeStyle = `rgba(${RING_COLOR.r},${RING_COLOR.g},${RING_COLOR.b},0.15)`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.fillStyle = `rgba(${BEAM_A.r},${BEAM_A.g},${BEAM_A.b},0.9)`;
    ctx.beginPath();
    ctx.arc(x0 + 12, y0 + bh * 0.3, 4, 0, TWO_PI);
    ctx.fill();
    ctx.font = '400 9px monospace';
    ctx.fillStyle = `rgba(${BEAM_A.r},${BEAM_A.g},${BEAM_A.b},0.85)`;
    ctx.textAlign = 'left';
    ctx.fillText('νμ (muon neutrino)', x0 + 22, y0 + bh * 0.3 + 3);

    ctx.fillStyle = 'rgba(190,90,85,0.9)';
    ctx.beginPath();
    ctx.arc(x0 + 12, y0 + bh * 0.72, 4, 0, TWO_PI);
    ctx.fill();
    ctx.font = '400 9px monospace';
    ctx.fillStyle = 'rgba(190,90,85,0.85)';
    ctx.textAlign = 'left';
    ctx.fillText('νe  (oscillated)', x0 + 22, y0 + bh * 0.72 + 3);
  }

  // Physics update
  function update(time) {
    spawnNeutrino(time);

    for (let i = beamNeutrinos.length - 1; i >= 0; i--) {
      const n = beamNeutrinos[i];
      n.prog += n.speed;
      const pos = beamPoint(n.prog);
      n.trail.push({ x: pos.x, y: pos.y, prog: n.prog });
      if (n.trail.length > 18) n.trail.shift();
      if (n.prog >= 1) {
        spawnHit(SURF);
        beamNeutrinos.splice(i, 1);
      }
    }

    for (let i = detectorHits.length - 1; i >= 0; i--) {
      const h = detectorHits[i];
      h.x += h.vx;
      h.y += h.vy;
      h.vx *= 0.97;
      h.vy *= 0.97;
      h.life -= h.decay;
      if (h.life <= 0) detectorHits.splice(i, 1);
    }

    for (const ap of acceleratorParticles) {
      ap.phase += ap.speed;
      if (ap.phase > TWO_PI) ap.phase -= TWO_PI;
    }
  }

  // Draw — transparent canvas, no fillRect background
  function draw(time) {
    ctx.clearRect(0, 0, W, H);

    drawGroundLine();
    drawBeamTunnel();
    drawAccelerator();
    drawSiteLabels();
    drawNeutrinos();
    drawDetectorBuilding();
    drawDetectorHits();
    drawOscillationLegend();
  }

  function loop(time) {
    update(time);
    draw(time);
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(loop);
})();
