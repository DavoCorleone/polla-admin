import Image from 'next/image';
import { cn } from '@/lib/utils';

interface TeamLogoProps {
  src: string | null;
  name: string;
  size?: number;
  className?: string;
}

export function TeamLogo({ src, name, size = 48, className }: TeamLogoProps) {
  return (
    <div 
      className={cn(
        "relative rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden",
        className
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          className="object-contain p-1"
        />
      ) : (
        <span className="text-xs font-bold text-zinc-500">
          {name.substring(0, 3).toUpperCase()}
        </span>
      )}
    </div>
  );
}
