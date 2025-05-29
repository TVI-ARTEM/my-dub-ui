import {usePlayheadDrag} from "@/hooks/timeline/ruler/usePlayheadDrag.ts";
import {useBodyCursor} from "@/hooks/timeline/ruler/useBodyCursor.ts";

interface Props {
    position: number;
    offset: number;
    maxPosition: number;
    height: number;
    onSeek?: (newPosition: number) => void;
}

export default function Playhead({ position, offset, maxPosition, height, onSeek }: Props) {
    const { dragging, handleMouseDown } = usePlayheadDrag({ offset, maxPosition: maxPosition, onSeek });

    useBodyCursor(dragging);

    return (
        <div
            className="absolute z-[5]"
            style={{ left: offset + position, top: 0 }}
            onMouseDown={(e) => handleMouseDown(e, position)}
        >
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-b-black translate-x-[-4px]" />
            <div className="w-px bg-black opacity-80" style={{ height }} />
        </div>
    );
}
