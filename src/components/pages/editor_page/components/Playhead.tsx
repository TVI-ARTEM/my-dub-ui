import {useEffect, useRef, useState} from "react";

interface Props {
    x: number;
    offset: number;
    maxX: number;              // ⬅️ новое
    height: number;
    onSeek?: (newX: number) => void;
}

export default function Playhead({x, offset, maxX, height, onSeek}: Props) {
    const [dragging, setDragging] = useState(false);
    const originRef = useRef<number>(0);

    /* пока тянем каретку — отключаем выделение body */
    useEffect(() => {
        if (dragging) {
            document.body.classList.add("select-none", "cursor-col-resize");
        } else {
            document.body.classList.remove("select-none", "cursor-col-resize");
        }
        return () => {
            document.body.classList.remove("select-none", "cursor-col-resize");
        };
    }, [dragging]);

    useEffect(() => {
        const move = (e: MouseEvent) => {
            if (!dragging) return;
            const raw = e.clientX - originRef.current - offset;
            const clamped = Math.max(0, Math.min(raw, maxX));
            onSeek?.(clamped);
        };
        const up = () => setDragging(false);
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
        return () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
        };
    }, [dragging, offset, onSeek]);

    return (
        <div
            className="absolute z-[5]"        // поверх клипов
            style={{left: offset + x, top: 0}}
            onMouseDown={(e) => {
                setDragging(true);
                originRef.current = e.clientX - (offset + x);
            }}
        >
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-b-black translate-x-[-4px]"/>
            <div className="w-px bg-black opacity-80" style={{height}}/>
        </div>
    );
}
