import type { FranchiseState } from '@/data/movies'

const STYLES: Record<FranchiseState, { label: string; cls: string }> = {
    complete: {
        label: 'All caught up',
        cls: 'bg-[var(--rd-label-pine)] text-[var(--rd-label-pine-fg)]',
    },
    watching: {
        label: 'Watching',
        cls: 'bg-[var(--rd-label-plum)] text-[var(--rd-label-plum-fg)]',
    },
    queued: {
        label: 'Not started',
        cls: 'bg-[var(--rd-label-slate)] text-[var(--rd-label-slate-fg)]',
    },
}

// StatusPill — small muted label for a franchise's watch progress.
export function StatusPill({ state }: { state: FranchiseState }) {
    const s = STYLES[state]
    return (
        <span
            className={`inline-flex shrink-0 items-center rounded-full px-[0.45rem] py-[0.1rem] text-[0.68rem] font-medium leading-[1.4] ${s.cls}`}
        >
            {s.label}
        </span>
    )
}

export default StatusPill
