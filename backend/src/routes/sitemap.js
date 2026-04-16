// REGISTRAR EN backend/src/index.js:
// import sitemapRoutes from './routes/sitemap.js'
// app.use('/', sitemapRoutes)  // sin prefijo /api/ porque es /sitemap.xml

import { Router } from 'express'

const router = Router()

const staticPages = [
  { loc: 'https://cycat.lat/', changefreq: 'daily', priority: '1.0' },
  { loc: 'https://cycat.lat/catalog', changefreq: 'daily', priority: '0.9' },
  { loc: 'https://cycat.lat/movies', changefreq: 'daily', priority: '0.9' },
  { loc: 'https://cycat.lat/series', changefreq: 'daily', priority: '0.9' },
  { loc: 'https://cycat.lat/rankings', changefreq: 'weekly', priority: '0.8' },
  { loc: 'https://cycat.lat/what-to-watch', changefreq: 'weekly', priority: '0.8' },
  { loc: 'https://cycat.lat/calendar', changefreq: 'daily', priority: '0.7' },
  { loc: 'https://cycat.lat/marathon', changefreq: 'weekly', priority: '0.7' },
  { loc: 'https://cycat.lat/streaming', changefreq: 'weekly', priority: '0.7' },
]

router.get('/sitemap.xml', (req, res) => {
  const urls = staticPages.map(page => `
  <url>
    <loc>${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.send(xml)
})

export default router
