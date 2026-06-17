import type {
  BlockType,
  DesignBlock,
  DesignSchema,
  GridBlock,
  ImageBlock,
  InputBlock,
  ShapeBlock,
  TextBlock
} from './types';

const DEFAULT_CANVAS = {
  width: 980,
  height: 680,
  backgroundColor: '#171717'
};

const DEFAULT_META_TITLE = 'Untitled diagram';
const SHAPE_KINDS: ShapeBlock['kind'][] = ['rectangle', 'rounded', 'circle', 'diamond', 'triangle', 'capsule'];

const asNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const asString = (value: unknown, fallback: string): string => (typeof value === 'string' ? value : fallback);

const asBoolean = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback);

const uid = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `blk_${crypto.randomUUID()}`;
  }
  return `blk_${Math.random().toString(36).slice(2, 9)}`;
};

const baseBlock = (type: BlockType, index = 0) => ({
  id: uid(),
  type,
  name: `${type[0].toUpperCase()}${type.slice(1)} Block ${index + 1}`,
  visible: true,
  x: 96 + index * 18,
  y: 92 + index * 18,
  width: 180,
  height: 84,
  rotation: 0,
  opacity: 1
});

export const createBlock = (type: BlockType, index = 0): DesignBlock => {
  const base = baseBlock(type, index);

  if (type === 'text') {
    return {
      ...base,
      type: 'text',
      name: `Text ${index + 1}`,
      text: 'New label',
      color: '#f5f5f5',
      backgroundColor: 'transparent',
      fontFamily: 'Inter, "Segoe UI", sans-serif',
      fontSize: 20,
      fontWeight: 700,
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'center',
      lineHeight: 1.2,
      letterSpacing: 0,
      padding: 4
    };
  }

  if (type === 'shape') {
    return {
      ...base,
      type: 'shape',
      name: `Shape ${index + 1}`,
      kind: 'rounded',
      fill: index === 0 ? '#dc2626' : '#1f2937',
      borderColor: index === 0 ? '#f87171' : '#60a5fa',
      borderWidth: 1,
      radius: 8
    };
  }

  if (type === 'image') {
    return {
      ...base,
      type: 'image',
      name: `Image ${index + 1}`,
      width: 240,
      height: 150,
      src: '',
      fit: 'cover',
      borderRadius: 8,
      borderColor: '#f59e0b',
      borderWidth: 1,
      padding: 0,
      backgroundColor: '#111827'
    };
  }

  if (type === 'input') {
    return {
      ...base,
      type: 'input',
      name: `Input ${index + 1}`,
      width: 260,
      height: 52,
      placeholder: 'Type here...',
      value: '',
      fontSize: 16,
      color: '#f5f5f5',
      backgroundColor: '#0a0a0a',
      borderColor: '#525252',
      borderWidth: 1,
      borderRadius: 8,
      padding: 12
    };
  }

  return {
    ...base,
    type: 'grid',
    name: `Grid ${index + 1}`,
    width: 320,
    height: 220,
    rows: 4,
    columns: 4,
    gap: 8,
    padding: 8,
    cellColor: '#262626',
    backgroundColor: 'transparent',
    showLines: true,
    lineColor: '#525252'
  };
};

const normalizeTextBlock = (raw: Record<string, unknown>, index: number): TextBlock => {
  const base = createBlock('text', index) as TextBlock;
  return {
    ...base,
    id: asString(raw.id, base.id),
    name: asString(raw.name, asString(raw.label, base.name)),
    visible: asBoolean(raw.visible, true),
    x: asNumber(raw.x, base.x),
    y: asNumber(raw.y, base.y),
    width: asNumber(raw.width, base.width),
    height: asNumber(raw.height, base.height),
    rotation: asNumber(raw.rotation, 0),
    opacity: asNumber(raw.opacity, 1),
    text: asString(raw.text, asString(raw.label, base.text)),
    color: asString(raw.color, asString(raw.textColor, base.color)),
    backgroundColor: asString(raw.backgroundColor, 'transparent'),
    fontFamily: asString(raw.fontFamily, base.fontFamily),
    fontSize: asNumber(raw.fontSize, base.fontSize),
    fontWeight: asNumber(raw.fontWeight, base.fontWeight),
    fontStyle: raw.fontStyle === 'italic' ? 'italic' : 'normal',
    textDecoration:
      raw.textDecoration === 'underline' || raw.textDecoration === 'line-through'
        ? raw.textDecoration
        : 'none',
    textAlign: ['left', 'center', 'right'].includes(String(raw.textAlign)) ? (raw.textAlign as TextBlock['textAlign']) : base.textAlign,
    lineHeight: asNumber(raw.lineHeight, base.lineHeight),
    letterSpacing: asNumber(raw.letterSpacing, base.letterSpacing),
    padding: asNumber(raw.padding, base.padding)
  };
};

