import {forwardRef, useRef} from "react";
import type {VideoPlayerHandle} from "@/types/types.ts";
import {useVideoSync} from "@/hooks/useVideoSync.ts";
import {useVideoControl} from "@/hooks/useVideoControl.ts";

interface Props {
    src: string;
    currentTime: number;
    onTimeUpdate?: (t: number) => void;
    onDuration?: (d: number) => void;
    onPlay?: () => void;
    onPause?: () => void;
    onEnded?: () => void;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, Props>((props, ref) => {
    const {src, currentTime, onTimeUpdate, onDuration, onPlay, onPause, onEnded} = props;
    const videoRef = useRef<HTMLVideoElement>(null);

    useVideoSync(videoRef, currentTime);
    useVideoControl(ref, videoRef);

    return (
        <video
            ref={videoRef}
            src={src}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            onLoadedMetadata={(e) => onDuration?.((e.target as HTMLVideoElement).duration)}
            onTimeUpdate={(e) => onTimeUpdate?.((e.target as HTMLVideoElement).currentTime)}
            onPlay={() => onPlay?.()}
            onPause={() => onPause?.()}
            onEnded={() => onEnded?.()}

            // muted={true}
        />
    );
});

export default VideoPlayer;
