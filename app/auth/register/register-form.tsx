'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { registerSchema, type RegisterInput } from '@/lib/validation';
import { ZodError } from 'zod';

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<RegisterInput>({
    first_name: '',
    last_name: '',
    company_name: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrors({});
    setIsLoading(true);

    try {
      const validatedData = registerSchema.parse(formData);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al registrarse');
        return;
      }

      setSuccessEmail(data.email);
      setSuccess(true);
      setFormData({
        first_name: '',
        last_name: '',
        company_name: '',
        phone: '',
        email: '',
        password: '',
        confirm_password: '',
      });
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        // ZodError uses `issues` (array of ZodIssue) instead of `errors`
        err.issues.forEach(issue => {
          const path = issue.path[0] as string;
          fieldErrors[path] = issue.message;
        });
        setErrors(fieldErrors);
      } else {
        setError('Error inesperado. Por favor intente de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription className="text-base">
            <div className="space-y-2">
              <p className="font-semibold text-green-700">¡Registro exitoso!</p>
              <p>
                Hemos enviado un correo de verificación a <strong>{successEmail}</strong>
              </p>
              <p className="text-sm">
                Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación para completar tu registro.
              </p>
              <p className="text-xs text-muted-foreground">
                Si no ves el correo, verifica tu carpeta de spam.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="first_name">Nombre</Label>
        <Input
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          placeholder="Juan"
          disabled={isLoading}
        />
        {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="last_name">Apellido</Label>
        <Input
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          placeholder="Pérez"
          disabled={isLoading}
        />
        {errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="company_name">Nombre de Empresa</Label>
        <Input
          id="company_name"
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
          placeholder="Mi Empresa S.A."
          disabled={isLoading}
        />
        {errors.company_name && <p className="text-sm text-destructive">{errors.company_name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 (555) 000-0000"
          disabled={isLoading}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="correo@empresa.com"
          disabled={isLoading}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Contraseña"
          disabled={isLoading}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        <p className="text-xs text-muted-foreground">
          Mínimo 8 caracteres, con mayúsculas, minúsculas, números y símbolos.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm_password">Confirmar Contraseña</Label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          value={formData.confirm_password}
          onChange={handleChange}
          placeholder="Confirmar contraseña"
          disabled={isLoading}
        />
        {errors.confirm_password && <p className="text-sm text-destructive">{errors.confirm_password}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Registrando...' : 'Crear Cuenta'}
      </Button>
    </form>
  );
}
