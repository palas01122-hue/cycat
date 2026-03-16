import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { streamingAPI } from '../../services/api'
import MediaGrid from '../catalog/MediaGrid'
import styles from './StreamingSection.module.css'

const PLATFORMS = {
  netflix:   { name: 'Netflix',      color: '#e50914', bg: 'rgba(229,9,20,0.08)',   logo: 'N' },
  disney:    { name: 'Disney+',      color: '#0063e5', bg: 'rgba(0,99,229,0.08)',   logo: 'D+' },
  prime:     { name: 'Prime Video',  color: '#00a8e1', bg: 'rgba(0,168,225,0.08)',  logo: 'P' },
  apple:     { name: 'Apple TV+',    color: '#a2aaad', bg: 'rgba(162,170,173,0.08)',logo: '▶' },
  hbo:       { name: 'Max',          color: '#9b6bff', bg: 'rgba(155,107,255,0.08)',logo: 'M' },
  paramount: { name: 'Paramount+',   color: '#0064ff', bg: 'rgba(0,100,255,0.08)',  logo: 'P+' },
}

export default function StreamingSection({ provider }) {
  const [mode, setMode]   = useState('best') // best | new
  const [type, setType]   = useState('movie')

  const platform = PLATFORMS[provider]

  const { data, loading } = useFetch(
    () => mode === 'best'
      ? streamingAPI.getBest(provider, type)
      : streamingAPI.getNew(provider, type),
    [provider, mode, type]
  )

  const items = data?.results?.slice(0, 10) || []

  return (
    <section className={styles.section}>
      {/* Header con branding de la plataforma */}
      <div className={styles.header} style={{ '--platform-color': platform.color, '--platform-bg': platform.bg }}>
        <div className={styles.platformBrand}>
          <div className={styles.platformLogo} style={{ background: platform.color }}>
            {platform.logo}
          </div>
          <h2 className={styles.platformName}>{platform.name}</h2>
        </div>

        <div className={styles.controls}>
          {/* Tipo */}
          <div className={styles.typeTabs}>
            <button
              className={type === 'movie' ? styles.typeActive : styles.typeBtn}
              onClick={() => setType('movie')}
              style={ type === 'movie' ? { '--c': platform.color } : {} }
            >🎬</button>
            <button
              className={type === 'tv' ? styles.typeActive : styles.typeBtn}
              onClick={() => setType('tv')}
              style={ type === 'tv' ? { '--c': platform.color } : {} }
            >📺</button>
          </div>

          {/* Modo */}
          <div className={styles.modeTabs}>
            <button
              className={mode === 'best' ? styles.modeActive : styles.modeBtn}
              onClick={() => setMode('best')}
              style={ mode === 'best' ? { '--c': platform.color } : {} }
            >
              ⭐ Lo mejor
            </button>
            <button
              className={mode === 'new' ? styles.modeActive : styles.modeBtn}
              onClick={() => setMode('new')}
              style={ mode === 'new' ? { '--c': platform.color } : {} }
            >
              🆕 Novedades
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <MediaGrid items={items} type={type} loading={loading} skeletonCount={10} />
    </section>
  )
}
