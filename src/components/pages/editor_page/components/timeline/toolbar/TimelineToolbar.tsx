import {ZoomSelector} from "./ZoomSelector.tsx";
import {PlaybackControls} from "./PlaybackControls.tsx";
import {ClipActions} from "@/components/pages/editor_page/components/timeline/toolbar/ClipActions.tsx";

interface Props {
    playing: boolean;
    currentTime: number;
    duration: number;
    zoom: number;
    zoomOptions: readonly { label: string; value: number }[];
    onZoomChange: (z: number) => void;
    onPlayPause: () => void;
    onRewind: () => void;
    onForward: () => void;

    onAddClip?: () => void;
    onRemoveClip?: () => void;
}

export default function TimelineToolbar({
                                            playing,
                                            currentTime,
                                            duration,
                                            zoom,
                                            zoomOptions,
                                            onZoomChange,
                                            onPlayPause,
                                            onRewind,
                                            onForward,
                                            onAddClip,
                                            onRemoveClip,
                                        }: Props) {
    return (
        <div className="
            w-full
            flex
            flex-col items-center space-y-2
            px-4 py-2
            md:flex-row md:items-center md:justify-between md:space-y-0
        ">
            <div className="shrink-0 w-full md:w-auto flex justify-center md:justify-start">
                <ClipActions
                    onAdd={onAddClip}
                    onRemove={onRemoveClip}
                />
            </div>

            <div className="shrink-0 w-full md:w-auto flex justify-center">
                <PlaybackControls
                    playing={playing}
                    currentTime={currentTime}
                    duration={duration}
                    onPlayPause={onPlayPause}
                    onRewind={onRewind}
                    onForward={onForward}
                />
            </div>

            <div className="shrink-0 w-full md:w-auto flex justify-center md:justify-end">
                <ZoomSelector
                    zoom={zoom}
                    options={zoomOptions}
                    onChange={onZoomChange}
                />
            </div>
        </div>
    );
}
