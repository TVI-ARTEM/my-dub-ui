import React, {useCallback, useEffect, useRef, useState} from "react";

interface Options {
    offset: number;
    maxPosition: number;
    onSeek?: (newPosition: number) => void;
}

export function usePlayheadDrag({offset, maxPosition, onSeek}: Options) {
    const [dragging, setDragging] = useState(false);
    const originRef = useRef(0);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>, currentX: number) => {
            setDragging(true);

            originRef.current = e.clientX - (offset + currentX);
        },
        [offset]
    );

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!dragging) return;
            const rawPosition = e.clientX - originRef.current - offset;
            const newPosition = Math.max(0, Math.min(rawPosition, maxPosition));
            onSeek?.(newPosition);
        };

        const onMouseUp = () => setDragging(false);

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [dragging, offset, maxPosition, onSeek]);

    return {dragging, handleMouseDown};
}
