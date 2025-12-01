# Documentación de APIs

Este documento detalla los endpoints de la API disponibles en la aplicación, incluyendo los datos que reciben y los que devuelven.

## Autenticación
La mayoría de los endpoints requieren autenticación mediante un token JWT.
- **Header**: `Authorization: Bearer <token>`
- **Cookie**: `auth_token` (usado por el middleware y endpoints de servidor)

## Endpoints

### Autenticación (`/api/auth`)

#### 1. Login
- **Método**: `POST`
- **URL**: `/api/auth/login`
- **Descripción**: Inicia sesión de usuario.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
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
- **Response (Error)**: 401 Unauthorized, 403 Forbidden (Email no verificado).

#### 2. Logout
- **Método**: `POST`
- **URL**: `/api/auth/logout`
- **Descripción**: Cierra la sesión del usuario y elimina la cookie.
- **Request**: Cookie `auth_token`.
- **Response (200 OK)**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

#### 3. Registro
- **Método**: `POST`
- **URL**: `/api/auth/register`
- **Descripción**: Registra un nuevo usuario.
- **Request Body**:
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
- **Response (201 Created)**:
  ```json
  {
    "message": "Usuario registrado. Por favor verifica tu email.",
    "email": "user@example.com"
  }
  ```

#### 4. Obtener Usuario Actual (Me)
- **Método**: `GET`
- **URL**: `/api/auth/me`
- **Descripción**: Obtiene la información del usuario autenticado basado en el token.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
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

#### 5. Reenviar Verificación
- **Método**: `POST`
- **URL**: `/api/auth/resend-verification`
- **Descripción**: Reenvía el correo de verificación de email.
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Correo de verificación reenviado exitosamente"
  }
  ```

#### 6. Verificar Email
- **Método**: `GET`
- **URL**: `/api/auth/verify-email`
- **Descripción**: Verifica el email del usuario mediante un token.
- **Query Params**: `token` (string)
- **Response**: Redirecciona a `/auth/login?verified=true` o devuelve error JSON.

---

### Cotizaciones (`/api/quotes`)

#### 1. Obtener Cotizaciones (Usuario)
- **Método**: `GET`
- **URL**: `/api/quotes`
- **Descripción**: Obtiene las cotizaciones del usuario autenticado.
- **Auth**: Requerido (Usuario).
- **Response (200 OK)**: Array de objetos de cotización.

#### 2. Crear Cotización
- **Método**: `POST`
- **URL**: `/api/quotes`
- **Descripción**: Crea una nueva cotización.
- **Auth**: Requerido (Usuario).
- **Request Body**:
  ```json
  {
    "items": [
      {
        "producto": "Producto A",
        "precio": 100,
        "cantidad": 2
      }
    ]
  }
  ```
- **Response (201 Created)**: Objeto de la cotización creada.

---

### Administración (`/api/admin`)

#### 1. Obtener Usuarios
- **Método**: `GET`
- **URL**: `/api/admin/users`
- **Descripción**: Obtiene lista de usuarios.
- **Auth**: Requerido (Admin).
- **Query Params**:
  - `search`: (opcional) Filtro por texto.
  - `role`: (opcional) Filtro por rol.
- **Response (200 OK)**: Array de usuarios.

#### 2. Crear Usuario (Admin)
- **Método**: `POST`
- **URL**: `/api/admin/users`
- **Descripción**: Crea un usuario desde el panel de administración.
- **Auth**: Requerido (Admin).
- **Request Body**:
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "company_name": "Company",
    "phone": "1234567890",
    "email": "admin@example.com",
    "password": "Password123!"
  }
  ```
- **Response (201 Created)**: Usuario creado.

#### 3. Actualizar Usuario
- **Método**: `PUT`
- **URL**: `/api/admin/users/[id]`
- **Descripción**: Actualiza un usuario existente.
- **Auth**: Requerido (Admin).
- **Request Body** (campos opcionales):
  ```json
  {
    "first_name": "New Name",
    "last_name": "New Last Name",
    "company_name": "New Company",
    "phone": "0987654321",
    "role": "admin"
  }
  ```
- **Response (200 OK)**: Usuario actualizado.

#### 4. Desactivar Usuario
- **Método**: `DELETE`
- **URL**: `/api/admin/users/[id]`
- **Descripción**: Desactiva un usuario.
- **Auth**: Requerido (Admin).
- **Response (200 OK)**: `{ "message": "Usuario desactivado" }`

#### 5. Obtener Cotizaciones (Admin)
- **Método**: `GET`
- **URL**: `/api/admin/cotizaciones`
- **Descripción**: Obtiene todas las cotizaciones del sistema.
- **Auth**: Requerido (Admin).
- **Query Params**:
  - `search`: (opcional)
  - `estado`: (opcional) Filtro por estado ('pendiente', 'aprobado', etc).
- **Response (200 OK)**: Array de cotizaciones.

#### 6. Obtener Cotización por ID
- **Método**: `GET`
- **URL**: `/api/admin/cotizaciones/[id]`
- **Descripción**: Obtiene detalles de una cotización específica.
- **Auth**: Requerido (Admin).
- **Response (200 OK)**: Objeto de cotización con items.

#### 7. Actualizar Estado de Cotización
- **Método**: `PUT`
- **URL**: `/api/admin/cotizaciones/[id]`
- **Descripción**: Actualiza el estado de una cotización.
- **Auth**: Requerido (Admin).
- **Request Body**:
  ```json
  {
    "estado": "aprobado" // o "pendiente", "desaprobado"
  }
  ```
- **Response (200 OK)**: Cotización actualizada.

---

### Dashboard (`/api/dashboard`)

#### 1. Estadísticas de Admin
- **Método**: `GET`
- **URL**: `/api/dashboard/admin-stats`
- **Descripción**: Obtiene estadísticas generales para el dashboard de admin.
- **Auth**: Requerido (Admin).
- **Response (200 OK)**: Objeto con estadísticas (total usuarios, cotizaciones, ingresos, etc).

#### 2. Reportes de Admin
- **Método**: `GET`
- **URL**: `/api/dashboard/admin-reports`
- **Descripción**: Obtiene datos para reportes y gráficos.
- **Auth**: Requerido (Admin).
- **Response (200 OK)**: Datos de reportes (top clientes, ventas por mes, etc).

#### 3. Estadísticas de Usuario
- **Método**: `GET`
- **URL**: `/api/dashboard/user-stats`
- **Descripción**: Obtiene estadísticas para el dashboard del usuario.
- **Auth**: Requerido (Usuario).
- **Response (200 OK)**: Objeto con estadísticas del usuario (mis cotizaciones, pendientes, etc).
