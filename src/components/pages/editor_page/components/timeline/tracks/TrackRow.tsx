import type {TrackRowProps} from "@/types/types.ts";
import {TrackRowBody} from "./TrackRowBody.tsx";

export default function TrackRow(props: TrackRowProps) {
    const {
        pxPerSec,
        totalPx,
        rowHeight = props.type === "audio" ? 40 : 48,
    } = props;

    const rowBody =
        props.type === "audio" ? (
            <TrackRowBody
                type="audio"
                totalPx={totalPx}
                mediaElement={props.mediaElement}
                segmentsRef={props.segmentsRef}
                rowHeight={rowHeight}
                waveColor="#0085D9"
            />
        ) : (
            <TrackRowBody
                type="text"
                clips={props.clips}
                pxPerSec={pxPerSec}
                totalPx={totalPx}
                selectedClipId={props.selectedClipId}
                onChangeClip={props.onChangeClip}
                onSelectClip={props.onSelectClip}
                segmentsRef={props.segmentsRef}
                rowHeight={rowHeight}
                waveColor="#4A7C59"
                onSwapClip={props.onSwapClip}
            />
        );

    return (
        <div className="relative bg-muted w-full select-none">
            {rowBody}
        </div>
    );
}
