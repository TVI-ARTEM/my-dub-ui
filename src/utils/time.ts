import {formatInTimeZone} from "date-fns-tz";
import {parse} from "date-fns";

export const toClipInfoTimeString = (t: number): string =>
    formatInTimeZone(t * 1000, "UTC", "mm:ss.SS");

export const toRulerTimeString = (t: number): string =>
    formatInTimeZone(t * 1000, "UTC", "mm:ss");


export const parseTime = (str: string): number => {
    const dt = parse(str, "mm:ss.SS", new Date(0));
    if (isNaN(dt.getTime())) return 0;

    const minutes = dt.getUTCMinutes();
    const seconds = dt.getUTCSeconds();
    const centiseconds = Math.round(dt.getUTCMilliseconds() / 10);

    return minutes * 60 + seconds + centiseconds / 100;
};