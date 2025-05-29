interface TimeRulerMinorTickProps {
    leftPx: number;
}

export function TimeRulerMinorTick({ leftPx }: TimeRulerMinorTickProps) {
    return (
        <div className="absolute top-0" style={{ left: leftPx }}>
            <div className="h-1 w-px bg-muted-foreground/20" />
        </div>
    );
}
