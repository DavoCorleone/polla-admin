'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Plus, Globe, Calendar, Database } from "lucide-react";
import { toast } from 'sonner';
import { syncFixtureByApiId } from '@/lib/actions/sync';
import Link from 'next/link';
import { TeamLogo } from '@/components/team-logo';

export default function GlobalMatchesAdmin() {
  const [fixtureId, setFixtureId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<any>(null);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixtureId.trim()) return;

    setIsSyncing(true);
    try {
      const result = await syncFixtureByApiId(parseInt(fixtureId));
      if (result.success) {
        toast.success(result.updated ? 'Partido actualizado' : 'Partido importado con éxito');
        setLastSync(result);
        setFixtureId('');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al sincronizar partido');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest flex items-center gap-2 mb-2">
              <Plus className="w-3 h-3 rotate-45" /> Volver al Panel
            </Link>
            <h1 className="text-4xl font-black tracking-tight">Gestión de Partidos</h1>
            <p className="text-zinc-500 mt-1">Busca e importa partidos desde API-Football para usarlos en tus pollas.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Import Section */}
          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  Importar desde API
                </CardTitle>
                <CardDescription>Ingresa el ID del fixture (partido) de API-Football.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSync} className="flex gap-2">
                  <Input 
                    placeholder="Ej: 867946" 
                    value={fixtureId}
                    onChange={(e) => setFixtureId(e.target.value)}
                    className="bg-zinc-950 border-zinc-800"
                  />
                  <Button type="submit" disabled={isSyncing}>
                    {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span className="ml-2">Sync</span>
                  </Button>
                </form>
                
                {lastSync && (
                  <div className="mt-4 p-4 rounded-lg bg-zinc-950 border border-emerald-500/20 text-emerald-500 text-xs">
                    Última acción: <strong>{lastSync.updated ? 'Actualización' : 'Nueva Importación'}</strong> 
                    <br />ID Local: <span className="font-mono">{lastSync.matchId}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-500">
                  <Plus className="w-5 h-5" />
                  Creación Manual
                </CardTitle>
                <CardDescription>Para partidos que no existen en la API.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full border-dashed border-zinc-700 hover:border-zinc-500">
                  Próximamente: Editor Manual
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Help/Tools Section */}
          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950">
              <CardHeader>
                <CardTitle className="text-zinc-400">Guía de IDs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Puedes encontrar los IDs de los partidos en el dashboard de API-Football o usando herramientas de búsqueda de ligas externas.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800">
                    <Calendar className="w-4 h-4 text-zinc-600" />
                    <div>
                      <p className="text-xs font-bold">Por Fecha</p>
                      <p className="text-[10px] text-zinc-600">Busca fixtures asignados a un día específico.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800">
                    <Database className="w-4 h-4 text-zinc-600" />
                    <div>
                      <p className="text-xs font-bold">Por Liga</p>
                      <p className="text-[10px] text-zinc-600">Filtra partidos por ID de liga (Ej: 13 para Premier League).</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
