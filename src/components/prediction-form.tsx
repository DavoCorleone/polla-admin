'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitPrediction } from '@/lib/actions/predictions';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';

interface PredictionFormProps {
  matchId: string;
  poolId: string;
  initialPrediction?: {
    predictedHome: number;
    predictedAway: number;
  };
}

export function PredictionForm({ matchId, poolId, initialPrediction }: PredictionFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [userName, setUserName] = useState('');
  const [homeScore, setHomeScore] = useState(initialPrediction?.predictedHome?.toString() || '');
  const [awayScore, setAwayScore] = useState(initialPrediction?.predictedAway?.toString() || '');

  const [hasStoredName, setHasStoredName] = useState(false);

  useEffect(() => {
    // Try to get name from localStorage
    const savedName = localStorage.getItem('polla_user_name');
    if (savedName) {
      setUserName(savedName);
      setHasStoredName(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userName.trim()) {
      toast.error('Ingresa tu nombre para participar');
      return;
    }
    
    if (homeScore === '' || awayScore === '') {
      toast.error('Ingresa el marcador completo');
      return;
    }

    setIsPending(true);
    
    try {
      // Save name to localStorage for future use
      localStorage.setItem('polla_user_name', userName.trim());

      const formData = new FormData();
      formData.append('poolId', poolId);
      formData.append('matchId', matchId);
      formData.append('participantName', userName.trim());
      formData.append('predictedHome', homeScore);
      formData.append('predictedAway', awayScore);

      const result = await submitPrediction(formData);
      
      if (result.success) {
        toast.success('¡Pronóstico enviado con éxito!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar pronóstico');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!hasStoredName && !userName && (
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-[10px] uppercase font-bold text-zinc-500">Tu Nombre</Label>
          <Input 
            id="name"
            placeholder="Ej: Juan Pérez" 
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="h-8 text-sm bg-zinc-950 border-zinc-800"
            required
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-1.5">
          <Input 
            type="number"
            min="0"
            placeholder="0" 
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="h-10 text-center text-lg font-black bg-zinc-950 border-zinc-800 focus:border-emerald-500 transition-colors"
          />
        </div>
        
        <span className="text-zinc-700 font-black">-</span>
        
        <div className="flex-1 space-y-1.5">
          <Input 
            type="number"
            min="0"
            placeholder="0" 
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="h-10 text-center text-lg font-black bg-zinc-950 border-zinc-800 focus:border-emerald-500 transition-colors"
          />
        </div>

        <Button 
          type="submit" 
          size="sm" 
          disabled={isPending}
          className="h-10 bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>

      {userName && (
        <p className="text-[10px] text-zinc-500 text-center italic">
          Participando como <span className="font-bold text-zinc-400">{userName}</span>
        </p>
      )}
    </form>
  );
}
