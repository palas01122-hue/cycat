import { useFetch } from '../../hooks/useFetch'
import { discoverAPI } from '../../services/api'
import styles from './WatchProviders.module.css'

const AFFILIATE_LINKS = {
  9:    'https://www.amazon.com/gp/video/primesignup?tag=cycat-movie-20',
  350:  'https://apple.co/3CyCat',
  337:  'https://www.disneyplus.com/?cid=DTCI-Affiliate-cycat',
  384:  'https://www.max.com',
  1899: 'https://www.max.com',
  531:  'https://www.paramountplus.com/?ftag=PPM-88-10aaa0b',
  386:  'https://www.peacocktv.com',
  11:   'https://mubi.com/en/us',
}

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
              {rent.slice(0, 5).map(p => (
                <ProviderLogo key={p.provider_id} provider={p} />
              ))}
            </div>
          </div>
        )}
        {buy.length > 0 && (
          <div className={styles.group}>
            <span className={styles.groupLabel}>Comprar</span>
            <div className={styles.logos}>
              {buy.slice(0, 5).map(p => (
                <ProviderLogo key={p.provider_id} provider={p} />
              ))}
            </div>
          </div>
        )}
      </div>
      <p className={styles.disclaimer}>
        📺 Datos de JustWatch · Algunos links son de afiliado{' '}
        <span
          className={styles.tooltipIcon}
          title="Si comprás o te suscribís a través de estos links, CyCat recibe una pequeña comisión sin costo extra para vos."
        >
          ℹ️
        </span>
      </p>
    </div>
  )
}

function ProviderLogo({ provider }) {
  const href = AFFILIATE_LINKS[provider.provider_id]
  const img = (
    <div className={styles.logoWrap} title={`Ver en ${provider.provider_name}`}>
      <img
        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
        alt={provider.provider_name}
        className={styles.logo}
        loading="lazy"
      />
    </div>
  )

  if (href) {
    return (
      <a
        className={styles.logoLink}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Ver en ${provider.provider_name}`}
      >
        {img}
      </a>
    )
  }

  return img
}
