import React, {useImperativeHandle} from "react";
import type {VideoPlayerHandle} from "@/types/types.ts";

export function useVideoControl(
    ref: React.Ref<VideoPlayerHandle>,
    videoRef: React.RefObject<HTMLVideoElement | null>
) {
    useImperativeHandle(
        ref,
        (): VideoPlayerHandle => ({
            play: () => {
                const p = videoRef.current?.play();
                if (p) p.catch((err) => {
                    if (err.name !== "AbortError") console.error(err);
                });
            },
            pause: () => {
                videoRef.current?.pause();
            },
            seek: (t: number) => {
                if (videoRef.current) videoRef.current.currentTime = t;
            },
            getVideoElement: () => videoRef.current ?? null,
        }),
        [videoRef]
    );
}
