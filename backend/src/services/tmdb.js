import axios from 'axios'

// Idiomas soportados por TMDB
const SUPPORTED_LANGS = [
  'es', 'en', 'pt', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'ru', 'ar', 'tr', 'nl', 'pl', 'sv'
]

// Mapeo de región por idioma para resultados más relevantes
const LANG_REGION = {
  'es': 'es-AR',
  'en': 'en-US',
  'pt': 'pt-BR',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'it': 'it-IT',
  'ja': 'ja-JP',
  'ko': 'ko-KR',
  'zh': 'zh-CN',
  'ru': 'ru-RU',
  'ar': 'ar-SA',
  'tr': 'tr-TR',
  'nl': 'nl-NL',
  'pl': 'pl-PL',
  'sv': 'sv-SE',
}

// Parsea el header Accept-Language y devuelve el código TMDB
export function getLangFromHeader(acceptLanguage) {
  if (!acceptLanguage) return 'es-AR'
  const langs = acceptLanguage
    .split(',')
    .map(l => l.split(';')[0].trim().toLowerCase())
  for (const lang of langs) {
    const code = lang.split('-')[0]
    if (SUPPORTED_LANGS.includes(code)) {
      return LANG_REGION[code] || `${code}-${code.toUpperCase()}`
    }
  }
  return 'es-AR'
}

const tmdb = axios.create({
  baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.TMDB_API_KEY,
    language: 'es-AR',
  },
  timeout: 8000,
})

// Crea una instancia de tmdb con el idioma del request
export function tmdbWithLang(lang = 'es-AR') {
  return axios.create({
    baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    params: {
      api_key: process.env.TMDB_API_KEY,
      language: lang,
    },
    timeout: 8000,
  })
}

// ── Catalog ───────────────────────────────────
export async function getTrending(mediaType = 'all', timeWindow = 'week', lang) {
  const client = lang ? tmdbWithLang(lang) : tmdb
  const res = await client.get(`/trending/${mediaType}/${timeWindow}`)
  return res.data
}

export async function getPopularMovies(page = 1, lang) {
  const client = lang ? tmdbWithLang(lang) : tmdb
  const res = await client.get('/movie/popular', { params: { page } })
  return res.data
}

export async function getPopularSeries(page = 1, lang) {
  const client = lang ? tmdbWithLang(lang) : tmdb
  const res = await client.get('/tv/popular', { params: { page } })
  return res.data
}

export async function getTopRated(type = 'movie', page = 1, lang) {
  const client = lang ? tmdbWithLang(lang) : tmdb
  const res = await client.get(`/${type}/top_rated`, { params: { page } })
  return res.data
}

export async function getByGenre(type, genreId, page = 1, lang) {
  const client = lang ? tmdbWithLang(lang) : tmdb
  const res = await client.get(`/discover/${type}`, {
    params: { with_genres: genreId, page, sort_by: 'popularity.desc' }
  })
  return res.data
}

export async function getGenres(type = 'movie', lang) {
  const client = lang ? tmdbWithLang(lang) : tmdb
  const res = await client.get(`/genre/${type}/list`)
  return res.data
}

// ── Detail ────────────────────────────────────
export async function getMovieDetail(id, lang) {
  const client = lang ? tmdbWithLang(lang) : tmdb
  const res = await client.get(`/movie/${id}`, {
    params: { append_to_response: 'videos,images' }
  })
  return res.data
}

export async function getSeriesDetail(id, lang) {
  const client = lang ? tmdbWithLang(lang) : tmdb
  const res = await client.get(`/tv/${id}`, {
    params: { append_to_response: 'videos,images' }
  })
  return res.data
}

export async function getCredits(type, id, lang) {
  const client = lang ? tmdbWithLang(lang) : tmdb
  const res = await client.get(`/${type}/${id}/credits`)
  return res.data
}

export async function getVideos(type, id, lang) {
  const client = lang ? tmdbWithLang(lang) : tmdb
  const res = await client.get(`/${type}/${id}/videos`)
  return res.data
}

export async function getSimilar(type, id, lang) {
  const client = lang ? tmdbWithLang(lang) : tmdb
  const res = await client.get(`/${type}/${id}/similar`)
  return res.data
}

// ── Person ────────────────────────────────────
export async function getPersonDetail(id, lang) {
  const client = lang ? tmdbWithLang(lang) : tmdb
  const res = await client.get(`/person/${id}`, {
    params: { append_to_response: 'movie_credits,tv_credits,images' }
  })
  return res.data
}

// ── Search ────────────────────────────────────
export async function searchMulti(query, page = 1, lang) {
  const client = lang ? tmdbWithLang(lang) : tmdb
  const res = await client.get('/search/multi', { params: { query, page } })
  return res.data
}

export async function searchByType(query, type, page = 1, lang) {
  const client = lang ? tmdbWithLang(lang) : tmdb
  const res = await client.get(`/search/${type}`, { params: { query, page } })
  return res.data
}

export default tmdb

// Discover with optional year filter
export async function discoverByYear(type, year, page = 1, lang) {
  const client = lang ? tmdbWithLang(lang) : tmdb
  const params = { page, sort_by: 'vote_average.desc', 'vote_count.gte': 100 }
  if (year) {
    if (type === 'movie') { params.primary_release_year = year }
    else { params.first_air_date_year = year }
  }
  const res = await client.get(`/discover/${type}`, { params })
  return res.data
}

// Contenido por proveedor de streaming
export async function getByProvider(type, providerId, sortBy = 'vote_average.desc', page = 1, lang) {
  const client = lang ? tmdbWithLang(lang) : tmdb
  const res = await client.get(`/discover/${type}`, {
    params: {
      with_watch_providers: providerId,
      watch_region: 'AR',
      sort_by: sortBy,
      'vote_count.gte': sortBy.includes('vote') ? 50 : 0,
      page,
    }
  })
  return res.data
}