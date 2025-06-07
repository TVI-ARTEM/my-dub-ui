import {Textarea} from "@/components/ui/textarea.tsx";
import type {Clip} from "@/types/types.ts";
import {useClipInfoBounds} from "@/hooks/clips/useClipInfoBounds.ts";
import {TimeSpinner} from "@/components/ui/time-spinner.tsx";
import {Button} from "@/components/ui/button.tsx";

interface Props {
    clip?: Clip;
    minStart: number;
    maxEnd: number;
    fileDuration?: number | null;
    onChange?: (updated: Clip) => void;
    onGenerate?: (clip: Clip) => Promise<void>;
}

export default function ClipInfoPanel({
                                          clip,
                                          minStart,
                                          maxEnd,
                                          fileDuration,
                                          onChange,
                                          onGenerate
                                      }: Props) {
    const {minIn, maxIn, minOut, maxOut} = useClipInfoBounds(
        clip,
        minStart,
        maxEnd,
        fileDuration
    );

    if (!clip) {
        return (
            <div className="text-center text-muted-foreground">
                Выберите клип
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-[32vh] min-h-[125px]" style={{overflowY: "scroll"}}>
            <div className="
                    w-full min-w-0 flex

                    /* ≥1024px — одна строка */
                    lg:flex-row lg:space-x-2 lg:space-y-0

                    /* <1024px — два ряда */
                    max-lg:flex-col max-lg:space-y-2 max-lg:space-x-0

                    /* <768px — снова одна строка */
                    max-md:flex-row max-md:space-x-2 max-md:space-y-0

                    /* <340px — опять два ряда */
                    max-[340px]:flex-col max-[340px]:space-y-2 max-[340px]:space-x-0
                ">
                <div className="flex-1 min-w-0">
                    <TimeSpinner
                        value={clip.in}
                        min={minIn}
                        max={maxIn}
                        step={0.01}
                        onChange={(v) => onChange?.({...clip, in: v})}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <TimeSpinner
                        value={clip.out}
                        min={minOut}
                        max={maxOut}
                        step={0.01}
                        onChange={(v) => onChange?.({...clip, out: v})}
                    />
                </div>
            </div>

            <Textarea
                id="transcript"
                placeholder="Транскрипция"
                className="h-12 overflow-auto resize-none w-full break-all whitespace-pre-wrap"
                value={clip.transcript ?? ""}
                onChange={(e) => onChange?.({...clip, transcript: e.target.value})}
            />

            <Textarea
                id="translation"
                placeholder="Перевод"
                className="h-12 overflow-auto resize-none w-full break-all whitespace-pre-wrap"
                value={clip.translation ?? ""}
                onChange={(e) => onChange?.({...clip, translation: e.target.value, accentRu: ""})}
            />

            <Textarea
                id="accent"
                placeholder="Фонетический вид"
                className="h-12 overflow-auto resize-none w-full break-all whitespace-pre-wrap"
                value={clip.accentRu ?? ""}
                onChange={(e) => onChange?.({...clip, accentRu: e.target.value})}
            />

            <Button
                onClick={async () => {
                    await onGenerate?.(clip)
                }}
            >
                Перегенерировать
            </Button>
        </div>
    );
}
