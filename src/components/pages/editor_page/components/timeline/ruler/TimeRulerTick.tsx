import {toRulerTimeString} from "@/utils/time.ts";

interface TimeRulerTickProps {
    time: number;
    leftPx: number;
    onSeek?: (t: number) => void;
}

export function TimeRulerTick({ time, leftPx, onSeek }: TimeRulerTickProps) {
    return (
        <div className="absolute top-0" style={{ left: leftPx }}>

            {/* Вертикальная линия */}
            <div className="h-2 w-px bg-muted-foreground/50" />

            {/* Центрированная подпись */}
            <span
                className="absolute top-2 left-0 transform
                    -translate-x-1/2 whitespace-nowrap
                    cursor-pointer hover:text-blue-800
                    transition-colors"

                onClick={(e) => {
                    e.stopPropagation();
                    onSeek?.(time);
                }}
            >
                {toRulerTimeString(time)}
            </span>
        </div>
    );
}
