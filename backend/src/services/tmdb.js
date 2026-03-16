import axios from 'axios'

const tmdb = axios.create({
  baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.TMDB_API_KEY,
    language: 'es-AR',
  },
  timeout: 8000,
})

// ── Catalog ───────────────────────────────────
export async function getTrending(mediaType = 'all', timeWindow = 'week') {
  const res = await tmdb.get(`/trending/${mediaType}/${timeWindow}`)
  return res.data
}

export async function getPopularMovies(page = 1) {
  const res = await tmdb.get('/movie/popular', { params: { page } })
  return res.data
}

export async function getPopularSeries(page = 1) {
  const res = await tmdb.get('/tv/popular', { params: { page } })
  return res.data
}

export async function getTopRated(type = 'movie', page = 1) {
  const res = await tmdb.get(`/${type}/top_rated`, { params: { page } })
  return res.data
}

export async function getByGenre(type, genreId, page = 1) {
  const res = await tmdb.get(`/discover/${type}`, {
    params: { with_genres: genreId, page, sort_by: 'popularity.desc' }
  })
  return res.data
}

export async function getGenres(type = 'movie') {
  const res = await tmdb.get(`/genre/${type}/list`)
  return res.data
}

// ── Detail ────────────────────────────────────
export async function getMovieDetail(id) {
  const res = await tmdb.get(`/movie/${id}`, {
    params: { append_to_response: 'videos,images' }
  })
  return res.data
}

export async function getSeriesDetail(id) {
  const res = await tmdb.get(`/tv/${id}`, {
    params: { append_to_response: 'videos,images' }
  })
  return res.data
}

export async function getCredits(type, id) {
  const res = await tmdb.get(`/${type}/${id}/credits`)
  return res.data
}

export async function getVideos(type, id) {
  const res = await tmdb.get(`/${type}/${id}/videos`)
  return res.data
}

export async function getSimilar(type, id) {
  const res = await tmdb.get(`/${type}/${id}/similar`)
  return res.data
}

// ── Search ────────────────────────────────────
export async function searchMulti(query, page = 1) {
  const res = await tmdb.get('/search/multi', { params: { query, page } })
  return res.data
}

export async function searchByType(query, type, page = 1) {
  const res = await tmdb.get(`/search/${type}`, { params: { query, page } })
  return res.data
}

export default tmdb

// Discover with optional year filter
export async function discoverByYear(type, year, page = 1) {
  const params = { page, sort_by: 'vote_average.desc', 'vote_count.gte': 100 }
  if (year) {
    if (type === 'movie') { params.primary_release_year = year }
    else { params.first_air_date_year = year }
  }
  const res = await tmdb.get(`/discover/${type}`, { params })
  return res.data
}

// Contenido por proveedor de streaming
// IDs de TMDB para Argentina (region=AR)
export async function getByProvider(type, providerId, sortBy = 'vote_average.desc', page = 1) {
  const res = await tmdb.get(`/discover/${type}`, {
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
