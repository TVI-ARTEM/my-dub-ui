import { useMemo } from "react";

const STATIC_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export interface ZoomOption {
    /** коэффициент масштабирования (1 = 100%) */
    value: number;
    /** подпись для UI, например "150%" */
    label: string;
}

/**
 * Возвращает предопределённые значения масштабов для таймлайна.
 */
export function useZoomOptions(): readonly ZoomOption[] {
    return useMemo(() => {
        const fmt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

        return STATIC_STEPS.map((v) => ({
            value: v,
            label: `${fmt.format(v * 100)}%`,
        }));
    }, []);
}
