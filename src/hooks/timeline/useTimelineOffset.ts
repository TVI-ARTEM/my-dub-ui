import React, {useLayoutEffect, useState} from "react";
import {LABEL_COL_WIDTH} from "@/constants/constants.ts";

export function useTimelineOffset(
    tracksRef: React.RefObject<HTMLElement | null>
): number {
    const [offsetPx, setOffsetPx] = useState(LABEL_COL_WIDTH);

    useLayoutEffect(() => {
        const el = tracksRef.current;

        if (!el) return;

        const paddingLeft = parseFloat(
            getComputedStyle(el).paddingLeft || "0"
        );

        setOffsetPx(paddingLeft + LABEL_COL_WIDTH);
    }, [tracksRef]);

    return offsetPx;
}
