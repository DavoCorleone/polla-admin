import { Card, CardContent } from "@/components/ui/card";
import { TeamLogo } from "./team-logo";
import { cn } from "@/lib/utils";
import { TendencyBadge } from "./tendency-badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Trophy, Clock, Lock } from "lucide-react";
import { PredictionForm } from "./prediction-form";

interface MatchCardProps {
  match: {
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    matchDate: Date;
    status: string;
    homeScore: number | null;
    awayScore: number | null;
  };
  homeTeam: { name: string; logoUrl: string };
  awayTeam: { name: string; logoUrl: string };
  prediction?: {
    predictedHome: number;
    predictedAway: number;
    pointsEarned: number;
    isScored: boolean;
  };
  poolId: string;
}

export function MatchCard({ match, homeTeam, awayTeam, prediction, poolId }: MatchCardProps) {
  const isFinished = match.status === 'FT';
  const isPending = match.status === 'NS';
  const isInProgress = !isPending && !isFinished;

  return (
    <Card className="overflow-hidden bg-zinc-950/50 border-zinc-800 backdrop-blur-sm group hover:border-zinc-700 transition-colors">
      <CardContent className="p-0">
        <div className="p-4 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/30">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-widest">
            {isFinished ? (
              <span className="flex items-center gap-1 text-emerald-500">
                <Trophy className="w-3 h-3" /> Finalizado
              </span>
            ) : isInProgress ? (
              <span className="flex items-center gap-1 text-amber-500 animate-pulse">
                <Clock className="w-3 h-3" /> En Vivo
              </span>
            ) : (
              <span>{format(new Date(match.matchDate), "d 'de' MMMM, HH:mm", { locale: es })}</span>
            )}
          </div>
          
          {prediction && !isPending && (
             <TendencyBadge 
               predictedHome={prediction.predictedHome} 
               predictedAway={prediction.predictedAway} 
             />
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex flex-col items-center gap-2 text-center">
              <TeamLogo src={homeTeam.logoUrl} name={homeTeam.name} size={64} />
              <span className="text-sm font-bold truncate w-full">{homeTeam.name}</span>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 min-w-[80px]">
              {isFinished || isInProgress ? (
                <div className="text-3xl font-black flex items-center gap-2">
                  <span>{match.homeScore ?? 0}</span>
                  <span className="text-zinc-700">-</span>
                  <span>{match.awayScore ?? 0}</span>
                </div>
              ) : (
                <div className="text-xs font-bold text-zinc-600 bg-zinc-900 px-3 py-1 rounded-full uppercase">
                  VS
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center gap-2 text-center">
              <TeamLogo src={awayTeam.logoUrl} name={awayTeam.name} size={64} />
              <span className="text-sm font-bold truncate w-full">{awayTeam.name}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-zinc-900/20 border-t border-zinc-800/50">
          {isPending ? (
            <PredictionForm 
              matchId={match.id} 
              poolId={poolId} 
              initialPrediction={prediction} 
            />
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-2 py-1.5 rounded bg-zinc-950/50 border border-zinc-800">
                <span className="text-xs text-zinc-500 font-medium">Tu predicción:</span>
                <span className="text-sm font-black text-zinc-200">
                  {prediction ? `${prediction.predictedHome} - ${prediction.predictedAway}` : 'Sin pronóstico'}
                </span>
              </div>
              
              {isFinished && prediction && (
                <div className={cn(
                  "flex justify-between items-center px-2 py-1.5 rounded border",
                  prediction.pointsEarned > 0 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                )}>
                  <span className="text-xs font-bold uppercase tracking-tighter">Puntos Ganados</span>
                  <span className="text-lg font-black">{prediction.pointsEarned}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
