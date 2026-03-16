import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={`container page-enter ${styles.page}`}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.msg}>Esta página no existe</p>
      <Link to="/" className={styles.back}>← Volver al inicio</Link>
    </div>
  )
}
