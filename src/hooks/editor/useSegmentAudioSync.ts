import {type RefObject, useEffect} from "react";
import type {Segment} from "@/types/types";
import {TIMELINE_STEP} from "@/constants/constants";


export function useSegmentAudioSync(
    videoEl: HTMLVideoElement | null,
    segmentsRef: RefObject<Segment[]>
) {
    useEffect(() => {
        if (!videoEl) return;

        const syncSegments = () => {
            const t = videoEl.currentTime;
            const rate = videoEl.playbackRate;

            segmentsRef.current.forEach(({startTime, duration, trimStart, audioElement}) => {
                const end = startTime + duration;
                const relT = t - startTime + (trimStart ?? 0);

                if (t >= startTime && t <= end) {
                    if (audioElement.playbackRate !== rate) {
                        audioElement.playbackRate = rate;
                    }

                    if (videoEl.paused) {
                        if (!audioElement.paused) audioElement.pause();
                    } else {
                        if (Math.abs(audioElement.currentTime - relT) > TIMELINE_STEP) {
                            audioElement.currentTime = relT;
                        }

                        if (audioElement.paused) {
                            audioElement.play().catch(() => {
                            });
                        }
                    }

                } else {
                    if (!audioElement.paused) audioElement.pause();
                }
            });
        };

        const events = [
            "timeupdate",
            "seeked",
            "ratechange",
            "play",
            "pause",
            "ended",
        ] as const;

        events.forEach((ev) => videoEl.addEventListener(ev, syncSegments));

        return () => {
            events.forEach((ev) => videoEl.removeEventListener(ev, syncSegments));
        };

    }, [videoEl, segmentsRef]);
}
