import { Eye, EyeOff, Image as ImageIcon, Table2, TextCursorInput, Type } from 'lucide-react';
import type { ReactElement } from 'react';
import type { DesignBlock, EditorMode } from './types';

type LayerPanelProps = {
  blocks: DesignBlock[];
  selectedId: string;
  mode: EditorMode;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
};

const iconFor = (block: DesignBlock): ReactElement => {
  if (block.type === 'text') return <Type className="h-3.5 w-3.5" />;
  if (block.type === 'image') return <ImageIcon className="h-3.5 w-3.5" />;
  if (block.type === 'grid') return <Table2 className="h-3.5 w-3.5" />;
  if (block.type === 'input') return <TextCursorInput className="h-3.5 w-3.5" />;
  return <span className="h-3.5 w-3.5 rounded-full border border-current" />;
};

export default function LayerPanel({ blocks, selectedId, mode, onSelect, onToggleVisibility, onMove }: LayerPanelProps): ReactElement {
  const topToBottom = [...blocks].reverse();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-black/70 md:flex">
      <div className="border-b border-white/5 p-3">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">Layers</div>
        <div className="mt-1 text-xs text-neutral-600">{blocks.length} item(s)</div>
      </div>
      <div className="custom-scrollbar flex-1 overflow-y-auto p-3">
        <div className="space-y-1.5">
          {topToBottom.map((block) => {
            const sourceIndex = blocks.findIndex((item) => item.id === block.id);
            const selected = selectedId === block.id;
            return (
              <div key={block.id} className={`rounded border p-2 ${selected ? 'border-red-400/40 bg-red-500/12 text-white' : 'border-transparent text-neutral-400 hover:border-white/10 hover:bg-white/[0.05]'}`}>
                <button
                  type="button"
                  onClick={() => onSelect(block.id)}
                  disabled={mode !== 'edit'}
                  className="flex w-full min-w-0 items-center gap-2 text-left text-xs"
                >
                  {iconFor(block)}
                  <span className="truncate">{block.name}</span>
                </button>
                <div className="mt-2 flex items-center gap-1">
                  <button type="button" title="Toggle visibility" onClick={() => onToggleVisibility(block.id)} className="rounded border border-white/10 bg-white/[0.04] p-1 text-neutral-300">
                    {block.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button type="button" onClick={() => onMove(block.id, 'up')} disabled={mode !== 'edit' || sourceIndex === blocks.length - 1} className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] disabled:opacity-35">
                    Up
                  </button>
                  <button type="button" onClick={() => onMove(block.id, 'down')} disabled={mode !== 'edit' || sourceIndex === 0} className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] disabled:opacity-35">
                    Down
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
