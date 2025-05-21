import {Minus, Plus} from "lucide-react";
import ClipItem from "./ClipItem.tsx";

import {Clip} from "@/lib/types.ts";
import {Button} from "@/components/ui/button.tsx";

interface Props {
    label: string;
    clips: Clip[];
    pxPerSec: number;
    totalPx: number;
    type: "audio" | "text";
    selectedClipId?: string | null;
    canAdd?: boolean;
    onChangeClip?: (c: Clip) => void;
    onAddClip?: () => void;
    onRemoveClip?: () => void;
    onSelectClip?: (id: string) => void;
}

export default function TrackRow({
                                     label,
                                     clips,
                                     pxPerSec,
                                     totalPx,
                                     type,
                                     canAdd,
                                     onChangeClip,
                                     onAddClip,
                                     onRemoveClip,
                                     selectedClipId,
                                     onSelectClip,
                                 }: Props) {
    const rowHeight = type === "audio" ? 40 : 48;


    return (
        <div className="grid grid-cols-[128px_1fr] select-none">
            {/* Лейбл дорожки слева */}
            <div
                className="flex items-center justify-between gap-2 w-32 shrink-0 pr-3 pl-2  border-r border-muted-foreground/10 select-none"
                style={{height: rowHeight}}
            >
                <span className="font-semibold whitespace-nowrap">{label}</span>

                {canAdd && (
                    <div className="flex items-center gap-1">
                        <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => onRemoveClip?.()}
                        >
                            <Minus className="h-3 w-3"/>
                        </Button>
                        <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => onAddClip?.()}
                        >
                            <Plus className="h-3 w-3"/>
                        </Button>
                    </div>
                )}
            </div>

            {/* Поле дорожки с клипами */}
            <div
                className="relative bg-background/40"
                style={{width: totalPx, height: rowHeight}}
            >
                {clips.map((c) =>
                    type === "audio" ? (
                        /* аудио-клип остаётся «глухим» (не перетаскивается) */
                        <div
                            key={c.id}
                            className="absolute h-full bg-primary/20 border border-primary/60 rounded-md"
                            style={{left: 0, width: totalPx}}
                        />
                    ) : (
                        <ClipItem
                            key={c.id}
                            clip={c}
                            clips={clips}
                            pxPerSec={pxPerSec}
                            timelineDur={totalPx / pxPerSec}
                            onChange={onChangeClip!}
                            selected={c.id === selectedClipId}
                            onSelect={onSelectClip}
                        />
                    )
                )}
            </div>
        </div>
    )
        ;
}
