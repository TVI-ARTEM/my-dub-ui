import {useEffect, useRef} from "react";
import {ChevronUp, ChevronDown} from "lucide-react";
import {withMask} from "use-mask-input";
import {fmtTime, parseTimeShort, round01} from "@/lib/time.ts";
import {Input} from "./input.tsx";
import {Button} from "./button.tsx";

interface Props {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (v: number) => void;
}

export default function TimeSpinner({
                                        value,
                                        min = 0,
                                        max = Infinity,
                                        step = 0.01,
                                        onChange,
                                    }: Props) {

    const inputRef = useRef<HTMLInputElement>(null);

    /* синхронизируем поле, только если НЕ редактируем его прямо сейчас */
    useEffect(() => {
        if (
            inputRef.current &&
            document.activeElement !== inputRef.current
        ) {
            inputRef.current.value = fmtTime(value);
        }
    }, [value]);

    const commit = () => {
        if (!inputRef.current) return;
        let t = parseTimeShort(inputRef.current.value);
        t = Math.max(min, Math.min(t, max));
        t = round01(t);
        onChange(t);
        inputRef.current.value = fmtTime(t);
    };

    const inc = () => {
        const nv = round01(Math.min(value + step, max));
        onChange(nv);
    };

    const dec = () => {
        const nv = round01(Math.max(value - step, min));
        onChange(nv);
    };

    return (
        <div className="inline-flex items-stretch gap-1">
            <Input
                ref={(el) => {
                    inputRef.current = el;
                    if (el) withMask("99:99.99")(el);
                }}
                className="w px-2 text-center"
                // value={str}
                // onChange={(e) => setStr(e.target.value)}
                onBlur={() => commit}
                onKeyDown={(e) => e.key === "Enter" && commit()}
                placeholder="MM:SS.CS"
                //ref={withMask("99:99.99")}
            />
            <div className="flex flex-col">
                <Button
                    size="icon"
                    variant="outline"
                    className="h-1/2 w-8 p-0"
                    onClick={inc}
                    aria-label="Increase time"
                >
                    <ChevronUp className="h-4 w-4"/>
                </Button>
                <Button
                    size="icon"
                    variant="outline"
                    className="h-1/2 w-8 p-0"
                    onClick={dec}
                    aria-label="Decrease time"
                >
                    <ChevronDown className="h-4 w-4"/>
                </Button>
            </div>
        </div>
    );
}
