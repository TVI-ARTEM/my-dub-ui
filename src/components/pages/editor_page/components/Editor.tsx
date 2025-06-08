import {useCallback, useEffect, useRef} from "react";
import {Clip, Segment, TimelineState, VideoPlayerHandle} from "@/types/types.ts";
import {useTimelineState} from "@/hooks/editor/useTimelineState.ts";
import {usePlaybackControls} from "@/hooks/editor/usePlaybackControls.ts";
import {useElementWidth} from "@/hooks/useElementWidth.ts";
import {useZoomOptions} from "@/hooks/timeline/toolbar/useZoomOptions.ts";
import {useZoom} from "@/hooks/editor/useZoom.ts";
import {useSelectedClip} from "@/hooks/editor/useSelectedClip.ts";
import {useSegmentAudioSync} from "@/hooks/editor/useSegmentAudioSync.ts";
import {Card, CardContent} from "@/components/ui/card.tsx";
import VideoPlayer from "@/components/pages/editor_page/components/VideoPlayer.tsx";
import ClipInfoPanel from "@/components/pages/editor_page/components/clips/ClipInfoPanel.tsx";
import TimelineToolbar from "@/components/pages/editor_page/components/timeline/toolbar/TimelineToolbar.tsx";
import Timeline from "@/components/pages/editor_page/components/timeline/Timeline.tsx";
import {ProjectServiceApi} from "@/api/services/ProjectServiceApi.ts";
import {FilesServiceApi} from "@/api/services/FilesServiceApi.ts";
import {round} from "@/utils/rnd.ts";
import {AxiosError} from "axios";
import toast from "react-hot-toast";
import {SegmentInfo} from "@/api/projects";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Button} from "@/components/ui/button";

interface Props {
    timeState: TimelineState,
    currMediaUrl: string,
}