const normalizeShapeBlock = (raw: Record<string, unknown>, index: number): ShapeBlock => {
  const base = createBlock('shape', index) as ShapeBlock;
  return {
    ...base,
    id: asString(raw.id, base.id),
    name: asString(raw.name, asString(raw.label, base.name)),
    visible: asBoolean(raw.visible, true),
    x: asNumber(raw.x, base.x),
    y: asNumber(raw.y, base.y),
    width: asNumber(raw.width, base.width),
    height: asNumber(raw.height, base.height),
    rotation: asNumber(raw.rotation, 0),
    opacity: asNumber(raw.opacity, 1),
    kind: SHAPE_KINDS.includes(raw.kind as ShapeBlock['kind']) ? (raw.kind as ShapeBlock['kind']) : base.kind,
    fill: asString(raw.fill, asString(raw.color, base.fill)),
    borderColor: asString(raw.borderColor, asString(raw.stroke, base.borderColor)),
    borderWidth: asNumber(raw.borderWidth, asNumber(raw.strokeWidth, base.borderWidth)),
    radius: asNumber(raw.radius, base.radius)
  };
};

const normalizeImageBlock = (raw: Record<string, unknown>, index: number): ImageBlock => {
  const base = createBlock('image', index) as ImageBlock;
  return {
    ...base,
    id: asString(raw.id, base.id),
    name: asString(raw.name, asString(raw.label, base.name)),
    visible: asBoolean(raw.visible, true),
    x: asNumber(raw.x, base.x),
    y: asNumber(raw.y, base.y),
    width: asNumber(raw.width, base.width),
    height: asNumber(raw.height, base.height),
    rotation: asNumber(raw.rotation, 0),
    opacity: asNumber(raw.opacity, 1),
    src: asString(raw.src, base.src),
    fit: ['cover', 'contain', 'fill'].includes(String(raw.fit)) ? (raw.fit as ImageBlock['fit']) : base.fit,
    borderRadius: asNumber(raw.borderRadius, asNumber(raw.radius, base.borderRadius)),
    borderColor: asString(raw.borderColor, asString(raw.stroke, base.borderColor)),
    borderWidth: asNumber(raw.borderWidth, asNumber(raw.strokeWidth, base.borderWidth)),
    padding: asNumber(raw.padding, base.padding),
    backgroundColor: asString(raw.backgroundColor, asString(raw.fill, base.backgroundColor))
  };
};

const normalizeGridBlock = (raw: Record<string, unknown>, index: number): GridBlock => {
  const base = createBlock('grid', index) as GridBlock;
  return {
    ...base,
    id: asString(raw.id, base.id),
    name: asString(raw.name, base.name),
    visible: asBoolean(raw.visible, true),
    x: asNumber(raw.x, base.x),
    y: asNumber(raw.y, base.y),
    width: asNumber(raw.width, base.width),
    height: asNumber(raw.height, base.height),
    rotation: asNumber(raw.rotation, 0),
    opacity: asNumber(raw.opacity, 1),
    rows: Math.max(1, Math.min(24, asNumber(raw.rows, base.rows))),
    columns: Math.max(1, Math.min(24, asNumber(raw.columns, base.columns))),
    gap: Math.max(0, asNumber(raw.gap, base.gap)),
    padding: Math.max(0, asNumber(raw.padding, base.padding)),
    cellColor: asString(raw.cellColor, base.cellColor),
    backgroundColor: asString(raw.backgroundColor, base.backgroundColor),
    showLines: asBoolean(raw.showLines, base.showLines),
    lineColor: asString(raw.lineColor, base.lineColor)
  };
};

