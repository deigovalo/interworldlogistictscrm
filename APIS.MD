# Documentación de APIs

Este documento detalla los endpoints de la API disponibles, incluyendo ejemplos de peticiones y respuestas en JSON.

## Autenticación

### 1. Iniciar Sesión (`/api/auth/login`)
Inicia sesión de usuario y establece la cookie de sesión.

- **Método:** `POST`
- **Endpoint:** `/api/auth/login`
- **Acceso:** Público

**Request Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Iniciaste sesión exitosamente",
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "usuario"
  }
}
```

### 2. Cerrar Sesión (`/api/auth/logout`)
Cierra la sesión del usuario.

- **Método:** `POST`
- **Endpoint:** `/api/auth/logout`
- **Acceso:** Público (requiere cookie)

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

### 3. Registro (`/api/auth/register`)
Registra un nuevo usuario en el sistema.

- **Método:** `POST`
- **Endpoint:** `/api/auth/register`
- **Acceso:** Público

**Request Body (JSON):**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "company_name": "Company Inc",
  "phone": "1234567890",
  "email": "user@example.com",
  "password": "Password123!",
  "confirm_password": "Password123!"
}
```

**Response (201 Created):**
```json
{
  "message": "Usuario registrado. Por favor verifica tu email.",
  "email": "user@example.com"
}
```

### 4. Obtener Usuario Actual (`/api/auth/me`)
Obtiene la información del usuario autenticado.

- **Método:** `GET`
- **Endpoint:** `/api/auth/me`
- **Acceso:** Usuario Autenticado

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "usuario"
  }
}
```

### 5. Reenviar Verificación (`/api/auth/resend-verification`)
Reenvía el correo de verificación de cuenta.

- **Método:** `POST`
- **Endpoint:** `/api/auth/resend-verification`
- **Acceso:** Público

**Request Body (JSON):**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Correo de verificación reenviado exitosamente"
}
```

### 6. Verificar Email (`/api/auth/verify-email`)
Verifica el email mediante un token.

- **Método:** `GET`
- **Endpoint:** `/api/auth/verify-email`
- **Acceso:** Público
- **Query Params:** `?token=xyz...`

**Response:**
Redirecciona a `/auth/login?verified=true` o devuelve JSON de error.

---

## Cotizaciones

### 1. Obtener Mis Cotizaciones (`/api/quotes`)
Obtiene las cotizaciones del usuario actual.

- **Método:** `GET`
- **Endpoint:** `/api/quotes`
- **Acceso:** Usuario Autenticado

**Response (200 OK):**
```json
[
  {
    "id": "uuid-1",
    "numero_cotizacion": "COT-001",
    "estado": "pendiente",
    "created_at": "2024-01-01T10:00:00Z",
    "total": 500
  },
  {
    "id": "uuid-2",
    "numero_cotizacion": "COT-002",
    "estado": "aprobado",
    "created_at": "2024-01-02T15:30:00Z",
    "total": 1200
  }
]
```

### 2. Crear Cotización (`/api/quotes`)
Crea una nueva solicitud de cotización.

- **Método:** `POST`
- **Endpoint:** `/api/quotes`
- **Acceso:** Usuario Autenticado

**Request Body (JSON):**
```json
{
  "items": [
    {
      "producto": "Carga General",
      "descripcion": "Electrónicos",
      "peso": 500,
      "volumen": 2.5
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": "uuid-new",
  "numero_cotizacion": "COT-003",
  "estado": "pendiente",
  "created_at": "2024-12-15T12:00:00Z"
}
```

### 3. Actualizar Cliente (`/api/quotes/[id]`)
Actualiza información del cliente asociada a la cotización.

- **Método:** `PUT`
- **Endpoint:** `/api/quotes/[id]`
- **Acceso:** Usuario Autenticado

**Response (200 OK):**
```json
{
  "id": "uuid-1",
  "mensaje": "Información actualizada correctamente"
}
```

---

## Transporte

### 1. Actualizar Transporte (`/api/admin/cotizaciones/[id]/transport`)
Agrega una actualización de estado de transporte.

- **Método:** `POST`
- **Endpoint:** `/api/admin/cotizaciones/[id]/transport`
- **Acceso:** Administrador

**Request Body (JSON):**
```json
{
  "estado": "En Tránsito",
  "descripcion": "Salió del puerto de origen",
  "ubicacion": "Miami, FL"
}
```

**Response (201 Created):**
```json
{
  "id": "trans-1",
  "cotizacion_id": "uuid-1",
  "estado": "En Tránsito",
  "descripcion": "Salió del puerto de origen",
  "ubicacion": "Miami, FL",
  "created_at": "2024-12-15T12:05:00Z"
}
```

---

## Administración

### 1. Obtener Usuarios (`/api/admin/users`)
Lista de todos los usuarios registrados.

