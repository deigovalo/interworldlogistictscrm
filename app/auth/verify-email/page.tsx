import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';
import VerifyEmailContent from './verify-email-content';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Verificando Email</h1>
              <p className="text-muted-foreground">Un momento por favor...</p>
            </div>
            <div className="flex justify-center">
              <Spinner className="h-8 w-8" />
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
