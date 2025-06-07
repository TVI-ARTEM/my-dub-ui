import {Button} from "@/components/ui/button";
import {Slider} from "@/components/ui/slider.tsx";
import {ZoomIn, ZoomOut} from "lucide-react";
import {useZoomController} from "@/hooks/timeline/toolbar/useZoomController.ts";
import {useMemo} from "react";

interface ZoomSelectorProps {
    zoom: number;
    options: readonly { label: string; value: number }[];
    onChange: (z: number) => void;
}

export function ZoomSelector({zoom, options, onChange}: ZoomSelectorProps) {
    const zoomValues = useMemo(() => options.map(o => o.value), [options]);

    const {
        index,
        zoomIn,
        zoomOut,
        onSliderChange,
        canZoomIn,
        canZoomOut
    } = useZoomController(zoomValues, zoom, onChange);

    return (
        <div className="flex items-center gap-2 max-w-full">
            <Button
                size="icon"
                variant="outline"
                disabled={!canZoomOut}
                onClick={zoomOut}
            >
                <ZoomOut className="h-4 w-4"/>
            </Button>

            <div className="mx-2">
                <Slider
                    value={[index]}
                    min={0}
                    max={zoomValues.length - 1}
                    step={1}
                    onValueChange={onSliderChange}
                    className="w-48"
                />
            </div>

            <Button
                size="icon"
                variant="outline"
                disabled={!canZoomIn}
                onClick={zoomIn}
            >
                <ZoomIn className="h-4 w-4"/>
            </Button>
        </div>
    );
}
