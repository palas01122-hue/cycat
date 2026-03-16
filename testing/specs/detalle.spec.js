import { test, expect } from '@playwright/test'

// Usamos una película conocida de TMDB (The Shawshank Redemption)
const KNOWN_MOVIE_ID = 278
const KNOWN_TV_ID    = 1396 // Breaking Bad

test.describe('Detalle de Película', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/movie/${KNOWN_MOVIE_ID}`)
    await page.getByTestId('detail-page').waitFor({ timeout: 12000 })
  })

  test('muestra el contenedor de detalle', async ({ page }) => {
    await expect(page.getByTestId('detail-page')).toBeVisible()
  })

  test('muestra el título de la película', async ({ page }) => {
    // Sección de heading debe existir
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
    const text = await heading.textContent()
    expect(text?.length).toBeGreaterThan(0)
  })

  test('muestra el poster', async ({ page }) => {
    const poster = page.locator('img[alt*="Poster"]').first()
    await expect(poster).toBeVisible()
  })

  test('muestra el rating de TMDB', async ({ page }) => {
    await expect(page.getByText('TMDB')).toBeVisible()
  })

  test('muestra la sinopsis', async ({ page }) => {
    // El overview debe tener contenido
    const overview = page.locator('p').filter({ hasText: /[A-Za-z]{20,}/ }).first()
    await expect(overview).toBeVisible()
  })

  test('muestra el reparto', async ({ page }) => {
    await expect(page.getByText('Reparto')).toBeVisible()
    const castPhotos = page.locator('img[alt]').nth(2) // after backdrop and poster
    await expect(castPhotos).toBeVisible({ timeout: 8000 })
  })

  test('muestra películas similares', async ({ page }) => {
    await expect(page.getByText('Contenido similar')).toBeVisible({ timeout: 8000 })
  })

  test('el botón de calificar redirige a login si no está autenticado', async ({ page }) => {
    const ratingPrompt = page.getByText('Iniciá sesión')
    await expect(ratingPrompt).toBeVisible()
    await ratingPrompt.click()
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Detalle de Serie', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/tv/${KNOWN_TV_ID}`)
    await page.getByTestId('detail-page').waitFor({ timeout: 12000 })
  })

  test('muestra el badge "Serie"', async ({ page }) => {
    await expect(page.locator('text=Serie').first()).toBeVisible()
  })

  test('muestra información de la serie', async ({ page }) => {
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
  })
})

test.describe('Detalle — Navegación', () => {
  test('desde catálogo a detalle y de vuelta', async ({ page }) => {
    await page.goto('/movies')
    await page.getByTestId('media-card').first().waitFor({ timeout: 10000 })
    await page.getByTestId('media-card').first().click()
    await expect(page).toHaveURL(/\/movie\/\d+/)
    await page.goBack()
    await expect(page).toHaveURL('/movies')
  })
})
