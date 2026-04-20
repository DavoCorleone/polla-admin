'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, X, Trophy } from "lucide-react";
import { createPool } from '@/lib/actions/pools';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CreatePoolForm({ ownerId }: { ownerId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre del grupo es obligatorio.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await createPool(name.trim(), ownerId, logoUrl.trim() || undefined);
        toast.success(`¡Grupo "${name}" creado exitosamente!`);
        setIsOpen(false);
        setName('');
        setLogoUrl('');
        router.refresh();
        router.push(`/p/${result.poolId}/admin`);
      } catch (error: any) {
        toast.error(error.message || 'Error al crear el grupo. Intenta nuevamente.');
      }
    });
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="font-bold">
        <Plus className="w-4 h-4 mr-2" /> Crear Nuevo Grupo
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !isPending && setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md mx-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-100">Nuevo Grupo</h2>
                  <p className="text-xs text-zinc-500">Crea una nueva Polla</p>
                </div>
              </div>
              <button
                onClick={() => !isPending && setIsOpen(false)}
                className="text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="pool-name" className="text-zinc-300 font-semibold text-sm">
                  Nombre del Grupo <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="pool-name"
                  placeholder="Ej: Polla Familia 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                  autoFocus
                  className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pool-logo" className="text-zinc-300 font-semibold text-sm">
                  URL del Logo <span className="text-zinc-600 font-normal">(opcional)</span>
                </Label>
                <Input
                  id="pool-logo"
                  placeholder="https://... (imagen del grupo)"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  disabled={isPending}
                  className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500"
                />
                <p className="text-[11px] text-zinc-600">Puedes dejarla vacía y añadirla después.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => !isPending && setIsOpen(false)}
                  disabled={isPending}
                  className="flex-1 border-zinc-700 text-zinc-400 hover:text-zinc-100"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !name.trim()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 font-bold"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Grupo
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
