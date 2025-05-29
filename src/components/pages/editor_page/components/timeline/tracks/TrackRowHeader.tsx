interface TrackRowHeaderProps {
    label: string;
    rowHeight: number;
}

export function TrackRowHeader({ label, rowHeight }: TrackRowHeaderProps) {
    return (
        <div
            className="flex items-center gap-2 w-32 shrink-0 pr-3 pl-2 border-r border-muted-foreground/10 select-none"
            style={{ height: rowHeight }}
        >
            <span className="font-semibold whitespace-nowrap">{label}</span>
        </div>
    );
}
