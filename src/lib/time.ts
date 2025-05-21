import { formatInTimeZone } from "date-fns-tz";
import { parse } from "date-fns";

/** Квантует к сотым (0.01 с) */
export const round01 = (t: number): number =>
    Math.round(t * 100) / 100;

/** mm:ss.SS (сотые секунды), в UTC */
export const fmtTime = (t: number): string =>
    formatInTimeZone(t * 1000, "UTC", "mm:ss.SS");

/** mm:ss (линейка), в UTC */
export const fmtRuler = (t: number): string =>
    formatInTimeZone(t * 1000, "UTC", "mm:ss");

/** HH:mm:ss.SS, в UTC */
export const fmtTimeExtended = (t: number): string =>
    formatInTimeZone(t * 1000, "UTC", "HH:mm:ss.SS");

/**
 * Парсит строку "HH:mm:ss.SS" (десятые и сотые секунды) обратно в секунды.
 * Использует локальные компоненты Date (getHours/getMinutes/getSeconds/getMilliseconds),
 * чтобы не было смещения из-за часового пояса.
 */
export const parseTimeExtended = (str: string): number => {
    // пробуем распарсить по шаблону
    const dt = parse(str, "HH:mm:ss.SS", new Date(0));
    if (isNaN(dt.getTime())) return 0;

    const hh = dt.getHours();            // 0…23
    const mm = dt.getMinutes();          // 0…59
    const ss = dt.getSeconds();          // 0…59
    const ms = dt.getMilliseconds();     // 0…999

    // сотые = миллисекунд / 10, округляем
    const cs = Math.round(ms / 10);

    return hh * 3600 + mm * 60 + ss + cs / 100;
};

/** Парсит строку "mm:ss.SS" обратно в секунды */
export const parseTimeShort = (str: string): number => {
    // базовая дата в UTC, чтобы parse работал от нуля
    const dt = parse(str, "mm:ss.SS", new Date(0));
    if (isNaN(dt.getTime())) return 0;

    // берём UTC-значения, они ровно соответствуют строке
    const minutes = dt.getUTCMinutes();           // 0–59
    const seconds = dt.getUTCSeconds();           // 0–59
    const centiseconds = Math.round(dt.getUTCMilliseconds() / 10); // 0–99

    return minutes * 60 + seconds + centiseconds / 100;
};