import {useMemo, useState} from "react";
import {PX_PER_SEC} from "@/constants/constants";

export function useZoom(initial = 1) {
    const [zoom, setZoom] = useState(initial);

    const pxPerSec = useMemo(() => PX_PER_SEC * zoom, [zoom]);

    return {zoom, setZoom, pxPerSec};
}
