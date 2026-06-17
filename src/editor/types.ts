export type EditorMode = 'edit' | 'preview';
export type BlockType = 'text' | 'shape' | 'image' | 'grid' | 'input';

export type TextAlign = 'left' | 'center' | 'right';
export type ImageFit = 'cover' | 'contain' | 'fill';

export type CanvasSettings = {
  width: number;
  height: number;
  backgroundColor: string;
};

export type DesignMeta = {
  title: string;
  canvas: CanvasSettings;
};

export type BaseBlock = {
  id: string;
  type: BlockType;
  name: string;
  visible: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
};

export type TextBlock = BaseBlock & {
  type: 'text';
  text: string;
  color: string;
  backgroundColor: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  textAlign: TextAlign;
  lineHeight: number;
  letterSpacing: number;
  padding: number;
};

export type ShapeBlock = BaseBlock & {
  type: 'shape';
  kind: 'rectangle' | 'rounded' | 'circle' | 'diamond' | 'triangle' | 'capsule';
  fill: string;
  borderColor: string;
  borderWidth: number;
  radius: number;
};

export type ImageBlock = BaseBlock & {
  type: 'image';
  src: string;
  fit: ImageFit;
  borderRadius: number;
  borderColor: string;
  borderWidth: number;
  padding: number;
  backgroundColor: string;
};

export type GridBlock = BaseBlock & {
  type: 'grid';
  rows: number;
  columns: number;
  gap: number;
  padding: number;
  cellColor: string;
  backgroundColor: string;
  showLines: boolean;
  lineColor: string;
};

export type InputBlock = BaseBlock & {
  type: 'input';
  placeholder: string;
  value: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  padding: number;
};

export type DesignBlock = TextBlock | ShapeBlock | ImageBlock | GridBlock | InputBlock;

export type DesignSchema = {
  version: '1';
  meta: DesignMeta;
  blocks: DesignBlock[];
};
