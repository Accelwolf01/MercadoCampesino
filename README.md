# MercadoCampesino Frontend

Angular 19 standalone + Leaflet.

## Requisitos

- Node.js 18+
- Backend corriendo en `http://localhost:8000`

## Ejecutar

```bash
cd frontend
ng serve --port 4200
```

## URLs

- Frontend: http://localhost:4200
- Backend API: http://localhost:8000
- Swagger: http://localhost:8000/docs

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio / Landing page |
| `/login` | Inicio de sesión |
| `/register` | Registro de usuario (requiere verificación admin) |
| `/mapa` | Mapa con campesinos activos (requiere auth) |
| `/admin` | Panel admin: verificar usuarios pendientes |
| `/pending` | Pendiente de verificación |

## Estructura

```
src/
├── app/
│   ├── components/navbar/     # Barra de navegación
│   ├── guards/                # Route guards (auth, admin)
│   ├── pages/
│   │   ├── home/              # Landing page
│   │   ├── login/             # Login
│   │   ├── register/          # Registro
│   │   ├── mapa/              # Mapa Leaflet
│   │   ├── admin/             # Admin dashboard
│   │   └── pending/           # Pending verification
│   └── services/              # Auth, API services
└── environments/              # API URL config
```
