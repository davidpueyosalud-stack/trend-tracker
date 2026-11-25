import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const FPS = 30;
const W = 1080;
const H = 1920;

type Row = {
  fase: string;
  semana: string;
  siPuedes: string;
  evitar: string;
  startSec: number;
  endSec: number;
  bg: string;
};

const ROWS: Row[] = [
  {
    fase: "Fase 1 · Calmar",
    semana: "Semana 0-2",
    siPuedes: "Caminar corto, movilidad suave",
    evitar: "Cargar peso, estar sentado mucho rato",
    startSec: 8.4,
    endSec: 23.67,
    bg: "#C8DDF8",
  },
  {
    fase: "Fase 2 · Recuperar movimiento",
    semana: "Semana 2-6",
    siPuedes: "Bisagra de cadera sin carga, core suave",
    evitar: "Flexión profunda con carga",
    startSec: 24.71,
    endSec: 32.79,
    bg: "#C9F5D2",
  },
  {
    fase: "Fase 3 · Recuperar fuerza",
    semana: "Semana 6-12",
    siPuedes: "Peso progresivo, sentadilla controlada",
    evitar: "Saltos o impacto brusco",
    startSec: 34.44,
    endSec: 44.92,
    bg: "#F4D3B0",
  },
  {
    fase: "Fase 4 · Vida normal",
    semana: "Semana 12+",
    siPuedes: "Coger a tus hijos, deporte, viajar",
    evitar: "—",
    startSec: 46.13,
    endSec: 53.15,
    bg: "#FBD1D3",
  },
];

const CAPTIONS: {text: string; startSec: number; endSec: number}[] = [
  {text: "4 FASES", startSec: 8.4, endSec: 11.5},
  {text: "SEMANA 0-2", startSec: 14.2, endSec: 20.1},
  {text: "SEMANA 2-6", startSec: 25.4, endSec: 31.2},
  {text: "SEMANA 6-12", startSec: 36.3, endSec: 43},
  {text: "SEMANA 12+", startSec: 46.8, endSec: 52.5},
  {text: "GUÁRDATE ESTA", startSec: 54.3, endSec: 57.6},
];

const ACCENT = "#E8724A";
const INK = "#16202E";
const GOOD = "#3FAE6B";
const BAD = "#E2574C";
const PAGE_BG = "#FAF7EE";
const DARK_BG = "#28292D";

// ---- Absolute layout coordinates (content space, before camera transform) ----
const CARD = {left: 50, top: 70, width: W - 100, height: 1620};
const PAD = {x: 48, top: 56};
const CONTENT_LEFT = CARD.left + PAD.x;
const CONTENT_RIGHT = CARD.left + CARD.width - PAD.x;
const CONTENT_TOP = CARD.top + PAD.top;

const TITLE_H = 112;
const HEADER_H = 50;
const ROW_H = 192;
const ROW_GAP = 20;

const rowTop = (i: number) => CONTENT_TOP + TITLE_H + 20 + HEADER_H + i * (ROW_H + ROW_GAP);
const rowCenterY = (i: number) => rowTop(i) + ROW_H / 2;
const BIO_TOP = rowTop(ROWS.length) + 20;
const CONTENT_CENTER_X = (CONTENT_LEFT + CONTENT_RIGHT) / 2;

// column centers within a row, used as left/right camera focus points
const LEFT_FOCUS_X = CONTENT_LEFT + 195;
const RIGHT_FOCUS_X = CONTENT_LEFT + 773;
const TABLE_WIDE_FY = (rowCenterY(0) + rowCenterY(ROWS.length - 1)) / 2;

// ---- Camera keyframes ----
type CamKey = {t: number; scale: number; fx: number; fy: number};

const INTRO = {scale: 0.95, fx: CONTENT_CENTER_X, fy: CONTENT_TOP + 260};
const OVERVIEW = {scale: 0.95, fx: CONTENT_CENTER_X, fy: CONTENT_TOP + 320};
const TABLE_WIDE = {scale: 1.22, fx: CONTENT_CENTER_X, fy: TABLE_WIDE_FY};
const ZOOM = 1.95;

