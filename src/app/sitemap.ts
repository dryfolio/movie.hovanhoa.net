import { MetadataRoute } from 'next'
import { MOVIE_URL } from '@/constants'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: MOVIE_URL,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ]
}
