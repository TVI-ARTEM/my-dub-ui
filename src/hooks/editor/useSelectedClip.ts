import {useCallback, useMemo, useState} from "react";
import type {Clip} from "@/types/types";

export function useSelectedClip(textClips: Clip[], duration: number) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const select = useCallback((id: string) => setSelectedId(id), []);
    const clear = useCallback(() => setSelectedId(null), []);

    const idx = useMemo(
        () => textClips.findIndex(c => c.id === selectedId),
        [textClips, selectedId]
    );

    const minStart = useMemo(
        () => (idx > 0 ? textClips[idx - 1].out : 0),
        [idx, textClips]
    );
    const maxEnd = useMemo(
        () =>
            idx >= 0 && idx < textClips.length - 1
                ? textClips[idx + 1].in
                : duration,
        [idx, textClips, duration]
    );

    return {selectedId, select, clear, minStart, maxEnd};
}
