import type { ReactElement, ReactNode } from 'react';
import type { DesignBlock } from './types';

type PropertyPanelProps = {
  block: DesignBlock | undefined;
  disabled: boolean;
  onPatch: (patch: Partial<DesignBlock>) => void;
  onDelete: () => void;
};

function Field({ label, children }: { label: string; children: ReactNode }): ReactElement {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

function TextInput({ value, onChange }: { value: string; onChange: (value: string) => void }): ReactElement {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-red-500/60"
    />
  );
}

function NumberInput({
  value,
  step = 1,
  min,
  max,
  onChange
}: {
  value: number;
  step?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}): ReactElement {
  return (
    <input
      type="number"
      value={Number.isInteger(value) ? value : Number(value.toFixed(2))}
      step={step}
      min={min}
      max={max}
      onChange={(event) => onChange(Number(event.target.value) || 0)}
      className="w-full rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-red-500/60"
    />
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (value: string) => void }): ReactElement {
  const colorValue = value.startsWith('#') ? value : '#000000';
  return (
    <div className="flex gap-2">
      <input type="color" value={colorValue} onChange={(event) => onChange(event.target.value)} className="h-10 w-12 rounded border border-white/10 bg-black/60 p-1" />
      <input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-red-500/60" />
    </div>
  );
}

function patch<T extends DesignBlock>(key: keyof T, value: unknown): Partial<DesignBlock> {
  return { [key]: value } as Partial<DesignBlock>;
}

export default function PropertyPanel({ block, disabled, onPatch, onDelete }: PropertyPanelProps): ReactElement {
  return (
    <aside className="hidden w-72 shrink-0 border-l border-white/5 bg-black/70 md:block">
      <div className="border-b border-white/5 p-4">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">Properties</div>
        <p className="mt-2 text-xs text-neutral-600">{block ? block.type : 'No selection'}</p>
      </div>

      {!block ? (
        <div className="p-4 text-sm text-neutral-500">Select a block to edit properties.</div>
      ) : (
        <div className="custom-scrollbar max-h-[calc(100vh-88px)] space-y-4 overflow-y-auto p-4">
          <Field label="Layer name">
            <TextInput value={block.name} onChange={(value) => onPatch(patch<typeof block>('name', value))} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="X">
              <NumberInput value={block.x} onChange={(value) => onPatch(patch<typeof block>('x', value))} />
            </Field>
            <Field label="Y">
              <NumberInput value={block.y} onChange={(value) => onPatch(patch<typeof block>('y', value))} />
            </Field>
            <Field label="Width">
              <NumberInput min={1} value={block.width} onChange={(value) => onPatch(patch<typeof block>('width', value))} />
            </Field>
            <Field label="Height">
              <NumberInput min={1} value={block.height} onChange={(value) => onPatch(patch<typeof block>('height', value))} />
            </Field>
            <Field label="Rotation">
              <NumberInput value={block.rotation} onChange={(value) => onPatch(patch<typeof block>('rotation', value))} />
            </Field>
            <Field label="Opacity">
              <NumberInput step={0.05} min={0} max={1} value={block.opacity} onChange={(value) => onPatch(patch<typeof block>('opacity', value))} />
            </Field>
          </div>

          <label className="flex items-center gap-2 rounded border border-white/10 bg-black/50 px-3 py-2 text-sm text-neutral-300">
            <input type="checkbox" checked={block.visible} onChange={(event) => onPatch(patch<typeof block>('visible', event.target.checked))} />
            Visible
          </label>

          {block.type === 'text' ? (
            <div className="space-y-3 rounded border border-white/10 bg-white/[0.03] p-3">
              <Field label="Text">
                <textarea
                  value={block.text}
                  rows={4}
                  onChange={(event) => onPatch(patch<typeof block>('text', event.target.value))}
                  className="w-full rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-red-500/60"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Font size">
                  <NumberInput min={1} value={block.fontSize} onChange={(value) => onPatch(patch<typeof block>('fontSize', value))} />
                </Field>
                <Field label="Weight">
                  <NumberInput min={100} max={900} step={100} value={block.fontWeight} onChange={(value) => onPatch(patch<typeof block>('fontWeight', value))} />
                </Field>
                <Field label="Padding">
                  <NumberInput min={0} value={block.padding} onChange={(value) => onPatch(patch<typeof block>('padding', value))} />
                </Field>
                <Field label="Align">
                  <select value={block.textAlign} onChange={(event) => onPatch(patch<typeof block>('textAlign', event.target.value))} className="w-full rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-red-500/60">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </Field>
              </div>
              <Field label="Text color">
                <ColorInput value={block.color} onChange={(value) => onPatch(patch<typeof block>('color', value))} />
              </Field>
              <Field label="Background">
                <ColorInput value={block.backgroundColor === 'transparent' ? '#000000' : block.backgroundColor} onChange={(value) => onPatch(patch<typeof block>('backgroundColor', value))} />
              </Field>
            </div>
          ) : null}

          {block.type === 'shape' ? (
            <div className="space-y-3 rounded border border-white/10 bg-white/[0.03] p-3">
              <Field label="Kind">
                <select value={block.kind} onChange={(event) => onPatch(patch<typeof block>('kind', event.target.value))} className="w-full rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-red-500/60">
                  <option value="rectangle">Rectangle</option>
                  <option value="rounded">Rounded</option>
                  <option value="circle">Circle</option>
                  <option value="diamond">Diamond</option>
                  <option value="triangle">Triangle</option>
                  <option value="capsule">Capsule</option>
                </select>
              </Field>
              <Field label="Fill">
                <ColorInput value={block.fill} onChange={(value) => onPatch(patch<typeof block>('fill', value))} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Radius">
                  <NumberInput min={0} value={block.radius} onChange={(value) => onPatch(patch<typeof block>('radius', value))} />
                </Field>
                <Field label="Border">
                  <NumberInput min={0} value={block.borderWidth} onChange={(value) => onPatch(patch<typeof block>('borderWidth', value))} />
                </Field>
              </div>
              <Field label="Border color">
                <ColorInput value={block.borderColor} onChange={(value) => onPatch(patch<typeof block>('borderColor', value))} />
              </Field>
            </div>
          ) : null}

          {block.type === 'image' ? (
            <div className="space-y-3 rounded border border-white/10 bg-white/[0.03] p-3">
              <Field label="Image URL / data">
                <TextInput value={block.src} onChange={(value) => onPatch(patch<typeof block>('src', value))} />
              </Field>
              <Field label="Fit">
                <select value={block.fit} onChange={(event) => onPatch(patch<typeof block>('fit', event.target.value))} className="w-full rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-red-500/60">
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="fill">Fill</option>
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Padding">
                  <NumberInput min={0} value={block.padding} onChange={(value) => onPatch(patch<typeof block>('padding', value))} />
                </Field>
                <Field label="Radius">
                  <NumberInput min={0} value={block.borderRadius} onChange={(value) => onPatch(patch<typeof block>('borderRadius', value))} />
                </Field>
                <Field label="Border">
                  <NumberInput min={0} value={block.borderWidth} onChange={(value) => onPatch(patch<typeof block>('borderWidth', value))} />
                </Field>
              </div>
              <Field label="Border color">
                <ColorInput value={block.borderColor} onChange={(value) => onPatch(patch<typeof block>('borderColor', value))} />
              </Field>
            </div>
          ) : null}

          <button
            type="button"
            onClick={onDelete}
            disabled={disabled}
            className="flex w-full items-center justify-center rounded border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete Layer
          </button>
        </div>
      )}
    </aside>
  );
}
