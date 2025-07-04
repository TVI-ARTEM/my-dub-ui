import type {RefObject} from "react";
import {VoiceInfo} from "@/api/projects";

export interface Clip {
    id: string;
    src?: string;
    originalId?: string;
    in: number;
    out: number;
    trimStart?: number;
    transcript?: string;
    translation?: string;
    accentRu?: string;
    speaker?: number;
    externalRefId?: string;
    trueDub?: boolean;
}

export interface TimelineState {
    projectId: number;
    duration: number;
    playhead: number;
    textClips: Clip[];
    origClips: Clip[];
    voices: VoiceInfo[];
}

export interface Segment extends Clip {
    startTime: number;
    duration: number;
    audioElement: HTMLAudioElement;
}


export interface VideoPlayerHandle {
    play: () => void;
    pause: () => void;
    seek: (t: number) => void;
    getVideoElement: () => HTMLVideoElement | null;
}


interface BaseTrackRowProps {
    pxPerSec: number;
    totalPx: number;
    rowHeight?: number;
}

export interface AudioTrackRowProps extends BaseTrackRowProps {
    type: "audio";
    mediaElement: HTMLVideoElement | null;
    segmentsRef?: RefObject<Segment[]>;
}

export interface TextTrackRowProps extends BaseTrackRowProps {
    type: "text";
    clips: Clip[];
    onChangeClip?: (c: Clip) => void;
    selectedClipId?: string;
    onSelectClip?: (id: string) => void;
    segmentsRef?: RefObject<Segment[]>;
    onSwapClip?: (id: string, dir: "left" | "right") => void;
    addTextClipAt?: (start: number, defaultLength: number) => void
}

export type TrackRowProps = AudioTrackRowProps | TextTrackRowProps;

interface BaseTrackRowBoydProps {
    waveColor: string;
}

interface AudioTrackRowBodyProps extends BaseTrackRowBoydProps {
    type: "audio";
    totalPx: number;
    rowHeight: number;
    mediaElement?: HTMLVideoElement | null;
    segmentsRef?: RefObject<Segment[]>;
}

interface TextTrackRowBodyProps extends BaseTrackRowBoydProps {
    type: "text";
    clips: Clip[];
    pxPerSec: number;
    totalPx: number;
    rowHeight: number;
    selectedClipId?: string;
    onChangeClip?: (c: Clip) => void;
    onSelectClip?: (id: string) => void;
    segmentsRef?: RefObject<Segment[]>;
    onSwapClip?: (id: string, dir: "left" | "right") => void;
    addTextClipAt?: (start: number, defaultLength: number) => void
}


export type TrackRowBodyProps = AudioTrackRowBodyProps | TextTrackRowBodyProps;