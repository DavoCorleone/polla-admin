import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, pools, matches, teams, poolMatches, participants } from '@/lib/db/schema';
import { eq, notInArray, sql } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Settings, List, BarChart, ChevronLeft, Plus, Trash2 } from "lucide-react";
import Link from 'next/link';
import { TeamLogo } from '@/components/team-logo';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { removeMatchFromPool, assignMatchToPool } from '@/lib/actions/pools';

interface PoolAdminPageProps {
  params: Promise<{ poolId: string }>;
}

export default async function PoolAdminDashboard({ params }: PoolAdminPageProps) {
  const { poolId } = await params;
  const user = await currentUser();
  if (!user) {
    redirect('/admin-login');
  }

  // 1. Fetch User and check permissions
  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, user.id),
  });

  const pool = await db.query.pools.findFirst({
    where: eq(pools.id, poolId),
  });

  if (!pool) {
    notFound();
  }

  // Permission check: Super Admin or Pool Owner
  const isSuperAdmin = dbUser?.role === 'super_admin';
  const isOwner = pool.ownerId === dbUser?.id;

  if (!isSuperAdmin && !isOwner) {
    redirect('/admin');
  }

  // 2. Fetch assigned matches (simple, correct join)
  const assignedMatches = await db.select()
    .from(poolMatches)
    .where(eq(poolMatches.poolId, poolId))
    .innerJoin(matches, eq(poolMatches.matchId, matches.id));

  // Load all teams into a map for efficient lookup
  const teamList = await db.select().from(teams);
  const teamMap = new Map(teamList.map(t => [t.id, t]));

  // Participant count — cast to number properly
  const participantCountRows = await db.select({ count: sql<string>`count(*)` })
    .from(participants)
    .where(eq(participants.poolId, poolId));
  const participantCount = parseInt(participantCountRows[0]?.count ?? '0', 10);

  // Fetch global matches NOT already in this pool
  const assignedMatchIds = assignedMatches.map(m => m.matches.id);
  const availableMatches = assignedMatchIds.length > 0
    ? await db.select().from(matches).where(notInArray(matches.id, assignedMatchIds))
    : await db.select().from(matches);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <TeamLogo src={pool.logoUrl} name={pool.name} size={32} />
              <div>
                <h1 className="font-black tracking-tight">{pool.name}</h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none">Admin Panel</p>
              </div>
            </div>
          </div>

          <nav className="flex gap-1">
            <Link 
              href={`/p/${poolId}`} 
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2")}
            >
              <BarChart className="w-4 h-4" /> Ver Polla
            </Link>
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="w-4 h-4" /> Configuración
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-auto">
        <div className="container mx-auto space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardDescription className="uppercase text-[10px] font-bold tracking-widest">Participantes</CardDescription>
                <CardTitle className="text-4xl font-black">{participantCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardDescription className="uppercase text-[10px] font-bold tracking-widest">Partidos Activos</CardDescription>
                <CardTitle className="text-4xl font-black">{assignedMatches.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Assigned Matches */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <List className="w-5 h-5 text-emerald-500" />
                Partidos en la Polla
              </h2>
              
              <div className="space-y-2">
                {assignedMatches.map(({ matches: match }) => {
                  const hTeam = teamMap.get(match.homeTeamId);
                  const aTeam = teamMap.get(match.awayTeamId);
                  return (
                    <div key={match.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 group">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 w-32">
                          <TeamLogo src={hTeam?.logoUrl || null} name={hTeam?.name || ''} size={24} />
                          <span className="text-sm font-bold truncate">{hTeam?.name}</span>
                        </div>
                        <span className="text-zinc-700 font-bold">VS</span>
                        <div className="flex items-center gap-2 w-32">
                          <TeamLogo src={aTeam?.logoUrl || null} name={aTeam?.name || ''} size={24} />
                          <span className="text-sm font-bold truncate">{aTeam?.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {match.status === 'FT' && (
                          <form action={async () => {
                            'use server';
                            const { scoreMatchPredictions } = await import('@/lib/actions/scoring');
                            await scoreMatchPredictions(match.id);
                          }}>
                            <Button type="submit" variant="ghost" size="sm" className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                              Topar Puntos
                            </Button>
                          </form>
                        )}
                        <form action={async () => {
                          'use server';
                          await removeMatchFromPool(poolId, match.id);
                        }}>
                          <Button type="submit" variant="ghost" size="sm" className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  );
                })}
                {assignedMatches.length === 0 && (
                  <div className="text-center py-12 rounded-xl bg-zinc-900/50 border border-dashed border-zinc-800 text-zinc-500 italic">
                    No hay partidos asignados a este grupo.
                  </div>
                )}
              </div>
            </div>

            {/* Available Matches to Add */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                Añadir Partidos
              </h2>
              
              <Card className="bg-zinc-900 border-zinc-800 max-h-[600px] overflow-auto">
                <CardContent className="p-4 space-y-2">
                  {availableMatches.map((match) => {
                    const hTeam = teamMap.get(match.homeTeamId);
                    const aTeam = teamMap.get(match.awayTeamId);
                    return (
                      <div key={match.id} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                        <div className="flex-1 flex items-center gap-2 overflow-hidden">
                          <span className="text-[10px] font-black text-zinc-400 truncate">
                            {hTeam?.name ?? '?'} vs {aTeam?.name ?? '?'}
                          </span>
                        </div>
                        <form action={async () => {
                          'use server';
                          await assignMatchToPool(poolId, match.id);
                        }}>
                          <Button type="submit" size="sm" variant="outline" className="h-7 text-xs border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">
                            Añadir
                          </Button>
                        </form>
                      </div>
                    );
                  })}
                  {availableMatches.length === 0 && (
                    <p className="text-center py-4 text-zinc-500 text-xs italic">No hay más partidos globales disponibles.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
