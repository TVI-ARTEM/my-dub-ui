import {Textarea} from "@/components/ui/textarea.tsx";
import type {Clip} from "@/types/types.ts";
import {useClipInfoBounds} from "@/hooks/clips/useClipInfoBounds.ts";
import {TimeSpinner} from "@/components/ui/time-spinner.tsx";
import {Button} from "@/components/ui/button.tsx";
import {VoiceInfo} from "@/api/projects";
import {useMemo, useState} from "react";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group.tsx";
import {FileAudioIcon, Trash2, X} from "lucide-react";
import {Accordion, AccordionTrigger} from "@radix-ui/react-accordion";
import {AccordionContent, AccordionItem} from "@/components/ui/accordion.tsx";
import {FilesServiceApi} from "@/api/services/FilesServiceApi.ts";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Dialog, DialogBackdrop, DialogPanel, DialogTitle} from "@headlessui/react";
import {Checkbox} from "@/components/ui/checkbox.tsx";

interface Props {
    clip?: Clip;
    minStart: number;
    maxEnd: number;
    fileDuration?: number | null;
    onChange?: (updated: Clip) => void;
    onGenerate?: (clip: Clip) => Promise<void>;
    voices?: VoiceInfo[];
    onAddVoice?: (name: string, mediaId: string, groupName: (string | null)) => Promise<void>;
    onDeleteVoice?: (voiceId: number) => Promise<void>;
}

const voiceSchema = z.object({
    voiceName: z.string().trim().min(3, 'Минимум 3 символа'),
    groupName: z.string(),
})

type FormVoiceData = z.infer<typeof voiceSchema>

interface VoiceMoreInfo {
    voice: VoiceInfo;
    src: string
}


