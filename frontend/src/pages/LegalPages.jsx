import styles from './LegalPage.module.css'

export function TermsPage() {
  return (
    <div className={`container page-enter ${styles.page}`}>
      <div className={styles.doc}>
        <div className={styles.docHeader}>
          <span className={styles.docType}>Legal</span>
          <h1 className={styles.docTitle}>Términos de Uso</h1>
          <p className={styles.docDate}>Última actualización: {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <Section title="1. Aceptación de los términos">
          Al acceder y usar CyCat ("el Servicio"), aceptás estos Términos de Uso en su totalidad.
          Si no estás de acuerdo con alguna parte de estos términos, no podés usar el Servicio.
          CyCat es un proyecto personal sin fines de lucro en etapa de desarrollo.
        </Section>

        <Section title="2. Descripción del Servicio">
          CyCat es una plataforma de catálogo de películas y series que permite a los usuarios:
          <ul>
            <li>Explorar información sobre películas y series</li>
            <li>Calificar y reseñar contenido audiovisual</li>
            <li>Crear listas personales y un diario de vistas</li>
            <li>Descubrir contenido disponible en plataformas de streaming</li>
          </ul>
          CyCat no distribuye, reproduce ni aloja contenido audiovisual protegido por derechos de autor.
          Solo mostramos información y metadatos sobre dicho contenido.
        </Section>

        <Section title="3. Fuentes de datos y atribución">
          La información sobre películas y series (títulos, sinopsis, reparto, imágenes, ratings)
          es provista por <strong>The Movie Database (TMDB)</strong> a través de su API pública.
          Este producto usa la API de TMDB pero no está respaldado ni certificado por TMDB.
          <br /><br />
          Los posters, imágenes y materiales gráficos son propiedad de sus respectivos titulares
          (estudios, distribuidoras, productoras). Su uso en CyCat se realiza únicamente con fines
          informativos y referenciales, al amparo de los términos de uso de TMDB.
          <br /><br />
          La información sobre disponibilidad en plataformas de streaming es provista por TMDB
          con datos de JustWatch y puede no estar actualizada en tiempo real.
        </Section>

        <Section title="4. Cuentas de usuario">
          Para acceder a ciertas funciones (calificaciones, reseñas, listas) necesitás crear una cuenta.
          Sos responsable de:
          <ul>
            <li>Mantener la confidencialidad de tu contraseña</li>
            <li>Toda la actividad que ocurra bajo tu cuenta</li>
            <li>Notificarnos inmediatamente si sospechás uso no autorizado</li>
          </ul>
          Nos reservamos el derecho de suspender cuentas que violen estos términos.
        </Section>

        <Section title="5. Contenido generado por usuarios">
          Las reseñas, calificaciones y listas que publicás son de tu propiedad.
          Al publicarlas, nos otorgás una licencia no exclusiva para mostrarlas en el Servicio.
          Te comprometés a no publicar contenido que sea:
          <ul>
            <li>Ilegal, difamatorio o que viole derechos de terceros</li>
            <li>Spam, publicidad no autorizada o contenido malicioso</li>
            <li>Spoilers sin la debida advertencia</li>
            <li>Material que viole derechos de autor o propiedad intelectual</li>
          </ul>
        </Section>

        <Section title="6. Limitación de responsabilidad">
          CyCat se provee "tal como está". No garantizamos que el Servicio sea ininterrumpido,
          libre de errores o que la información sea completamente precisa o actualizada.
          No somos responsables por decisiones tomadas basándose en la información del Servicio.
        </Section>

        <Section title="7. Modificaciones">
          Podemos modificar estos términos en cualquier momento. Los cambios importantes
          serán notificados a los usuarios registrados. El uso continuado del Servicio
          implica la aceptación de los nuevos términos.
        </Section>

        <Section title="8. Contacto">
          Para consultas sobre estos términos, podés contactarnos a través del Servicio.
        </Section>
      </div>
    </div>
  )
}

export function PrivacyPage() {
  return (
    <div className={`container page-enter ${styles.page}`}>
      <div className={styles.doc}>
        <div className={styles.docHeader}>
          <span className={styles.docType}>Legal</span>
          <h1 className={styles.docTitle}>Política de Privacidad</h1>
          <p className={styles.docDate}>Última actualización: {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <Section title="1. Información que recopilamos">
          <strong>Al registrarte con email:</strong>
          <ul>
            <li>Nombre de usuario</li>
            <li>Dirección de email</li>
            <li>Contraseña (almacenada de forma encriptada, nunca en texto plano)</li>
          </ul>
          <strong>Al registrarte con Google:</strong>
          <ul>
            <li>Nombre y foto de perfil públicos de tu cuenta Google</li>
            <li>Dirección de email</li>
            <li>No accedemos a tu contraseña de Google ni a otros datos de tu cuenta</li>
          </ul>
          <strong>Al usar el Servicio:</strong>
          <ul>
            <li>Calificaciones y reseñas que publicás</li>
            <li>Listas y diario de vistas que creás</li>
            <li>Favoritos y contenido en tu lista</li>
          </ul>
        </Section>

        <Section title="2. Cómo usamos tu información">
          Usamos tu información únicamente para:
          <ul>
            <li>Proveer y mantener el Servicio</li>
            <li>Personalizar tu experiencia (recomendaciones, estadísticas)</li>
            <li>Mostrarte tu historial y actividad dentro de CyCat</li>
            <li>Enviarte comunicaciones relacionadas con el Servicio (solo si lo autorizás)</li>
          </ul>
          <strong>No vendemos, alquilamos ni compartimos tus datos personales con terceros
          con fines comerciales.</strong>
        </Section>

        <Section title="3. Almacenamiento de datos">
          Tus datos se almacenan en servidores seguros. Las contraseñas se encriptan
          con bcrypt (salt 12 rondas) y nunca son almacenadas en texto plano.
          Los tokens de sesión (JWT) tienen vencimiento de 7 días.
        </Section>

        <Section title="4. Cookies y almacenamiento local">
          Usamos localStorage del navegador para mantener tu sesión iniciada.
          No usamos cookies de rastreo ni de publicidad de terceros.
        </Section>

        <Section title="5. Servicios de terceros">
          <strong>Google OAuth:</strong> Si iniciás sesión con Google, tu autenticación
          es procesada por Google. Consultá la Política de Privacidad de Google para
          más información sobre cómo manejan tus datos.
          <br /><br />
          <strong>TMDB:</strong> Las búsquedas e imágenes se realizan a través de la API de TMDB.
          Consultá la política de privacidad de TMDB en themoviedb.org.
        </Section>

        <Section title="6. Tus derechos">
          Tenés derecho a:
          <ul>
            <li><strong>Acceder</strong> a tus datos personales almacenados</li>
            <li><strong>Corregir</strong> información incorrecta</li>
            <li><strong>Eliminar</strong> tu cuenta y todos tus datos</li>
            <li><strong>Exportar</strong> tus calificaciones y listas</li>
          </ul>
          Para ejercer estos derechos, contactanos a través del Servicio.
        </Section>

        <Section title="7. Menores de edad">
          CyCat no está dirigido a menores de 13 años. No recopilamos intencionalmente
          datos de menores. Si sos menor de 13 años, no uses el Servicio.
        </Section>

        <Section title="8. Cambios a esta política">
          Podemos actualizar esta política ocasionalmente. Te notificaremos sobre
          cambios significativos por email o mediante un aviso en el Servicio.
        </Section>

        <Section title="9. Ley aplicable">
          Esta política se rige por las leyes de la República Argentina,
          incluyendo la Ley 25.326 de Protección de Datos Personales.
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  )
}

export default TermsPage
