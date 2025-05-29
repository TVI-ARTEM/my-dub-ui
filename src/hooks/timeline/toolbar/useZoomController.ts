import {useCallback, useEffect, useState} from "react";

export interface ZoomController {
    /** индекс текущего зума в массиве options */
    index: number;
    zoomIn: () => void;
    zoomOut: () => void;
    /** callback для <Slider value={…} onValueChange={…} /> */
    onSliderChange: (vals: number[]) => void;
    /** можно ли увеличить / уменьшить масштаб */
    canZoomIn: boolean;
    canZoomOut: boolean;
}

export function useZoomController(
    /** Массив зум-коэффициентов, отсортированный по возрастанию */
    options: readonly number[],
    /** Текущее внешнее значение zoom */
    value: number,
    /** Отдать наружу новый zoom, когда он изменился внутри хука */
    onChange: (zoom: number) => void,
): ZoomController {
    /** индекс ближайшего к переданному value элемента */
    const nearestIndex = useCallback(
        (val: number) =>
            options.reduce(
                (best, cur, i) =>
                    Math.abs(cur - val) < Math.abs(options[best] - val) ? i : best,
                0,
            ),
        [options],
    );

    const [index, setIndex] = useState(() => nearestIndex(value));

    /* держим index в синхроне с внешним value */
    useEffect(() => {
        const next = nearestIndex(value);
        setIndex((prev) => (prev === next ? prev : next));
    }, [value, nearestIndex]);

    const clamp = useCallback(
        (i: number) => Math.min(Math.max(i, 0), options.length - 1),
        [options.length],
    );

    const setZoomByIndex = useCallback(
        (i: number) => {
            const clamped = clamp(i);
            setIndex(clamped);
            onChange(options[clamped]);
        },
        [clamp, options, onChange],
    );

    const zoomIn = useCallback(() => setZoomByIndex(index + 1), [index, setZoomByIndex]);
    const zoomOut = useCallback(() => setZoomByIndex(index - 1), [index, setZoomByIndex]);

    const onSliderChange = useCallback(
        ([sliderIdx]: number[]) => setZoomByIndex(sliderIdx),
        [setZoomByIndex],
    );

    return {
        index,
        zoomIn,
        zoomOut,
        onSliderChange,
        canZoomIn: index < options.length - 1,
        canZoomOut: index > 0,
    };
}
