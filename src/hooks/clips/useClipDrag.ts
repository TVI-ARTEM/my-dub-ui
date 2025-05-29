import React, {useCallback, useEffect, useRef, useState} from "react";
import {MIN_CLIP_LENGTH, TIMELINE_STEP} from "@/constants/constants.ts";
import type {Clip} from "@/types/types.ts";
import {round} from "@/utils/rnd.ts";

type Mode = "none" | "move" | "resize-l" | "resize-r";

interface UseClipDragOptions {
    clip: Clip;
    clips: Clip[];
    pxPerSec: number;
    timelineDur: number;
    fileDuration: number | null;
    onChange: (c: Clip) => void;
}

export function useClipDrag({
                                clip,
                                clips,
                                pxPerSec,
                                timelineDur,
                                fileDuration,
                                onChange,
                            }: UseClipDragOptions) {
    const [mode, setMode] = useState<Mode>("none");
    const originX = useRef(0);
    const originClip = useRef<Clip>(clip);

    const dragMovedRef = useRef(false);

    // Старт перетаскивания или ресайза
    const onStartMove = useCallback((e: React.MouseEvent) => {
            // сброс флага перед началом drag’а
            dragMovedRef.current = false;

            // при реальном движении мыши пометим, что был drag
            const markDragged = () => {
                dragMovedRef.current = true;
                window.removeEventListener("mousemove", markDragged);
            };
            window.addEventListener("mousemove", markDragged);

            // очистка слушателей после mouseup
            const cleanup = () => {
                window.removeEventListener("mousemove", markDragged);
                window.removeEventListener("mouseup", cleanup);
            };
            window.addEventListener("mouseup", cleanup);

            e.stopPropagation();
            setMode("move");
            originX.current = e.clientX;
            originClip.current = {...clip};
        },
        [clip]
    );

    const onStartResizeLeft = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            setMode("resize-l");
            originX.current = e.clientX;
            originClip.current = {...clip};
        },
        [clip]
    );

    const onStartResizeRight = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            setMode("resize-r");
            originX.current = e.clientX;
            originClip.current = {...clip};
        },
        [clip]
    );

    // Общий handler для mousemove
    const handleMove = useCallback(
        (e: MouseEvent) => {
            if (mode === "none") return;
            const dx = e.clientX - originX.current;
            const rawDt = dx / pxPerSec;
            const dt = Math.round(rawDt / TIMELINE_STEP) * TIMELINE_STEP;

            // находим соседние клипы, чтобы не выйти за границы
            const sorted = [...clips].sort((a, b) => a.in - b.in);
            const idx = sorted.findIndex((c) => c.id === clip.id);
            const prev = sorted[idx - 1];
            const next = sorted[idx + 1];
            const minStart = prev ? prev.out : 0;
            const maxEnd = next ? next.in : timelineDur;

            let newIn = originClip.current.in;
            let newOut = originClip.current.out;
            let newTrim = originClip.current.trimStart ?? 0;

            if (mode === "move") {
                const span = originClip.current.out - originClip.current.in;

                newIn = clamp(originClip.current.in + dt, minStart, maxEnd - span);
                newOut = newIn + span;
            } else if (mode === "resize-l") {
                // 1) не выходим за соседей
                const neighborLimit = minStart;

                // 2) сколько секунд осталось в самом файле после того, что уже «отрезано»
                const restOfFile = fileDuration != null
                    ? fileDuration - (originClip.current.trimStart ?? 0)
                    : Infinity;

                // 3) не выходим за конец файла
                const fileLimit = originClip.current.out - restOfFile;
                const lowerBound = Math.max(neighborLimit, fileLimit);

                const upperBound = originClip.current.out - MIN_CLIP_LENGTH;

                // новый in
                newIn = clamp(originClip.current.in + dt, lowerBound, upperBound);

                // теперь смещаем trimStart ровно на то же число секунд
                const delta = newIn - originClip.current.in;
                newTrim = clamp(
                    (originClip.current.trimStart ?? 0) + delta,
                    0,
                    fileDuration ?? Infinity
                );

                // right boundary stays
                newOut = originClip.current.out;

            } else if (mode === "resize-r") {
                const minBound = originClip.current.in + MIN_CLIP_LENGTH;
                const upperBound = Math.min(
                    maxEnd,
                    (fileDuration != null
                        ? originClip.current.in + fileDuration
                        : maxEnd)
                );

                newOut = clamp(originClip.current.out + dt, minBound, upperBound);
                newIn = originClip.current.in;
            }

            onChange({
                ...clip,
                in: round(newIn, 2),
                out: round(newOut, 2),
                trimStart: round(newTrim, 2),
            });
        },
        [
            mode,
            pxPerSec,
            clips,
            clip,
            timelineDur,
            fileDuration,
            onChange,
        ]
    );

    // Подписываемся на глобальные события
    useEffect(() => {
        const onUp = () => setMode("none");
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [handleMove]);

    return {
        onStartMove,
        onStartResizeLeft,
        onStartResizeRight,
        dragMovedRef,
    };
}

function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(v, max));
}