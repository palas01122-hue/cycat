// ══════════════════════════════════════════════
//  CARRUSEL DEL HOME — editá este archivo para
//  cambiar los banners que aparecen en el inicio
// ══════════════════════════════════════════════

export const BANNERS = [
  {
    image: 'https://image.tmdb.org/t/p/original/qdIMHd4sEfJSckfVJfKQvisL02a.jpg',
    label: '📺 Última temporada',
    title: 'The Boys',
    subtitle: 'La serie más disruptiva llega a su fin. ¿Podrán los Boys detener a Homelander?',
    link: '/tv/76479',
    linkText: 'Ver ficha',
  },
  {
    image: 'https://image.tmdb.org/t/p/original/lXCbKGxn0bHuhSJB0CQHL5GFHmy.jpg',
    label: '🎬 En cartelera',
    title: 'El Drama',
    subtitle: 'Zendaya y Robert Pattinson. Una boda, un secreto, todo fuera de control.',
    link: '/movie/1325734',
    linkText: 'Ver ficha',
  },
  {
    image: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    label: '🚀 Estreno del año',
    title: 'Project Hail Mary',
    subtitle: 'Ryan Gosling en el espacio. Solo, sin memoria, con la misión de salvar la Tierra.',
    link: '/movie/687163',
    linkText: 'Ver ficha',
  },
]

// Tiempo entre slides en milisegundos
export const AUTOPLAY_INTERVAL = 5000