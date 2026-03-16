import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { listsAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { getPosterUrl } from '../utils/tmdb'
import styles from './ListsPage.module.css'

export default function ListsPage() {
  const { isAuthenticated } = useAuth()
  const [tab, setTab]         = useState('public')
  const [showCreate, setCreate] = useState(false)
  const [name, setName]       = useState('')
  const [desc, setDesc]       = useState('')
  const [isPublic, setPublic] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [refresh, setRefresh] = useState(0)
  const navigate = useNavigate()

  const { data: publicData, loading: lp } = useFetch(() => listsAPI.getPublic(), [refresh])
  const { data: mineData,   loading: lm } = useFetch(
    () => isAuthenticated ? listsAPI.getMine() : Promise.resolve({ data: { lists: [] } }),
    [isAuthenticated, refresh]
  )

  const publicLists = publicData?.lists || []
  const mineLists   = mineData?.lists   || []

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await listsAPI.create({ name, description: desc, is_public: isPublic })
      setCreate(false); setName(''); setDesc('')
      setRefresh(r => r + 1)
      navigate(`/lists/${res.data.id}`)
    } catch {}
    setSaving(false)
  }

  return (
    <div className={`container page-enter ${styles.page}`}>
      <div className={styles.header}>
        <div>
          <h1 className="heading-lg">📋 Listas</h1>
          <p className={styles.sub}>Listas temáticas creadas por la comunidad</p>
        </div>
        {isAuthenticated && (
          <button className={styles.createBtn} onClick={() => setCreate(true)}>
            + Nueva lista
          </button>
        )}
      </div>

      {/* Modal crear lista */}
      {showCreate && (
        <div className={styles.modal} onClick={() => setCreate(false)}>
          <form className={styles.modalCard} onSubmit={handleCreate} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Nueva lista</h2>
            <div className={styles.field}>
              <label>Nombre</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Las mejores de los 90s" required maxLength={80} />
            </div>
            <div className={styles.field}>
              <label>Descripción (opcional)</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="De qué trata esta lista..." rows={3} maxLength={300} />
            </div>
            <label className={styles.publicCheck}>
              <input type="checkbox" checked={isPublic} onChange={e => setPublic(e.target.checked)} />
              <span>Lista pública (visible para todos)</span>
            </label>
            <div className={styles.modalBtns}>
              <button type="button" onClick={() => setCreate(false)} className={styles.cancelBtn}>Cancelar</button>
              <button type="submit" disabled={saving} className={styles.saveBtn}>{saving ? 'Creando...' : 'Crear lista'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={tab === 'public' ? styles.activeTab : styles.tab} onClick={() => setTab('public')}>🌍 Públicas</button>
        {isAuthenticated && <button className={tab === 'mine' ? styles.activeTab : styles.tab} onClick={() => setTab('mine')}>👤 Mis listas</button>}
      </div>

      {/* Lista de listas */}
      {tab === 'public' && (
        <ListGrid lists={publicLists} loading={lp} />
      )}
      {tab === 'mine' && (
        <ListGrid lists={mineLists} loading={lm} mine onRefresh={() => setRefresh(r => r + 1)} />
      )}
    </div>
  )
}

function ListGrid({ lists, loading, mine, onRefresh }) {
  if (loading) return <div className={styles.loading}>Cargando listas...</div>
  if (!lists.length) return (
    <div className={styles.empty}>
      {mine ? 'No tenés listas todavía. ¡Creá la primera!' : 'No hay listas públicas todavía.'}
    </div>
  )

  return (
    <div className={styles.grid}>
      {lists.map(list => (
        <ListCard key={list.id} list={list} mine={mine} onRefresh={onRefresh} />
      ))}
    </div>
  )
}

function ListCard({ list, mine, onRefresh }) {
  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta lista?')) return
    await listsAPI.delete(list.id)
    onRefresh?.()
  }

  return (
    <div className={styles.listCard}>
      <Link to={`/lists/${list.id}`} className={styles.listLink}>
        <div className={styles.listCover}>
          {list.cover ? (
            <img src={getPosterUrl(list.cover, 'sm')} alt={list.name} className={styles.coverImg} />
          ) : (
            <div className={styles.coverPlaceholder}>📋</div>
          )}
        </div>
        <div className={styles.listInfo}>
          <h3 className={styles.listName}>{list.name}</h3>
          {list.description && <p className={styles.listDesc}>{list.description}</p>}
          <div className={styles.listMeta}>
            <span className={styles.itemCount}>{list.item_count} {list.item_count === 1 ? 'título' : 'títulos'}</span>
            {list.username && <span className={styles.listAuthor}>por {list.username}</span>}
            {!list.is_public && <span className={styles.privateBadge}>🔒 Privada</span>}
          </div>
        </div>
      </Link>
      {mine && (
        <button onClick={handleDelete} className={styles.deleteBtn} title="Eliminar lista">✕</button>
      )}
    </div>
  )
}
