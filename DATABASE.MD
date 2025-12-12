-- 1. Tabla de Usuarios
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company_name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'usuario',
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  email_verification_token_expires TIMESTAMP,
  status VARCHAR(20) DEFAULT 'activo' NOT NULL CHECK (status IN ('activo', 'inactivo')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Sesiones
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Cotizaciones
-- NOTA: ID migrado a UUID para no exponer numeración secuencial
CREATE TABLE cotizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  numero_cotizacion VARCHAR(50) UNIQUE NOT NULL, -- Ej: COT-123456-789
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, respondido, aprobado, desaprobado, transporte, finalizado
  monto_total DECIMAL(12, 2), -- Nullable inicialmente
  descripcion TEXT,
  
  -- Campos Logísticos Nuevos
  origen VARCHAR(255),
  destino VARCHAR(255),
  tipo_servicio VARCHAR(100), -- Marítimo, Aéreo, etc.
  peso DECIMAL(10, 2),
  volumen DECIMAL(10, 2),
  tipo_carga VARCHAR(255), -- General, Peligrosa, etc.
  
  -- Respuesta Admin
  mensaje_admin TEXT,
  fecha_aceptacion TIMESTAMP,

  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla para Historial de Transporte
CREATE TABLE transport_updates (
  id SERIAL PRIMARY KEY,
  cotizacion_id UUID NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  estado VARCHAR(100) NOT NULL, -- Ej: 'Salio de Puerto', 'En Aduana'
  descripcion TEXT,
  ubicacion VARCHAR(255),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Notificaciones
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(255),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_cotizaciones_user_id ON cotizaciones(user_id);
CREATE INDEX idx_cotizaciones_estado ON cotizaciones(estado);
CREATE INDEX idx_cotizaciones_numero ON cotizaciones(numero_cotizacion);
CREATE INDEX idx_transport_updates_cotizacion_id ON transport_updates(cotizacion_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);