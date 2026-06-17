import type { ReactNode } from 'react';

export default function GridBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-neutral-200 selection:bg-red-500/30">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
