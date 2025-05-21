import {useLayoutEffect, useRef, useState} from "react";
import TimeRuler from "./TimeRuler.tsx";
import TrackRow from "./TrackRow.tsx";
import Playhead from "./Playhead.tsx";
import {Clip, TimelineState} from "@/lib/types.ts";
import {LABEL_COL_WIDTH, SNAP_STEP} from "@/lib/constants.ts";
import {round01} from "@/lib/time.ts";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area.tsx";

interface Props {
    state: TimelineState;
    pxPerSec: number;
    onSeek: (t: number) => void;
    onChangeTextClip: (c: Clip) => void;
    onAddTextClip: () => void;
    onRemoveTextClip: () => void;
    selectedTextClipId: string | null;
    onSelectTextClip: (id: string) => void;
}


export default function Timeline({
                                     state,
                                     pxPerSec,
                                     onSeek,
                                     onChangeTextClip,
                                     onAddTextClip,
                                     onRemoveTextClip,
                                     selectedTextClipId,
                                     onSelectTextClip,
                                 }: Props) {
    const {duration} = state;
    const timelinePx = duration * pxPerSec;

    const sectionRef = useRef<HTMLDivElement>(null);
    const tracksRef = useRef<HTMLDivElement>(null);
    const [padLeft, setPadLeft] = useState(0); // вычисляемый offset
    const offset = padLeft + LABEL_COL_WIDTH;

    /* вычисляем реальный padding-left дорожек один раз после монтирования */
    useLayoutEffect(() => {
        if (sectionRef.current && tracksRef.current) {
            const pl = parseFloat(
                window.getComputedStyle(tracksRef.current).paddingLeft || "0"
            );
            setPadLeft(pl);
        }
    }, []);

    /* клик в дорожках → прыжок play-head (учитываем scroll + padding) */
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!sectionRef.current) return;
        const {left} = sectionRef.current.getBoundingClientRect();
        const xInTimeline =
            e.clientX - left + sectionRef.current.scrollLeft - offset;

        if (xInTimeline < 0 || xInTimeline > timelinePx) return;
        onSeek?.(xInTimeline / pxPerSec);
    };

    return (
        <ScrollArea type="always" className="w-full whitespace-nowrap rounded-md border">
            <section
                ref={sectionRef}
                className="relative w-full min-w-0 bg-muted"
                onClick={handleClick}
            >
                {/* линейка времени */}
                <TimeRuler
                    duration={duration}
                    pxPerSec={pxPerSec}
                    offset={offset}
                    onSeek={onSeek}
                />

                {/* дорожки */}
                <div
                    ref={tracksRef}
                    className="grid gap-y-2 pl-10 pr-4 py-2 border-b border-muted-foreground/10 auto-rows-min"
                    style={{width: timelinePx + offset}}
                >
                    <TrackRow
                        label="Аудио"
                        clips={state.audioClips}
                        pxPerSec={pxPerSec}
                        totalPx={timelinePx}
                        type="audio"
                    />
                    <TrackRow
                        label="Треки"
                        clips={state.textClips}
                        pxPerSec={pxPerSec}
                        totalPx={timelinePx}
                        type="text"
                        canAdd
                        onChangeClip={onChangeTextClip}
                        onAddClip={onAddTextClip}
                        onRemoveClip={onRemoveTextClip}
                        selectedClipId={selectedTextClipId}
                        onSelectClip={onSelectTextClip}
                    />
                </div>

                {/* play-head */}
                <Playhead
                    x={state.playhead * pxPerSec}
                    offset={offset}
                    maxX={timelinePx}
                    height={120}
                    onSeek={(x) => {
                        const t = x / pxPerSec;
                        // квантование seek-времени
                        const snapped = Math.round(t / SNAP_STEP) * SNAP_STEP;
                        onSeek?.(round01(snapped));
                    }}
                />
            </section>
            <ScrollBar orientation="horizontal"/>
        </ScrollArea>
    );
}
