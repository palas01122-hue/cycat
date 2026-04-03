import fetch from 'node-fetch'
import Anthropic from '@anthropic-ai/sdk'

const TMDB_API_KEY = process.env.TMDB_API_KEY
const IG_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
const IG_ID = process.env.INSTAGRAM_BUSINESS_ID
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

const TMDB_BASE = 'https://api.themoviedb.org/3'
const POSTER_BASE = 'https://image.tmdb.org/t/p/w780'

const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })

// Determina qué tipo de post hacer según el día
function getPostType() {
  const day = new Date().getDay()
  if (day === 1) return 'trending'    // Lunes
  if (day === 3) return 'mood'        // Miércoles
  if (day === 5) return 'curiosity'   // Viernes
  if (day === 0) return 'top5'        // Domingo
  return 'trending'
}

// Obtiene tendencias de TMDB
async function getTrending() {
  const res = await fetch(`${TMDB_BASE}/trending/movie/week?api_key=${TMDB_API_KEY}&language=es-AR`)
  const data = await res.json()
  return data.results.slice(0, 5)
}

// Obtiene una película random para curiosidad
async function getRandomMovie() {
  const page = Math.floor(Math.random() * 10) + 1
  const res = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}&language=es-AR&page=${page}`)
  const data = await res.json()
  const movie = data.results[Math.floor(Math.random() * data.results.length)]
  // Obtener detalles completos
  const detail = await fetch(`${TMDB_BASE}/movie/${movie.id}?api_key=${TMDB_API_KEY}&language=es-AR`)
  return await detail.json()
}

// Genera texto con Claude
async function generateCaption(type, data) {
  let prompt = ''

  if (type === 'trending') {
    const titles = data.map((m, i) => `${i + 1}. ${m.title}`).join('\n')
    prompt = `Generá una caption para Instagram sobre las 5 películas más vistas de la semana. 
Tono: entusiasta, cinéfilo, en español argentino. Máximo 150 palabras.
Incluí emojis relevantes y 5 hashtags de cine al final.
Las películas son:
${titles}`
  }

  if (type === 'curiosity') {
    prompt = `Generá un dato curioso e interesante sobre la película "${data.title}" (${data.release_date?.slice(0,4)}).
Tono: sorprendente, entretenido, en español argentino. Máximo 120 palabras.
Empezá con "¿Sabías que..." o similar.
Incluí emojis y 5 hashtags de cine al final.`
  }

  if (type === 'mood') {
    const genres = ['acción', 'comedia', 'terror', 'romance', 'ciencia ficción', 'thriller', 'drama']
    const genre = genres[Math.floor(Math.random() * genres.length)]
    prompt = `Generá una recomendación de película para ver si tenés ganas de ${genre}.
Recomendá una película conocida con una breve descripción de por qué es perfecta para ese mood.
Tono: amigable, en español argentino. Máximo 120 palabras.
Incluí emojis y 5 hashtags al final.`
  }

  if (type === 'top5') {
    const titles = data.map((m, i) => `${i + 1}. ${m.title} — ${m.vote_average?.toFixed(1)}/10`).join('\n')
    prompt = `Generá una caption para Instagram con el Top 5 de películas mejor rankeadas de la semana en CyCat (cycat.lat).
Tono: entusiasta, en español argentino. Máximo 150 palabras.
Mencioná que los rankings son de CyCat.lat
Incluí emojis y 5 hashtags al final.
Las películas son:
${titles}`
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  })

  return response.content[0].text
}

// Publica en Instagram
async function publishToInstagram(imageUrl, caption) {
  // Paso 1: Crear el contenedor de media
  const containerRes = await fetch(
    `https://graph.instagram.com/v21.0/${IG_ID}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: caption,
        access_token: IG_TOKEN
      })
    }
  )
  const container = await containerRes.json()
  console.log('Container:', container)

  if (!container.id) throw new Error('Error creando container: ' + JSON.stringify(container))

  // Esperar 5 segundos para que procese
  await new Promise(r => setTimeout(r, 5000))

  // Paso 2: Publicar
  const publishRes = await fetch(
    `https://graph.instagram.com/v21.0/${IG_ID}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: IG_TOKEN
      })
    }
  )
  const result = await publishRes.json()
  console.log('Publicado:', result)
  return result
}

// Main
async function main() {
  const type = process.env.POST_TYPE || getPostType()
  console.log(`Tipo de post: ${type}`)

  let imageUrl, caption, movies

  if (type === 'trending' || type === 'top5') {
    movies = await getTrending()
    imageUrl = `${POSTER_BASE}${movies[0].poster_path}`
    caption = await generateCaption(type, movies)
  } else if (type === 'curiosity' || type === 'mood') {
    const movie = await getRandomMovie()
    imageUrl = `${POSTER_BASE}${movie.poster_path}`
    caption = await generateCaption(type, movie)
  }

  console.log('Caption generada:', caption)
  console.log('Image URL:', imageUrl)

  await publishToInstagram(imageUrl, caption)
  console.log('✅ Post publicado exitosamente')
}

main().catch(console.error)
