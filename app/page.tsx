import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg text-center">
        <div className="flex justify-center">
          <Image
            src="/LOGO-WEB-INTER-WOLRD-SOLUITIONS.png"
            alt="Inter World Logistics Solutions"
            width={300}
            height={100}
            priority
            className="h-auto w-auto"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido</h1>
          <p className="text-gray-500">
            Sistema de Gestión de Relaciones con Clientes
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Link href="/auth/login" className="block w-full">
            <Button className="w-full" size="lg">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/auth/register" className="block w-full">
            <Button variant="outline" className="w-full" size="lg">
              Registrarse
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
