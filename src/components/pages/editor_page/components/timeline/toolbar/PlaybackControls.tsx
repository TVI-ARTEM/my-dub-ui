import {Button} from "@/components/ui/button.tsx";
import {FastForward, Pause, Play, Rewind} from "lucide-react";
import {toClipInfoTimeString} from "@/utils/time.ts";

interface PlaybackControlsProps {
    playing: boolean;
    currentTime: number;
    duration: number;
    onPlayPause: () => void;
    onRewind: () => void;
    onForward: () => void;
}

export function PlaybackControls({
                                     playing,
                                     currentTime,
                                     duration,
                                     onPlayPause,
                                     onRewind,
                                     onForward,
                                 }: PlaybackControlsProps) {
    return (
        <div className="flex items-center gap-4">
            <span className="font-mono text-sm">{toClipInfoTimeString(currentTime)}</span>

            <Button
                size="icon"
                variant="outline"
                onClick={onRewind}
                aria-label="Rewind 5s"
            >
                <Rewind className="h-5 w-5"/>
            </Button>

            <Button
                size="icon"
                variant="outline"
                onClick={onPlayPause}
                aria-label={playing ? "Pause" : "Play"}
            >
                {playing ? <Pause className="h-5 w-5"/> : <Play className="h-5 w-5"/>}
            </Button>

            <Button
                size="icon"
                variant="outline"
                onClick={onForward}
                aria-label="Forward 5s"
            >
                <FastForward className="h-5 w-5"/>
            </Button>

            <span className="font-mono text-sm">{toClipInfoTimeString(duration)}</span>
        </div>
    );
}
