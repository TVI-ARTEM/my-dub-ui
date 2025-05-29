import React, {useEffect} from "react";

export function useVideoSync(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    currentTime: number
) {
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        // Синхронизируем, только если расхождение >200 мс
        if (Math.abs(video.currentTime - currentTime) > 0.2) {
            video.currentTime = currentTime;
        }
    }, [videoRef, currentTime]);
}
