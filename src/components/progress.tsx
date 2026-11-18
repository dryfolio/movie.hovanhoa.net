// Progress — hairline track with an accent fill; the one place the accent
// shows up as a graph highlight on this site.
export function Progress({
    value,
    total,
    className = '',
}: {
    value: number
    total: number
    className?: string
}) {
    const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0
    return (
        <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={value}
            className={`h-[3px] w-full overflow-hidden rounded-full bg-[var(--rd-line)] ${className}`}
        >
            <div
                className="h-full rounded-full bg-[var(--rd-accent)]"
                style={{ width: `${pct}%` }}
            />
        </div>
    )
}

export default Progress
