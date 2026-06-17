import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileDown, Import, Layers3, Save } from 'lucide-react';
import { deflateRaw } from 'pako';
import GridBackground from '../components/GridBackground';
import { useAuth } from '../auth/useAuth';
import { diagramStore } from '../diagrams/diagramStore';
import { normalizeSchema } from '../editor/schema';
import type { DesignSchema } from '../editor/types';

const DEFAULT_PUML = `@startuml
Alice -> Bob: Hello from Diagramify Mini
@enduml`;

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const encode6bit = (b: number): string => {
  if (b < 10) return String.fromCharCode(48 + b);
  b -= 10;
  if (b < 26) return String.fromCharCode(65 + b);
  b -= 26;
  if (b < 26) return String.fromCharCode(97 + b);
  b -= 26;
  if (b === 0) return '-';
  if (b === 1) return '_';
  return '?';
};

const append3bytes = (b1: number, b2: number, b3: number): string => {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3f;

  return encode6bit(c1 & 0x3f) + encode6bit(c2 & 0x3f) + encode6bit(c3 & 0x3f) + encode6bit(c4 & 0x3f);
};

const encodePlantUml = (source: string): string => {
  const bytes = new TextEncoder().encode(source);
  const compressed = deflateRaw(bytes, { level: 9 }) as Uint8Array;

  let encoded = '';
  for (let i = 0; i < compressed.length; i += 3) {
    if (i + 2 === compressed.length) {
      encoded += append3bytes(compressed[i], compressed[i + 1], 0);
    } else if (i + 1 === compressed.length) {
      encoded += append3bytes(compressed[i], 0, 0);
    } else {
      encoded += append3bytes(compressed[i], compressed[i + 1], compressed[i + 2]);
    }
  }

  return encoded;
};

const getPlantUmlFromSchema = (schema: DesignSchema): string => {
  const meta = schema.meta as unknown as Record<string, unknown>;
  const stored = meta.plantUml ?? meta.puml ?? meta.plantuml;

  return typeof stored === 'string' && stored.trim() ? stored : DEFAULT_PUML;
};

const putPlantUmlIntoSchema = (schema: DesignSchema, plantUml: string): DesignSchema => {
  return normalizeSchema({
    ...schema,
    meta: {
      ...schema.meta,
      plantUml,
      puml: plantUml
    } as DesignSchema['meta']
  });
};

type EditorInitialState =
  | {
      ok: true;
      diagramName: string;
      schema: DesignSchema;
      plantUml: string;
      savedAt: Date;
      status: string;
    }
  | {
      ok: false;
      diagramName: string;
      schema: null;
      plantUml: string;
      savedAt: null;
      status: string;
    };

const loadInitialState = (userId: string, diagramId: string): EditorInitialState => {
  if (!userId || !diagramId) {
    return {
      ok: false,
      diagramName: 'Diagram',
      schema: null,
      plantUml: DEFAULT_PUML,
      savedAt: null,
      status: 'Missing diagram context.'
    };
  }

  try {
    const diagram = diagramStore.get(userId, diagramId);
    const schema = normalizeSchema(diagram.schema);

    return {
      ok: true,
      diagramName: diagram.name,
      schema: putPlantUmlIntoSchema(schema, getPlantUmlFromSchema(schema)),
      plantUml: getPlantUmlFromSchema(schema),
      savedAt: new Date(diagram.updatedAt),
      status: 'Render completed'
    };
  } catch (error) {
    return {
      ok: false,
      diagramName: 'Diagram',
      schema: null,
      plantUml: DEFAULT_PUML,
      savedAt: null,
      status: (error as Error).message
    };
  }
};

const downloadTextFile = (filename: string, text: string) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

const openDownloadUrl = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  link.rel = 'noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export default function EditorPage() {
  const { diagramId = '' } = useParams();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  return <EditorWorkspace key={`${userId}:${diagramId}`} diagramId={diagramId} userId={userId} />;
}

