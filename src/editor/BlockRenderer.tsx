import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactElement } from 'react';
import type { DesignBlock, GridBlock, ImageBlock, InputBlock, ShapeBlock, TextBlock } from './types';

const renderText = (block: TextBlock): ReactElement => (
  <div
    style={{
      width: '100%',
      height: '100%',
      color: block.color,
      backgroundColor: block.backgroundColor,
      fontFamily: block.fontFamily,
      fontSize: `${block.fontSize}px`,
      fontWeight: block.fontWeight,
      fontStyle: block.fontStyle,
      textDecoration: block.textDecoration,
      textAlign: block.textAlign,
      lineHeight: block.lineHeight,
      letterSpacing: `${block.letterSpacing}px`,
      padding: `${block.padding}px`,
      whiteSpace: 'pre-wrap'
    }}
  >
    {block.text}
  </div>
);

const renderImage = (block: ImageBlock): ReactElement => (
  <div
    style={{
      width: '100%',
      height: '100%',
      backgroundColor: block.backgroundColor,
      padding: `${block.padding}px`,
      borderRadius: `${block.borderRadius}px`,
      border: `${block.borderWidth}px solid ${block.borderColor}`,
      overflow: 'hidden'
    }}
  >
    {block.src ? (
      <img src={block.src} alt={block.name} draggable={false} className="block h-full w-full" style={{ objectFit: block.fit }} />
    ) : (
      <div className="grid h-full w-full place-items-center text-xs text-neutral-500">Image</div>
    )}
  </div>
);

const renderGrid = (block: GridBlock): ReactElement => (
  <div style={{ width: '100%', height: '100%', backgroundColor: block.backgroundColor, padding: block.padding }}>
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: `repeat(${block.columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${block.rows}, minmax(0, 1fr))`,
        gap: block.gap
      }}
    >
      {Array.from({ length: block.rows * block.columns }).map((_, index) => (
        <div
          key={`${block.id}_${index}`}
          style={{ backgroundColor: block.cellColor, border: block.showLines ? `1px solid ${block.lineColor}` : 'none' }}
        />
      ))}
    </div>
  </div>
);

const renderInput = (block: InputBlock): ReactElement => (
  <div
    style={{
      width: '100%',
      height: '100%',
      padding: block.padding,
      backgroundColor: block.backgroundColor,
      border: `${block.borderWidth}px solid ${block.borderColor}`,
      borderRadius: block.borderRadius,
      display: 'flex',
      alignItems: 'center'
    }}
  >
    <div
      style={{
        color: block.color,
        fontSize: block.fontSize,
        opacity: block.value.trim() ? 1 : 0.62,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
    >
      {block.value.trim() || block.placeholder}
    </div>
  </div>
);

const shapeClipPath = (kind: ShapeBlock['kind']): string | undefined => {
  if (kind === 'diamond') return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
  if (kind === 'triangle') return 'polygon(50% 0%, 100% 100%, 0% 100%)';
  return undefined;
};

type BlockRendererProps = {
  block: DesignBlock;
  isSelected: boolean;
  isDragging?: boolean;
  mode: 'edit' | 'preview';
  onSelect: (id: string) => void;
  onDragStart?: (block: DesignBlock, event: ReactMouseEvent<HTMLButtonElement>) => void;
  onResizeStart?: (block: DesignBlock, event: ReactMouseEvent<HTMLSpanElement>) => void;
};

export default function BlockRenderer({
  block,
  isSelected,
  isDragging = false,
  mode,
  onSelect,
  onDragStart,
  onResizeStart
}: BlockRendererProps): ReactElement | null {
  if (!block.visible) return null;

  const commonStyle: CSSProperties = {
    position: 'absolute',
    left: block.x,
    top: block.y,
    width: block.width,
    height: block.height,
    opacity: block.opacity,
    transform: `rotate(${block.rotation}deg)`,
    transformOrigin: 'center center',
    cursor: mode === 'edit' ? (isDragging ? 'grabbing' : 'grab') : 'default',
    outline: isSelected && mode === 'edit' ? '2px solid #ef4444' : '1px dashed transparent',
    outlineOffset: 2,
    userSelect: 'none'
  };

  let content: ReactElement;
  if (block.type === 'text') {
    content = renderText(block);
  } else if (block.type === 'shape') {
    const radius = block.kind === 'circle' || block.kind === 'capsule' ? 9999 : block.kind === 'rounded' ? Math.max(12, block.radius) : block.radius;
    content = (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: block.fill,
          borderRadius: radius,
          border: `${block.borderWidth}px solid ${block.borderColor}`,
          clipPath: shapeClipPath(block.kind),
          boxShadow: '0 18px 40px rgba(0,0,0,0.28)'
        }}
      />
    );
  } else if (block.type === 'image') {
    content = renderImage(block);
  } else if (block.type === 'input') {
    content = renderInput(block);
  } else {
    content = renderGrid(block);
  }

  return (
    <button
      type="button"
      style={commonStyle}
      className="text-left"
      onClick={(event) => {
        event.stopPropagation();
        if (mode === 'edit') onSelect(block.id);
      }}
      onMouseDown={(event) => {
        if (mode === 'edit') onDragStart?.(block, event);
      }}
      aria-label={`Select ${block.name}`}
    >
      {content}
      {mode === 'edit' && isSelected ? (
        <span
          className="absolute bottom-0 right-0 h-3.5 w-3.5 translate-x-1/2 translate-y-1/2 cursor-nwse-resize rounded-full border border-black bg-red-400"
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onResizeStart?.(block, event);
          }}
        />
      ) : null}
    </button>
  );
}
