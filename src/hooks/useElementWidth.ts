import {type RefObject, useLayoutEffect, useState} from "react";


export function useElementWidth<T extends HTMLElement = HTMLElement>(
    ref: RefObject<T | null>
): number {
    const [width, setWidth] = useState(0);

    useLayoutEffect(() => {
        if (!ref.current) return;

        const handleResize = () => setWidth(ref.current!.offsetWidth);
        handleResize(); // начальный замер

        const ro = new ResizeObserver(handleResize);
        ro.observe(ref.current);

        return () => ro.disconnect();
    }, [ref]);

    return width;
}
