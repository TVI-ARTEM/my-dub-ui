import {useTimeRuler} from "@/hooks/timeline/ruler/useTimeRuler.ts";
import {TimeRulerMinorTick} from "@/components/pages/editor_page/components/timeline/ruler/TimeRulerMinorTick.tsx";
import {TimeRulerTick} from "@/components/pages/editor_page/components/timeline/ruler/TimeRulerTick.tsx";

interface Props {
    duration: number;      // длительность в секундах
    pxPerSec: number;      // пикселей в секунду
    offsetPx: number;      // смещение всего ruler в пикселях
    stepSec?: number;      // шаг между тиками в секундах
    onSeek?: (t: number) => void;
    minDurationSec?: number;
}

export default function TimeRuler({
                                      duration,
                                      pxPerSec,
                                      offsetPx,
                                      stepSec = 5,
                                      onSeek,
                                      minDurationSec
                                  }: Props) {
    const {ticks, minorTicks, totalWidth} = useTimeRuler(
        duration,
        pxPerSec,
        offsetPx,
        stepSec,
        minDurationSec
    );

    return (
        <div
            className="relative h-7 border-b border-muted-foreground/20 text-xs select-none"
            style={{width: totalWidth + offsetPx}}
        >
            {minorTicks.map((tick, idx) => (
                <TimeRulerMinorTick key={`minor-${idx}`} leftPx={tick.leftPx}/>
            ))}

            {ticks.map(({time, leftPx}) => (
                <TimeRulerTick
                    key={time}
                    time={time}
                    leftPx={leftPx}
                    onSeek={onSeek}
                />
            ))}
        </div>
    );
}
