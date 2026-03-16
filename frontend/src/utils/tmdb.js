const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export const POSTER_SIZES = {
  sm:     'w185',
  md:     'w342',
  lg:     'w500',
  xl:     'w780',
  original: 'original',
}

export const BACKDROP_SIZES = {
  sm:     'w300',
  md:     'w780',
  lg:     'w1280',
  original: 'original',
}

export const PROFILE_SIZES = {
  sm:  'w45',
  md:  'w185',
  lg:  'h632',
}

export function getPosterUrl(path, size = 'md') {
  if (!path) return '/placeholder-poster.svg'
  return `${TMDB_IMAGE_BASE}/${POSTER_SIZES[size]}${path}`
}

export function getBackdropUrl(path, size = 'lg') {
  if (!path) return '/placeholder-backdrop.svg'
  return `${TMDB_IMAGE_BASE}/${BACKDROP_SIZES[size]}${path}`
}

export function getProfileUrl(path, size = 'md') {
  if (!path) return '/placeholder-profile.svg'
  return `${TMDB_IMAGE_BASE}/${PROFILE_SIZES[size]}${path}`
}

export function formatRating(vote) {
  if (!vote || vote === 0) return '—'
  return (Math.round(vote * 10) / 10).toFixed(1)
}

export function formatYear(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).getFullYear()
}

export function formatRuntime(minutes) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function getRatingColor(rating) {
  if (rating >= 7.5) return '#2ecc71'
  if (rating >= 6.0) return '#e8a020'
  if (rating >= 4.0) return '#e67e22'
  return '#c0392b'
}
