import { MOVIE_URL } from '@/constants'
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
            },
        ],
        sitemap: `${MOVIE_URL}/sitemap.xml`,
        host: MOVIE_URL,
    }
}
