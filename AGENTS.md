# Normas para el agente

- **Idioma**: Siempre debes hablar en español con el usuario. Piensa y razona en español antes de responder o ejecutar cualquier acción.
- **Propósito**: Este proyecto es MercadoCampesino, una plataforma web (Angular + FastAPI + PostgreSQL) para conectar campesinos de Cundinamarca con consumidores de Bogotá.

## Goal
- Desarrollar **MercadoCampesino**, plataforma web (Angular + FastAPI + PostgreSQL) que conecta campesinos de Cundinamarca con consumidores de Bogotá, con preórdenes, mapa en tiempo real, ofertas flash y reseñas mutuas — proyecto de grado "Trabajo de Grado 3" CUN Bogotá

## Constraints & Preferences
- **Pagos NO en plataforma** — directo entre campesino y consumidor
- **Chat con admin** — chat widget con sesión anónima vía UUID, polling 4s, badge de pendientes
- **Sin chat entre pares** — solo reseñas públicas entre campesino y consumidor
- **Seguridad**: bcrypt directo (sin passlib 1.7.4), JWT, permisos por perfil
- **Control de fraude**: penalización por no-retiro, verificación admin con foto de cédula
- **Parametrizable**: configuración del sistema desde GUI admin/superadmin
- **Base normalizada**: 3NF, sin triggers
- **Ubicación flexible**: campesino marca punto en mapa, puede actualizar durante el día
- **Registro requiere verificación admin** — todos los usuarios nuevos inactivos hasta aprobación
- **Idioma**: todo en español (incluido AGENTS.md)
- **Sin variables de entorno**: todas las credenciales van hardcodeadas como defaults en `config.py` (Supabase: `aws-1-us-west-2.pooler.supabase.com`, user: `postgres.bfpxpvophaixbvvluxaq`, pass: `bXo76SLW1sozXDmY`). El `.env` es solo para desarrollo local y está en `.gitignore`.
- **Push automático de fixes**: no esperar aprobación para subir fixes a los repos. Si hay un error de compilación o runtime, fixear y pushear inmediatamente.
- **Sin crear ramas nuevas**: todo cambio va directo a `main`. No crear ramas `master`, `develop` u otras.
- **Pull antes de cambios**: siempre hacer `git pull` en ambos repos antes de empezar a trabajar, para evitar conflictos.
- **Verificar push**: siempre verificar que el push se haya completado correctamente revisando `git log --oneline origin/main -3` tras cada push.

## Progress
### Done
- **Backend**: 14 modelos ORM, 13 routers con 63+ endpoints, auth JWT + bcrypt directo, sistema de permisos
- **SQL**: schema completo con `producto_fotos`, `foto_url` en `viaje_ubicaciones`, hash bcrypt correcto
- **Frontend Angular**: todos los componentes de página creados (campesino, home, login, register, pending, admin, consumidor, superadmin, mapa, viaje)
- **Campesino**: pestaña "Mis productos" con CRUD (agregar/eliminar), selector de categorías, foto base64 via file input, vista en grid
- **Home**: banner de ofertas flash con tarjetas (imagen, descuento, precios, ubicación), mensaje "No hay ofertas activas" cuando vacío
- **Login**: formulario con redirección por perfil
- **Register**: formulario con selección campesino/consumidor, redirección a pending
- **Admin**: pestañas Usuarios (buscar, verificar, bloquear, reset pass) y Categorías (agregar, activar/desactivar)
- **Superadmin**: pestaña Perfiles y permisos con checkboxes para toggle permisos por perfil
- **Mapa**: Leaflet con marcadores personalizados 🌽, popups con productos/precios/fotos
- **Navbar**: gradiente rojo, texto amarillo, enlaces según perfil (superadmin ve todos)
- **Estilos globales**: paleta rojo+amarillo, CSS variables, diseño responsivo
- **Productos con dueño**: modelo Producto ahora tiene `id_creador` nullable FK a usuarios — admin crea productos globales (sin creador), campesinos crean sus propios productos (con su id como creador)
- **Permisos por perfil**: endpoints `POST /perfiles/{id}/permisos` y `DELETE /perfiles/{id}/permisos/{permiso_id}` para toggle desde superadmin
- **Compilación**: frontend build exitoso, backend routers verificados sintácticamente
- **Login con signals**: error y cargando convertidos a signals para detección de cambios automática
- **Modal de error en login**: mensajes 403 aparecen como modal con botón "Aceptar" que recarga la página
- **Footer con recomendación MercadoPago**: sugerencia no obligatoria de usar plataformas de pago protegido
- **Eliminado `provideBrowserGlobalErrorListeners()`**: interfería con propagación de errores RxJS
- **Simplificado auth.service**: eliminado `tap` operator, token guardado en callback del componente
- **app.config simplificado**: `provideHttpClient()` sin `withInterceptorsFromDi()`

### In Progress
- (ninguno)

### Blocked
- (ninguno)

