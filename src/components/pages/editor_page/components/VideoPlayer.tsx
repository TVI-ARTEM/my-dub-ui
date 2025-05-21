import {
    forwardRef,
    useImperativeHandle,
    useRef,
    useEffect,
} from "react";

export interface VideoPlayerHandle {
    play: () => void;
    pause: () => void;
    seek: (t: number) => void;
    getVideoElement: () => HTMLVideoElement | null;
}

interface Props {
    src: string;
    currentTime: number;
    onTimeUpdate?: (t: number) => void;
    onDuration?: (d: number) => void;
    onPlay?: () => void;
    onPause?: () => void;
    onEnded?: () => void
}

const VideoPlayer = forwardRef<VideoPlayerHandle, Props>(
    ({src, currentTime, onTimeUpdate, onDuration, onPlay, onPause, onEnded}, ref) => {
        const videoRef = useRef<HTMLVideoElement>(null);

        // Синхронизация внешнего currentTime ⇄ internal <video>
        useEffect(() => {
            const video = videoRef.current;
            if (!video) return;
            if (Math.abs(video.currentTime - currentTime) > 0.2) {
                video.currentTime = currentTime;
            }
        }, [currentTime]);

        // Экспонируем методы play/pause/seek
        useImperativeHandle(
            ref,
            () => ({
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
            []
        );

        return (
            <video
                ref={videoRef}
                src={src}
                className="max-w-full max-h-full w-auto h-auto object-contain"
                // убираем native controls, т.к. будем управлять снаружи
                // controls
                onLoadedMetadata={(e) =>
                    onDuration?.((e.target as HTMLVideoElement).duration)
                }
                onTimeUpdate={(e) =>
                    onTimeUpdate?.((e.target as HTMLVideoElement).currentTime)
                }
                onPlay={() => onPlay?.()}
                onPause={() => onPause?.()}
                onEnded={() => onEnded?.()}
            />
        );
    }
);

export default VideoPlayer;