const Editor = (props: Props) => {
    const {timeState, currMediaUrl} = props;

    const DEFAULT_CLIP_LENGTH = 5;

    const {
        state,
        seek,
        setDuration,
        updateTextClip,
        addTextClip,
        removeTextClip,
        swapTextClips,
        updateClips,
        addTextClipAt,
        addVoice,
        removeVoice,
        // refreshVoices
    } = useTimelineState(timeState);

    const playerRef = useRef<VideoPlayerHandle>(null);
    const {
        playing,
        setPlaying,
        playPause,
        rewind,
        forward,
    } = usePlaybackControls(
        playerRef,
        seek,
        state.duration,
        state.playhead
    );

    const refreshProject = useCallback(async () => {
        try {
            console.log("refresh");
            const projectInfo = await ProjectServiceApi.getProject(state.projectId);

            const new_clips = await Promise.all(projectInfo.segments?.map(
                async it => ({
                    id: it.id,
                    src: it.audioMediaId ? await FilesServiceApi.getUrl(it.audioMediaId) : "",
                    in: round(it.startMs! / 1000, 2),
                    out: round(it.endMs! / 1000, 2),
                    transcript: it.transcribe,
                    translation: it.translationRu,
                    accentRu: it.accentRu ?? "",
                    speaker: it.speaker,
                    originalId: it.audioMediaId,
                    trueDub: it.trueDub,
                    externalRefId: it.externalRefId,
                } as Clip)
            ) ?? [])

            const prevIds = new Set(state.origClips.map(c => c.id));
            const newIds = new Set(new_clips.map(c => c.id));

            const isNew = [...newIds].some(id => !prevIds.has(id));

            if (isNew) {
                updateClips(new_clips)
                return
            }

            const newById = new Map(new_clips.map(c => [c.id, c]));

            const mergedClips = state.textClips.map(clip => {
                const fresh = newById.get(clip.id);
                if (!fresh) return clip;

                if (clip.originalId !== fresh.originalId) {
                    return {...clip, originalId: fresh.originalId, src: fresh.src};
                }
                return clip;
            });

            updateClips(mergedClips)

            const resultSegs = mergedClips.map(clip => ({
                id: clip.id,
                startMs: Math.ceil(clip.in * 1000),
                endMs: Math.ceil(clip.out * 1000),
                speaker: clip.speaker,
                transcribe: clip.transcript,
                translationRu: clip.translation,
                accentRu: clip.accentRu,
                audioMediaId: clip.originalId,
                trueDub: clip.trueDub,
                externalRefId: clip.externalRefId,
            } as SegmentInfo))


            await ProjectServiceApi.updateSegments(state.projectId, resultSegs);
        } catch (error: any) {
            if (error.code !== AxiosError.ERR_NETWORK) {
                toast.error(error.message)
            }
        }
    }, [state, updateClips])

    const POLL_MS = 10_000;


    useEffect(() => {
        const id = setInterval(() => {
            refreshProject();
        }, POLL_MS);

        return () => clearInterval(id);
    }, [refreshProject]);


    const timelineWrapRef = useRef<HTMLDivElement>(null);
    const timelineWidth = useElementWidth(timelineWrapRef);


    /* строим полный список масштабов с учётом fitZoom */
    const zoomOptions = useZoomOptions();

    const startZoom = zoomOptions[0]?.value ?? 1;
    const {zoom, setZoom, pxPerSec} = useZoom(startZoom);

    const {
        selectedId,
        select,
        minStart,
        maxEnd,
    } = useSelectedClip(state.textClips, state.duration);

    const segmentsRef = useRef<Segment[]>([]);
    useSegmentAudioSync(
        playerRef.current?.getVideoElement() ?? null,
        segmentsRef
    );

    return (
        <>
            <div className="mx-auto mt-8 mb-16 w-full">
                <div className="w-full grid grid-rows-[auto_auto_1fr] min-w-0">

                    <div
                        className="grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-y-4 md:gap-x-8 overflow-hidden min-w-0">
                        <div className="items-center justify-start">
                            <Card className="h-full max-h-[40vh] min-h-[200px] w-full md:w-auto">
                                <CardContent
                                    className="p-0 flex items-center justify-center h-full overflow-hidden">
                                    <VideoPlayer
                                        ref={playerRef}
                                        src={currMediaUrl}
                                        currentTime={state.playhead}
                                        onTimeUpdate={seek}
                                        onDuration={setDuration}
                                        onPlay={() => setPlaying(true)}
                                        onPause={() => setPlaying(false)}
                                        onEnded={() => setPlaying(false)}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <Tabs defaultValue="projectInfo" className="gap-0 h-full max-h-[40vh] min-h-[200px]">
                            <TabsList className="w-full p-0 bg-background justify-start border-b rounded-none">
                                <TabsTrigger
                                    value="projectInfo"
                                    className="rounded-none bg-background h-full data-[state=active]:shadow-none border border-transparent border-b-border data-[state=active]:border-border data-[state=active]:border-b-background -mb-[2px] rounded-t-xl"
                                >
                                    Проект
                                </TabsTrigger>
                                <TabsTrigger
                                    value="clipInfo"
                                    className="rounded-none bg-background h-full data-[state=active]:shadow-none border border-transparent border-b-border data-[state=active]:border-border data-[state=active]:border-b-background -mb-[2px] rounded-t-xl"
                                >
                                    Клип
                                </TabsTrigger>

                            </TabsList>
                            <TabsContent
                                value="clipInfo"
                                className="
                                border border-border
                                border-t-0
                                rounded-b-lg
                                p-4"
                            >
                                <ClipInfoPanel
                                    clip={state.textClips.find((c) => c.id === selectedId)}
                                    minStart={minStart}
                                    maxEnd={maxEnd}
                                    fileDuration={
                                        segmentsRef.current.find((s) => s.id === selectedId)
                                            ?.audioElement?.duration ?? null
                                    }
                                    onChange={updateTextClip}
                                    onGenerate={async (clip) => {
                                        try {
                                            await refreshProject();

                                            await ProjectServiceApi.reGenerateSeg(state.projectId, clip.id)
                                        } catch (error: any) {
                                            if (error.code !== AxiosError.ERR_NETWORK) {
                                                toast.error(error.message)
                                            }
                                        }
                                    }}
                                    voices={state.voices}
                                    onAddVoice={addVoice}
                                    onDeleteVoice={removeVoice}
                                />
                            </TabsContent>

                            <TabsContent
                                value="projectInfo"
                                className="
                                border border-border
                                border-t-0
                                rounded-b-lg
                                p-4"
                            >
                                <div className="flex flex-col space-y-2">
                                    <Button
                                        onClick={async () => {
                                            try {
                                                await refreshProject();

                                                const fileLink = await ProjectServiceApi.export(state.projectId)

                                                const link = document.createElement('a');
                                                link.href = fileLink;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            } catch (error: any) {
                                                if (error.code !== AxiosError.ERR_NETWORK) {
                                                    toast.error(error.message)
                                                }
                                            }
                                        }}
                                    >
                                        Экспортировать
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            try {
                                                await refreshProject();

                                                await ProjectServiceApi.generateSegs(state.projectId)
                                            } catch (error: any) {
                                                if (error.code !== AxiosError.ERR_NETWORK) {
                                                    toast.error(error.message)
                                                }
                                            }
                                        }}
                                    >
                                        Сгенерировать
                                    </Button>

                                    <Button
                                        onClick={async () => {
                                            try {
                                                await refreshProject();
                                            } catch (error: any) {
                                                if (error.code !== AxiosError.ERR_NETWORK) {
                                                    toast.error(error.message)
                                                }
                                            }
                                        }}
                                    >
                                        Обновить
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="min-w-0 mt-2">
                        <TimelineToolbar
                            playing={playing}
                            currentTime={state.playhead}
                            duration={state.duration}
                            zoom={zoom}
                            zoomOptions={zoomOptions}
                            onZoomChange={setZoom}
                            onPlayPause={playPause}
                            onRewind={rewind}
                            onForward={forward}
                            onAddClip={() => addTextClip(DEFAULT_CLIP_LENGTH)}
                            onRemoveClip={() =>
                                selectedId != null && removeTextClip(selectedId)
                            }
                        />
                    </div>

                    <div ref={timelineWrapRef} className="min-w-0 mt-2">
                        <Timeline
                            state={state}
                            pxPerSec={pxPerSec}
                            onSeek={seek}
                            onChangeTextClip={updateTextClip}
                            selectedTextClipId={selectedId!}
                            onSelectTextClip={select}
                            mediaElement={playerRef.current?.getVideoElement()}
                            segmentsRef={segmentsRef}
                            minDurationSec={timelineWidth / pxPerSec}
                            onSwapClip={swapTextClips}
                            addTextClipAt={addTextClipAt}
                        />
                    </div>
                </div>
            </div>
        </>
    )
};

export default Editor;