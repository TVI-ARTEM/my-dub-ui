import {fmtRuler} from "@/lib/time.ts";

interface Props {
    duration: number;      // сек
    pxPerSec: number;      // масштаб
    offset: number;        // сколько пикселей сместить весь ruler (обычно = padding дорожек)
    step?: number;         // подпись каждые n сек
    onSeek?: (t: number) => void;
}

export default function TimeRuler({
                                      duration,
                                      pxPerSec,
                                      offset,
                                      step = 5,
                                      onSeek,
                                  }: Props) {
    const ticks: number[] = [];
    for (let t = 0; t <= duration; t += step) ticks.push(t);

    const totalWidth = offset + duration * pxPerSec;

    return (
        <div
            className="relative h-7 border-b border-muted-foreground/20 text-xs select-none"
            style={{width: totalWidth}}
        >
            {ticks.map((t) => {
                // точная позиция в px (можно округлить до целых)
                const leftPx = offset + t * pxPerSec;

                return (
                    <div
                        key={t}
                        // контейнер без transform!
                        className="absolute top-0"
                        style={{left: leftPx}}
                    >
                        {/* вертикальная линия */}
                        <div className="h-2 w-px bg-muted-foreground/50"/>
                        {/* абсолютная подпись, центрируем относительно линии */}
                        <span
                            className="
                               absolute top-2 left-0 transform -translate-x-1/2 whitespace-nowrap
                               cursor-pointer
                               hover:text-blue-800   /* цвет при наведении */
                               transition-colors
                             "
                            onClick={(e) => {
                                e.stopPropagation();
                                onSeek?.(t);
                            }}
                        >
              {fmtRuler(t)}
            </span>
                    </div>
                );
            })}
        </div>
    );
}