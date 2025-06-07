import {Button} from "@/components/ui/button.tsx";
import {FilePlus, Trash2} from "lucide-react";

interface ClipActionsProps {
    onAdd?: () => void;
    onRemove?: () => void;
}

export function ClipActions({
                                onAdd,
                                onRemove,
                            }: ClipActionsProps) {

    return (
        <div className="flex items-center gap-1">
            <Button
                size="icon"
                variant="outline"
                onClick={() => onAdd?.()}
            >
                <FilePlus className="h-5 w-5"/>
            </Button>

            <Button
                size="icon"
                variant="outline"
                onClick={() => onRemove?.()}
            >
                <Trash2 className="h-5 w-5"/>
            </Button>
        </div>
    );
}
