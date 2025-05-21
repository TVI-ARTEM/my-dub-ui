import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {fmtTime} from "@/lib/time.ts";
import TimeSpinner from "@/components/ui/time-spinner";
import {Clip} from "@/lib/types.ts";
import {MIN_CLIP_LENGTH} from "@/lib/constants.ts";

interface Props {
    clip?: Clip;
    minStart: number;    // прежний clip.out соседа или 0
    maxEnd: number;      // следующий clip.in или duration
    onChange?: (updated: Clip) => void;
}

export default function ClipInfoPanel({
                                          clip,
                                          minStart,
                                          maxEnd,
                                          onChange,
                                      }: Props) {
    // локальные строки для ввода
    const [startStr, setStartStr] = useState("");
    const [endStr, setEndStr] = useState("");

    // при смене clip сбрасываем их
    useEffect(() => {
        if (clip) {
            setStartStr(fmtTime(clip.in));
            setEndStr(fmtTime(clip.out));
        } else {
            setStartStr("");
            setEndStr("");
        }
    }, [clip]);

    if (!clip) {
        return (
            <Card>
                <CardContent className="text-center text-muted-foreground">
                    Выберите клип
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="space-y-3">
                {/* Start / End */}
                <div className="flex items-center justify-between space-x-4">
                {/*<div className="flex items-center gap-6">*/}
                    <div className="flex flex-col">
                        <TimeSpinner
                            value={clip.in}
                            min={minStart}
                            max={clip.out - MIN_CLIP_LENGTH}
                            step={0.01}
                            onChange={(v) => onChange?.({ ...clip, in: v })}
                        />
                    </div>
                    <div className="flex flex-col">
                        <TimeSpinner
                            value={clip.out}
                            min={clip.in + MIN_CLIP_LENGTH}
                            max={maxEnd}
                            step={0.01}
                            onChange={(v) => onChange?.({ ...clip, out: v })}
                        />
                    </div>
                </div>

                {/* Transcription */}
                {/*<div className="flex flex-col">*/}
                    <Textarea
                        id="transcript"
                        placeholder="Транскрипция"
                        className="h-12 overflow-auto resize-none"
                        value={clip.transcript ?? ""}
                        onChange={(e) =>
                            onChange?.({ ...clip, transcript: e.target.value })
                        }
                    />
                {/*</div>*/}

                {/* Translation */}
                {/*<div className="flex flex-col">*/}
                    <Textarea
                        id="translation"
                        className="h-12 overflow-auto resize-none"
                        placeholder="Перевод"
                        value={clip.translation ?? ""}
                        onChange={(e) =>
                            onChange?.({ ...clip, translation: e.target.value })
                        }
                    />
                {/*</div>*/}
            </CardContent>
        </Card>
    );
}