function buildCamKeys(): CamKey[] {
  const keys: CamKey[] = [];
  keys.push({t: 0, ...INTRO});
  keys.push({t: ROWS[0].startSec - 1.3, ...INTRO});
  keys.push({t: ROWS[0].startSec - 0.3, ...TABLE_WIDE});

  ROWS.forEach((row, i) => {
    const dur = row.endSec - row.startSec;
    const leftT = row.startSec;
    const rightT = row.startSec + dur * 0.45;
    const wideT = row.startSec + dur * 0.8;
    keys.push({t: leftT, scale: ZOOM, fx: LEFT_FOCUS_X, fy: rowCenterY(i)});
    keys.push({t: rightT, scale: ZOOM, fx: RIGHT_FOCUS_X, fy: rowCenterY(i)});
    keys.push({t: wideT, ...TABLE_WIDE});
    keys.push({t: row.endSec, ...TABLE_WIDE});
  });

  keys.push({t: ROWS[ROWS.length - 1].endSec + 1.15, ...OVERVIEW});
  keys.push({t: 60.33, ...OVERVIEW});
  return keys;
}

const CAM_KEYS = buildCamKeys();

const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

function sampleCamera(t: number): {scale: number; fx: number; fy: number} {
  if (t <= CAM_KEYS[0].t) return CAM_KEYS[0];
  const last = CAM_KEYS[CAM_KEYS.length - 1];
  if (t >= last.t) return last;
  for (let i = 0; i < CAM_KEYS.length - 1; i++) {
    const a = CAM_KEYS[i];
    const b = CAM_KEYS[i + 1];
    if (t >= a.t && t <= b.t) {
      const p = b.t === a.t ? 1 : easeInOut((t - a.t) / (b.t - a.t));
      return {
        scale: a.scale + (b.scale - a.scale) * p,
        fx: a.fx + (b.fx - a.fx) * p,
        fy: a.fy + (b.fy - a.fy) * p,
      };
    }
  }
  return last;
}

const activeRowIndex = (t: number) => {
  for (let i = 0; i < ROWS.length; i++) {
    if (t >= ROWS[i].startSec && t <= ROWS[i].endSec) return i;
  }
  return -1;
};

// Hand + forearm entering from the bottom-right corner, pen tip anchored at (TIP_X, TIP_Y).
const TIP_X = 64;
const TIP_Y = 78;