const normalizeInputBlock = (raw: Record<string, unknown>, index: number): InputBlock => {
  const base = createBlock('input', index) as InputBlock;
  return {
    ...base,
    id: asString(raw.id, base.id),
    name: asString(raw.name, base.name),
    visible: asBoolean(raw.visible, true),
    x: asNumber(raw.x, base.x),
    y: asNumber(raw.y, base.y),
    width: Math.max(80, asNumber(raw.width, base.width)),
    height: Math.max(28, asNumber(raw.height, base.height)),
    rotation: asNumber(raw.rotation, 0),
    opacity: asNumber(raw.opacity, 1),
    placeholder: asString(raw.placeholder, base.placeholder),
    value: asString(raw.value, base.value),
    fontSize: Math.max(8, asNumber(raw.fontSize, base.fontSize)),
    color: asString(raw.color, base.color),
    backgroundColor: asString(raw.backgroundColor, base.backgroundColor),
    borderColor: asString(raw.borderColor, base.borderColor),
    borderWidth: Math.max(0, asNumber(raw.borderWidth, base.borderWidth)),
    borderRadius: Math.max(0, asNumber(raw.borderRadius, base.borderRadius)),
    padding: Math.max(0, asNumber(raw.padding, base.padding))
  };
};

export const normalizeSchema = (input: unknown): DesignSchema => {
  const root = (input ?? {}) as Record<string, unknown>;
  const meta = (root.meta ?? {}) as Record<string, unknown>;
  const legacyCanvas = (root.canvas ?? {}) as Record<string, unknown>;
  const canvas = (meta.canvas ?? legacyCanvas) as Record<string, unknown>;
  const rawBlocks = Array.isArray(root.blocks) ? root.blocks : [];

  const blocks = rawBlocks
    .map((block, index) => {
      if (!block || typeof block !== 'object') return null;
      const raw = block as Record<string, unknown>;
      if (raw.type === 'text') return normalizeTextBlock(raw, index);
      if (raw.type === 'shape') return normalizeShapeBlock(raw, index);
      if (raw.type === 'image') return normalizeImageBlock(raw, index);
      if (raw.type === 'grid') return normalizeGridBlock(raw, index);
      if (raw.type === 'input') return normalizeInputBlock(raw, index);
      return null;
    })
    .filter((block): block is DesignBlock => Boolean(block));

  return {
    version: '1',
    meta: {
      title: asString(meta.title, DEFAULT_META_TITLE),
      canvas: {
        width: asNumber(canvas.width, DEFAULT_CANVAS.width),
        height: asNumber(canvas.height, DEFAULT_CANVAS.height),
        backgroundColor: asString(canvas.backgroundColor, asString(canvas.background, DEFAULT_CANVAS.backgroundColor))
      }
    },
    blocks
  };
};

export const createBlankSchema = (title = DEFAULT_META_TITLE): DesignSchema =>
  normalizeSchema({
    version: '1',
    meta: {
      title,
      canvas: DEFAULT_CANVAS
    },
    blocks: [
      { ...createBlock('shape', 0), name: 'Start', x: 96, y: 92, width: 150, height: 72 },
      { ...createBlock('shape', 1), name: 'Cognito auth', x: 348, y: 92, width: 178, height: 72, fill: '#1f2937' },
      { ...createBlock('shape', 2), name: 'Editor', x: 612, y: 92, width: 150, height: 72, fill: '#1f2937' },
      { ...createBlock('text', 3), name: 'Note', text: 'localStorage first', x: 350, y: 262, width: 190, height: 44 }
    ]
  });

export const findBlock = (schema: DesignSchema, blockId: string): DesignBlock | undefined =>
  schema.blocks.find((block) => block.id === blockId);
