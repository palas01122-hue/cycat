import { test, expect } from '@playwright/test'

const API = 'http://localhost:3001/api'

test.describe('API Contract — Health', () => {
  test('GET /api/health devuelve 200 y status ok', async ({ request }) => {
    const res = await request.get(`${API}/health`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
    expect(body.service).toBe('CyCat API')
  })
})

test.describe('API Contract — Catálogo', () => {
  test('GET /api/catalog/trending/all/week devuelve resultados', async ({ request }) => {
    const res = await request.get(`${API}/catalog/trending/all/week`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('results')
    expect(Array.isArray(body.results)).toBe(true)
    expect(body.results.length).toBeGreaterThan(0)
  })

  test('GET /api/catalog/movies/popular devuelve películas', async ({ request }) => {
    const res = await request.get(`${API}/catalog/movies/popular`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.results[0]).toHaveProperty('title')
    expect(body.results[0]).toHaveProperty('poster_path')
  })

  test('GET /api/catalog/series/popular devuelve series', async ({ request }) => {
    const res = await request.get(`${API}/catalog/series/popular`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.results[0]).toHaveProperty('name')
  })

  test('GET /api/catalog/genres/movie devuelve géneros', async ({ request }) => {
    const res = await request.get(`${API}/catalog/genres/movie`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('genres')
    expect(body.genres.length).toBeGreaterThan(0)
    expect(body.genres[0]).toHaveProperty('id')
    expect(body.genres[0]).toHaveProperty('name')
  })
})

test.describe('API Contract — Detalle', () => {
  test('GET /api/detail/movie/:id devuelve ficha completa', async ({ request }) => {
    const res = await request.get(`${API}/detail/movie/278`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data).toHaveProperty('title')
    expect(body.data).toHaveProperty('overview')
    expect(body.data).toHaveProperty('vote_average')
    expect(body.data.id).toBe(278)
  })

  test('GET /api/detail/tv/:id devuelve ficha de serie', async ({ request }) => {
    const res = await request.get(`${API}/detail/tv/1396`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data).toHaveProperty('name')
    expect(body.data.id).toBe(1396)
  })

  test('GET /api/detail/movie/:id/credits devuelve reparto', async ({ request }) => {
    const res = await request.get(`${API}/detail/movie/278/credits`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data).toHaveProperty('cast')
    expect(Array.isArray(body.data.cast)).toBe(true)
  })
})

test.describe('API Contract — Search', () => {
  test('GET /api/search?q=batman devuelve resultados', async ({ request }) => {
    const res = await request.get(`${API}/search?q=batman`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('results')
    expect(body.results.length).toBeGreaterThan(0)
  })

  test('GET /api/search sin query devuelve array vacío', async ({ request }) => {
    const res = await request.get(`${API}/search`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.results).toEqual([])
  })
})

test.describe('API Contract — Auth', () => {
  test('POST /api/auth/register sin datos devuelve 400', async ({ request }) => {
    const res = await request.post(`${API}/auth/register`, { data: {} })
    expect(res.status()).toBe(400)
  })

  test('POST /api/auth/login con credenciales inválidas devuelve 401', async ({ request }) => {
    const res = await request.post(`${API}/auth/login`, {
      data: { email: 'noexiste@test.com', password: 'wrongpassword' }
    })
    expect(res.status()).toBe(401)
  })

  test('GET /api/auth/me sin token devuelve 401', async ({ request }) => {
    const res = await request.get(`${API}/auth/me`)
    expect(res.status()).toBe(401)
  })

  test('registro + login flujo completo', async ({ request }) => {
    const user = {
      username: `apitest_${Date.now()}`,
      email: `apitest_${Date.now()}@test.com`,
      password: 'ValidPass123!'
    }

    // Register
    const regRes = await request.post(`${API}/auth/register`, { data: user })
    expect(regRes.status()).toBe(201)
    const regBody = await regRes.json()
    expect(regBody).toHaveProperty('token')
    expect(regBody.user.username).toBe(user.username)

    // Login
    const loginRes = await request.post(`${API}/auth/login`, {
      data: { email: user.email, password: user.password }
    })
    expect(loginRes.status()).toBe(200)
    const loginBody = await loginRes.json()
    expect(loginBody).toHaveProperty('token')

    // Me (authenticated)
    const meRes = await request.get(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${loginBody.token}` }
    })
    expect(meRes.status()).toBe(200)
    const meBody = await meRes.json()
    expect(meBody.user.email).toBe(user.email)
  })
})
