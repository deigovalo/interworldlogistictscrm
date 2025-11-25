'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { LoginForm } from './login-form';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <Image
                src="/LOGO-WEB-INTER-WOLRD-SOLUITIONS.png"
                alt="Inter World Logistics Solutions"
                width={200}
                height={67}
                priority
                className="h-auto w-auto"
              />
            </div>
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="space-y-4"><div className="h-10 bg-muted rounded animate-pulse" /></div>}>
              <LoginForm />
            </Suspense>
            <div className="mt-4 text-center text-sm">
              ¿No tienes cuenta?{' '}
              <Link href="/auth/register" className="text-primary hover:underline font-semibold">
                Regístrate aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
