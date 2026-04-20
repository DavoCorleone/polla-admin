import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, pools, matches, teams } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Users, Settings, Database, Globe } from "lucide-react";
import Link from 'next/link';
import { TeamLogo } from '@/components/team-logo';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export default async function SuperAdminDashboard() {
  const user = await currentUser();
  if (!user) {
    redirect('/admin-login');
  }

  // Fetch user role from DB
  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, user.id),
  });

  if (!dbUser || dbUser.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-rose-500">Access Denied</h1>
        <p className="text-zinc-400 mt-2">Only the Super Admin can access this panel.</p>
        <Link 
          href="/" 
          className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
        >
          Return to Home
        </Link>
      </div>
    );
  }

  // Fetch Stats
  const poolsCount = await db.select().from(pools);
  const matchesCount = await db.select().from(matches);
  const teamsCount = await db.select().from(teams);

  // Fetch recent pools
  const recentPools = await db.select().from(pools).limit(5).orderBy(desc(pools.createdAt));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2 px-2">
          <Trophy className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg tracking-tighter uppercase">Polla Master</span>
        </div>

        <nav className="flex flex-col gap-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-100 font-medium">
            <Database className="w-4 h-4" /> Resumen
          </Link>
          <Link href="/admin/pools" className="flex items-center gap-3 px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors">
            <Users className="w-4 h-4" /> Grupos
          </Link>
          <Link href="/admin/matches" className="flex items-center gap-3 px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors">
            <Globe className="w-4 h-4" /> Partidos Globales
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight">Panel Super Admin</h1>
              <p className="text-zinc-500 mt-1">Gestiona todas las pollas y partidos globales del sistema.</p>
            </div>
            <Button className="font-bold">
              <Plus className="w-4 h-4 mr-2" /> Crear Nueva Polla
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Total Pollas</CardTitle>
                <Users className="w-4 h-4 text-zinc-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{poolsCount.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Partidos en BD</CardTitle>
                <Database className="w-4 h-4 text-zinc-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{matchesCount.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Equipos Registrados</CardTitle>
                <Trophy className="w-4 h-4 text-zinc-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{teamsCount.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle>Pollas Recientes</CardTitle>
                <CardDescription>Los últimos grupos creados en el sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPools.map((pool) => (
                    <div key={pool.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                      <div className="flex items-center gap-3">
                        <TeamLogo src={pool.logoUrl} name={pool.name} size={32} />
                        <div>
                          <p className="font-bold text-sm">{pool.name}</p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{pool.id}</p>
                        </div>
                      </div>
                      <Link 
                        href={`/p/${pool.id}/admin`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                      >
                        <Settings className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                  {recentPools.length === 0 && (
                    <p className="text-center py-8 text-zinc-500 text-sm italic">No hay pollas creadas.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>Accesos directos a configuraciones globales.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex flex-col gap-2 border-dashed">
                  <Globe className="w-6 h-6 text-zinc-500" />
                  <span>Sync API Matches</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2 border-dashed">
                  <Plus className="w-6 h-6 text-zinc-500" />
                  <span>Add Manual Team</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
