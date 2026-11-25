import React from "react";
import { Composition, staticFile } from "remotion";
import { AutoEditedReel, Segment } from "./AutoEditedReel";
import { FasesReel, FASES_REEL_DURATION_IN_FRAMES, FASES_REEL_FPS } from "./FasesReel";

type SegmentsFile = {
  fps: number;
  totalDurationInFrames: number;
  segments: Segment[];
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Composition
      id="FasesReel"
      component={FasesReel}
      durationInFrames={FASES_REEL_DURATION_IN_FRAMES}
      fps={FASES_REEL_FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="AutoEditedReel"
      component={AutoEditedReel}
      durationInFrames={30}
      fps={30}
      width={360}
      height={640}
      defaultProps={{
        segments: [] as Segment[],
        src: "assets/raw/test-clip.mov",
      }}
      calculateMetadata={async () => {
        const res = await fetch(staticFile("assets/segments.json"));
        const data: SegmentsFile = await res.json();

        return {
          durationInFrames: data.totalDurationInFrames,
          fps: data.fps,
          props: {
            segments: data.segments,
            src: "assets/raw/test-clip.mov",
          },
        };
      }}
    />
    </>
  );
};
