import type {RefObject} from "react";
import {useRef} from "react";
import type {Clip, Segment, TimelineState} from "@/types/types.ts";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area.tsx";
import Playhead from "./ruler/Playhead.tsx";
import TimeRuler from "./ruler/TimeRuler.tsx";
import {useTimelineClick} from "@/hooks/timeline/useTimelineClick.ts";
import {useTimelineOffset} from "@/hooks/timeline/useTimelineOffset.ts";
import {round} from "@/utils/rnd.ts";
import {TIMELINE_STEP} from "@/constants/constants.ts";
import TrackRow from "@/components/pages/editor_page/components/timeline/tracks/TrackRow.tsx";

interface Props {
    state: TimelineState;
    pxPerSec: number;
    onSeek?: (t: number) => void;
    onChangeTextClip?: (c: Clip) => void;
    selectedTextClipId?: string;
    onSelectTextClip?: (id: string) => void;
    mediaElement?: HTMLVideoElement | null;
    segmentsRef: RefObject<Segment[]>;
    minDurationSec?: number;
    onSwapClip?: (id: string, dir: "left" | "right") => void;
}

export default function Timeline({
                                     state,
                                     pxPerSec,
                                     onSeek,
                                     onChangeTextClip,
                                     selectedTextClipId,
                                     onSelectTextClip,
                                     mediaElement,
                                     segmentsRef,
                                     minDurationSec,
                                     onSwapClip
                                 }: Props) {
    const { duration, playhead } = state;

    console.log(duration, pxPerSec)
    const timelinePx = duration * pxPerSec;

    const sectionRef = useRef<HTMLDivElement>(null);
    const tracksRef = useRef<HTMLDivElement>(null);

    const offsetPx = useTimelineOffset(tracksRef);

    const handleClick = useTimelineClick(
        sectionRef,
        pxPerSec,
        offsetPx,
        timelinePx,
        onSeek
    );

    return (
        <ScrollArea
            type="auto"
            className="w-full whitespace-nowrap rounded-md border"
        >
            <section
                ref={sectionRef}
                className="relative w-full min-w-0 pb-3"
                onClick={handleClick}
            >
                {/* линейка времени */}
                <TimeRuler
                    duration={duration}
                    pxPerSec={pxPerSec}
                    offsetPx={offsetPx}
                    onSeek={onSeek}
                    minDurationSec={minDurationSec}
                />

                {/* дорожки */}
                <div
                    ref={tracksRef}
                    className="grid gap-y-2 pl-10 pr-10 py-2 auto-rows-min"
                    style={{ minWidth: timelinePx }}
                >
                    <TrackRow
                        pxPerSec={pxPerSec}
                        totalPx={timelinePx}
                        type="audio"
                        mediaElement={mediaElement!}
                    />

                    <TrackRow
                        clips={state.textClips}
                        pxPerSec={pxPerSec}
                        totalPx={timelinePx}
                        type="text"
                        onChangeClip={onChangeTextClip}
                        selectedClipId={selectedTextClipId}
                        onSelectClip={onSelectTextClip}
                        segmentsRef={segmentsRef}
                        onSwapClip={onSwapClip}
                    />
                </div>

                {/* play-head */}
                <Playhead
                    position={playhead * pxPerSec}
                    offset={offsetPx}
                    maxPosition={timelinePx}
                    height={120}
                    onSeek={(px) => {
                        const t = px / pxPerSec;
                        const snapped = Math.round(t / TIMELINE_STEP) * TIMELINE_STEP;
                        onSeek?.(round(snapped, 2));
                    }}
                />
            </section>

            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}
