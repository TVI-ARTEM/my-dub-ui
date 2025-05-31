import AudioWaveform from "../../AudioWaveform.tsx";
import ClipItem from "../../clips/ClipItem.tsx";
import type {TrackRowBodyProps} from "@/types/types.ts";


export function TrackRowBody(props: TrackRowBodyProps) {
    const {totalPx, rowHeight} = props;

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
        >
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
