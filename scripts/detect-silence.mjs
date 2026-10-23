import { execSync, spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const INPUT = path.join(root, "public/assets/raw/test-clip.mov");
const OUTPUT = path.join(root, "public/assets/segments.json");

const NOISE_DB = "-30dB";
const MIN_SILENCE = 0.5; // seconds of silence before it counts as a cut
const PADDING = 0.12; // seconds kept before/after each speech segment
const FPS = 30;

const duration = parseFloat(
  execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${INPUT}"`,
  )
    .toString()
    .trim(),
);

const result = spawnSync(
  "ffmpeg",
  [
    "-i",
    INPUT,
    "-af",
    `silencedetect=noise=${NOISE_DB}:d=${MIN_SILENCE}`,
    "-f",
    "null",
    "-",
  ],
  { encoding: "utf-8" },
);

const log = result.stderr;
const silences = [];
let pendingStart = null;

for (const line of log.split("\n")) {
  const startMatch = line.match(/silence_start:\s*([\d.]+)/);
  const endMatch = line.match(/silence_end:\s*([\d.]+)/);
  if (startMatch) {
    pendingStart = parseFloat(startMatch[1]);
  } else if (endMatch && pendingStart !== null) {
    silences.push({ start: pendingStart, end: parseFloat(endMatch[1]) });
    pendingStart = null;
  }
}
if (pendingStart !== null) {
  silences.push({ start: pendingStart, end: duration });
}

// Speech segments = gaps between silences, padded, clamped to [0, duration]
const speech = [];
let cursor = 0;
for (const s of silences) {
  const segStart = cursor;
  const segEnd = Math.min(s.start + PADDING, duration);
  if (segEnd - segStart > 0.05) {
    speech.push({ start: Math.max(0, segStart - (speech.length ? 0 : 0)), end: segEnd });
  }
  cursor = Math.max(0, s.end - PADDING);
}
if (cursor < duration - 0.05) {
  speech.push({ start: cursor, end: duration });
}

// Merge segments that ended up overlapping/adjacent after padding
const merged = [];
for (const seg of speech) {
  const last = merged[merged.length - 1];
  if (last && seg.start <= last.end) {
    last.end = Math.max(last.end, seg.end);
  } else {
    merged.push({ ...seg });
  }
}

const segments = merged.map((seg) => ({
  startSeconds: Number(seg.start.toFixed(3)),
  endSeconds: Number(seg.end.toFixed(3)),
  startFrame: Math.round(seg.start * FPS),
  endFrame: Math.round(seg.end * FPS),
}));

const totalDurationInFrames = segments.reduce(
  (sum, s) => sum + (s.endFrame - s.startFrame),
  0,
);

const originalDurationInFrames = Math.round(duration * FPS);

writeFileSync(
  OUTPUT,
  JSON.stringify(
    {
      fps: FPS,
      originalDurationInFrames,
      totalDurationInFrames,
      removedFrames: originalDurationInFrames - totalDurationInFrames,
      segments,
    },
    null,
    2,
  ),
);

console.log(`Original: ${duration.toFixed(2)}s (${originalDurationInFrames}f)`);
console.log(
  `Edited:   ${(totalDurationInFrames / FPS).toFixed(2)}s (${totalDurationInFrames}f) across ${segments.length} segments`,
);
console.log(`Wrote ${OUTPUT}`);
