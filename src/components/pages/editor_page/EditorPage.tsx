import {useEffect, useRef, useState} from "react";
import {ProjectServiceApi} from "@/api/services/ProjectServiceApi.ts";
import {AxiosError} from "axios";
import toast from "react-hot-toast";
import {ProjectInfo} from "@/api/projects";
import {useNavigate} from "react-router-dom";
import {FilesServiceApi} from "@/api/services/FilesServiceApi.ts";
import {Clip, TimelineState} from "@/lib/types.ts";
import {PX_PER_SEC, SNAP_STEP} from "@/lib/constants.ts";
import VideoPlayer, {VideoPlayerHandle} from "@/components/pages/editor_page/components/VideoPlayer.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import CustomControls from "@/components/pages/editor_page/components/CustomControls.tsx";
import Timeline from "@/components/pages/editor_page/components/Timeline.tsx";
import ClipInfoPanel from "@/components/pages/editor_page/components/ClipInfoPanel.tsx";
import {round01} from "@/lib/time.ts";


export default function EditorPage() {
    const [currProject, setCurrProject] = useState<ProjectInfo>({})
    const [currMediaUrl, setcurrMediaUrl] = useState<string>("")
    const navigate = useNavigate();
    const currentId = Number(decodeURIComponent(
        location.pathname.replace(/^\/editor\/?/, '').trim()
    ))
    const refreshProject = async () => {
        try {
            const result = await ProjectServiceApi.getProject(currentId);
            const commonMediaUrl = await FilesServiceApi.getUrl(result.mediaId!)

            setState({
                duration: 0,
                playhead: 0,
                audioClips: [{id: "a1", src: commonMediaUrl, in: 0, out: 0}],
                textClips: result.segments?.map(
                    it => ({
                        id: it.id,
                        src: "/snd.mp3",
                        in: round01(it.startMs! / 1000),
                        out: round01(it.endMs! / 1000),
                        transcript: it.transcribe,
                        translation: it.translationRu
                    } as Clip)
                ) ?? []
            })

            setcurrMediaUrl(commonMediaUrl)

            setCurrProject(result)


        } catch (error: any) {
            if (error.code !== AxiosError.ERR_NETWORK) {
                toast.error(error.message)

                navigate('/')
            }
        }
    }

    useEffect(() => {
        (async function () {
                await refreshProject()
            }
        )()
    }, [currentId, navigate]);

    const [state, setState] = useState<TimelineState>({
        duration: 0,
        playhead: 0,
        audioClips: [],
        textClips: [],
    } as TimelineState);

    const [selectedTextClipId, setSelectedTextClipId] = useState<string | null>(null);

    // Масштаб: коэффициенты для pxPerSec
    const zoomOptions = [
        {label: "25%", value: 0.25},
        {label: "50%", value: 0.5},
        {label: "75%", value: 0.75},
        {label: "100%", value: 1},
        {label: "125%", value: 1.25},
        {label: "150%", value: 1.5},
        {label: "200%", value: 2},
    ] as const;
    const [zoom, setZoom] = useState<number>(0.5);

    const DEFAULT_CLIP_LENGTH = 5;

    const [playing, setPlaying] = useState(false);
    const playerRef = useRef<VideoPlayerHandle>(null);

    const videoEl = playerRef.current?.getVideoElement() ?? null;


    // вычисляем границы для выбранного клипа
    const selIdx = state.textClips.findIndex((c) => c.id === selectedTextClipId);
    const prevEnd = selIdx > 0 ? state.textClips[selIdx - 1].out : 0;
    const nextStart =
        selIdx >= 0 && selIdx < state.textClips.length - 1
            ? state.textClips[selIdx + 1].in
            : state.duration;


    /** Перемотка назад на 5 секунд */
    const handleRewind = () => {
        const t = Math.max(0, state.playhead - 5);
        setState((s) => ({...s, playhead: t}));
        playerRef.current?.seek(t);
    };

    /** Перемотка вперёд на 5 секунд */
    const handleForward = () => {
        const t = Math.min(state.duration, state.playhead + 5);
        setState((s) => ({...s, playhead: t}));
        playerRef.current?.seek(t);
    };

    /** Play/Pause */
    const handlePlayPause = () => {
        if (playing) {
            playerRef.current?.pause();
        } else {
            playerRef.current?.play();
        }
        // Состояние playing мы теперь меняем только по событиям onPlay/onPause/onEnded
    };


    // добавить текст-клип в конец после последнего
    const handleAddTextClip = () => {
        setState((s) => {
            const lastEnd = s.textClips[s.textClips.length - 1]?.out ?? 0;
            const start = lastEnd;
            if (start >= s.duration) return s;
            // новый конец — либо DEFAULT_CLIP_LENGTH после старта, либо конец видео
            const end = Math.min(start + DEFAULT_CLIP_LENGTH, s.duration);
            const nextId = `t${s.textClips.length + 1}`;
            const newClip: Clip = {
                id: nextId,
                src: "",
                in: start,
                out: end,
            };
            return {...s, textClips: [...s.textClips, newClip]};
        });
    };

    // удалить последний текст-клип
    const handleRemoveTextClip = () => {
        if (!selectedTextClipId) return;
        setState((s) => ({
            ...s,
            textClips: s.textClips.filter((c) => c.id !== selectedTextClipId),
        }));
        setSelectedTextClipId(null);
    };


    // При клике на клип — сохраняем его ID
    const handleSelectTextClip = (id: string) => setSelectedTextClipId(id);

    /** Обновить данные выбранного клипа */
    const handleClipChange = (updated: Clip) => {
        setState((s) => ({
            ...s,
            textClips: s.textClips.map((c) =>
                c.id === updated.id ? updated : c
            ),
        }));
    };


    // pxPerSec = базовый * zoom
    const pxPerSec = PX_PER_SEC * zoom;


    return (
        <>
            <div className="max-w px-4 min-h-screen flex flex-col">
                <div className="relative flex h-16 items-center justify-between border-b">
                    <div className="flex flex-1 items-center">
                        <div className="flex shrink-0 items-center">
                            <img src="/logo_min_transp.png" className="h-8" alt="MyDub Logo"/>
                            <span
                                className="ms-2 self-center text-2xl font-semibold whitespace-nowrap dark:text-white">MyDub</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">

                    </div>
                </div>

                <>
                    {
                        currProject?.mediaId && currMediaUrl && (
                            <>
                                <div className={"mt-4"}>
                                    <div className="mx-auto mt-8 mb-16 max-w-6xl w-full">
                                        <div className="w-full grid grid-rows-[auto_auto_1fr] min-w-0">
                                            <div className="grid grid-cols-[1fr_320px] overflow-hidden min-w-0">
                                                <div className="flex items-center justify-center">
                                                    <Card>
                                                        <CardContent className="p-0 flex items-center justify-center">
                                                            <VideoPlayer
                                                                ref={playerRef}
                                                                src={currMediaUrl}
                                                                currentTime={state.playhead}
                                                                onTimeUpdate={(tRaw) => {
                                                                    // квантуем к шагу 0.01 с
                                                                    const t = Math.min(
                                                                        Math.round(tRaw / SNAP_STEP) * SNAP_STEP,
                                                                        state.duration
                                                                    );
                                                                    setState((s) => ({...s, playhead: t}));
                                                                }}
                                                                onDuration={(d) =>
                                                                    setState((s) => ({
                                                                        ...s,
                                                                        duration: d,
                                                                        audioClips: s.audioClips.map((c) =>
                                                                            c.id === "a1" ? {...c, out: d} : c
                                                                        ),
                                                                    }))
                                                                }
                                                                onPlay={() => setPlaying(true)}
                                                                onPause={() => setPlaying(false)}
                                                                onEnded={() => setPlaying(false)}
                                                            />
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                <ClipInfoPanel
                                                    clip={state.textClips.find((c) => c.id === selectedTextClipId) ?? undefined}
                                                    minStart={prevEnd}
                                                    maxEnd={nextStart}
                                                    onChange={handleClipChange}
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <CustomControls
                                                    playing={playing}
                                                    currentTime={state.playhead}
                                                    duration={state.duration}
                                                    zoom={zoom}
                                                    zoomOptions={zoomOptions}
                                                    onZoomChange={setZoom}
                                                    onPlayPause={handlePlayPause}
                                                    onRewind={handleRewind}
                                                    onForward={handleForward}
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <Timeline
                                                    state={state}
                                                    pxPerSec={pxPerSec}
                                                    onSeek={(t) => setState((s) => ({...s, playhead: t}))}
                                                    onChangeTextClip={(clip) =>
                                                        setState((s) => ({
                                                            ...s,
                                                            textClips: s.textClips.map((c) => (c.id === clip.id ? clip : c)),
                                                        }))
                                                    }
                                                    onAddTextClip={handleAddTextClip}
                                                    onRemoveTextClip={handleRemoveTextClip}
                                                    selectedTextClipId={selectedTextClipId}
                                                    onSelectTextClip={handleSelectTextClip}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </>
                        )
                    }
                </>


            </div>


        </>
    )

}