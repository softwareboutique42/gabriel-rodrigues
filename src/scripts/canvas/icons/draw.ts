/**
 * Procedural icon drawing functions.
 * Each function draws an industry icon on a 2D canvas context.
 * The canvas is 128x128, drawing area centered, using the provided color.
 */

type DrawFn = (ctx: CanvasRenderingContext2D, color: string) => void;

const S = 128; // canvas size
const C = S / 2; // center
const R = S * 0.35; // icon radius

// ── Tech / Software ──────────────────────────────────────────────

const drawCircuitBoard: DrawFn = (ctx, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  // Central chip
  const chip = S * 0.15;
  ctx.strokeRect(C - chip, C - chip, chip * 2, chip * 2);

  // Traces from chip edges
  const traces = [
    // Top
    [C - chip * 0.5, C - chip, C - chip * 0.5, C - R],
    [C + chip * 0.5, C - chip, C + chip * 0.5, C - R * 0.7],
    // Bottom
    [C - chip * 0.5, C + chip, C - chip * 0.5, C + R],
    [C + chip * 0.5, C + chip, C + chip * 0.5, C + R * 0.7],
    // Left
    [C - chip, C - chip * 0.5, C - R, C - chip * 0.5],
    [C - chip, C + chip * 0.5, C - R * 0.7, C + chip * 0.5],
    // Right
    [C + chip, C - chip * 0.5, C + R, C - chip * 0.5],
    [C + chip, C + chip * 0.5, C + R * 0.7, C + chip * 0.5],
  ];

  for (const [x1, y1, x2, y2] of traces) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    // Node dot at end
    ctx.beginPath();
    ctx.arc(x2, y2, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
};

// ── Finance ──────────────────────────────────────────────────────

const drawChart: DrawFn = (ctx, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Axes
  const left = C - R;
  const right = C + R;
  const top = C - R;
  const bottom = C + R;

  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.stroke();

  // Rising line chart
  const points = [
    [left + R * 0.15, bottom - R * 0.3],
    [left + R * 0.5, bottom - R * 0.6],
    [left + R * 0.8, bottom - R * 0.45],
    [left + R * 1.1, bottom - R * 0.9],
    [left + R * 1.5, bottom - R * 1.3],
    [left + R * 1.8, bottom - R * 1.6],
  ];

  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.stroke();

  // Dots on data points
  ctx.fillStyle = color;
  for (const [x, y] of points) {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
};

// ── Food / Restaurant ────────────────────────────────────────────

const drawForkKnife: DrawFn = (ctx, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  // Fork (left)
  const fx = C - R * 0.35;
  ctx.beginPath();
  ctx.moveTo(fx, C - R);
  ctx.lineTo(fx, C + R);
  ctx.stroke();
  // Fork tines
  for (const dx of [-6, 0, 6]) {
    ctx.beginPath();
    ctx.moveTo(fx + dx, C - R);
    ctx.lineTo(fx + dx, C - R * 0.3);
    ctx.stroke();
  }

  // Knife (right)
  const kx = C + R * 0.35;
  ctx.beginPath();
  ctx.moveTo(kx, C - R);
  ctx.quadraticCurveTo(kx + 12, C - R * 0.2, kx, C);
  ctx.lineTo(kx, C + R);
  ctx.stroke();
};

// ── Health / Medical ─────────────────────────────────────────────

const drawHeartbeat: DrawFn = (ctx, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Heartbeat pulse line
  const y = C;
  ctx.beginPath();
  ctx.moveTo(C - R, y);
  ctx.lineTo(C - R * 0.5, y);
  ctx.lineTo(C - R * 0.3, y - R * 0.6);
  ctx.lineTo(C - R * 0.1, y + R * 0.4);
  ctx.lineTo(C + R * 0.1, y - R * 0.8);
  ctx.lineTo(C + R * 0.3, y + R * 0.3);
  ctx.lineTo(C + R * 0.5, y);
  ctx.lineTo(C + R, y);
  ctx.stroke();

  // Cross/plus
  const cx = C;
  const cy = C - R * 0.05;
  const cs = R * 0.2;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - cs, cy);
  ctx.lineTo(cx + cs, cy);
  ctx.moveTo(cx, cy - cs);
  ctx.lineTo(cx, cy + cs);
  ctx.stroke();
};

// ── Aerospace / Space ────────────────────────────────────────────

const drawRocket: DrawFn = (ctx, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Rocket body
  ctx.beginPath();
  ctx.moveTo(C, C - R);
  ctx.quadraticCurveTo(C + R * 0.35, C - R * 0.3, C + R * 0.3, C + R * 0.4);
  ctx.lineTo(C - R * 0.3, C + R * 0.4);
  ctx.quadraticCurveTo(C - R * 0.35, C - R * 0.3, C, C - R);
  ctx.stroke();

  // Window
  ctx.beginPath();
  ctx.arc(C, C - R * 0.15, R * 0.12, 0, Math.PI * 2);
  ctx.stroke();

  // Fins
  ctx.beginPath();
  ctx.moveTo(C - R * 0.3, C + R * 0.2);
  ctx.lineTo(C - R * 0.55, C + R * 0.6);
  ctx.lineTo(C - R * 0.3, C + R * 0.4);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(C + R * 0.3, C + R * 0.2);
  ctx.lineTo(C + R * 0.55, C + R * 0.6);
  ctx.lineTo(C + R * 0.3, C + R * 0.4);
  ctx.stroke();

  // Flame
  ctx.beginPath();
  ctx.moveTo(C - R * 0.15, C + R * 0.4);
  ctx.quadraticCurveTo(C, C + R * 0.9, C + R * 0.15, C + R * 0.4);
  ctx.stroke();
};

// ── E-commerce / Retail ──────────────────────────────────────────

const drawCart: DrawFn = (ctx, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Cart body
  ctx.beginPath();
  ctx.moveTo(C - R * 0.8, C - R * 0.5);
  ctx.lineTo(C - R * 0.55, C - R * 0.5);
  ctx.lineTo(C - R * 0.35, C + R * 0.3);
  ctx.lineTo(C + R * 0.6, C + R * 0.3);
  ctx.lineTo(C + R * 0.75, C - R * 0.5);
  ctx.lineTo(C - R * 0.4, C - R * 0.5);
  ctx.stroke();

  // Handle
  ctx.beginPath();
  ctx.moveTo(C - R * 0.8, C - R * 0.5);
  ctx.lineTo(C - R * 0.95, C - R * 0.7);
  ctx.stroke();

  // Wheels
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(C - R * 0.2, C + R * 0.55, R * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(C + R * 0.45, C + R * 0.55, R * 0.1, 0, Math.PI * 2);
  ctx.fill();
};

// ── Education ────────────────────────────────────────────────────

const drawBook: DrawFn = (ctx, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Open book
  ctx.beginPath();
  ctx.moveTo(C, C - R * 0.5);
  ctx.quadraticCurveTo(C - R * 0.5, C - R * 0.7, C - R, C - R * 0.5);
  ctx.lineTo(C - R, C + R * 0.5);
  ctx.quadraticCurveTo(C - R * 0.5, C + R * 0.3, C, C + R * 0.5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(C, C - R * 0.5);
  ctx.quadraticCurveTo(C + R * 0.5, C - R * 0.7, C + R, C - R * 0.5);
  ctx.lineTo(C + R, C + R * 0.5);
  ctx.quadraticCurveTo(C + R * 0.5, C + R * 0.3, C, C + R * 0.5);
  ctx.stroke();

  // Spine
  ctx.beginPath();
  ctx.moveTo(C, C - R * 0.5);
  ctx.lineTo(C, C + R * 0.5);
  ctx.stroke();
};

// ── Music / Audio ────────────────────────────────────────────────

const drawWaveform: DrawFn = (ctx, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  // Vertical bars like an equalizer
  const bars = 9;
  const gap = (R * 2) / bars;
  const heights = [0.3, 0.5, 0.8, 0.6, 1.0, 0.6, 0.8, 0.5, 0.3];
  const startX = C - R + gap / 2;

  for (let i = 0; i < bars; i++) {
    const x = startX + i * gap;
    const h = R * heights[i];
    ctx.beginPath();
    ctx.moveTo(x, C - h);
    ctx.lineTo(x, C + h);
    ctx.stroke();
  }
};

// ── Automotive / Transport ───────────────────────────────────────

const drawWheel: DrawFn = (ctx, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;

  // Outer ring
  ctx.beginPath();
  ctx.arc(C, C, R, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring
  ctx.beginPath();
  ctx.arc(C, C, R * 0.6, 0, Math.PI * 2);
  ctx.stroke();

  // Hub
  ctx.beginPath();
  ctx.arc(C, C, R * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Spokes
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(C + Math.cos(angle) * R * 0.15, C + Math.sin(angle) * R * 0.15);
    ctx.lineTo(C + Math.cos(angle) * R * 0.6, C + Math.sin(angle) * R * 0.6);
    ctx.stroke();
  }
};

// ── Energy / Utilities ───────────────────────────────────────────

const drawLightning: DrawFn = (ctx, color) => {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';

  // Lightning bolt shape
  ctx.beginPath();
  ctx.moveTo(C + R * 0.15, C - R);
  ctx.lineTo(C - R * 0.35, C + R * 0.05);
  ctx.lineTo(C + R * 0.05, C + R * 0.05);
  ctx.lineTo(C - R * 0.15, C + R);
  ctx.lineTo(C + R * 0.35, C - R * 0.05);
  ctx.lineTo(C - R * 0.05, C - R * 0.05);
  ctx.closePath();
  ctx.stroke();
};

// ── Generic / Fallback ───────────────────────────────────────────

const drawDiamond: DrawFn = (ctx, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';

  // Diamond/gem shape
  ctx.beginPath();
  ctx.moveTo(C, C - R);
  ctx.lineTo(C + R, C);
  ctx.lineTo(C, C + R);
  ctx.lineTo(C - R, C);
  ctx.closePath();
  ctx.stroke();

  // Inner lines
  ctx.beginPath();
  ctx.moveTo(C - R * 0.5, C - R * 0.5);
  ctx.lineTo(C + R * 0.5, C - R * 0.5);
  ctx.moveTo(C - R * 0.5, C - R * 0.5);
  ctx.lineTo(C, C + R);
  ctx.moveTo(C + R * 0.5, C - R * 0.5);
  ctx.lineTo(C, C + R);
  ctx.stroke();
};

// ── Registry ─────────────────────────────────────────────────────

interface IconEntry {
  keywords: string[];
  draw: DrawFn;
}

const icons: IconEntry[] = [
  {
    keywords: [
      'tech',
      'software',
      'saas',
      'ai',
      'cloud',
      'data',
      'computing',
      'platform',
      'digital',
      'cyber',
      'semiconductor',
      'chip',
    ],
    draw: drawCircuitBoard,
  },
  {
    keywords: [
      'finance',
      'bank',
      'invest',
      'insurance',
      'fintech',
      'trading',
      'capital',
      'stock',
      'crypto',
      'payment',
    ],
    draw: drawChart,
  },
  {
    keywords: [
      'food',
      'restaurant',
      'beverage',
      'drink',
      'dining',
      'culinary',
      'catering',
      'grocery',
      'kitchen',
      'coffee',
    ],
    draw: drawForkKnife,
  },
  {
    keywords: [
      'health',
      'medical',
      'pharma',
      'biotech',
      'hospital',
      'wellness',
      'fitness',
      'healthcare',
      'clinic',
      'dental',
    ],
    draw: drawHeartbeat,
  },
  {
    keywords: [
      'aerospace',
      'space',
      'aviation',
      'rocket',
      'defense',
      'satellite',
      'drone',
      'flight',
      'airline',
    ],
    draw: drawRocket,
  },
  {
    keywords: [
      'ecommerce',
      'e-commerce',
      'retail',
      'shop',
      'store',
      'marketplace',
      'commerce',
      'consumer',
      'fashion',
      'apparel',
    ],
    draw: drawCart,
  },
  {
    keywords: [
      'education',
      'learning',
      'school',
      'university',
      'academic',
      'edtech',
      'training',
      'course',
      'teaching',
      'book',
    ],
    draw: drawBook,
  },
  {
    keywords: [
      'music',
      'audio',
      'sound',
      'streaming',
      'podcast',
      'radio',
      'recording',
      'entertainment',
      'media',
      'video',
    ],
    draw: drawWaveform,
  },
  {
    keywords: [
      'automotive',
      'car',
      'vehicle',
      'transport',
      'logistics',
      'shipping',
      'delivery',
      'mobility',
      'fleet',
      'trucking',
    ],
    draw: drawWheel,
  },
  {
    keywords: [
      'energy',
      'electric',
      'solar',
      'power',
      'utility',
      'oil',
      'gas',
      'renewable',
      'battery',
      'grid',
      'nuclear',
    ],
    draw: drawLightning,
  },
];

/**
 * Match an industry string to a draw function.
 * Uses lowercase keyword matching against the free-form industry field.
 */
export function getIconDrawFn(industry: string): DrawFn {
  const lower = industry.toLowerCase();
  for (const entry of icons) {
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        return entry.draw;
      }
    }
  }
  return drawDiamond;
}
