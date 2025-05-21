import { useEffect, useRef, useState } from "react";
import { Clip } from "@/lib/types.ts";
import {MIN_CLIP_LENGTH, SNAP_STEP} from "@/lib/constants.ts";
import {round01} from "@/lib/time.ts";

interface Props {
    clip: Clip;
    clips: Clip[];           // все клипы дорожки
    pxPerSec: number;
    timelineDur: number;     // в секундах
    onChange: (c: Clip) => void;
      selected?: boolean;
      onSelect?: (id: string) => void;
}

type Mode = "none" | "move" | "resize-l" | "resize-r";

export default function ClipItem({
                                     clip,
                                     clips,
                                     pxPerSec,
                                     timelineDur,
                                     onChange,
                                     selected, onSelect
                                 }: Props) {
    const [mode, setMode] = useState<Mode>("none");
    const originX = useRef(0);
    const originClip = useRef<Clip>(clip);

    // Глобальный mousemove/mouseup
    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (mode === "none") return;
            const dx = e.clientX - originX.current;
            const rawDt = dx / pxPerSec;
            const dt = Math.round(rawDt / SNAP_STEP) * SNAP_STEP;

            // находим соседей по времени
            const sorted = [...clips].sort((a, b) => a.in - b.in);
            const idx = sorted.findIndex((c) => c.id === clip.id);
            const prev = sorted[idx - 1];
            const next = sorted[idx + 1];
            const minStart = prev ? prev.out : 0;
            const maxEnd = next ? next.in : timelineDur;

            let newIn = originClip.current.in;
            let newOut = originClip.current.out;

            if (mode === "move") {
                const span = originClip.current.out - originClip.current.in;
                newIn = Math.max(
                    minStart,
                    Math.min(originClip.current.in + dt, maxEnd - span)
                );
                newOut = newIn + span;
            } else if (mode === "resize-l") {
                newIn = Math.max(minStart, Math.min(originClip.current.in + dt, originClip.current.out - MIN_CLIP_LENGTH));
            } else if (mode === "resize-r") {
                newOut = Math.min(maxEnd, Math.max(originClip.current.out + dt, originClip.current.in + MIN_CLIP_LENGTH));
            }

            onChange({
                ...clip,
                in: round01(newIn),
                out: round01(newOut),
            });
        };

        const handleUp = () => setMode("none");

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };
    }, [mode, pxPerSec, clips, clip, onChange, timelineDur]);

    // абсолютные координаты
    const left = clip.in * pxPerSec;
    const width = (clip.out - clip.in) * pxPerSec;

    return (
        <div
            className={`
        absolute overflow-hidden h-full bg-primary/20 border border-primary/60 rounded-md
        flex items-center justify-center select-none group
        ${selected ? "ring-2 ring-offset-1 ring-primary" : ""}
      `}
            style={{ left, width, minWidth: pxPerSec * SNAP_STEP, }}
            onClick={(e) => {
                e.stopPropagation();
                onSelect?.(clip.id);
            }}
            onMouseDown={(e) => {
                e.stopPropagation();
                setMode("move");
                originX.current = e.clientX;
                originClip.current = clip;
            }}
        >
            {/* левый хватал */}
            <div
                className="absolute left-0 top-0 h-full w-2 opacity-0 group-hover:opacity-100
                   cursor-ew-resize"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    setMode("resize-l");
                    originX.current = e.clientX;
                    originClip.current = clip;
                }}
            />
            {/* правый хватал */}
            <div
                className="absolute right-0 top-0 h-full w-2 opacity-0 group-hover:opacity-100
                   cursor-ew-resize"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    setMode("resize-r");
                    originX.current = e.clientX;
                    originClip.current = clip;
                }}
            />

            <span className="block px-1 text-xs font-medium truncate whitespace-nowrap">{clip.id}</span>
        </div>
    );
}
