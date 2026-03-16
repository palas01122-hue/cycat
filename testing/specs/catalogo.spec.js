import { test, expect } from '@playwright/test'

test.describe('Catálogo — Películas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/movies')
  })

  test('muestra el heading de Películas', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Películas' })).toBeVisible()
  })

  test('renderiza la grilla de películas con tarjetas', async ({ page }) => {
    const grid = page.getByTestId('media-grid')
    await expect(grid).toBeVisible()

    // Espera que carguen tarjetas reales (no skeletons)
    await expect(page.getByTestId('media-card').first()).toBeVisible({ timeout: 10000 })
    const cards = await page.getByTestId('media-card').count()
    expect(cards).toBeGreaterThan(0)
  })

  test('los filtros de género están presentes', async ({ page }) => {
    await page.waitForSelector('button:has-text("Todos")')
    const todosBtn = page.getByRole('button', { name: 'Todos' })
    await expect(todosBtn).toBeVisible()
  })

  test('puede cambiar a top-rated', async ({ page }) => {
    const topBtn = page.getByRole('button', { name: 'Mejor valoradas' })
    await topBtn.click()
    // Verifica que siga mostrando tarjetas
    await expect(page.getByTestId('media-card').first()).toBeVisible({ timeout: 10000 })
  })

  test('tiene botón de cargar más', async ({ page }) => {
    const loadMore = page.getByTestId('load-more-btn')
    await expect(loadMore).toBeVisible({ timeout: 10000 })
    await loadMore.click()
    await page.waitForLoadState('networkidle')
    const cards = await page.getByTestId('media-card').count()
    expect(cards).toBeGreaterThan(20)
  })

  test('navega al detalle al clickear una tarjeta', async ({ page }) => {
    await page.getByTestId('media-card').first().click()
    await expect(page).toHaveURL(/\/(movie|tv)\/\d+/)
    await expect(page.getByTestId('detail-page')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Catálogo — Series', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/series')
  })

  test('muestra el heading de Series', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Series' })).toBeVisible()
  })

  test('renderiza tarjetas con badge "Serie"', async ({ page }) => {
    await page.waitForSelector('[data-testid="media-card"]', { timeout: 10000 })
    // Las tarjetas de series tienen el badge visible
    await expect(page.locator('text=Serie').first()).toBeVisible()
  })
})

test.describe('Catálogo — Home', () => {
  test('muestra sección de tendencias', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Tendencias de la semana')).toBeVisible()
    await expect(page.getByTestId('media-card').first()).toBeVisible({ timeout: 12000 })
  })

  test('muestra sección de mejor valoradas', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Mejor valoradas')).toBeVisible()
  })

  test('el hero tiene CTAs funcionales', async ({ page }) => {
    await page.goto('/')
    const exploreBtn = page.getByRole('link', { name: 'Explorar catálogo' })
    await expect(exploreBtn).toBeVisible()
    await exploreBtn.click()
    await expect(page).toHaveURL('/catalog')
  })
})
