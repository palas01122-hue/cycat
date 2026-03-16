import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cycat_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cycat_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Catalog ──────────────────────────────────────
export const catalogAPI = {
  getTrending:     (mediaType = 'all', timeWindow = 'week') => api.get(`/catalog/trending/${mediaType}/${timeWindow}`),
  getPopularMovies:(page = 1)           => api.get('/catalog/movies/popular', { params: { page } }),
  getPopularSeries:(page = 1)           => api.get('/catalog/series/popular', { params: { page } }),
  getTopRated:     (type = 'movie', page = 1) => api.get(`/catalog/${type}/top-rated`, { params: { page } }),
  getByGenre:      (type, genreId, page = 1)  => api.get(`/catalog/${type}/genre/${genreId}`, { params: { page } }),
  getGenres:       (type = 'movie')     => api.get(`/catalog/genres/${type}`),
}

// ── Detail ───────────────────────────────────────
export const detailAPI = {
  getMovie:   (id)       => api.get(`/detail/movie/${id}`),
  getSeries:  (id)       => api.get(`/detail/tv/${id}`),
  getCredits: (type, id) => api.get(`/detail/${type}/${id}/credits`),
  getVideos:  (type, id) => api.get(`/detail/${type}/${id}/videos`),
  getSimilar: (type, id) => api.get(`/detail/${type}/${id}/similar`),
}

// ── Search ───────────────────────────────────────
export const searchAPI = {
  search:       (query, page = 1) => api.get('/search', { params: { q: query, page } }),
  searchByType: (query, type, page = 1) => api.get(`/search/${type}`, { params: { q: query, page } }),
}

// ── Auth ─────────────────────────────────────────
export const authAPI = {
  login:      (email, password)            => api.post('/auth/login', { email, password }),
  register:   (username, email, password)  => api.post('/auth/register', { username, email, password }),
  logout:     ()                           => api.post('/auth/logout'),
  getProfile: ()                           => api.get('/auth/me'),
}

// ── Rankings ─────────────────────────────────────
export const rankingsAPI = {
  rate:          (type, id, score, title, poster_path) => api.post('/rankings/rate', { type, contentId: id, score, title, poster_path }),
  getRating:     (type, id)        => api.get(`/rankings/rating/${type}/${id}`),
  getTopRanked:  (type = 'movie', page = 1) => api.get(`/rankings/top/${type}`, { params: { page } }),
  getUserRatings:()                => api.get('/rankings/user/ratings'),
}

// ── Favorites ────────────────────────────────────
export const favoritesAPI = {
  getAll:          ()                                          => api.get('/favorites'),
  add:             (contentId, type, title, poster_path)      => api.post('/favorites', { contentId, type, title, poster_path }),
  remove:          (type, id)                                  => api.delete(`/favorites/${type}/${id}`),
  check:           (type, id)                                  => api.get(`/favorites/check/${type}/${id}`),
  getWatchlist:    ()                                          => api.get('/favorites/watchlist'),
  addWatchlist:    (contentId, type, title, poster_path)      => api.post('/favorites/watchlist', { contentId, type, title, poster_path }),
  removeWatchlist: (type, id)                                  => api.delete(`/favorites/watchlist/${type}/${id}`),
  checkWatchlist:  (type, id)                                  => api.get(`/favorites/watchlist/check/${type}/${id}`),
}

// ── Profile ──────────────────────────────────────
export const profileAPI = {
  get:    ()     => api.get('/profile'),
  update: (data) => api.patch('/profile', data),
}

export default api

// ── Reviews ──────────────────────────────────────
export const reviewsAPI = {
  getForContent: (type, id)                    => api.get(`/reviews/${type}/${id}`),
  create:        (type, id, body, spoiler, title, poster_path) =>
                   api.post(`/reviews/${type}/${id}`, { body, contains_spoiler: spoiler, title, poster_path }),
  delete:        (type, id)                    => api.delete(`/reviews/${type}/${id}`),
  like:          (reviewId)                    => api.post(`/reviews/${reviewId}/like`),
  getMine:       ()                            => api.get('/reviews/user/mine'),
}

// ── Stats ────────────────────────────────────────
export const statsAPI = {
  getMyStats:       ()                          => api.get('/stats/me'),
  getRankingByYear: (year, type = 'movie', page = 1) => api.get(`/stats/rankings/year/${year}`, { params: { type, page } }),
  getRankingByGenre:(genreId, type = 'movie', page = 1) => api.get(`/stats/rankings/genre/${genreId}`, { params: { type, page } }),
}

// ── Discover ─────────────────────────────────────
export const discoverAPI = {
  random:          (params)        => api.get('/discover/random', { params }),
  recommendations: (type)          => api.get('/discover/recommendations', { params: { type } }),
  providers:       (type, id)      => api.get(`/discover/providers/${type}/${id}`),
}

// ── Diary ─────────────────────────────────────────
export const diaryAPI = {
  getAll:   (params)  => api.get('/diary', { params }),
  add:      (data)    => api.post('/diary', data),
  delete:   (id)      => api.delete(`/diary/${id}`),
  getStats: ()        => api.get('/diary/stats'),
}

// ── Lists ─────────────────────────────────────────
export const listsAPI = {
  getPublic:   ()          => api.get('/lists/public'),
  getMine:     ()          => api.get('/lists/mine'),
  getById:     (id)        => api.get(`/lists/${id}`),
  create:      (data)      => api.post('/lists', data),
  update:      (id, data)  => api.patch(`/lists/${id}`, data),
  delete:      (id)        => api.delete(`/lists/${id}`),
  addItem:     (id, data)  => api.post(`/lists/${id}/items`, data),
  removeItem:  (id, cid)   => api.delete(`/lists/${id}/items/${cid}`),
}

// ── Search Advanced ───────────────────────────────
export const searchAdvancedAPI = {
  search: (params) => api.get('/search/advanced', { params }),
}

// ── Streaming ─────────────────────────────────────
export const streamingAPI = {
  getBest: (provider, type = 'movie') => api.get(`/streaming/${provider}/best`, { params: { type } }),
  getNew:  (provider, type = 'movie') => api.get(`/streaming/${provider}/new`,  { params: { type } }),
}
