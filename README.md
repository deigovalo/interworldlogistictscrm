# Interworld Logistics CRM

Sistema de gestión de relaciones con clientes (CRM) para Interworld Logistics, construido con tecnologías web modernas para asegurar rendimiento, escalabilidad y seguridad.

## Tecnologías

- **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), React, Tailwind CSS, [Shadcn/ui](https://ui.shadcn.com/).
- **Backend:** Next.js API Routes (Serverless).
- **Base de Datos:** [Neon](https://neon.tech/) (PostgreSQL serverless).
- **Autenticación:** Sistema personalizado con sesiones seguras (HttpOnly Cookies), Hashing PBKDF2, y Session Fingerprinting.
- **Seguridad:** Cumplimiento con OWASP Top 10 (ver [OWASP.md](./OWASP.md)).
- **Documentación API:** Referencia completa de endpoints en [APIS.md](./APIS.MD).

## Características Principales

- **Autenticación Segura:** Login con validación de email, protección contra fuerza bruta y robo de sesiones.
- **Panel de Administración:** Gestión de usuarios (crear, editar, desactivar), roles y permisos.
- **Dashboard:** Vista general de estadísticas y métricas clave.
- **Gestión de Cotizaciones:** Creación y seguimiento de cotizaciones para clientes.
- **Seguimiento de Transporte:** Actualizaciones de estado y ubicación de envíos.
- **Notificaciones:** Sistema de alertas para actualizaciones de cotizaciones y envíos.

## Configuración Local

1.  Clonar el repositorio.
2.  Instalar dependencias:
    ```bash
    npm install
    ```
3.  Configurar variables de entorno en `.env`:
    ```env
    DATABASE_URL=postgres://usuario:password@host/database
    ```
4.  Iniciar el servidor de desarrollo:
    ```bash
    npm run dev
    ```

## Seguridad

Este proyecto sigue estrictas prácticas de seguridad, incluyendo protección contra inyecciones SQL, XSS, y Session Hijacking. Para un análisis detallado, consulta el archivo [OWASP.md](./OWASP.md).
