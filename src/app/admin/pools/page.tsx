import { db } from '@/lib/db';
import { pools } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Settings } from "lucide-react";
import Link from 'next/link';
import { TeamLogo } from '@/components/team-logo';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default async function AdminPoolsPage() {
  const allPools = await db.select().from(pools).orderBy(desc(pools.createdAt));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest flex items-center gap-2 mb-2">
              <Plus className="w-3 h-3 rotate-45" /> Volver al Panel
            </Link>
            <h1 className="text-4xl font-black tracking-tight">Gestión de Grupos (Pollas)</h1>
            <p className="text-zinc-500 mt-1">Administra todas las pollas creadas en la plataforma.</p>
          </div>
          <Button className="font-bold">
            <Plus className="w-4 h-4 mr-2" /> Crear Nuevo Grupo
          </Button>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Todos los Grupos Activos
            </CardTitle>
            <CardDescription>Lista completa de la base de datos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allPools.map((pool) => (
                <div key={pool.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <TeamLogo src={pool.logoUrl} name={pool.name} size={48} />
                    <div>
                      <h3 className="font-black text-lg text-zinc-100">{pool.name}</h3>
                      <p className="text-xs font-mono text-zinc-500">{pool.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/p/${pool.id}/admin`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-zinc-700 bg-zinc-900")}
                    >
                      <Settings className="w-4 h-4 mr-2" /> Editar Grupo
                    </Link>
                  </div>
                </div>
              ))}
              
              {allPools.length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-zinc-800 rounded-xl">
                  <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-400 font-medium">No hay ninguna Polla Muncialista creada aún.</p>
                  <p className="text-zinc-600 text-sm mt-1">Usa el botón de arriba para crear una.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
