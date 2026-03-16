import { test, expect } from '@playwright/test'

const TEST_USER = {
  username: `tester_${Date.now()}`,
  email:    `tester_${Date.now()}@cycat.test`,
  password: 'TestPassword123!',
}

test.describe('Autenticación — Registro', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('muestra el formulario de registro', async ({ page }) => {
    await expect(page.getByTestId('register-form')).toBeVisible()
    await expect(page.getByLabel('Usuario')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()
  })

  test('muestra error con contraseña corta', async ({ page }) => {
    await page.getByLabel('Usuario').fill('testuser')
    await page.getByLabel('Email').fill('test@test.com')
    await page.getByLabel('Contraseña').fill('123')
    await page.getByTestId('register-submit').click()
    // HTML5 validation or server error
    await expect(page.locator('input:invalid, .error')).toBeVisible()
  })

  test('registra un usuario nuevo exitosamente', async ({ page }) => {
    await page.getByLabel('Usuario').fill(TEST_USER.username)
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Contraseña').fill(TEST_USER.password)
    await page.getByTestId('register-submit').click()

    // Debe redirigir al home tras registro exitoso
    await expect(page).toHaveURL('/', { timeout: 8000 })
  })

  test('tiene link hacia login', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: 'Iniciá sesión' })
    await expect(loginLink).toBeVisible()
    await loginLink.click()
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Autenticación — Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('muestra el formulario de login', async ({ page }) => {
    await expect(page.getByTestId('login-form')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()
  })

  test('muestra error con credenciales incorrectas', async ({ page }) => {
    await page.getByLabel('Email').fill('no_existe@cycat.test')
    await page.getByLabel('Contraseña').fill('WrongPassword123')
    await page.getByTestId('login-submit').click()
    await expect(page.locator('[class*="error"]')).toBeVisible({ timeout: 5000 })
  })

  test('tiene link hacia registro', async ({ page }) => {
    const regLink = page.getByRole('link', { name: 'Registrate' })
    await expect(regLink).toBeVisible()
  })
})

test.describe('Autenticación — Navbar', () => {
  test('muestra botones de login y registro cuando no está autenticado', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Registrarse' })).toBeVisible()
  })

  test('el botón Entrar navega a /login', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Entrar' }).click()
    await expect(page).toHaveURL('/login')
  })
})
