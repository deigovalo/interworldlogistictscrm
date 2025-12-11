-- 1. Tabla de Usuarios (Con columna status integrada)
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

-- 2. Tabla de Sesiones (Con user_agent e ip_address integrados)
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
CREATE TABLE cotizaciones (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  numero_cotizacion VARCHAR(50) UNIQUE NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente',
  monto_total DECIMAL(12, 2) NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Items de Cotización
CREATE TABLE cotizacion_items (
  id SERIAL PRIMARY KEY,
  cotizacion_id INT NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  producto VARCHAR(255) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  cantidad DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Índices para optimización
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);

CREATE INDEX idx_cotizaciones_user_id ON cotizaciones(user_id);
CREATE INDEX idx_cotizaciones_estado ON cotizaciones(estado);
CREATE INDEX idx_cotizaciones_numero ON cotizaciones(numero_cotizacion);
CREATE INDEX idx_cotizacion_items_cotizacion_id ON cotizacion_items(cotizacion_id);

-- 6. Actualizaciones para Sistema de Cotizaciones y Transporte (NUEVO)
-- Modificación de tabla cotizaciones para soportar flujo de solicitud -> respuesta
/*
ALTER TABLE cotizaciones 
ADD COLUMN origen VARCHAR(255),
ADD COLUMN destino VARCHAR(255),
ADD COLUMN tipo_servicio VARCHAR(100),
ADD COLUMN peso DECIMAL(10, 2),
ADD COLUMN volumen DECIMAL(10, 2),
ADD COLUMN tipo_carga VARCHAR(255),
ADD COLUMN mensaje_admin TEXT,
ADD COLUMN fecha_aceptacion TIMESTAMP,
ALTER COLUMN monto_total DROP NOT NULL; -- El monto inicia nulo hasta que el admin responde
*/

-- Tabla para Historial de Transporte
CREATE TABLE transport_updates (
  id SERIAL PRIMARY KEY,
  cotizacion_id INT NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  estado VARCHAR(100) NOT NULL, -- Ej: 'Salio de Puerto', 'En Aduana'
  descripcion TEXT,
  ubicacion VARCHAR(255),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transport_updates_cotizacion_id ON transport_updates(cotizacion_id);