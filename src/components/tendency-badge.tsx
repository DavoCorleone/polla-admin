import { cn } from '@/lib/utils';
import { Circle, Minus, Plus } from 'lucide-react';

interface TendencyBadgeProps {
  predictedHome: number;
  predictedAway: number;
}

export function TendencyBadge({ predictedHome, predictedAway }: TendencyBadgeProps) {
  // predictedHome > predictedAway → LOCAL gana (🟢)
  // predictedHome == predictedAway → EMPATE (🟡)
  // predictedHome < predictedAway → VISITANTE (🔴)
  
  if (predictedHome > predictedAway) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Local
      </div>
    );
  }

  if (predictedHome === predictedAway) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        Empate
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-wider">
      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
      Visita
    </div>
  );
}
