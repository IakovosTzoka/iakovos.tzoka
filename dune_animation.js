/**
 * DUNE / LBNF NEUTRINO BEAM — Canvas Animation
 * Responsive rewrite with stronger visual presence.
 */

(function () {
  const canvas = document.getElementById('dune-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const TWO_PI = Math.PI * 2;

  let W = 0;
  let H = 0;
  let S = 1;

  const RING_COLOR = { r: 116, g: 140, b: 171 };
  const BEAM_A = { r: 116, g: 140, b: 171 };
  const BEAM_B = { r: 62, g: 92, b: 118 };

  const COLL_COLORS = [
    [240, 235, 216],
    [116, 140, 171],
    [62, 92, 118],
    [180, 190, 200],
    [200, 195, 175],
  ];

  let FNAL, SURF;
  let beamNeutrinos = [];
  let detectorHits = [];
  let acceleratorParticles = [];
  let lastSpawn = 0;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const sx = (v) => v * S;

  function rgba(c, a) {
    return `rgba(${c.r},${c.g},${c.b},${a})`;
  }

  function oscProb(progress) {
    return 0.5 - 0.5 * Math.cos(Math.PI * progress * 1.6);
  }

  function flavorColor(progress) {
    const o = Math.min(1, oscProb(progress));
    return [
      Math.round(116 + (240 - 116) * o),
      Math.round(140 + (235 - 140) * o),
      Math.round(171 + (216 - 171) * o),
    ];
  }

  function font(px, weight = 400) {
    return `${weight} ${Math.round(clamp(px * S, px * 0.95, px * 1.75))}px monospace`;
  }

  function resize() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    S = clamp(Math.min(W / 960, H / 480), 0.9, 1.8);

    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    FNAL = { x: W * 0.14, y: H * 0.42 };
    SURF = { x: W * 0.86, y: H * 0.40 };

    initAccelerator();
  }

  function initAccelerator() {
    acceleratorParticles = [];
    const count = Math.round(30 * S);
    for (let i = 0; i < count; i++) {
      acceleratorParticles.push({
        phase: (i / count) * TWO_PI,
        speed: 0.035 + Math.random() * 0.02,
        r: sx(Math.random() * 1.6 + 0.8),
      });
    }
  }

  function beamPoint(prog) {
    const x = FNAL.x + (SURF.x - FNAL.x) * prog;
    const sag = H * 0.1 * Math.sin(Math.PI * prog);
    return { x, y: FNAL.y + sag };
  }

  function drawAccelerator() {
    const rx = W * 0.08;
    const ry = W * 0.032;
    const ax = FNAL.x;
    const ay = FNAL.y - H * 0.11;

    ctx.beginPath();
    ctx.ellipse(ax, ay, rx + sx(8), ry + sx(4), 0, 0, TWO_PI);
    ctx.strokeStyle = rgba(RING_COLOR, 0.14);
    ctx.lineWidth = sx(16);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(ax, ay, rx, ry, 0, 0, TWO_PI);
    ctx.strokeStyle = rgba(RING_COLOR, 0.72);
    ctx.lineWidth = sx(3.6);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(ax, ay, rx * 0.72, ry * 0.72, 0, 0, TWO_PI);
    ctx.strokeStyle = rgba(RING_COLOR, 0.28);
    ctx.lineWidth = sx(1.4);
    ctx.stroke();

    for (const ap of acceleratorParticles) {
      const px = ax + rx * Math.cos(ap.phase);
      const py = ay + ry * Math.sin(ap.phase);
      const col = ap.phase < Math.PI ? BEAM_A : BEAM_B;

      ctx.beginPath();
      ctx.arc(px, py, ap.r, 0, TWO_PI);
      ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},0.95)`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, ap.r * 3, 0, TWO_PI);
      ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},0.08)`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(ax + rx * 0.9, ay + ry * 0.3);
    ctx.quadraticCurveTo(FNAL.x + W * 0.045, FNAL.y - H * 0.015, FNAL.x, FNAL.y);
    ctx.strokeStyle = rgba(BEAM_A, 0.42);
    ctx.lineWidth = sx(1.8);
    ctx.setLineDash([sx(5), sx(6)]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawBeamTunnel() {
    const steps = 100;

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const bp = beamPoint(i / steps);
      i === 0 ? ctx.moveTo(bp.x, bp.y) : ctx.lineTo(bp.x, bp.y);
    }
    ctx.strokeStyle = rgba(BEAM_B, 0.1);
    ctx.lineWidth = sx(18);
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const bp = beamPoint(i / steps);
      i === 0 ? ctx.moveTo(bp.x, bp.y) : ctx.lineTo(bp.x, bp.y);
    }
    ctx.strokeStyle = rgba(BEAM_A, 0.28);
    ctx.lineWidth = sx(2);
    ctx.setLineDash([sx(5), sx(7)]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawGroundLine() {
    const groundY = H * 0.58;

    for (let i = 1; i <= 3; i++) {
      const ly = groundY + ((H - groundY) * i) / 4;
      ctx.beginPath();
      ctx.moveTo(0, ly);
      ctx.lineTo(W, ly);
      ctx.strokeStyle = rgba(RING_COLOR, 0.06);
      ctx.lineWidth = sx(0.8);
      ctx.setLineDash([sx(10), sx(20)]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const midX = (FNAL.x + SURF.x) / 2;

    ctx.beginPath();
    ctx.moveTo(FNAL.x, groundY + sx(18));
    ctx.lineTo(SURF.x, groundY + sx(18));
    ctx.strokeStyle = rgba(RING_COLOR, 0.32);
    ctx.lineWidth = sx(0.8);
    ctx.setLineDash([sx(5), sx(7)]);
    ctx.stroke();
    ctx.setLineDash([]);

    for (const tx of [FNAL.x, SURF.x]) {
      ctx.beginPath();
      ctx.moveTo(tx, groundY + sx(12));
      ctx.lineTo(tx, groundY + sx(24));
      ctx.strokeStyle = rgba(RING_COLOR, 0.38);
      ctx.lineWidth = sx(1.1);
      ctx.stroke();
    }

    ctx.font = font(11, 500);
    ctx.fillStyle = rgba(RING_COLOR, 0.6);
    ctx.textAlign = 'center';
    ctx.fillText('1300 km baseline', midX, groundY + sx(34));
  }

  function drawSiteLabels() {
    ctx.textAlign = 'center';

    ctx.font = font(18, 600);
    ctx.fillStyle = rgba(RING_COLOR, 0.95);
    ctx.fillText('Fermilab', FNAL.x, FNAL.y - H * 0.26);

    ctx.font = font(12, 400);
    ctx.fillStyle = rgba(RING_COLOR, 0.62);
    ctx.fillText('Batavia, IL', FNAL.x, FNAL.y - H * 0.215);

    ctx.font = font(18, 600);
    ctx.fillStyle = rgba(BEAM_A, 0.95);
    ctx.fillText('DUNE', SURF.x, SURF.y - H * 0.2);

    ctx.font = font(12, 400);
    ctx.fillStyle = rgba(BEAM_A, 0.64);
    ctx.fillText('1480 m deep', SURF.x, SURF.y - H * 0.12);

    const ndPos = beamPoint(0.05);
    ctx.beginPath();
    ctx.arc(ndPos.x, ndPos.y, sx(4.6), 0, TWO_PI);
    ctx.fillStyle = 'rgba(240,235,216,0.85)';
    ctx.fill();

    ctx.font = font(10, 400);
    ctx.fillStyle = 'rgba(240,235,216,0.78)';
    ctx.textAlign = 'left';
    ctx.fillText('ND (0.5 km)', ndPos.x + sx(9), ndPos.y - sx(8));
  }

  function drawDetectorBuilding() {
    const x = SURF.x;
    const groundY = H * 0.58;
    const cavTop = SURF.y - H * 0.08;

    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x, cavTop);
    ctx.strokeStyle = rgba(RING_COLOR, 0.28);
    ctx.lineWidth = sx(2.6);
    ctx.setLineDash([sx(4), sx(5)]);
    ctx.stroke();
    ctx.setLineDash([]);

    const bw = W * 0.1;
    const bh = H * 0.14;
    const bx = x - bw / 2;
    const by = SURF.y - bh / 2;

    ctx.fillStyle = rgba(RING_COLOR, 0.07);
    ctx.strokeStyle = rgba(BEAM_A, 0.56);
    ctx.lineWidth = sx(1.5);
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, sx(5));
    ctx.fill();
    ctx.stroke();

    for (let m = 1; m <= 3; m++) {
      ctx.beginPath();
      ctx.moveTo(bx + (bw * m) / 4, by + sx(3));
      ctx.lineTo(bx + (bw * m) / 4, by + bh - sx(3));
      ctx.strokeStyle = rgba(BEAM_A, 0.2);
      ctx.lineWidth = sx(0.8);
      ctx.stroke();
    }

    ctx.font = font(10, 600);
    ctx.fillStyle = rgba(BEAM_A, 0.76);
    ctx.textAlign = 'center';
    ctx.fillText('40 kt LArTPC', x, by + bh + sx(18));
  }

  function spawnNeutrino(time) {
    if (time - lastSpawn < 120) return;
    lastSpawn = time;

    beamNeutrinos.push({
      prog: 0,
      speed: 0.0018 + Math.random() * 0.0006,
      trail: [],
      size: sx(Math.random() * 1.7 + 1.0),
    });
  }

  function drawNeutrinos() {
    for (const n of beamNeutrinos) {
      if (n.trail.length >= 2) {
        for (let i = 1; i < n.trail.length; i++) {
          const a = n.trail[i - 1];
          const b = n.trail[i];
          const [r, g, bl] = flavorColor(b.prog);

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${r},${g},${bl},${(i / n.trail.length) * 0.62})`;
          ctx.lineWidth = Math.max(sx(1), n.size * 0.72);
          ctx.stroke();
        }
      }

      const pos = beamPoint(n.prog);
      const [r, g, bl] = flavorColor(n.prog);

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, n.size + sx(0.5), 0, TWO_PI);
      ctx.fillStyle = `rgba(${r},${g},${bl},0.96)`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, (n.size + sx(0.5)) * 3.2, 0, TWO_PI);
      ctx.fillStyle = `rgba(${r},${g},${bl},0.09)`;
      ctx.fill();
    }
  }

  function spawnHit(pos) {
    const count = 4 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * TWO_PI;
      const spd = sx(Math.random() * 2.5 + 0.8);
      const col = COLL_COLORS[Math.floor(Math.random() * COLL_COLORS.length)];

      detectorHits.push({
        x: pos.x,
        y: pos.y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1,
        decay: 0.018 + Math.random() * 0.014,
        size: sx(Math.random() * 2.8 + 1.2),
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
      ctx.arc(h.x, h.y, h.size * h.life * 3.2, 0, TWO_PI);
      ctx.fillStyle = `rgba(${r},${g},${b},${h.life * 0.08})`;
      ctx.fill();
    }
  }

  function drawOscillationLegend() {
    const lx = W / 2;
    const ly = H * 0.13;
    const bw = W * 0.26;
    const bh = H * 0.085;
    const x0 = lx - bw / 2;
    const y0 = ly - bh / 2;

    ctx.fillStyle = 'rgba(13, 19, 33, 0.68)';
    ctx.beginPath();
    ctx.roundRect(x0, y0, bw, bh, sx(6));
    ctx.fill();

    ctx.strokeStyle = rgba(RING_COLOR, 0.16);
    ctx.lineWidth = sx(0.8);
    ctx.stroke();

    ctx.fillStyle = rgba(BEAM_A, 0.92);
    ctx.beginPath();
    ctx.arc(x0 + sx(16), y0 + bh * 0.32, sx(4.5), 0, TWO_PI);
    ctx.fill();

    ctx.font = font(10, 400);
    ctx.fillStyle = rgba(BEAM_A, 0.9);
    ctx.textAlign = 'left';
    ctx.fillText('νμ (muon neutrino)', x0 + sx(30), y0 + bh * 0.32 + sx(4));

    ctx.fillStyle = 'rgba(190,90,85,0.92)';
    ctx.beginPath();
    ctx.arc(x0 + sx(16), y0 + bh * 0.72, sx(4.5), 0, TWO_PI);
    ctx.fill();

    ctx.font = font(10, 400);
    ctx.fillStyle = 'rgba(190,90,85,0.88)';
    ctx.fillText('νe (oscillated)', x0 + sx(30), y0 + bh * 0.72 + sx(4));
  }

  function update(time) {
    spawnNeutrino(time);

    for (let i = beamNeutrinos.length - 1; i >= 0; i--) {
      const n = beamNeutrinos[i];
      n.prog += n.speed;

      const pos = beamPoint(n.prog);
      n.trail.push({ x: pos.x, y: pos.y, prog: n.prog });
      if (n.trail.length > Math.round(20 * S)) n.trail.shift();

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

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawGroundLine();
    drawBeamTunnel();
    drawAccelerator();
    drawSiteLabels();
    drawNeutrinos();
    drawDetectorBuilding();
    drawDetectorHits();
  }

  function loop(time) {
    update(time);
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(loop);
})();
