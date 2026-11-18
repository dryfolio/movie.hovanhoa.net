import { FRANCHISES, TOTALS } from '@/data/movies'
import { FULL_NAME, MOVIE_URL } from '@/constants'

export async function GET() {
    const lines: string[] = [
        `# ${FULL_NAME} | movie`,
        '',
        `A watch log of the film franchises ${FULL_NAME} follows, every entry in release order. ${TOTALS.watched} of ${TOTALS.released} released entries watched. ${MOVIE_URL}`,
        '',
    ]

    for (const f of FRANCHISES) {
        lines.push(`## ${f.title} (${f.watched}/${f.released} watched)`)
        for (const e of f.entries) {
            const mark = e.status === 'watched' ? 'x' : ' '
            const extra = [
                e.year,
                e.kind !== 'film' ? e.kind : '',
                e.status === 'upcoming' ? 'not released yet' : '',
            ]
                .filter(Boolean)
                .join(', ')
            lines.push(`- [${mark}] ${e.title}${extra ? ` (${extra})` : ''}`)
        }
        lines.push('')
    }

    return new Response(lines.join('\n'), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
}
