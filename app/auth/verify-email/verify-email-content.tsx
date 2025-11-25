'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token inválido o expirado');
      return;
    }


    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);

        if (response.ok) {
          setStatus('success');
          setMessage('Email verificado correctamente');
        } else {
          setStatus('error');
          const data = await response.json();
          setMessage(data.error || 'Error al verificar email');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Error al verificar email');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Verificando Email</h1>
          <p className="text-muted-foreground">Un momento por favor...</p>
        </div>

        {status === 'loading' && (
          <div className="flex justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {status === 'success' && (
          <Alert>
            <AlertDescription className="space-y-4">
              <div>
                <p className="font-semibold text-green-700">¡Email verificado exitosamente!</p>
                <p className="text-sm mt-2">Tu cuenta está completamente activada. Ahora puedes iniciar sesión.</p>
              </div>
              <Link href="/auth/login">
                <Button className="w-full">Ir a Login</Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert variant="destructive">
            <AlertDescription className="space-y-4">
              <div>
                <p className="font-semibold">Error en la verificación</p>
                <p className="text-sm mt-2">{message}</p>
              </div>
              <Link href="/auth/register">
                <Button className="w-full" variant="outline">
                  Registrarse de Nuevo
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
