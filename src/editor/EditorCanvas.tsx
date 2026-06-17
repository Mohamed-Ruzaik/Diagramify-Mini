import type { MouseEvent as ReactMouseEvent, ReactElement } from 'react';
import BlockRenderer from './BlockRenderer';
import type { DesignBlock, DesignSchema, EditorMode } from './types';

type EditorCanvasProps = {
  schema: DesignSchema;
  selectedId: string;
  mode: EditorMode;
  zoom: number;
  draggingId: string | null;
  onSelect: (id: string) => void;
  onDragStart: (block: DesignBlock, event: ReactMouseEvent<HTMLButtonElement>) => void;
  onResizeStart: (block: DesignBlock, event: ReactMouseEvent<HTMLSpanElement>) => void;
};

export default function EditorCanvas({
  schema,
  selectedId,
  mode,
  zoom,
  draggingId,
  onSelect,
  onDragStart,
  onResizeStart
}: EditorCanvasProps): ReactElement {
  const canvas = schema.meta.canvas;
  const scaledWidth = canvas.width * zoom;
  const scaledHeight = canvas.height * zoom;

  return (
    <section className="relative flex min-w-0 flex-1 overflow-hidden bg-neutral-950/55">
      <div className="custom-scrollbar flex-1 overflow-auto p-8">
        <div style={{ width: scaledWidth, height: scaledHeight }} className="mx-auto">
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
            <div
              style={{
                width: canvas.width,
                height: canvas.height,
                position: 'relative',
                backgroundColor: canvas.backgroundColor
              }}
              className="overflow-hidden rounded border border-white/10 shadow-2xl shadow-black/50"
              onClick={() => onSelect('')}
            >
              <div
                className="absolute inset-0 opacity-[0.2]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              />
              {schema.blocks.map((block) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  isSelected={selectedId === block.id}
                  isDragging={draggingId === block.id}
                  mode={mode}
                  onSelect={onSelect}
                  onDragStart={onDragStart}
                  onResizeStart={onResizeStart}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
