import { Play, Pause, Rewind, FastForward } from "lucide-react";
import {fmtTime} from "@/lib/time.ts";
import {Button} from "@/components/ui/button.tsx";

interface Props {
    playing: boolean;
    currentTime: number;
    duration: number;
    zoom: number;
    zoomOptions: readonly { label: string; value: number }[];
    onZoomChange: (z: number) => void;
    onPlayPause: () => void;
    onRewind: () => void;
    onForward: () => void;
}

export default function CustomControls({
                                           playing,
                                           currentTime,
                                           duration,
                                           zoom,
                                           zoomOptions,
                                           onZoomChange,
                                           onPlayPause,
                                           onRewind,
                                           onForward,
                                       }: Props) {
    return (
        <div className="flex items-center px-4 py-2">
            {/* 1) Селект масштаба */}
            {/* ==== 1. Панель масштабирования ==== */}
            <div className="flex justify-end items-center gap-2">
                <label className="text-sm font-medium">Масштаб:</label>
                <select
                    className="px-2 py-1 border rounded"
                    value={zoom}
                    onChange={(e) => onZoomChange(Number(e.target.value))}
                >
                    {zoomOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* 2) Центр: время + кнопки */}
            <div className="flex items-center gap-4 mx-auto">
                <span className="font-mono text-sm">{fmtTime(currentTime)}</span>
                <Button size="icon" variant="outline" onClick={onRewind} aria-label="Rewind 5s">
                    <Rewind className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="outline" onClick={onPlayPause} aria-label={playing ? "Pause" : "Play"}>
                    {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button size="icon" variant="outline" onClick={onForward} aria-label="Forward 5s">
                    <FastForward className="h-5 w-5" />
                </Button>
                <span className="font-mono text-sm">{fmtTime(duration)}</span>
            </div>

            {/* 3) Пустой правый блок, чтобы flex не съехал */}
            <div className="w-8" />
        </div>
    );
}
