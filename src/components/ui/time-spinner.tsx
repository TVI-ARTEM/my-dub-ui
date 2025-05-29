import React, { useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { withMask } from "use-mask-input";
import { toClipInfoTimeString, parseTime } from "@/utils/time";
import { round } from "@/utils/rnd";

interface Props {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (v: number) => void;
}

function TimeSpinnerImpl({
                             value,
                             min = 0,
                             max = Infinity,
                             step = 0.01,
                             onChange,
                         }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        const el = inputRef.current;

        if (!el) return;

        withMask("99:99.99")(el);
    }, []);


    useEffect(() => {
        const el = inputRef.current;

        if (el && document.activeElement !== el) {
            el.value = toClipInfoTimeString(value);
        }
    }, [value]);


    const commit = useCallback(() => {
        const el = inputRef.current;

        if (!el) return;

        let t = parseTime(el.value);
        t = Math.max(min, Math.min(t, max));
        t = round(t, 2);

        onChange(t);

        el.value = toClipInfoTimeString(t);
    }, [min, max, onChange]);

    const inc = useCallback(() => {
        onChange(round(Math.min(value + step, max), 2));
    }, [value, step, max, onChange]);

    const dec = useCallback(() => {
        onChange(round(Math.max(value - step, min), 2));
    }, [value, step, min, onChange]);

    return (
        <div className="inline-flex items-stretch gap-2">
            <Input
                ref={inputRef}
                className="w px-2 text-center"
                onBlur={commit}
                onKeyDown={(e) => e.key === "Enter" && commit()}
                placeholder="MM:SS.CS"
            />
            <div className="flex flex-col">
                <Button
                    size="icon"
                    variant="outline"
                    className="h-1/2 w-8 p-0"
                    onClick={inc}
                    aria-label="Increase time"
                >
                    <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="outline"
                    className="h-1/2 w-8 p-0"
                    onClick={dec}
                    aria-label="Decrease time"
                >
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

function propsAreEqual(prev: Props, next: Props) {
    return (
        prev.value === next.value &&
        prev.min === next.min &&
        prev.max === next.max &&
        prev.step === next.step &&
        prev.onChange === next.onChange
    );
}

export const TimeSpinner = React.memo(TimeSpinnerImpl, propsAreEqual);
