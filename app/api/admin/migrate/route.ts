
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
    try {
        // 1. Alter table cotizaciones
        try {
            await sql`
        ALTER TABLE cotizaciones 
        ADD COLUMN IF NOT EXISTS origen VARCHAR(255),
        ADD COLUMN IF NOT EXISTS destino VARCHAR(255),
        ADD COLUMN IF NOT EXISTS tipo_servicio VARCHAR(100),
        ADD COLUMN IF NOT EXISTS peso DECIMAL(10, 2),
        ADD COLUMN IF NOT EXISTS volumen DECIMAL(10, 2),
        ADD COLUMN IF NOT EXISTS tipo_carga VARCHAR(255),
        ADD COLUMN IF NOT EXISTS mensaje_admin TEXT,
        ADD COLUMN IF NOT EXISTS fecha_aceptacion TIMESTAMP;
        `;

            // Separate alter column as it might fail if already nullable or other constraints
            await sql`ALTER TABLE cotizaciones ALTER COLUMN monto_total DROP NOT NULL;`;

        } catch (e) {
            console.log("Error modifying cotizaciones:", e);
        }

        // 2. Create transport_updates table
        await sql`
    CREATE TABLE IF NOT EXISTS transport_updates (
      id SERIAL PRIMARY KEY,
      cotizacion_id INT NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
      estado VARCHAR(100) NOT NULL,
      descripcion TEXT,
      ubicacion VARCHAR(255),
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

        // 3. Index
        try {
            await sql`CREATE INDEX IF NOT EXISTS idx_transport_updates_cotizacion_id ON transport_updates(cotizacion_id);`;
        } catch (e) { console.log("Index error:", e); }

        return NextResponse.json({ success: true, message: "Migration completed" });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
