// A small Gray–Scott reaction field. A feeds B; diffusion makes the growing
// patches split and reconnect. A low-resolution mask guides the chemistry;
// the original PNG still clips the final drawing at full display resolution.
// Model reference: https://www.karlsims.com/rd.html
export type ReactionPalette = {
  primary: [number, number, number];
  secondary: [number, number, number];
  shadow: [number, number, number];
};

export function createReactionField(width: number, height: number, maskAlpha: Uint8Array) {
  const count = width * height;
  let a = new Float32Array(count).fill(1);
  let b = new Float32Array(count);
  let nextA = new Float32Array(count).fill(1);
  let nextB = new Float32Array(count);
  const memory = new Float32Array(count);
  const edge = new Float32Array(count);
  const flowX = new Float32Array(count);
  const flowY = new Float32Array(count);
  const distance = new Uint8Array(count);
  const cells: number[] = [];
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  // Lower diffusion keeps the wavefronts compact at the same small resolution.
  const diffusionA = .55;
  const diffusionB = .26;
  const feed = .042;
  const kill = .061;
  const timeStep = 1.15;
  let tick = 0;

  // Approximate distance from the brush edges once. Transparent regions do not
  // participate in the simulation, and chemistry cannot diffuse across gaps.
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      if (maskAlpha[i] < 32) continue;
      distance[i] = 4;
      cells.push(i);
      // A small curl field forms internal eddies rather than a directional sweep.
      flowX[i] = .02 * Math.sin(x * .07) * Math.cos(y * .09) + .008 * Math.cos((x + y) * .045);
      flowY[i] = -.02 * (.07 / .09) * Math.cos(x * .07) * Math.sin(y * .09) - .008 * Math.cos((x + y) * .045);
    }
  }
  for (const i of cells) distance[i] = Math.min(distance[i], distance[i - 1] + 1, distance[i - width] + 1);
  for (let cell = cells.length - 1; cell >= 0; cell--) {
    const i = cells[cell];
    distance[i] = Math.min(distance[i], distance[i + 1] + 1, distance[i + width] + 1);
    edge[i] = (4 - distance[i]) / 4;
  }

  // Cache neighbor lookups. At a boundary, sampling the cell itself gives a
  // closed edge: no reagent leaks into transparent space or another brushstroke.
  const neighbors = new Int32Array(cells.length * 8);
  const offsets = [-1, 1, -width, width, -width - 1, -width + 1, width - 1, width + 1];
  for (let cell = 0; cell < cells.length; cell++) {
    const i = cells[cell];
    for (let side = 0; side < 8; side++) {
      const neighbor = i + offsets[side];
      neighbors[cell * 8 + side] = distance[neighbor] ? neighbor : i;
    }
  }

  function disturb(x: number, y: number, radius: number, strength: number, remember = false) {
    for (let row = Math.max(1, Math.floor(y - radius)); row < Math.min(height - 1, y + radius); row++) {
      for (let column = Math.max(1, Math.floor(x - radius)); column < Math.min(width - 1, x + radius); column++) {
        const index = row * width + column;
        if (!distance[index]) continue;
        const falloff = 1 - Math.hypot(column - x, row - y) / radius;
        if (falloff <= 0) continue;
        const weight = remember ? falloff * falloff : falloff;
        const amount = weight * strength;
        b[index] = clamp(b[index] + amount * (1 - b[index]));
        a[index] = clamp(a[index] - amount * .5);
        if (remember) memory[index] = clamp(memory[index] + weight * .55);
      }
    }
  }

  function injectStroke(fromX: number, fromY: number, toX: number, toY: number, speed: number) {
    const energy = clamp(speed);
    const radius = 3.8 - energy * 1.6;
    const strength = .14 + energy * .14;
    const length = Math.hypot(toX - fromX, toY - fromY);
    const samples = Math.min(32, Math.max(1, Math.ceil(length / (radius * .7))));
    for (let sample = 1; sample <= samples; sample++) {
      const fraction = sample / samples;
      disturb(fromX + (toX - fromX) * fraction, fromY + (toY - fromY) * fraction, radius, strength, true);
    }
  }

  function fadeMemory(seconds: number) {
    const decay = Math.exp(-.85 * seconds);
    for (const i of cells) memory[i] *= decay;
  }

  for (let seed = 0; seed < 260; seed++) {
    disturb(Math.random() * width, Math.random() * height, 1.5 + Math.random() * 1.5, .9);
  }

  function step() {
    const tide = .75 + .25 * Math.sin(tick++ * .008);
    // Memory changes the chemistry briefly; it never retains old canvas frames.
    // At 60 simulation steps/sec its half-life is about 0.8 seconds.
    for (const i of cells) memory[i] *= .986;
    for (let cell = 0; cell < cells.length; cell++) {
      const i = cells[cell];
      const n = cell * 8;
      const left = neighbors[n], right = neighbors[n + 1];
      const top = neighbors[n + 2], bottom = neighbors[n + 3];
      const lapA = -a[i]
        + .2 * (a[left] + a[right] + a[top] + a[bottom])
        + .05 * (a[neighbors[n + 4]] + a[neighbors[n + 5]] + a[neighbors[n + 6]] + a[neighbors[n + 7]]);
      const lapB = -b[i]
        + .2 * (b[left] + b[right] + b[top] + b[bottom])
        + .05 * (b[neighbors[n + 4]] + b[neighbors[n + 5]] + b[neighbors[n + 6]] + b[neighbors[n + 7]]);
      const vx = flowX[i] * tide;
      const vy = flowY[i] * tide;
      // Upwind advection gently carries the chemicals along the curl field.
      const driftA = vx * (vx > 0 ? a[i] - a[left] : a[right] - a[i])
        + vy * (vy > 0 ? a[i] - a[top] : a[bottom] - a[i]);
      const driftB = vx * (vx > 0 ? b[i] - b[left] : b[right] - b[i])
        + vy * (vy > 0 ? b[i] - b[top] : b[bottom] - b[i]);
      const localFeed = feed + edge[i] * .0015 + memory[i] * .003;
      const reaction = a[i] * b[i] * b[i];
      nextA[i] = clamp(a[i] + (diffusionA * lapA - driftA - reaction + localFeed * (1 - a[i])) * timeStep);
      nextB[i] = clamp(b[i] + (diffusionB * lapB - driftB + reaction - (kill + localFeed) * b[i]) * timeStep);
    }
    [a, nextA] = [nextA, a];
    [b, nextB] = [nextB, b];
  }

  function paint(pixels: Uint8ClampedArray, palette: ReactionPalette) {
    for (let i = 0; i < count; i++) {
      const activity = clamp(b[i] * 3);
      const front = Math.max(0, 1 - Math.abs(b[i] - .16) * 15);
      const membrane = front * front;
      // Blend within bounded photo-derived colors. A readable shadow floor
      // protects the whole mark, including during a palette transition.
      const highlight = Math.min(1, membrane * .9 + edge[i] * .12 + memory[i] * .18);
      for (let channel = 0; channel < 3; channel++) {
        const base = palette.primary[channel] + (palette.shadow[channel] - palette.primary[channel]) * activity;
        pixels[i * 4 + channel] = base + (palette.secondary[channel] - base) * highlight;
      }
      pixels[i * 4 + 3] = 255;
    }
  }

  return { step, injectStroke, fadeMemory, paint };
}