## Documento de Trabajo de Grado (`trabajo_grado_completo.html`)
- **Alcances**: se aclaró que el chat no usa IA por ser proyecto gratuito, pero la arquitectura Python permitiría integrar LLM a futuro (chat automático, recomendaciones, predicción de demanda)
- **Antecedentes**: se expandió con análisis detallado de Mercado Libre (sistema de reputación que inspiró las reseñas mutuas), Rappi, Didi Food, OLX, Facebook Marketplace, Farmers Market Online y La Ruche qui dit Oui
- **Diagramas de flujo**: se agregaron 4 diagramas con Mermaid.js (registro y verificación, creación de viaje y preórdenes, reseñas y calificaciones, ofertas flash), renderizados con tema dark mediante CDN
- **Login con signals**: se documentó el manejo de errores HTTP 403 con signals y modal popup
- **Recomendación MercadoPago**: se agregó al footer y al documento la sugerencia no obligatoria de pagos protegidos

## Key Decisions
- **bcrypt directo** en lugar de passlib (passlib 1.7.4 incompatible con bcrypt 4.1.3 en Python 3.14)
- **Todos los usuarios requieren verificación admin** — `activo=false` + `verificado_por_admin=false` al registrar
- **Usuarios bloqueados pueden login pero tienen cero permisos** (perfil "bloqueado" sin permisos)
- **Componentes Angular standalone** sin NgModules, sintaxis `@if`/`@for` (Angular 19+)
- **API directa** (`http://localhost:8000`) sin proxy config
- **Paleta rojo+amarillo** — rojo (#c62828), amarillo (#fdd835), crema (#fff8e1)
- **Fotos como base64 en DB** en lugar de URLs — campesinos no saben manejar URLs
- **Productos con dueño** (`id_creador`) — campesinos gestionan su propio catálogo
- **Admin resuelve problemas** — gestiona usuarios, categorías, moderación, reportes
- **Superadmin desarrollador** — acceso total, permisos, perfiles, config del sistema
- **Login con cédula** en lugar de correo — los campesinos no manejan email pero todos tienen cédula
- **Email opcional** en registro — se permite duplicado o vacío, sin unique constraint en DB

## Next Steps
1. Enriquecer componente Consumidor (ver productos, dejar reseñas, preórdenes)
2. Enriquecer componente Campesino (viajes, ofertas flash)
3. Probar flujo completo: registro → verificación admin → login → crear producto → crear viaje
4. Sembrar datos de prueba con ofertas para ver banner funcionando
5. Probar backend corriendo con `uvicorn app.main:app`

## Rechazo de registros
- Cuando el admin rechaza, ya no se borra al usuario de la BD — se marca `rechazado=True` con `motivo_rechazo`
- Al intentar login, el rechazado ve: *"Tu solicitud de registro fue rechazada. Por favor regístrate nuevamente. Asegúrate de que la foto de tu cédula tenga la mejor calidad posible."*
- Admin tiene pestaña "Rechazados" con lista, puede eliminar definitivamente si lo desea
- Al re-registrarse con la misma cédula, se actualizan los datos del registro rechazado (reutiliza el registro existente)

## Critical Context
- Backend: `http://localhost:8000` (Swagger en `/docs`)
- Frontend: `http://localhost:4200`
- DB: host=localhost, db=MercadoCampesino, user=postgres, password=*
- Superadmin: `superadmin@mercadocampesino.co` / `SuperAdmin2026!`
- Python 3.14, bcrypt 4.1.3, pydantic 2.13.4
- Angular 19+ standalone, Leaflet, FormsModule
- Perfiles: 1=superadmin, 2=admin, 3=campesino, 4=consumidor, 5=bloqueado
- IDs de permisos: `verificar_usuarios`=1, `gestionar_categorias`=2, `gestionar_perfiles`=3, `gestionar_permisos`=4, `ver_reportes`=5, `gestionar_config`=6

## Relevant Files
- `backend/app/models.py` — ORM models
- `backend/app/schemas.py` — Pydantic schemas
- `backend/app/routers/productos.py` — productos router (mis-productos, POST, PUT, DELETE)
- `backend/app/routers/perfiles.py` — perfiles router (incluye POST/DELETE permisos)
- `backend/bd/init.sql` — schema DDL con datos de prueba (campesino, consumidor, productos, viaje, ofertas)
- `frontend/src/app/pages/campesino/campesino.ts` — campesino con pestaña Mis productos
- `frontend/src/app/pages/home/home.ts` — home con banner de ofertas flash
- `frontend/src/app/pages/admin/admin.ts` — admin con usuarios y categorías
- `frontend/src/app/pages/superadmin/superadmin.ts` — superadmin con toggle permisos
- `frontend/src/app/pages/mapa/mapa.ts` — mapa Leaflet con marcadores personalizados
- `frontend/src/app/components/navbar/navbar.ts` — navbar con navegación por perfil
- `frontend/src/styles.css` — variables globales rojo/amarillo
- `frontend/src/index.html` — lang="es", charset="utf-8"