function EditorWorkspace({ diagramId, userId }: { diagramId: string; userId: string }) {
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  const initialState = useMemo(() => loadInitialState(userId, diagramId), [diagramId, userId]);

  const [schema, setSchema] = useState<DesignSchema | null>(() => initialState.schema);
  const [plantUml, setPlantUml] = useState(() => initialState.plantUml);
  const [savedAt, setSavedAt] = useState<Date | null>(() => initialState.savedAt);
  const [status, setStatus] = useState(initialState.status);
  const [dirty, setDirty] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [autoRender, setAutoRender] = useState(true);
const diagramName = initialState.diagramName;
const [showSavedFlash, setShowSavedFlash] = useState(false);

  const encoded = useMemo(() => {
    try {
      return encodePlantUml(plantUml);
    } catch {
      return '';
    }
  }, [plantUml]);

  const svgUrl = encoded ? `https://www.plantuml.com/plantuml/svg/${encoded}` : '';
  const pngUrl = encoded ? `https://www.plantuml.com/plantuml/png/${encoded}` : '';

  const persistPlantUml = useCallback(
  (nextPlantUml: string, reason: 'manual' | 'auto') => {
    if (!userId || !diagramId || !schema) return;

    try {
      const nextSchema = putPlantUmlIntoSchema(schema, nextPlantUml);
      const saved = diagramStore.save(userId, diagramId, nextSchema);

      setSchema(normalizeSchema(saved.schema));
      setSavedAt(new Date(saved.updatedAt));
      setStatus(reason === 'manual' ? 'Saved.' : 'Autosaved.');
      setDirty(false);

      if (reason === 'manual') {
        setShowSavedFlash(true);
        window.setTimeout(() => setShowSavedFlash(false), 1200);
      }
    } catch (error) {
      setStatus(`Save failed: ${(error as Error).message}`);
    }
  },
  [diagramId, schema, userId]
);

  useEffect(() => {
    if (!dirty || !autoRender) return;

    const timer = window.setTimeout(() => {
      persistPlantUml(plantUml, 'auto');
    }, 700);

    return () => window.clearTimeout(timer);
  }, [autoRender, dirty, persistPlantUml, plantUml]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        persistPlantUml(plantUml, 'manual');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [persistPlantUml, plantUml]);

  const handlePlantUmlChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setPlantUml(event.target.value);
    setDirty(true);
    setStatus('Unsaved changes.');
  };


  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    const allowed =
      file.name.endsWith('.puml') ||
      file.name.endsWith('.plantuml') ||
      file.name.endsWith('.txt') ||
      file.type === 'text/plain';

    if (!allowed) {
      setStatus('Import failed: use .puml, .plantuml, or .txt');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const text = String(reader.result ?? DEFAULT_PUML);
      setPlantUml(text);
      setDirty(true);
      setStatus('Imported. Unsaved changes.');
      requestAnimationFrame(() => editorRef.current?.focus());
    };

    reader.onerror = () => {
      setStatus('Import failed.');
    };

    reader.readAsText(file);
  };

  const handleSavePuml = () => {
    downloadTextFile(`${diagramName || 'diagram'}.puml`, plantUml);
    setStatus('PUML downloaded.');
  };

  const handleExportSvg = () => {
    if (!svgUrl) return;
    openDownloadUrl(svgUrl, `${diagramName || 'diagram'}.svg`);
    setStatus('SVG export opened.');
  };

  const handleExportPng = () => {
    if (!pngUrl) return;
    openDownloadUrl(pngUrl, `${diagramName || 'diagram'}.png`);
    setStatus('PNG export opened.');
  };

  const zoomOut = () => setZoom((value) => clamp(Number((value - 0.1).toFixed(2)), 0.4, 2));
  const zoomIn = () => setZoom((value) => clamp(Number((value + 0.1).toFixed(2)), 0.4, 2));

  if (!schema) {
    return (
      <GridBackground>
        <div className="grid min-h-screen place-items-center px-4">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-black/70 p-6 text-center shadow-2xl shadow-black">
            <Layers3 className="mx-auto h-8 w-8 text-red-500" />
            <h1 className="mt-3 text-xl font-bold text-white">Diagram unavailable</h1>
            <p className="mt-2 text-sm text-neutral-500">{status}</p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-5 inline-flex items-center gap-2 rounded border border-red-400/40 bg-red-600 px-4 py-2 text-sm font-bold text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </button>
          </div>
        </div>
      </GridBackground>
    );
  }

  return (
    <GridBackground>
      <div className="flex h-screen flex-col overflow-hidden bg-[#0b0b0b] text-white">
        <header className="flex h-14 items-center justify-between border-b border-white/5 bg-black/80 px-3">
          <div className="flex min-w-0 items-center gap-3">
  <button
    type="button"
    onClick={() => navigate('/dashboard')}
    className="rounded border border-white/10 bg-white/[0.04] p-2 text-neutral-300 transition hover:bg-white/[0.1] hover:text-white"
    title="Back to dashboard"
  >
    <ArrowLeft className="h-4 w-4" />
  </button>

  <div className="flex items-center gap-2 font-black tracking-[0.18em] text-white">
    <Layers3 className="h-4 w-4 text-red-500" />
    DIAGRAMIFY
  </div>
</div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center rounded border border-white/10 bg-white/[0.03] font-mono text-xs text-neutral-300 md:flex">
              <button type="button" onClick={zoomOut} className="px-3 py-1.5 hover:bg-white/10">
                -
              </button>
              <span className="min-w-12 border-x border-white/10 px-3 text-center">{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={zoomIn} className="px-3 py-1.5 hover:bg-white/10">
                +
              </button>
            </div>

            <label className="hidden cursor-pointer items-center gap-1 font-mono text-xs text-neutral-300 sm:flex">
              <input
                type="checkbox"
                checked={autoRender}
                onChange={(event) => setAutoRender(event.target.checked)}
                className="accent-red-500"
              />
              Auto
            </label>

            <button
              type="button"
              onClick={handleExportPng}
              className="inline-flex items-center gap-2 rounded border border-white/10 bg-white px-3 py-1.5 text-xs font-black text-black transition hover:bg-neutral-200"
            >
              <Download className="h-3.5 w-3.5" />
              Export PNG
            </button>

            <button
              type="button"
              onClick={handleExportSvg}
              className="hidden items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/[0.1] sm:inline-flex"
            >
              <Download className="h-3.5 w-3.5" />
              Export SVG
            </button>

            <button
              type="button"
              onClick={handleSavePuml}
              className="hidden items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/[0.1] lg:inline-flex"
            >
              <FileDown className="h-3.5 w-3.5" />
              Save PUML
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="hidden items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/[0.1] lg:inline-flex"
            >
              <Import className="h-3.5 w-3.5" />
              Import
            </button>

            <button
  type="button"
  onClick={() => persistPlantUml(plantUml, 'manual')}
  className="inline-flex items-center gap-2 rounded border border-red-400/40 bg-red-600 px-3 py-1.5 text-xs font-black text-white transition hover:bg-red-500"
  title="Save"
>
  <Save className="h-4 w-4" />
  {showSavedFlash ? 'Saved' : 'Save'}
</button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".puml,.plantuml,.txt,text/plain"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </header>

        <main className="flex min-h-0 flex-1">
          <section className="flex min-w-0 flex-1 flex-col border-r border-white/10 bg-[#080808]">
            <div className="flex h-9 items-center justify-between border-b border-white/10 bg-black/40 px-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                Editor: {diagramName || 'diagram'}.puml
              </span>
              <span className="font-mono text-[10px] text-emerald-400">{dirty ? '● Unsaved' : '● Synced'}</span>
            </div>

            <div className="relative min-h-0 flex-1">
              <textarea
                ref={editorRef}
                value={plantUml}
                onChange={handlePlantUmlChange}
                spellCheck={false}
                className="h-full w-full resize-none bg-[#080808] px-10 py-5 font-mono text-sm leading-6 text-white outline-none selection:bg-red-500/30"
              />

              <div className="pointer-events-none absolute left-0 top-0 w-8 select-none py-5 text-right font-mono text-sm leading-6 text-neutral-600">
                {plantUml.split('\n').map((_, index) => (
                  <div key={index}>{index + 1}</div>
                ))}
              </div>
            </div>
          </section>

          <section className="flex min-w-0 flex-1 flex-col bg-[#101010]">
            <div className="flex h-9 items-center justify-between border-b border-white/10 bg-black/40 px-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                Live Preview
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>

            <div className="min-h-0 flex-1 overflow-auto bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:32px_32px] p-8">
              <div
                className="inline-block origin-top-left rounded-sm bg-white p-3 shadow-2xl shadow-black/60"
                style={{ transform: `scale(${zoom})` }}
              >
                {svgUrl ? (
                  <img
                    src={svgUrl}
                    alt="PlantUML preview"
                    className="block max-w-none"
                    onLoad={() => setStatus(dirty ? 'Unsaved changes.' : 'Render completed')}
                    onError={() => setStatus('Render failed. Check PlantUML syntax or connection.')}
                  />
                ) : (
                  <div className="p-6 font-mono text-sm text-black">Preview unavailable</div>
                )}
              </div>
            </div>
          </section>
        </main>

        <footer className="flex h-8 items-center justify-between border-t border-white/5 bg-black px-4 font-mono text-[10px] text-neutral-500">
          <span>UTF-8 | PlantUML | {plantUml.split('\n').length} lines</span>

          <span className={dirty ? 'text-yellow-300' : 'text-neutral-500'}>
            {savedAt ? `Saved ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : status}
          </span>

          <span className="text-emerald-500">Diagramify Mini</span>
        </footer>
      </div>
    </GridBackground>
  );
}
