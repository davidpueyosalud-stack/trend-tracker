import React from "react";
import { Composition, staticFile } from "remotion";
import { AutoEditedReel, Segment } from "./AutoEditedReel";

type SegmentsFile = {
  fps: number;
  totalDurationInFrames: number;
  segments: Segment[];
};

export const RemotionRoot: React.FC = () => {
  return (
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
  );
};
