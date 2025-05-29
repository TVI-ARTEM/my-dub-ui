import {useRef} from "react";
import {Segment, TimelineState, VideoPlayerHandle} from "@/types/types.ts";
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
        swapTextClips
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
                        <div className="min-h-0 items-center justify-start">
                            <Card className="h-full max-h-[40vh] w-full md:w-auto">
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

                        <ClipInfoPanel
                            clip={state.textClips.find((c) => c.id === selectedId)}
                            minStart={minStart}
                            maxEnd={maxEnd}
                            fileDuration={
                                segmentsRef.current.find((s) => s.id === selectedId)
                                    ?.audioElement?.duration ?? null
                            }
                            onChange={updateTextClip}
                        />
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
                        />
                    </div>
                </div>
            </div>
        </>
    )
};

export default Editor;