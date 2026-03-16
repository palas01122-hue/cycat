import { useFetch } from '../../hooks/useFetch'
import { discoverAPI } from '../../services/api'
import styles from './WatchProviders.module.css'

const PROVIDER_LOGOS = 'https://image.tmdb.org/t/p/original'

export default function WatchProviders({ type, id }) {
  const { data, loading } = useFetch(() => discoverAPI.providers(type, id), [type, id])

  if (loading) return null

  const providers = data?.providers
  if (!providers) return null

  const flatrate = providers.flatrate || []
  const rent     = providers.rent     || []
  const buy      = providers.buy      || []

  if (!flatrate.length && !rent.length && !buy.length) return null

  return (
    <div className={styles.wrap}>
      <h3 className={styles.title}>📺 Dónde verlo</h3>
      <div className={styles.groups}>
        {flatrate.length > 0 && (
          <div className={styles.group}>
            <span className={styles.groupLabel}>Incluido en</span>
            <div className={styles.logos}>
              {flatrate.map(p => (
                <ProviderLogo key={p.provider_id} provider={p} />
              ))}
            </div>
          </div>
        )}
        {rent.length > 0 && (
          <div className={styles.group}>
            <span className={styles.groupLabel}>Alquilar</span>
            <div className={styles.logos}>
              {rent.slice(0,5).map(p => (
                <ProviderLogo key={p.provider_id} provider={p} />
              ))}
            </div>
          </div>
        )}
        {buy.length > 0 && (
          <div className={styles.group}>
            <span className={styles.groupLabel}>Comprar</span>
            <div className={styles.logos}>
              {buy.slice(0,5).map(p => (
                <ProviderLogo key={p.provider_id} provider={p} />
              ))}
            </div>
          </div>
        )}
      </div>
      <p className={styles.source}>Datos de JustWatch</p>
    </div>
  )
}

function ProviderLogo({ provider }) {
  return (
    <div className={styles.logoWrap} title={provider.provider_name}>
      <img
        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
        alt={provider.provider_name}
        className={styles.logo}
        loading="lazy"
      />
    </div>
  )
}
