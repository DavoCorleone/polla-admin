'use client';

import Link from "next/link";
import { Search, Trophy, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [poolCode, setPoolCode] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (poolCode.trim()) {
      router.push(`/p/${poolCode.trim()}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
      <header className="px-6 h-16 flex items-center border-b border-zinc-800/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-zinc-950" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase">Polla Mundialista</span>
        </div>
        <nav className="ml-auto flex items-center gap-6">
          <Link 
            className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors" 
            href="/admin-login"
          >
            Administración
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] opacity-20" />
          <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] opacity-10" />
        </div>

        <section className="w-full max-w-4xl px-6 py-20 relative z-10">
          <div className="flex flex-col items-center space-y-10 text-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-4 duration-1000">
                Plataforma de Predicciones Deportivas
              </div>
              <h1 className="text-5xl font-black tracking-tighter sm:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                PRONOSTICA.<br />COMPITE. GANA.
              </h1>
              <p className="mx-auto max-w-[600px] text-zinc-400 text-lg sm:text-xl font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                Únete a un grupo, introduce tu marcador y demuestra que eres el que más sabe de fútbol.
              </p>
            </div>
            
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
              <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-2xl shadow-2xl shadow-black/50">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-black">Entrar a una Polla</CardTitle>
                  <CardDescription>Ingresa el ID de tu grupo para participar</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="flex flex-col gap-4">
                    <div className="relative">
                      <input 
                        className="flex h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-2 text-sm ring-offset-zinc-950 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all font-bold"
                        placeholder="Ej: mundial-2026" 
                        value={poolCode}
                        onChange={(e) => setPoolCode(e.target.value)}
                      />
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    </div>
                    <Button type="submit" className="h-12 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-white font-black uppercase tracking-widest text-xs gap-2 group">
                      Buscar Grupo
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-10 w-full border-t border-zinc-800/30">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">© 2026 Admin Polla Mundialista</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-[10px] font-bold text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-widest">Privacidad</Link>
            <Link href="/terms" className="text-[10px] font-bold text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-widest">Términos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
