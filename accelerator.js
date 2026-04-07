/**
 * ====================================================
 * PARTICLE ACCELERATOR — Canvas Animation
 * ====================================================
 *
 * HOW IT WORKS:
 * - A tilted elliptical ring (the "accelerator") sits in the center
 * - Two beams of particles orbit the ring in opposite directions
 * - When particles reach the collision point (bottom of the ring),
 *   they produce a shower of debris particles ("jets")
 *
 * HOW TO EDIT:
 * - Search for "EDIT:" comments below — those are the knobs you can turn
 * - Colors use [R, G, B] arrays (0-255 per channel)
 * - Angles are in radians: 0 = right, PI/2 = bottom, PI = left, 3PI/2 = top
 *
 * ====================================================
 */

(function () {
  const canvas = document.getElementById('accelerator-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, cx, cy;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const TWO_PI = Math.PI * 2;

  let radiusX, radiusY;

  // EDIT: Tilt of the ring. 0 = edge-on (flat line), 1 = top-down (full circle).
  // Try values between 0.25 and 0.6.
  const TILT = 0.36;

  // EDIT: Number of orbiting particles per beam (total = BEAM_COUNT).
  // Half go clockwise, half go counter-clockwise.
  const BEAM_COUNT = 90;

  // EDIT: Number of background dots.
  const STAR_COUNT = 60;

  // EDIT: Where on the ring do particles collide?
  // PI/2 = bottom (front), 0 = right, PI = left, 3*PI/2 = top (back)
  const COLLISION_ANGLE = Math.PI / 2;

  // EDIT: How close (in radians) a particle must be to COLLISION_ANGLE to trigger a collision.
  const COLLISION_ZONE = 0.07;

  // ===== COLORS =====
  // Each color is [Red, Green, Blue] where each value is 0-255.

  // EDIT: Ring color (the accelerator tube)
  const RING_COLOR = { r: 26, g: 100, b: 138 };

  // EDIT: Beam A color (clockwise particles)
  const BEAM_A = { r: 26, g: 122, b: 138 };

  // EDIT: Beam B color (counter-clockwise particles)
  const BEAM_B = { r: 60, g: 90, b: 140 };

  // EDIT: Collision debris colors — particles randomly pick one of these
  const COLLISION_COLORS = [
    [212, 114, 106],   // warm coral
    [26, 122, 138],    // teal
    [184, 152, 64],    // soft gold
    [60, 90, 140],     // slate blue
    [160, 80, 90],     // rose
  ];

  // ===== INTERNAL STATE (no need to edit) =====
  const beamParticles = [];
  const collisionParticles = [];
  const bgStars = [];

  function resize() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2;
    cy = H / 2;
    // EDIT: Ring size relative to canvas. Bigger number = bigger ring.
    radiusX = Math.min(W * 0.38, 320);
    if (radiusX < 100) radiusX = 100;
    radiusY = radiusX * TILT;
  }

  // Get a position on the elliptical ring at a given angle
  function ringPos(angle, rOffX, rOffY) {
    return {
      x: cx + (radiusX + rOffX) * Math.cos(angle),
      y: cy + (radiusY + rOffY * TILT) * Math.sin(angle),
    };
  }

  // Depth: 0 = back of ring (far away), 1 = front of ring (close to viewer)
  function depthFactor(angle) {
    return 0.5 + 0.5 * Math.sin(angle);
  }

  // ----- Background dots -----
  function initStars() {
    bgStars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      bgStars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.12 + 0.03,
        twinkleSpeed: Math.random() * 0.015 + 0.003,
        phase: Math.random() * TWO_PI,
      });
    }
  }

  // ----- Beam particles -----
  function initBeam() {
    beamParticles.length = 0;
    for (let i = 0; i < BEAM_COUNT; i++) {
      const dir = i < BEAM_COUNT / 2 ? 1 : -1;
      beamParticles.push({
        angle: (TWO_PI / (BEAM_COUNT / 2)) * (i % (BEAM_COUNT / 2)) + Math.random() * 0.1,

        // EDIT: Orbit speed. Bigger = faster. The * dir makes beams go opposite ways.
        speed: (0.011 + Math.random() * 0.005) * dir,

        // EDIT: How far off-center from the ring each particle drifts (in px)
        radiusOffset: (Math.random() - 0.5) * 6,

        // EDIT: Particle dot size (px)
        size: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.6 + 0.4,
        dir: dir,
        trail: [],
      });
    }
  }

  // ----- Collision jets -----
  function spawnCollision(x, y) {
    // EDIT: Number of debris particles per collision. More = denser spray.
    const count = 22 + Math.floor(Math.random() * 16);
    for (let i = 0; i < count; i++) {
      // EDIT: Spray angle spread. PI * 1.4 = wide fan. PI * 0.5 = narrow jet.
      const baseAngle = Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;

      // EDIT: Debris speed. Bigger = particles fly farther.
      const speed = Math.random() * 6 + 2;
      const color = COLLISION_COLORS[Math.floor(Math.random() * COLLISION_COLORS.length)];
      const isSpark = Math.random() > 0.6;

      collisionParticles.push({
        x: x,
        y: y,
        vx: Math.cos(baseAngle) * speed * (0.5 + Math.random() * 1.0),
        vy: Math.sin(baseAngle) * speed * (0.3 + Math.random() * 0.8),
        life: 1,

        // EDIT: Decay rate. Smaller = particles live longer. Try 0.005 - 0.03.
        decay: 0.008 + Math.random() * 0.014,

        // EDIT: Debris particle size. Bigger number = bigger blobs.
        size: isSpark ? Math.random() * 1.5 + 0.5 : Math.random() * 4 + 2,
        color: color,
        isSpark: isSpark,
      });
    }
  }

  let lastCollisionTime = 0;

  // ===== PHYSICS UPDATE (runs every frame) =====
  function update(time) {
    // Move beam particles around the ring
    for (const p of beamParticles) {
      p.angle += p.speed;
      if (p.angle > TWO_PI) p.angle -= TWO_PI;
      if (p.angle < 0) p.angle += TWO_PI;

      const pos = ringPos(p.angle, p.radiusOffset, p.radiusOffset);
      p.trail.push({ x: pos.x, y: pos.y, angle: p.angle });
      if (p.trail.length > 10) p.trail.shift();

      // Check if particle is near collision point
      const diff = Math.abs(p.angle - COLLISION_ANGLE);
      const wrapped = Math.min(diff, TWO_PI - diff);

      // EDIT: Minimum time between collisions (ms). 320 = ~3 per second.
      if (wrapped < COLLISION_ZONE && time - lastCollisionTime > 320) {
        const cp = ringPos(COLLISION_ANGLE, 0, 0);
        spawnCollision(cp.x, cp.y);
        lastCollisionTime = time;
      }
    }

    // Update collision debris (move, slow down, fade)
    for (let i = collisionParticles.length - 1; i >= 0; i--) {
      const cp = collisionParticles[i];
      cp.x += cp.vx;
      cp.y += cp.vy;
      cp.vy += 0.04; // EDIT: Gravity. Bigger = debris falls faster. 0 = no gravity.
      cp.vx *= 0.984; // EDIT: Air drag. Closer to 1 = less drag. Try 0.95 - 0.999.
      cp.vy *= 0.984;
      cp.life -= cp.decay;
      if (cp.life <= 0) collisionParticles.splice(i, 1);
    }
  }

  // ===== DRAWING (runs every frame) =====
  function draw(time) {
    ctx.clearRect(0, 0, W, H);

    // Background dots
    for (const s of bgStars) {
      const twinkle = Math.sin(time * s.twinkleSpeed + s.phase) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, TWO_PI);
      ctx.fillStyle = `rgba(26, 100, 138, ${s.alpha * twinkle})`;
      ctx.fill();
    }

    // --- RING: drawn in two halves for 3D depth ---
    // Back half (behind everything, dimmer)
    drawRingArc(-Math.PI / 2, Math.PI / 2, 0.07, 0.4);
    drawRingStructure(-Math.PI / 2, Math.PI / 2, 0.05);
    drawBeamParticles(true); // back-half particles

    // Front half (in front, brighter)
    drawRingArc(Math.PI / 2, 3 * Math.PI / 2, 0.18, 1.0);
    drawRingStructure(Math.PI / 2, 3 * Math.PI / 2, 0.14);

    drawDetectors(time);
    drawBeamParticles(false); // front-half particles
    drawCollisionParticles(time);

    // Collision point glow
    const pulse = Math.sin(time * 0.004) * 0.4 + 0.6;
    const cp = ringPos(COLLISION_ANGLE, 0, 0);
    // EDIT: Glow radius. Bigger number = larger glow area.
    const glowRadius = 55 * pulse;
    const grad = ctx.createRadialGradient(cp.x, cp.y, 0, cp.x, cp.y, glowRadius);
    grad.addColorStop(0, `rgba(212, 114, 106, ${0.3 * pulse})`);
    grad.addColorStop(0.3, `rgba(184, 152, 64, ${0.12 * pulse})`);
    grad.addColorStop(1, 'rgba(26, 122, 138, 0)');
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, glowRadius, 0, TWO_PI);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // --- Helper: draw a section of the ring ---
  function drawRingArc(startAngle, endAngle, baseAlpha, brightnessMult) {
    const { r, g, b } = RING_COLOR;
    // EDIT: Ring tube thickness. Change lineWidth values (14, 11, 8, 5 default).
    for (let layer = 3; layer >= 0; layer--) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, radiusX + layer * 0.5, radiusY + layer * 0.3, 0, startAngle, endAngle);
      const alpha = (baseAlpha + layer * 0.012) * brightnessMult;
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.lineWidth = (14 - layer * 3) * brightnessMult;
      ctx.stroke();
    }
    // Core thin line
    ctx.beginPath();
    ctx.ellipse(cx, cy, radiusX, radiusY, 0, startAngle, endAngle);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.3 * brightnessMult})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawRingStructure(startAngle, endAngle, alpha) {
    const { r, g, b } = RING_COLOR;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radiusX - 8, radiusY - 3, 0, startAngle, endAngle);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.4})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy, radiusX + 8, radiusY + 3, 0, startAngle, endAngle);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  function drawDetectors(time) {
    const detectorAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    for (const da of detectorAngles) {
      const pos = ringPos(da, 0, 0);
      const depth = depthFactor(da);
      const sz = 3 + depth * 4;
      const isCP = da === COLLISION_ANGLE;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, sz * 2.5, 0, TWO_PI);
      ctx.fillStyle = isCP
        ? `rgba(212, 114, 106, ${0.08 + depth * 0.1})`
        : `rgba(26, 100, 138, ${0.04 + depth * 0.04})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, sz, 0, TWO_PI);
      ctx.fillStyle = isCP
        ? `rgba(212, 114, 106, ${0.5 + depth * 0.4})`
        : `rgba(26, 100, 138, ${0.25 + depth * 0.3})`;
      ctx.fill();

      if (depth > 0.3) {
        const boxW = 10 + depth * 8;
        const boxH = 4 + depth * 4;
        ctx.save();
        ctx.translate(pos.x, pos.y);
        const tangentAngle = Math.atan2(radiusY * Math.cos(da), -radiusX * Math.sin(da));
        ctx.rotate(tangentAngle);
        ctx.strokeStyle = isCP
          ? `rgba(212, 114, 106, ${0.25 * depth})`
          : `rgba(26, 100, 138, ${0.15 * depth})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);
        ctx.restore();
      }
    }
  }

  function drawBeamParticles(backHalf) {
    for (const p of beamParticles) {
      const pos = ringPos(p.angle, p.radiusOffset, p.radiusOffset);
      const depth = depthFactor(p.angle);
      const isBack = (p.angle > (3 * Math.PI / 2) || p.angle < Math.PI / 2);
      if (backHalf !== isBack) continue;

      const sizeMult = 0.5 + depth * 0.8;
      const alphaMult = 0.3 + depth * 0.7;
      const beam = p.dir === 1 ? BEAM_A : BEAM_B;

      // Trail
      if (p.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let i = 1; i < p.trail.length; i++) {
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
        }
        ctx.strokeStyle = `rgba(${beam.r}, ${beam.g}, ${beam.b}, ${p.alpha * 0.1 * alphaMult})`;
        ctx.lineWidth = p.size * 0.7 * sizeMult;
        ctx.stroke();
      }

      // Dot
      const pSize = p.size * sizeMult;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pSize, 0, TWO_PI);
      ctx.fillStyle = `rgba(${beam.r}, ${beam.g}, ${beam.b}, ${p.alpha * alphaMult * 0.8})`;
      ctx.fill();

      // Subtle glow
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pSize * 2.5, 0, TWO_PI);
      ctx.fillStyle = `rgba(${beam.r}, ${beam.g}, ${beam.b}, ${p.alpha * 0.06 * alphaMult})`;
      ctx.fill();
    }
  }

  function drawCollisionParticles(time) {
    for (const cp of collisionParticles) {
      const [r, g, b] = cp.color;

      // Core
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, cp.size * cp.life, 0, TWO_PI);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${cp.life * 0.85})`;
      ctx.fill();

      // Glow
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, cp.size * cp.life * 4, 0, TWO_PI);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${cp.life * 0.08})`;
      ctx.fill();

      // Spark trail
      if (cp.life > 0.3 && !cp.isSpark) {
        ctx.beginPath();
        ctx.moveTo(cp.x, cp.y);
        ctx.lineTo(cp.x - cp.vx * 4, cp.y - cp.vy * 4);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${cp.life * 0.3})`;
        ctx.lineWidth = cp.size * cp.life * 0.5;
        ctx.stroke();
      }

      if (cp.isSpark && cp.life > 0.5) {
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, cp.size * cp.life * 0.6, 0, TWO_PI);
        ctx.fillStyle = `rgba(240, 220, 200, ${(cp.life - 0.3) * 0.4})`;
        ctx.fill();
      }
    }
  }

  // ===== MAIN LOOP =====
  function loop(time) {
    update(time);
    draw(time);
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => {
    resize();
    initStars();
  });

  resize();
  initStars();
  initBeam();
  requestAnimationFrame(loop);
})();
