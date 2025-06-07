import type {RefObject} from "react";
import type {Clip, Segment} from "@/types/types.ts";
import {TIMELINE_STEP} from "@/constants/constants.ts";
import {useClipDrag} from "@/hooks/clips/useClipDrag.ts";
import {ChevronLeft, ChevronRight} from "lucide-react";
import AudioWaveform from "@/components/pages/editor_page/components/AudioWaveform.tsx";
import {useClipSegments} from "@/hooks/clips/useClipSegments.ts";

interface Props {
    clip: Clip;
    clips: Clip[];
    pxPerSec: number;
    timelineDur: number;
    onChange: (c: Clip) => void;
    selected?: boolean;
    onSelect?: (id: string) => void;
    segmentsRef?: RefObject<Segment[]>;
    waveColor: string;
    index?: number;
    length?: number;
    onSwap?: (id: string, dir: "left" | "right") => void;
}

export default function ClipItem({
                                     clip,
                                     clips,
                                     pxPerSec,
                                     timelineDur,
                                     onChange,
                                     selected,
                                     onSelect,
                                     segmentsRef,
                                     waveColor,
                                     onSwap,
                                     index,
                                     length,
                                 }: Props) {
    let fileDuration = useClipSegments(clip, segmentsRef);
    fileDuration = null;

    const {onStartMove, onStartResizeLeft, onStartResizeRight, dragMovedRef} =
        useClipDrag({
            clip,
            clips,
            pxPerSec,
            timelineDur,
            fileDuration,
            onChange,
        });

    const leftPx = clip.in * pxPerSec;
    const widthPx = (clip.out - clip.in) * pxPerSec;
    const minWidthPx = pxPerSec * TIMELINE_STEP;

    const idx = index ?? clips.findIndex((c) => c.id === clip.id);
    const len = length ?? clips.length;
    const hasLeft = idx > 0;
    const hasRight = idx < len - 1;

    const showControls = widthPx > minWidthPx + 80;

    return (
        <div
            className={`absolute h-full bg-[#6AC66C80] rounded-md flex items-center justify-center select-none group
                        ${selected ? "border border-[#3b82f6]" : "border border-transparent"} hover:border-[#3b82f6]`}
            style={{
                left: leftPx,
                width: widthPx,
                minWidth: minWidthPx,
            }}
            onClick={(e) => {
                e.stopPropagation();
                onSelect?.(clip.id);
            }}
            onMouseDown={onStartMove}
        >

            <div
                className="absolute left-0 top-0 h-full w-2 cursor-ew-resize z-30"
                onMouseDown={onStartResizeLeft}
            />
            <div
                className="absolute right-0 top-0 h-full w-2 cursor-ew-resize z-30"
                onMouseDown={onStartResizeRight}
            />

            {hasLeft && showControls && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!dragMovedRef.current) onSwap?.(clip.id, "left");
                    }}
                    className={`absolute left-0 top-0 h-full w-8 z-20
                      flex items-center justify-center
                      bg-blue-400 border-r border-[#3b82f6] rounded-l-md
                      transition-opacity
                      ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                    `}
                >
                    <ChevronLeft className="text-white"/>
                </button>
            )}

            {hasRight && showControls && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!dragMovedRef.current) onSwap?.(clip.id, "right");
                    }}
                    className={`
                      absolute right-0 top-0 h-full w-8 z-20
                      flex items-center justify-center
                      bg-blue-400 border-l border-[#3b82f6] rounded-r-md
                      transition-opacity
                      ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                    `}
                >
                    <ChevronRight className="text-white"/>
                </button>
            )}

            <div className="absolute inset-0 pointer-events-none z-10">
                <AudioWaveform
                    src={clip.src}
                    clipIn={clip.in}
                    clipOut={clip.out}
                    trimStart={clip.trimStart}
                    waveColor={waveColor}
                />
            </div>

            <span className="z-10 px-1 truncate whitespace-no-wrap audio-segment_label">
                {clip.transcript}
            </span>
        </div>
    );
}
