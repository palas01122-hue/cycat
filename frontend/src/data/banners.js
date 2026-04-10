// ══════════════════════════════════════════════
//  CARRUSEL DEL HOME — editá este archivo para
//  cambiar los banners que aparecen en el inicio
// ══════════════════════════════════════════════
//
// Cada banner tiene:
//   image   → URL de la imagen (podés usar cualquier URL externa o /images/nombre.jpg si subís al proyecto)
//   title   → Título grande
//   subtitle→ Texto chico debajo del título (opcional, podés dejarlo vacío "")
//   label   → Etiqueta pequeña arriba del título (opcional)
//   link    → A dónde va cuando hacen click (ruta interna o URL)
//   linkText→ Texto del botón
//
// ¡Podés agregar, quitar o reordenar banners como quieras!

export const BANNERS = [
  {
    image: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    label: '🔥 Estreno de la semana',
    title: 'Avatar: Fuego y ceniza',
    subtitle: 'La saga continúa. Disponible para calificar en CyCat.',
    link: '/movie/83533',
    linkText: 'Ver ficha',
  },
  {
    image: 'https://image.tmdb.org/t/p/original/qdIMHd4sEfJSckfVJfKQvisL02a.jpg',
    label: '🏆 Top valorada',
    title: 'The Boys — Temporada 4',
    subtitle: 'La serie más disruptiva de Amazon Prime.',
    link: '/tv/76479',
    linkText: 'Ver ficha',
  },
  {
    image: 'https://image.tmdb.org/t/p/original/tmU7GeKVPlSoOL3gR69kFRUvHKH.jpg',
    label: '📺 Serie destacada',
    title: 'Adolescence',
    subtitle: 'El fenómeno de Netflix que todos están viendo.',
    link: '/tv/262252',
    linkText: 'Ver ficha',
  },
]

// Tiempo entre slides (en milisegundos). 5000 = 5 segundos
export const AUTOPLAY_INTERVAL = 5000
