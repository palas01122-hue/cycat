import { useState, useEffect, useRef } from 'react'

export function useFetch(fetchFn, deps = []) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const abortRef              = useRef(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchFn()
      .then(res => {
        if (!cancelled) setData(res.data)
      })
      .catch(err => {
        if (!cancelled) setError(err.response?.data?.message || err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}

export function usePaginatedFetch(fetchFn, deps = []) {
  const [items, setItems]     = useState([])
  const [page, setPage]       = useState(1)
  const [totalPages, setTotal]= useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setItems([])
    setPage(1)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetchFn(page)
      .then(res => {
        if (!cancelled) {
          setItems(prev => page === 1 ? res.data.results : [...prev, ...res.data.results])
          setTotal(res.data.total_pages || 1)
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.response?.data?.message || err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, ...deps])

  const loadMore = () => {
    if (page < totalPages && !loading) setPage(p => p + 1)
  }

  const hasMore = page < totalPages

  return { items, loading, error, loadMore, hasMore, page }
}
