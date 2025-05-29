import {type RefObject, useCallback, useState} from "react";
import type {VideoPlayerHandle} from "@/types/types";

export function usePlaybackControls(
    playerRef: RefObject<VideoPlayerHandle | null>,
    seek: (t: number) => void,
    duration: number,
    currentTime: number
) {
    const [playing, setPlaying] = useState(false);

    const playPause = useCallback(() => {
        const p = playerRef.current;

        if (!p) return;

        if (playing) p.pause();
        else p.play();

    }, [playing, playerRef]);

    const rewind = useCallback(() => {
        const t = Math.max(0, currentTime - 5);

        seek(t);

        playerRef.current?.seek(t);

    }, [currentTime, seek, playerRef]);

    const forward = useCallback(() => {
        const t = Math.min(duration, currentTime + 5);

        seek(t);

        playerRef.current?.seek(t);

    }, [currentTime, duration, seek, playerRef]);

    return {
        playing,
        setPlaying,
        playPause,
        rewind,
        forward,
    };
}
