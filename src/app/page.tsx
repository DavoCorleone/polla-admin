import Link from "next/link";
import { Search, Trophy, ArrowRight, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { pools } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { TeamLogo } from "@/components/team-logo";

export default async function Home() {
  let availablePools: any[] = [];
  
  try {
    availablePools = await db.query.pools.findMany({
      orderBy: [desc(pools.createdAt)],
    });
  } catch (error) {
    console.error("Error fetching pools, DB might not be configured:", error);
  }

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

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden py-12">
        {/* Background Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] opacity-20" />
          <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] opacity-10" />
        </div>

        <section className="w-full max-w-4xl px-6 relative z-10">
          <div className="flex flex-col items-center space-y-10 text-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-4 duration-1000">
                Plataforma de Predicciones Deportivas
              </div>
              <h1 className="text-5xl font-black tracking-tighter sm:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                PRONOSTICA.<br />COMPITE. GANA.
              </h1>
              <p className="mx-auto max-w-[600px] text-zinc-400 text-lg sm:text-xl font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                Selecciona un grupo para unirte, introduce tu marcador y demuestra que eres el que más sabe de fútbol.
              </p>
            </div>
            
            <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
              <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-2xl shadow-2xl shadow-black/50 text-left">
                <CardHeader className="border-b border-zinc-800/50">
                  <CardTitle className="text-xl font-black">Grupos Disponibles</CardTitle>
                  <CardDescription>Escoge a qué grupo unirte para jugar</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[400px] overflow-auto flex flex-col">
                    {availablePools.length > 0 ? (
                      availablePools.map((pool) => (
                        <Link 
                          key={pool.id} 
                          href={`/p/${pool.id}`}
                          className="flex items-center justify-between p-4 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <TeamLogo src={pool.logoUrl} name={pool.name} size={48} />
                            <div>
                              <h3 className="font-bold text-lg">{pool.name}</h3>
                              <p className="text-xs text-zinc-500 flex items-center gap-1">
                                <Users className="w-3 h-3" /> ID: {pool.id}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="group-hover:bg-zinc-700/50 group-hover:text-white text-zinc-400 transition-colors gap-2">
                            Entrar
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      ))
                    ) : (
                      <div className="p-8 text-center text-zinc-500 italic">
                        {availablePools === undefined ? "Cargando grupos..." : "No hay grupos creados todavía o la base de datos no está configurada."}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-10 w-full border-t border-zinc-800/30">
        <div className="container mx-auto px-6 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-xs font-medium text-zinc-400">
            Desarrollado por{' '}
            <a 
              href="https://www.linkedin.com/in/david-chavez" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors underline decoration-emerald-500/30 underline-offset-4"
            >
              David Chavez
            </a>
          </p>
          <div className="flex gap-4">
            {/* Los links de privacidad y términos están deshabilitados hasta que existan páginas reales */}
            <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest cursor-not-allowed">Privacidad</span>
            <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest cursor-not-allowed">Términos</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
