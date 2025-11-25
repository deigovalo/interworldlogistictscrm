'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResendVerificationContent } from './resend-verification-content';

export default function ResendVerificationPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Reenviar Verificación</CardTitle>
            <CardDescription>
              Ingresa tu email para recibir un nuevo correo de verificación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Suspense fallback={<div className="space-y-4"><div className="h-10 bg-muted rounded animate-pulse" /></div>}>
              <ResendVerificationContent />
            </Suspense>

            <div className="text-center text-sm">
              <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                Volver al Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
