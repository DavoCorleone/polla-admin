import { db } from "@/lib/db";
import { pools, matches, teams, participants, predictions, poolMatches } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MatchCard } from "@/components/match-card";
import { RankingTable } from "@/components/ranking-table";
import { Trophy, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { TeamLogo } from "@/components/team-logo";

interface PoolPageProps {
  params: Promise<{ poolId: string }>;
  searchParams: Promise<{ name?: string }>;
}

export default async function PoolPage({ params, searchParams }: PoolPageProps) {
  const { poolId } = await params;
  const { name: participantName } = await searchParams;

  // 1. Fetch Pool
  const pool = await db.query.pools.findFirst({
    where: eq(pools.id, poolId),
  });

  if (!pool) {
    notFound();
  }

  // 2. Fetch assigned matches (simple join, no duplicate table issue)
  const assignedMatches = await db.select()
    .from(poolMatches)
    .where(eq(poolMatches.poolId, poolId))
    .innerJoin(matches, eq(poolMatches.matchId, matches.id))
    .orderBy(matches.matchDate);

  // Load all teams into a map for efficient lookup
  const teamList = await db.select().from(teams);
  const teamMap = new Map(teamList.map(t => [t.id, t]));

  // 3. Fetch Ranking — ordered DESC (highest points first)
  const participantList = await db.select()
    .from(participants)
    .where(eq(participants.poolId, poolId))
    .orderBy(desc(participants.totalPoints));

  // 4. Fetch User Predictions if name is provided
  let userParticipant = null;
  let userPredictions: any[] = [];

  if (participantName) {
    userParticipant = await db.query.participants.findFirst({
      where: and(eq(participants.poolId, poolId), eq(participants.name, participantName)),
    });
    
    if (userParticipant) {
      userPredictions = await db.select()
        .from(predictions)
        .where(and(eq(predictions.participantId, userParticipant.id), eq(predictions.poolId, poolId)));
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Inicio</span>
          </Link>
          
          <div className="flex items-center gap-3">
            {pool.logoUrl && <TeamLogo src={pool.logoUrl} name={pool.name} size={32} />}
            <h1 className="text-lg font-black tracking-tighter">{pool.name}</h1>
          </div>

          <div className="w-10 sm:w-20" /> {/* Spacer */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Matches Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">Partidos</h2>
              <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {assignedMatches.length} Partidos Asignados
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedMatches.map(({ matches: match }) => {
                const hTeam = teamMap.get(match.homeTeamId)!;
                const aTeam = teamMap.get(match.awayTeamId)!;
                const prediction = userPredictions.find((p: any) => p.matchId === match.id);

                return (
                  <MatchCard 
                    key={match.id}
                    match={match}
                    homeTeam={hTeam}
                    awayTeam={aTeam}
                    prediction={prediction}
                    poolId={poolId}
                  />
                );
              })}
              {assignedMatches.length === 0 && (
                <div className="col-span-2 text-center py-16 rounded-xl border-2 border-dashed border-zinc-800 text-zinc-500 italic">
                  No hay partidos asignados a este grupo todavía.
                </div>
              )}
            </div>
          </div>

          {/* Ranking Column */}
          <div className="space-y-6">
            <RankingTable participants={participantList} />
            
            {/* CTA or Info */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Cómo participar
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Ingresa tu nombre en cualquier tarjeta de partido para empezar. 
                Los puntos se calculan así:
              </p>
              <ul className="text-xs space-y-2 text-zinc-500 font-medium">
                <li className="flex justify-between items-center bg-zinc-950/50 p-2 rounded">
                  <span>Marcador Exacto</span>
                  <span className="text-emerald-500 font-black">+3 pts</span>
                </li>
                <li className="flex justify-between items-center bg-zinc-950/50 p-2 rounded">
                  <span>Resultado (G/E/P)</span>
                  <span className="text-amber-500 font-black">+1 pt</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