const Hand: React.FC<{tipX: number; tipY: number}> = ({tipX, tipY}) => (
  <svg
    width="420"
    height="520"
    viewBox="0 0 420 520"
    style={{
      position: "absolute",
      left: tipX - TIP_X,
      top: tipY - TIP_Y,
      filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.35))",
    }}
  >
    {/* forearm, entering from bottom-right */}
    <path
      d="M230 190 Q260 160 300 185 L420 400 Q440 440 410 470 L380 520 L250 420 Q210 390 215 340 Q200 280 215 230 Q215 205 230 190 Z"
      fill="#E8B894"
    />
    <path d="M260 230 Q320 300 360 400" stroke="#D49F72" strokeWidth="4" fill="none" opacity="0.5" />

    {/* pen, running from the tip up through the grip and out past the hand */}
    <line x1={TIP_X} y1={TIP_Y} x2="300" y2="255" stroke="#2B2420" strokeWidth="6" strokeLinecap="round" />
    <line x1={TIP_X + 18} y1={TIP_Y + 14} x2="270" y2="235" stroke="#F2C94C" strokeWidth="19" strokeLinecap="round" />
    <polygon points={`${TIP_X},${TIP_Y} ${TIP_X + 22},${TIP_Y + 6} ${TIP_X + 10},${TIP_Y + 24}`} fill="#2B2420" />

    {/* fist gripping the pen */}
    <path
      d="M150 210 Q134 182 160 170 Q165 154 188 160 Q192 144 215 152 Q222 138 244 148 Q264 154 258 178 Q268 196 250 212 Q246 234 218 238 Q190 246 168 234 Q148 230 150 210 Z"
      fill="#E8B894"
      stroke="#C98F66"
      strokeWidth="3"
    />
    <path d="M178 164 Q181 186 176 206" stroke="#C98F66" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M200 156 Q203 180 198 200" stroke="#C98F66" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M222 152 Q225 174 220 196" stroke="#C98F66" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M243 160 Q246 180 241 200" stroke="#C98F66" strokeWidth="3" fill="none" strokeLinecap="round" />
    <ellipse cx="166" cy="172" rx="9" ry="6" fill="#F2C9A4" opacity="0.7" />
    <ellipse cx="188" cy="162" rx="9" ry="6" fill="#F2C9A4" opacity="0.7" />
    <ellipse cx="210" cy="156" rx="9" ry="6" fill="#F2C9A4" opacity="0.7" />
    <ellipse cx="230" cy="162" rx="9" ry="6" fill="#F2C9A4" opacity="0.7" />

    {/* thumb */}
    <path
      d="M152 214 Q122 212 120 186 Q120 166 144 170 Q160 174 158 196 Q160 212 152 214 Z"
      fill="#E8B894"
      stroke="#C98F66"
      strokeWidth="3"
    />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" style={{flexShrink: 0}}>
    <circle cx="15" cy="15" r="15" fill={GOOD} />
    <path d="M8 15.5 L13 20 L22 10" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CrossIcon: React.FC = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" style={{flexShrink: 0}}>
    <circle cx="15" cy="15" r="15" fill={BAD} />
    <path d="M10 10 L20 20 M20 10 L10 20" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const FasesReel: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const cam = sampleCamera(t);
  const idx = activeRowIndex(t);

  const camTransform = `translate(${W / 2 - cam.fx * cam.scale}px, ${H / 2 - cam.fy * cam.scale}px) scale(${cam.scale})`;

  const activeCaption = CAPTIONS.find((c) => t >= c.startSec && t <= c.endSec);

  // Hand tip follows the same left->right sweep the camera does within the active row.
  let tipX = LEFT_FOCUS_X;
  let tipY = CONTENT_TOP + 200;
  const handVisible = t >= ROWS[0].startSec - 0.2;
  if (idx >= 0) {
    const row = ROWS[idx];
    const dur = row.endSec - row.startSec;
    const p = Math.min(1, Math.max(0, (t - row.startSec) / (dur * 0.45)));
    const ep = easeInOut(p);
    tipX = LEFT_FOCUS_X + (RIGHT_FOCUS_X - LEFT_FOCUS_X) * ep;
    tipY = rowCenterY(idx) + 10;
  } else if (t > ROWS[ROWS.length - 1].endSec) {
    tipX = RIGHT_FOCUS_X;
    tipY = rowCenterY(ROWS.length - 1) + 10;
  }

  return (
    <AbsoluteFill style={{background: DARK_BG, fontFamily: "'Work Sans', sans-serif", overflow: "hidden"}}>
      <Audio src={staticFile("assets/reel1-fases/audio.m4a")} />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: W,
          height: H,
          transform: camTransform,
          transformOrigin: "0 0",
        }}
      >
        {/* Page */}
        <div
          style={{
            position: "absolute",
            left: CARD.left,
            top: CARD.top,
            width: CARD.width,
            height: CARD.height,
            background: PAGE_BG,
            borderRadius: 20,
            boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          }}
        />

        {/* Title */}
        <div
          style={{
            position: "absolute",
            left: CONTENT_LEFT,
            top: CONTENT_TOP,
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              background: "#FAF168",
              borderRadius: 10,
              padding: "20px 28px",
              fontFamily: "'Anton', sans-serif",
              fontSize: 40,
              color: INK,
              textTransform: "uppercase",
              lineHeight: 1.05,
            }}
          >
            Fases de
            <br />
            recuperación
          </div>
          <div style={{fontSize: 24, fontWeight: 700, color: INK}}>David Pueyo</div>
        </div>

        {/* Table header */}
        <div
          style={{
            position: "absolute",
            left: CONTENT_LEFT,
            top: CONTENT_TOP + TITLE_H + 20,
            width: CONTENT_RIGHT - CONTENT_LEFT,
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr 1.6fr 1.3fr",
            gap: 10,
            fontSize: 20,
            fontWeight: 700,
            color: "#6B6B6B",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          <div>Fase</div>
          <div>Semana</div>
          <div>Qué sí puedes hacer</div>
          <div>Qué evitar</div>
        </div>

        {/* Rows */}
        {ROWS.map((row, i) => (
          <div
            key={row.fase}
            style={{
              position: "absolute",
              left: CONTENT_LEFT,
              top: rowTop(i),
              width: CONTENT_RIGHT - CONTENT_LEFT,
              height: ROW_H,
              display: "grid",
              gridTemplateColumns: "1.3fr 1fr 1.6fr 1.3fr",
              gap: 10,
              alignItems: "center",
              background: row.bg,
              borderRadius: 14,
              padding: "0 20px",
              boxSizing: "border-box",
              border: i === idx ? `4px solid ${ACCENT}` : "4px solid transparent",
            }}
          >
            <div style={{fontWeight: 700, fontSize: 22, color: INK}}>{row.fase}</div>
            <div style={{fontWeight: 800, fontSize: 26, color: ACCENT}}>{row.semana}</div>
            <div style={{display: "flex", alignItems: "center", gap: 10, fontSize: 19, color: INK, lineHeight: 1.25}}>
              <CheckIcon />
              <span>{row.siPuedes}</span>
            </div>
            <div style={{display: "flex", alignItems: "center", gap: 10, fontSize: 17, color: "#7A4A3A", lineHeight: 1.25}}>
              {row.evitar !== "—" && <CrossIcon />}
              <span>{row.evitar}</span>
            </div>
          </div>
        ))}

        {/* Bio */}
        <div
          style={{
            position: "absolute",
            left: CONTENT_LEFT,
            top: BIO_TOP,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <svg width="70" height="70" viewBox="0 0 100 100">
            <rect x="42" y="54" width="16" height="16" fill="#D9A574" />
            <path d="M18 98 Q22 62 50 62 Q78 62 82 98 Z" fill="#2D5F6B" />
            <path d="M50 62 L40 70 L50 80 L60 70 Z" fill="#234B54" />
            <circle cx="50" cy="36" r="21" fill="#D9A574" />
            <circle cx="29" cy="37" r="4" fill="#D9A574" />
            <circle cx="71" cy="37" r="4" fill="#D9A574" />
            <path
              d="M27 32 Q24 12 50 10 Q76 12 73 32 Q73 24 66 23 Q68 17 60 16 Q58 22 52 17 Q50 23 45 17 Q42 22 38 18 Q36 23 32 22 Q27 24 27 32 Z"
              fill="#241F1C"
            />
            <path d="M36 32 Q41 29 46 31" stroke="#241F1C" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M54 31 Q59 29 64 32" stroke="#241F1C" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M38 40 Q40 50 46 54 Q50 57 54 54 Q60 50 62 40 Q58 46 50 47 Q42 46 38 40 Z" fill="#5C5048" />
            <path d="M40 44 Q50 49 60 44 Q58 41 50 42 Q42 41 40 44 Z" fill="#4A4038" />
          </svg>
          <div>
            <div style={{fontWeight: 700, fontSize: 20, color: INK}}>David · Fisioterapeuta y osteópata</div>
            <div style={{fontSize: 16, color: "#6B6B6B"}}>Hernias L4-L5 y L5-S1 · @fisiodavidpueyo</div>
          </div>
        </div>

        {handVisible && <Hand tipX={tipX} tipY={tipY} />}
      </div>

      {/* Caption burst (screen space, not affected by camera) */}
      {activeCaption && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 90,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: INK,
              color: "#FFFFFF",
              fontFamily: "'Anton', sans-serif",
              fontSize: 56,
              padding: "16px 40px",
              borderRadius: 16,
              textTransform: "uppercase",
            }}
          >
            {activeCaption.text}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const FASES_REEL_DURATION_IN_FRAMES = Math.ceil(60.33 * FPS);
export const FASES_REEL_FPS = FPS;
