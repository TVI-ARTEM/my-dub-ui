import {useWaveSurfer} from "@/hooks/useWaveSurfer";
import React, {useRef} from "react";

export interface AudioWaveformProps {
    mediaElement?: HTMLMediaElement | null;
    src?: string;
    clipIn?: number;
    clipOut?: number;
    trimStart?: number
    waveColor: string;
    volume?: number;
}

const AudioWaveform: React.FC<AudioWaveformProps> = (props: AudioWaveformProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useWaveSurfer({ containerRef, ...props });

    return (
        <div className="h-full w-full flex items-center overflow-hidden select-none">
            <div
                ref={containerRef}
                className="w-full h-[30px]"
            />
        </div>
    );
};

export default AudioWaveform;
