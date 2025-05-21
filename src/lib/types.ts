export interface Clip {
    id: string;
    src: string;     // blob|url
    in: number;      // секунды
    out: number;
    transcript?: string;
    translation?: string;
}

export interface TimelineState {
    duration: number;   // вся композиция, сек
    playhead: number;   // текущее время, сек
    audioClips: Clip[];
    textClips: Clip[];  // субтитры/оверлеи
}
