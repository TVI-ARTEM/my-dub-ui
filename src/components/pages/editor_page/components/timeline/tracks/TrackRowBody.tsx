import ClipItem from "../../clips/ClipItem.tsx";
import {useClipGaps} from "@/hooks/clips/useClipGaps.ts";
import type {TrackRowBodyProps} from "@/types/types.ts";
import {MIN_CLIP_LENGTH} from "@/constants/constants.ts";
import {useState} from "react";
import AudioWaveform from "../../AudioWaveform.tsx";


export function TrackRowBody(props: TrackRowBodyProps) {
    const {totalPx, rowHeight} = props;

    const [hover, setHover] = useState(false);

    const timelineDur = props.type === "text" ? totalPx / props.pxPerSec : 0;
    const clips = props.type === "text" ? props.clips : [];

    const gaps = useClipGaps(clips, timelineDur);

    if (props.type === "audio") {
        return (
            <div
                className="relative"
                style={{width: totalPx, height: rowHeight}}
            >
                <div
                    className="absolute h-full bg-[#0085D980] rounded-md"
                    style={{left: 0, width: totalPx}}
                >
                    <AudioWaveform
                        mediaElement={props.mediaElement}
                        waveColor={props.waveColor}
                        volume={0.1}
                    />
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative"
            style={{width: totalPx, height: rowHeight}}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {/* gap-placeholder’ы рендерим ТОЛЬКО при hover === true */}
            {hover &&
                gaps.map((g) => {
                    const gapLen = g.end - g.start;
                    if (gapLen < MIN_CLIP_LENGTH) return null;

                    const leftPx = g.start * props.pxPerSec;
                    const widthPx = gapLen * props.pxPerSec;

                    return (
                        <button
                            key={`gap-${g.start}`}
                            style={{left: leftPx, width: widthPx}}
                            className="absolute top-0 h-full bg-blue-200/40
                         border-2 border-dashed border-blue-400 rounded-md
                         hover:bg-blue-300/60"
                            onClick={() => props.addTextClipAt?.(g.start, gapLen)}
                        />
                    );
                })}

            {props.clips.map((c, idx) => (
                <ClipItem
                    key={`${c.id}-${idx}`}
                    clip={c}
                    clips={props.clips}
                    pxPerSec={props.pxPerSec}
                    timelineDur={totalPx / props.pxPerSec}
                    onChange={props.onChangeClip!}
                    selected={c.id === props.selectedClipId}
                    onSelect={props.onSelectClip}
                    segmentsRef={props.segmentsRef}
                    waveColor={props.waveColor}
                    onSwap={props.onSwapClip}
                    index={idx}
                    length={props.clips.length}
                />
            ))}
        </div>
    );
}