export default function ClipInfoPanel({
                                          clip,
                                          minStart,
                                          maxEnd,
                                          fileDuration,
                                          onChange,
                                          onGenerate,
                                          voices,
                                          onAddVoice,
                                          onDeleteVoice,
                                      }: Props) {
    const {minIn, maxIn, minOut, maxOut} = useClipInfoBounds(
        clip,
        minStart,
        maxEnd,
        fileDuration
    );

    const {
        reset: resetVoiceValues,
        register: createVoiceRegister,
        handleSubmit: handleCreateVoice,
        formState: {errors: voiceErrors, isSubmitting: voiceIsSubmitting},
    } = useForm<FormVoiceData>({resolver: zodResolver(voiceSchema)})

    const [voiceApiError, setVoiceApiError] = useState('')
    const [voiceOpen, setVoiceOpen] = useState(false);
    const [selectedVoiceFile, setSelectedVoiceFile] = useState<File | null>(null);


    const selectedVoice = useMemo(
        () =>
            voices?.find((v) => v.mediaId === clip?.externalRefId),
        [voices, clip?.externalRefId],
    );

    const grouped = useMemo(() => {
        if (!voices) return [];
        const map = new Map<string, VoiceMoreInfo[]>();
        voices.forEach(async (v) => {
            const key = v.groupName || "Общие";
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push({
                voice: v,
                src: await FilesServiceApi.getUrl(v.mediaId ?? "")
            } as VoiceMoreInfo);
        });
        // гарантируем стабильный порядок
        return Array.from(map.entries()).sort(([a], [b]) =>
            a.localeCompare(b),
        );
    }, [voices]);

    if (!clip) {
        return (
            <div className="text-center text-muted-foreground">
                Выберите клип
            </div>
        );
    }

    const onCreateVoice = async (data: FormVoiceData) => {

        if (!selectedVoiceFile) {
            setVoiceApiError("Выберите файл.");
            return;
        }
        setVoiceApiError('')
        try {
            const voiceFileId = await FilesServiceApi.uploadFile(selectedVoiceFile)

            await onAddVoice?.(data.voiceName, voiceFileId, data.groupName)

            resetVoiceValues({voiceName: "", groupName: ""})
            setSelectedVoiceFile(null);
            setVoiceOpen(false)

        } catch (e: any) {
            setVoiceApiError(e?.body ?? "Ошибка при создании")
        }
    }

    return (
        <>
            <div className="space-y-3 max-h-[32vh] min-h-[125px]" style={{overflowY: "scroll"}}>
                <div className="
                    w-full min-w-0 flex

                    lg:flex-row lg:space-x-2 lg:space-y-0

                    max-lg:flex-col max-lg:space-y-2 max-lg:space-x-0

                    max-md:flex-row max-md:space-x-2 max-md:space-y-0

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

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="is-sub-translated"
                        checked={clip.trueDub ?? false}
                        onCheckedChange={(checked) => {
                            onChange?.({...clip, trueDub: !!checked})
                        }
                        }
                    />
                    <label
                        htmlFor="is-sub-translated"
                        className="cursor-pointer text-sm select-none"
                    >
                        Дубляж
                    </label>
                </div>


                <div className="flex items-center justify-between rounded-lg border p-2">
                <span className="text-sm">
                  <span className="font-medium">Голос:&nbsp;</span>
                    {clip.externalRefId
                        ? selectedVoice?.name || `#${clip.externalRefId}`
                        : "—"}
                </span>

                    {clip.externalRefId && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                onChange?.({...clip, externalRefId: undefined})
                            }
                        >
                            <X className="h-4 w-4"/>
                        </Button>
                    )}
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="voice-block">
                        <AccordionTrigger className="text-left font-semibold">
                            Посмотреть голоса
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2 ms-2">

                            <button
                                onClick={() => setVoiceOpen(true)}
                                className="px-4 py-2 text-white font-medium bg-gray-900 border border-gray-500 rounded hover:bg-gray-800"
                            >
                                Новый голос
                            </button>

                            {grouped.length > 0 && (
                                <Accordion type="multiple" className="space-y-1">
                                    {grouped.map(([group, list]) => (
                                        <AccordionItem key={group} value={group}>
                                            <AccordionTrigger className="text-left text-sm font-semibold">
                                                {group} ({list.length})
                                            </AccordionTrigger>

                                            <AccordionContent>
                                                <RadioGroup
                                                    value={clip.externalRefId?.toString() ?? ""}
                                                    onValueChange={(v) =>
                                                        onChange?.({
                                                            ...clip,
                                                            externalRefId: v ? v : undefined,
                                                        })
                                                    }
                                                    className="space-y-2 py-1"
                                                >
                                                    {list.map((voiceMore) => {
                                                        const voice = voiceMore.voice;
                                                        return (
                                                            <div
                                                                key={voice.id}
                                                                className={`flex rounded-md px-2 py-1 hover:bg-accent`}
                                                                style={{flexDirection: 'column', gap: '.5rem'}}
                                                            >
                                                                <div
                                                                    className="flex items-center justify-between ">
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem
                                                                            value={voice.mediaId?.toString() ?? ""}
                                                                            id={`voice-${voice.id}`}
                                                                        />
                                                                        <label
                                                                            htmlFor={`voice-${voice.id}`}
                                                                            className="cursor-pointer text-sm"
                                                                        >
                                                                            {voice.name}
                                                                        </label>


                                                                    </div>

                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => onDeleteVoice?.(voice.id ?? 0)}
                                                                        className="h-6 w-6"
                                                                    >
                                                                        <Trash2 className="h-4 w-4"/>
                                                                    </Button>
                                                                </div>


                                                                <audio style={{width: "100%", height: "40px"}} controls
                                                                       src={voiceMore.src}/>
                                                            </div>
                                                        )

                                                    })}
                                                </RadioGroup>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Button
                    onClick={async () => {
                        await onGenerate?.(clip)
                    }}
                >
                    Перегенерировать
                </Button>
            </div>

            <Dialog open={voiceOpen} onClose={setVoiceOpen} className="relative z-10">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                />

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel
                            transition
                            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                        >

                            <form onSubmit={handleCreateVoice(onCreateVoice)} className="w-full">

                                <div className="bg-white px-6 pt-5 pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 w-full">
                                            <DialogTitle as="h3" className="text-xl font-semibold text-gray-900">
                                                Новый проект
                                            </DialogTitle>
                                            <div className="mt-2 space-y-4">
                                                <label className="block">
                                                    <span className="text-xs uppercase text-gray-500">Название</span>
                                                    <input
                                                        type="text"
                                                        {...createVoiceRegister('voiceName')}
                                                        className="mt-1 w-full rounded bg-gray-100 p-3 outline-none focus:ring-2 focus:ring-black"
                                                    />
                                                    {voiceErrors.voiceName &&
                                                        <p className="mt-1 text-xs text-red-500">{voiceErrors.voiceName.message}</p>}
                                                </label>


                                                <label className="block">
                                                    <span className="text-xs uppercase text-gray-500">Название группы (опционально)</span>
                                                    <input
                                                        type="text"
                                                        {...createVoiceRegister('groupName')}
                                                        className="mt-1 w-full rounded bg-gray-100 p-3 outline-none focus:ring-2 focus:ring-black"
                                                    />
                                                    {voiceErrors.groupName &&
                                                        <p className="mt-1 text-xs text-red-500">{voiceErrors.groupName.message}</p>}
                                                </label>


                                                <label className="block">
                                                    <span className="text-xs uppercase text-gray-500">Файл</span>
                                                    <div
                                                        className="cursor-pointer mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-4">
                                                        <div className="text-center">
                                                            <FileAudioIcon aria-hidden="true"
                                                                           className="mx-auto size-12 text-gray-300"/>
                                                            <div
                                                                className="flex flex-col items-center mt-4 text-sm/6 text-gray-600 ">
                                                                <label
                                                                    htmlFor="file-upload"
                                                                    className="relative  rounded-md bg-white font-semibold text-blue-600 focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 focus-within:outline-hidden hover:text-blue-500"
                                                                >
                                                                    <span
                                                                        className={"text-center"}>Загрузить файл</span>
                                                                    <input
                                                                        type="file"
                                                                        accept=".wav,.mp3"
                                                                        onChange={e => setSelectedVoiceFile(e.target.files?.[0] || null)}
                                                                        className="sr-only"
                                                                    />
                                                                </label>
                                                                <span>{selectedVoiceFile && selectedVoiceFile.name}</span>
                                                                <span>{!selectedVoiceFile && "Выберите файл..."}</span>
                                                            </div>
                                                            <p className="text-xs/5 text-gray-600">WAV, MP3 не более
                                                                20MB</p>
                                                        </div>
                                                    </div>
                                                </label>


                                                {voiceApiError &&
                                                    <p className="text-sm text-red-600">{voiceApiError}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row-reverse bg-gray-50 px-6 py-3">
                                    <button
                                        disabled={voiceIsSubmitting}
                                        className="inline-flex w-full justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-700 sm:ml-3 sm:w-auto"
                                    >
                                        Создать
                                    </button>
                                </div>
                            </form>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

        </>
    );
}
