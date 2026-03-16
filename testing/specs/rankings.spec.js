import { test, expect } from '@playwright/test'

test.describe('Rankings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/rankings')
  })

  test('muestra la página de Rankings', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Rankings CyCat' })).toBeVisible()
  })

  test('muestra sección de Top Películas', async ({ page }) => {
    await expect(page.getByText('Top Películas')).toBeVisible()
  })

  test('muestra sección de Top Series', async ({ page }) => {
    await expect(page.getByText('Top Series')).toBeVisible()
  })

  test('el link de Rankings en la navbar funciona', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Rankings' }).click()
    await expect(page).toHaveURL('/rankings')
  })
})

test.describe('StarRating — Calificación', () => {
  test('el usuario no autenticado ve prompt de login en detalle', async ({ page }) => {
    await page.goto('/movie/278')
    await page.getByTestId('detail-page').waitFor({ timeout: 12000 })
    await expect(page.getByText('Iniciá sesión')).toBeVisible()
  })
})
