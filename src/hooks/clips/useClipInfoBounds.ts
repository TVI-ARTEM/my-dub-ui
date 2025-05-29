import {useMemo} from "react";
import type {Clip} from "@/types/types.ts";
import {MIN_CLIP_LENGTH} from "@/constants/constants.ts";

export interface ClipInfoBounds {
    minIn: number;
    maxIn: number;
    minOut: number;
    maxOut: number;
}

export function useClipInfoBounds(
    clip: Clip | undefined,
    minStart: number,
    maxEnd: number,
    fileDuration?: number | null
): ClipInfoBounds {
    return useMemo(() => {
        if (!clip) {
            return {minIn: 0, maxIn: 0, minOut: 0, maxOut: 0};
        }

        const maxIn = clip.out - MIN_CLIP_LENGTH;

        const fileLimitIn = fileDuration != null
            ? clip.out - fileDuration
            : minStart;

        const minIn = Math.max(minStart, fileLimitIn);

        const minOut = clip.in + MIN_CLIP_LENGTH;

        const fileLimitOut = fileDuration != null
            ? clip.in + fileDuration
            : maxEnd;

        const maxOut = Math.min(maxEnd, fileLimitOut);

        return {minIn, maxIn, minOut, maxOut};
    }, [clip, minStart, maxEnd, fileDuration]);
}
