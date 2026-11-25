import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FPS = 30;

type Row = {
  fase: string;
  semana: string;
  siPuedes: string;
  evitar: string;
  startSec: number;
  endSec: number;
  rowBg: string;
};

const ROWS: Row[] = [
  {
    fase: "Fase 1 · Calmar",
    semana: "Semana 0-2",
    siPuedes: "Caminar corto, movilidad suave",
    evitar: "Cargar peso, estar sentado mucho rato",
    startSec: 8.4,
    endSec: 23.67,
    rowBg: "#FBEFEA",
  },
  {
    fase: "Fase 2 · Recuperar movimiento",
    semana: "Semana 2-6",
    siPuedes: "Bisagra de cadera sin carga, core suave",
    evitar: "Flexión profunda con carga",
    startSec: 24.71,
    endSec: 32.79,
    rowBg: "#FDF4E3",
  },
  {
    fase: "Fase 3 · Recuperar fuerza",
    semana: "Semana 6-12",
    siPuedes: "Peso progresivo, sentadilla controlada",
    evitar: "Saltos o impacto brusco",
    startSec: 34.44,
    endSec: 44.92,
    rowBg: "#EAF1EC",
  },
  {
    fase: "Fase 4 · Vida normal",
    semana: "Semana 12+",
    siPuedes: "Coger a tus hijos, deporte, viajar",
    evitar: "—",
    startSec: 46.13,
    endSec: 53.15,
    rowBg: "#E9F0F5",
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

const ACCENT = "#B8714B";
const INK = "#16202E";

const activeRowIndex = (t: number) => {
  for (let i = 0; i < ROWS.length; i++) {
    if (t >= ROWS[i].startSec - 0.4 && t <= ROWS[i].endSec) return i;
  }
  if (t > ROWS[ROWS.length - 1].endSec) return ROWS.length - 1;
  return -1;
};

const TABLE_TOP = 520;
const ROW_HEIGHT = 190;
const ROW_GAP = 18;

const Hand: React.FC<{x: number; y: number; rotate: number}> = ({x, y, rotate}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `rotate(${rotate}deg)`,
      transformOrigin: "20% 80%",
    }}
  >
    <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
      <line x1="150" y1="30" x2="60" y2="150" stroke={INK} strokeWidth="10" strokeLinecap="round" />
      <circle cx="150" cy="30" r="8" fill={ACCENT} />
      <path
        d="M40 110 C20 108 10 125 20 140 L55 190 C65 205 85 210 100 198 L140 165 C150 157 148 143 137 138 C130 135 122 137 117 143 L100 158 L90 120 C87 108 75 100 65 103 L55 106 C47 108 42 108 40 110 Z"
        fill="#E8B894"
        stroke="#B9875F"
        strokeWidth="4"
      />
    </svg>
  </div>
);

export const FasesReel: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const idx = activeRowIndex(t);
  const targetRowCenterY =
    idx >= 0 ? TABLE_TOP + idx * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2 - 60 : TABLE_TOP - 140;

  const handY = interpolate(frame, [0, 10], [targetRowCenterY + 40, targetRowCenterY], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const activeCaption = CAPTIONS.find((c) => t >= c.startSec && t <= c.endSec);
  const captionOpacity = activeCaption
    ? interpolate(
        t,
        [activeCaption.startSec, activeCaption.startSec + 0.15, activeCaption.endSec - 0.2, activeCaption.endSec],
        [0, 1, 1, 0],
        {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
      )
    : 0;

  return (
    <AbsoluteFill style={{background: "#F2EDE1", fontFamily: "'Work Sans', sans-serif"}}>
      <Audio src={staticFile("assets/reel1-fases/audio.m4a")} />

      {/* Card */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 50,
          right: 50,
          bottom: 70,
          background: "#FFFFFF",
          borderRadius: 28,
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          padding: "56px 48px",
        }}
      >
        {/* Title */}
        <div style={{display: "flex", alignItems: "center", gap: 24, marginBottom: 20}}>
          <div
            style={{
              background: "#FBD98A",
              borderRadius: 16,
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
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr 1.6fr 1.3fr",
            gap: 10,
            fontSize: 20,
            fontWeight: 700,
            color: "#6B6B6B",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 14,
          }}
        >
          <div>Fase</div>
          <div>Semana</div>
          <div>Qué sí puedes hacer</div>
          <div>Qué evitar</div>
        </div>

        {/* Table rows */}
        <div style={{position: "relative"}}>
          {ROWS.map((row, i) => {
            const isActive = i === idx;
            return (
              <div
                key={row.fase}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.3fr 1fr 1.6fr 1.3fr",
                  gap: 10,
                  alignItems: "center",
                  background: row.rowBg,
                  borderRadius: 14,
                  padding: "18px 16px",
                  marginBottom: ROW_GAP,
                  height: ROW_HEIGHT - 36,
                  border: isActive ? `3px solid ${ACCENT}` : "3px solid transparent",
                  transition: "border 0.2s",
                }}
              >
                <div style={{fontWeight: 700, fontSize: 22, color: INK}}>{row.fase}</div>
                <div style={{fontWeight: 700, fontSize: 24, color: ACCENT}}>{row.semana}</div>
                <div style={{fontSize: 19, color: INK, lineHeight: 1.25}}>{row.siPuedes}</div>
                <div style={{fontSize: 18, color: "#8A5A46", lineHeight: 1.25}}>{row.evitar}</div>
              </div>
            );
          })}

          <Hand x={620} y={handY} rotate={-18} />
        </div>

        {/* Bio */}
        <div style={{display: "flex", alignItems: "center", gap: 20, marginTop: 24}}>
          <svg width="70" height="70" viewBox="0 0 100 100">
            <circle cx="50" cy="38" r="22" fill="#D9A574" />
            <path d="M30 30 Q50 10 70 30 Q72 20 50 16 Q28 20 30 30 Z" fill="#2B2420" />
            <path d="M34 44 Q50 54 66 44 L66 50 Q50 58 34 50 Z" fill="#3A2A20" />
            <path d="M20 95 Q25 60 50 60 Q75 60 80 95 Z" fill={INK} />
            <rect x="44" y="58" width="12" height="14" fill="#D9A574" />
          </svg>
          <div>
            <div style={{fontWeight: 700, fontSize: 20, color: INK}}>David · Fisioterapeuta y osteópata</div>
            <div style={{fontSize: 16, color: "#6B6B6B"}}>Hernias L4-L5 y L5-S1 · @fisiodavidpueyo</div>
          </div>
        </div>
      </div>

      {/* Caption burst */}
      {activeCaption && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 90,
            display: "flex",
            justifyContent: "center",
            opacity: captionOpacity,
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
