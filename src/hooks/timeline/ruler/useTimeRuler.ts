import {useMemo} from "react";

interface Tick {
    time: number;
    leftPx: number;
}

interface MinorTick {
    time: number;
    leftPx: number;
}


export function useTimeRuler(
    duration: number,
    pxPerSec: number,
    offsetPx: number,
    stepSec: number,
    minDurationSec: number = duration
) {
    return useMemo(() => {
        const fullDur = Math.max(duration, minDurationSec);
        const ticks: Tick[] = [];

        // Если шаг не указан явно (например, 0), подбираем автоматически
        const pickStep = () => {
            if (stepSec) return stepSec; // если есть — используем его

            const targetPx = 100; // хотим ~100 px между major-тиками
            const secsPerTick = targetPx / pxPerSec;

            const candidates = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
            return candidates.find((v) => v >= secsPerTick) ?? 600;
        };

        const majorStep = pickStep();

        for (let t = 0; t <= fullDur; t += majorStep) {
            ticks.push({
                time: t,
                leftPx: offsetPx + t * pxPerSec
            });
        }

        // ——— Генерация минорных тиков между основными
        const minorTicks: MinorTick[] = [];
        // разбиваем каждый major шаг на секунды (например, 5 → 5 делений по 1 с)
        const subdivisions = Math.floor(majorStep);

        if (subdivisions > 1) {
            const minorStep = majorStep / subdivisions;

            for (let t = 0; t <= fullDur; t += majorStep) {
                for (let i = 1; i < subdivisions; i++) {
                    const timeMinor = t + i * minorStep;

                    if (timeMinor <= fullDur) {
                        minorTicks.push({
                            time: timeMinor,
                            leftPx: offsetPx + timeMinor * pxPerSec,
                        });
                    }
                }
            }
        }

        const totalWidth = offsetPx + fullDur * pxPerSec;
        return {ticks, minorTicks, totalWidth};
    }, [duration, pxPerSec, offsetPx, stepSec, minDurationSec]);
}