- **Método:** `GET`
- **Endpoint:** `/api/admin/users`
- **Acceso:** Administrador

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "role": "usuario",
    "status": "activo"
  },
  {
    "id": 2,
    "first_name": "Admin",
    "last_name": "User",
    "email": "admin@example.com",
    "role": "admin",
    "status": "activo"
  }
]
```

### 2. Crear Usuario (`/api/admin/users`)
Crea un usuario manualmente.

- **Método:** `POST`
- **Endpoint:** `/api/admin/users`
- **Acceso:** Administrador

**Request Body (JSON):**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "company_name": "Logistics Co",
  "phone": "555-0123",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "role": "usuario"
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "email": "jane@example.com",
  "message": "Usuario creado exitosamente"
}
```

### 3. Actualizar Usuario (`/api/admin/users/[id]`)
Edita datos de un usuario.

- **Método:** `PUT`
- **Endpoint:** `/api/admin/users/[id]`
- **Acceso:** Administrador

**Request Body (JSON):**
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "role": "admin"
}
```

**Response (200 OK):**
```json
{
  "id": 3,
  "first_name": "Jane",
  "last_name": "Doe",
  "role": "admin"
}
```

### 4. Desactivar Usuario (`/api/admin/users/[id]`)
Desactiva una cuenta de usuario.

- **Método:** `DELETE`
- **Endpoint:** `/api/admin/users/[id]`
- **Acceso:** Administrador

**Response (200 OK):**
```json
{
  "message": "Usuario desactivado exitosamente"
}
```

### 5. Obtener Todas las Cotizaciones (`/api/admin/cotizaciones`)
Lista todas las cotizaciones del sistema.

- **Método:** `GET`
- **Endpoint:** `/api/admin/cotizaciones`
- **Acceso:** Administrador

**Response (200 OK):**
```json
[
  {
    "id": "uuid-1",
    "cliente": "John Doe",
    "empresa": "Company Inc",
    "numero_cotizacion": "COT-001",
    "estado": "pendiente",
    "fecha": "2024-01-01"
  }
]
```

### 6. Actualizar Estado Cotización (`/api/admin/cotizaciones/[id]`)
Cambia el estado (ej. de pendiente a aprobado).

- **Método:** `PUT`
- **Endpoint:** `/api/admin/cotizaciones/[id]`
- **Acceso:** Administrador

**Request Body (JSON):**
```json
{
  "estado": "aprobado"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid-1",
  "estado": "aprobado",
  "updated_at": "2024-12-15T12:10:00Z"
}
```

---

## Dashboard y Reportes

### 1. Estadísticas Admin (`/api/dashboard/admin-stats`)
Métricas generales para el panel administrativo.

- **Método:** `GET`
- **Endpoint:** `/api/dashboard/admin-stats`
- **Acceso:** Administrador

**Response (200 OK):**
```json
{
  "totalUsers": 150,
  "totalQuotes": 45,
  "monthlyRevenue": 25000,
  "activeShipments": 12
}
```

### 2. Reportes Admin (`/api/dashboard/admin-reports`)
Datos para gráficos de reportes.

- **Método:** `GET`
- **Endpoint:** `/api/dashboard/admin-reports`
- **Acceso:** Administrador

**Response (200 OK):**
```json
{
  "salesByMonth": [
    { "month": "Jan", "sales": 4000 },
    { "month": "Feb", "sales": 3000 }
  ],
  "topClients": [
    { "name": "Company A", "volume": 10000 },
    { "name": "Company B", "volume": 8000 }
  ]
}
```

### 3. Estadísticas Usuario (`/api/dashboard/user-stats`)
Métricas para el dashboard del cliente.

- **Método:** `GET`
- **Endpoint:** `/api/dashboard/user-stats`
- **Acceso:** Usuario Autenticado

**Response (200 OK):**
```json
{
  "totalQuotes": 5,
  "pendingQuotes": 1,
  "inTransit": 2,
  "completed": 2
}
```

---

## Notificaciones

### 1. Obtener Notificaciones (`/api/notifications`)
Lista de notificaciones recientes.

- **Método:** `GET`
- **Endpoint:** `/api/notifications`
- **Acceso:** Usuario Autenticado

**Response (200 OK):**
```json
[
  {
    "id": 101,
    "title": "Cotización Aprobada",
    "message": "Tu cotización #COT-001 ha sido aprobada.",
    "read": false,
    "created_at": "2024-12-15T10:00:00Z",
    "link": "/dashboard/cotizacion/uuid-1"
  }
]
```

### 2. Marcar Notificación Leída (`/api/notifications/[id]/read`)
Marca una notificación como leída.

- **Método:** `POST`
- **Endpoint:** `/api/notifications/[id]/read`
- **Acceso:** Usuario Autenticado

**Response (200 OK):**
```json
{
  "success": true
}
```
