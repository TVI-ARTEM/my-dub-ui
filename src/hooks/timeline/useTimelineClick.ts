import React, {useCallback} from "react";

export function useTimelineClick(
    sectionRef: React.RefObject<HTMLElement | null>,
    pxPerSec: number,
    offsetPx: number,
    timelinePx: number,
    onSeek?: (t: number) => void
) {
    return useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const sec = sectionRef.current;

            if (!sec) return;

            const {left} = sec.getBoundingClientRect();

            // учёт скролла и отступа
            const xInTimeline = e.clientX - left + sec.scrollLeft - offsetPx;

            if (xInTimeline < 0 || xInTimeline > timelinePx) return;

            onSeek?.(xInTimeline / pxPerSec);
        },
        [sectionRef, pxPerSec, offsetPx, timelinePx, onSeek]
    );
}
