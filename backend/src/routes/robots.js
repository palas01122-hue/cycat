// REGISTRAR EN backend/src/index.js:
// import robotsRoutes from './routes/robots.js'
// app.use('/', robotsRoutes)  // sin prefijo /api/ porque es /robots.txt

import { Router } from 'express'

const router = Router()

router.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send(`User-agent: *
Allow: /
Disallow: /profile
Disallow: /diary
Disallow: /lists
Disallow: /api/

Sitemap: https://cycat.lat/sitemap.xml`)
})

export default router
