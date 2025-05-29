import React, {useEffect, useState} from "react";
import type {Clip, Segment} from "@/types/types.ts";

export function useClipSegments(
    clip: Clip,
    segmentsRef?: React.RefObject<Segment[]>
): number | null {
    const [fileDuration, setFileDuration] = useState<number | null>(null);

    useEffect(() => {
        if (!segmentsRef || !clip.src) return;

        let mounted = true;

        const audio = new Audio(clip.src);
        audio.preload = "metadata";

        const onLoaded = () => {
            if (!mounted) return;

            if (isFinite(audio.duration)) {
                setFileDuration(audio.duration);
            }

            const list = segmentsRef.current!;

            let seg = list.find((s) => s.id === clip.id);

            if (!seg) {
                seg = {
                    ...clip,
                    startTime: clip.in,
                    duration: clip.out - clip.in,
                    trimStart: clip.trimStart ?? 0,
                    audioElement: audio,
                };

                list.push(seg);
            }
        };

        audio.addEventListener("loadedmetadata", onLoaded);
        audio.load();

        return () => {
            mounted = false;
            audio.pause();
            if (segmentsRef.current) {
                segmentsRef.current = segmentsRef.current.filter(
                    (s) => s.id !== clip.id
                );
            }
        };
    }, [segmentsRef, clip.src, clip.id]);


    useEffect(() => {
        if (!segmentsRef?.current) return;

        const seg = segmentsRef.current.find((s) => s.id === clip.id);

        if (seg) {
            seg.startTime = clip.in;
            seg.duration = clip.out - clip.in;
            seg.trimStart = clip.trimStart ?? 0;
        }
    }, [clip.in, clip.out, clip.id, clip.trimStart]);

    return fileDuration;
}
