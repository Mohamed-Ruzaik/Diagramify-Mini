import { Image as ImageIcon, MousePointer2, Save, Square, Type, ZoomIn, ZoomOut } from 'lucide-react';
import type { ReactElement } from 'react';
import type { BlockType, EditorMode } from './types';

type EditorToolbarProps = {
  mode: EditorMode;
  title: string;
  status: string;
  dirty: boolean;
  zoom: number;
  onModeChange: (mode: EditorMode) => void;
  onTitleChange: (value: string) => void;
  onZoomChange: (value: number) => void;
  onAddBlock: (type: BlockType) => void;
  onPickImage: () => void;
  onSave: () => void;
};

export default function EditorToolbar({
  mode,
  title,
  status,
  dirty,
  zoom,
  onModeChange,
  onTitleChange,
  onZoomChange,
  onAddBlock,
  onPickImage,
  onSave
}: EditorToolbarProps): ReactElement {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center gap-1 px-2">
      <button
        type="button"
        title="Select"
        onClick={() => onModeChange('edit')}
        className={`rounded border p-2 transition ${mode === 'edit' ? 'border-red-400/40 bg-red-500/15 text-white' : 'border-white/10 bg-white/[0.04] text-neutral-300 hover:bg-white/[0.1]'}`}
      >
        <MousePointer2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Preview"
        onClick={() => onModeChange('preview')}
        className={`rounded border px-2 py-2 text-xs font-semibold transition ${mode === 'preview' ? 'border-red-400/40 bg-red-500/15 text-white' : 'border-white/10 bg-white/[0.04] text-neutral-300 hover:bg-white/[0.1]'}`}
      >
        Preview
      </button>
      <div className="mx-1 h-6 w-px bg-white/10" />
      <button type="button" title="Add shape" onClick={() => onAddBlock('shape')} className="rounded border border-white/10 bg-white/[0.04] p-2 text-neutral-300 hover:bg-white/[0.1]">
        <Square className="h-4 w-4" />
      </button>
      <button type="button" title="Add text" onClick={() => onAddBlock('text')} className="rounded border border-white/10 bg-white/[0.04] p-2 text-neutral-300 hover:bg-white/[0.1]">
        <Type className="h-4 w-4" />
      </button>
      <button type="button" title="Add image" onClick={onPickImage} className="rounded border border-white/10 bg-white/[0.04] p-2 text-neutral-300 hover:bg-white/[0.1]">
        <ImageIcon className="h-4 w-4" />
      </button>
      <div className="mx-1 h-6 w-px bg-white/10" />
      <button type="button" title="Zoom out" onClick={() => onZoomChange(Math.max(0.35, zoom - 0.1))} className="rounded border border-white/10 bg-white/[0.04] p-2 text-neutral-300 hover:bg-white/[0.1]">
        <ZoomOut className="h-4 w-4" />
      </button>
      <span className="w-11 text-center font-mono text-[11px] text-neutral-500">{Math.round(zoom * 100)}%</span>
      <button type="button" title="Zoom in" onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))} className="rounded border border-white/10 bg-white/[0.04] p-2 text-neutral-300 hover:bg-white/[0.1]">
        <ZoomIn className="h-4 w-4" />
      </button>
      <input
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        className="ml-2 hidden w-52 rounded border border-white/10 bg-black/50 px-2 py-1.5 text-xs text-white outline-none focus:border-red-500/60 xl:block"
      />
      <span className={`ml-2 hidden max-w-36 truncate font-mono text-[10px] ${dirty ? 'text-yellow-300' : 'text-neutral-500'} lg:inline`}>
        {status}
      </span>
      <button
        type="button"
        onClick={onSave}
        className="ml-1 flex items-center gap-2 rounded border border-red-400/40 bg-red-600 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500"
      >
        <Save className="h-4 w-4" />
        Save
      </button>
    </div>
  );
}
