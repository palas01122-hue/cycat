import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, Tv, Star, Sparkles } from 'lucide-react'
import { useFetch } from '../../hooks/useFetch'
import { streamingAPI } from '../../services/api'
import MediaGrid from '../catalog/MediaGrid'
import styles from './StreamingSection.module.css'

const PLATFORMS = {
  netflix:   { name: 'Netflix',      color: '#e50914', bg: 'rgba(229,9,20,0.08)',    logo: 'N'  },
  disney:    { name: 'Disney+',      color: '#0063e5', bg: 'rgba(0,99,229,0.08)',    logo: 'D+' },
  prime:     { name: 'Prime Video',  color: '#00a8e1', bg: 'rgba(0,168,225,0.08)',   logo: 'P'  },
  apple:     { name: 'Apple TV+',    color: '#a2aaad', bg: 'rgba(162,170,173,0.08)', logo: '▶'  },
  hbo:       { name: 'Max',          color: '#9b6bff', bg: 'rgba(155,107,255,0.08)', logo: 'M'  },
  paramount: { name: 'Paramount+',   color: '#0064ff', bg: 'rgba(0,100,255,0.08)',   logo: 'P+' },
}

export default function StreamingSection({ provider }) {
  const [mode, setMode] = useState('best')
  const [type, setType] = useState('movie')

  const platform = PLATFORMS[provider]

  const { data, loading } = useFetch(
    () => mode === 'best'
      ? streamingAPI.getBest(provider, type)
      : streamingAPI.getNew(provider, type),
    [provider, mode, type]
  )

  const items = data?.results?.slice(0, 10) || []

  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45 }}
    >
      {/* Header */}
      <div className={styles.header} style={{ '--platform-color': platform.color, '--platform-bg': platform.bg }}>
        <div className={styles.platformBrand}>
          <motion.div
            className={styles.platformLogo}
            style={{ background: platform.color }}
            whileHover={{ scale: 1.08, rotate: -3 }}
            transition={{ duration: 0.2 }}
          >
            {platform.logo}
          </motion.div>
          <h2 className={styles.platformName}>{platform.name}</h2>
        </div>

        <div className={styles.controls}>
          {/* Tipo */}
          <div className={styles.typeTabs}>
            {[
              { key: 'movie', icon: <Film size={14} /> },
              { key: 'tv',    icon: <Tv size={14} />   },
            ].map(({ key, icon }) => (
              <motion.button
                key={key}
                className={type === key ? styles.typeActive : styles.typeBtn}
                onClick={() => setType(key)}
                style={type === key ? { '--c': platform.color } : {}}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              >
                {icon}
              </motion.button>
            ))}
          </div>

          {/* Modo */}
          <div className={styles.modeTabs}>
            {[
              { key: 'best', label: 'Lo mejor',   icon: <Star size={13} />     },
              { key: 'new',  label: 'Novedades',  icon: <Sparkles size={13} /> },
            ].map(({ key, label, icon }) => (
              <motion.button
                key={key}
                className={mode === key ? styles.modeActive : styles.modeBtn}
                onClick={() => setMode(key)}
                style={mode === key ? { '--c': platform.color } : {}}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              >
                {icon}{label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid con AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${mode}-${type}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <MediaGrid items={items} type={type} loading={loading} skeletonCount={10} />
        </motion.div>
      </AnimatePresence>
    </motion.section>
  )
}
