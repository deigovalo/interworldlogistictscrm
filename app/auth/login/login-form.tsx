'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginSchema, type LoginInput } from '@/lib/validation';
import { ZodError } from 'zod';
import { useAuth } from '@/hooks/use-auth';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });

  const verified = searchParams.get('verified');

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
      const validatedData = loginSchema.parse(formData);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.error?.includes('verifica tu email')) {
          setError(data.error);
        } else {
          setError(data.error || 'Error al iniciar sesión');
        }
        return;
      }

      login(data.token, data.user);
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        // ZodError exposes validation issues via the `issues` property
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {verified && (
        <Alert>
          <AlertDescription className="text-green-700">
            Email verificado correctamente. Ahora puedes iniciar sesión.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="space-y-3">
            <p>{error}</p>
            {error.includes('verifica tu email') && (
              <Link href={`/auth/resend-verification?email=${formData.email}`}>
                <Button type="button" variant="outline" className="w-full text-xs">
                  Reenviar correo de verificación
                </Button>
              </Link>
            )}
          </AlertDescription>
        </Alert>
      )}

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
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
      </Button>
    </form>
  );
}
