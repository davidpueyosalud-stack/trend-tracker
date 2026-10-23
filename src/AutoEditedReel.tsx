import React from "react";
import { OffthreadVideo, Sequence, staticFile } from "remotion";

export type Segment = {
  startFrame: number;
  endFrame: number;
};

export const AutoEditedReel: React.FC<{
  segments: Segment[];
  src: string;
}> = ({ segments, src }) => {
  let cursor = 0;

  return (
    <>
      {segments.map((segment, i) => {
        const length = segment.endFrame - segment.startFrame;
        const from = cursor;
        cursor += length;

        return (
          <Sequence key={i} from={from} durationInFrames={length}>
            <OffthreadVideo
              src={staticFile(src)}
              startFrom={segment.startFrame}
              endAt={segment.endFrame}
            />
          </Sequence>
        );
      })}
    </>
  );
};
