import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, User, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Participant {
  name: string;
  totalPoints: number;
}

interface RankingTableProps {
  participants: Participant[];
}

export function RankingTable({ participants }: RankingTableProps) {
  // Sort participants by points descending
  const sortedParticipants = [...participants].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-md overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h2 className="font-bold tracking-tight">Tabla de Posiciones</h2>
      </div>
      
      <Table>
        <TableHeader className="bg-zinc-900/20">
          <TableRow className="border-zinc-800">
            <TableHead className="w-[60px] text-center font-bold">POS</TableHead>
            <TableHead>PARTICIPANTE</TableHead>
            <TableHead className="text-right font-bold w-[100px]">PUNTOS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedParticipants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-12 text-zinc-500 italic">
                Aún no hay participantes en esta polla.
              </TableCell>
            </TableRow>
          ) : (
            sortedParticipants.map((participant, index) => (
              <TableRow key={index} className="border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                <TableCell className="text-center">
                  <div className={cn(
                    "inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs",
                    index === 0 ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" :
                    index === 1 ? "bg-zinc-300/20 text-zinc-300 border border-zinc-300/30" :
                    index === 2 ? "bg-orange-700/20 text-orange-700 border border-orange-700/30" :
                    "text-zinc-500"
                  )}>
                    {index + 1}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                      <User className="w-3 h-3 text-zinc-500" />
                    </div>
                    <span className="font-semibold text-zinc-200">{participant.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">
                    {participant.totalPoints}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
