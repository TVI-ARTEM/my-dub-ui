import {useEffect} from "react";

export function useBodyCursor(isActive: boolean) {
    useEffect(() => {
        const classes = ["select-none", "cursor-col-resize"];
        if (isActive) {
            document.body.classList.add(...classes);
        } else {
            document.body.classList.remove(...classes);
        }
        return () => {
            document.body.classList.remove(...classes);
        };
    }, [isActive]);
}
