import {useMemo} from "react";
import type {Clip} from "@/types/types.ts";

export function useClipGaps(
    clips: Clip[],
    duration: number
): { start: number; end: number }[] {
    return useMemo(() => {
        // 1. Копируем и сортируем клипы по полю in (началу)
        const sorted = [...clips].sort((a, b) => a.in - b.in);

        const gaps: { start: number; end: number }[] = [];
        let prevEnd = 0;

        for (const c of sorted) {
            // Если между prevEnd и c.in есть промежуток — записываем его
            if (c.in > prevEnd) {
                gaps.push({start: prevEnd, end: c.in});
            }
            prevEnd = c.out;
        }

        // Если после последнего клипа остаётся свободное время
        if (prevEnd < duration) {
            gaps.push({start: prevEnd, end: duration});
        }

        return gaps;
    }, [clips, duration]);
}
