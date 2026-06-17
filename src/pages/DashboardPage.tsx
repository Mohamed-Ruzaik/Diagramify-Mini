import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Clock3,
  Edit3,
  ExternalLink,
  FolderKanban,
  Layers3,
  LogOut,
  Plus,
  Search,
  Trash2,
  X
} from 'lucide-react';
import GridBackground from '../components/GridBackground';
import { useAuth } from '../auth/useAuth';
import { diagramStore } from '../diagrams/diagramStore';
import type { Diagram } from '../diagrams/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [search, setSearch] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [status, setStatus] = useState('Ready.');

  const userId = user?.id ?? '';
  const [diagrams, setDiagrams] = useState<Diagram[]>(() => (userId ? diagramStore.list(userId) : []));

  const refreshDiagrams = () => {
    setDiagrams(userId ? diagramStore.list(userId) : []);
  };

  const filteredDiagrams = useMemo(() => {
    const term = search.trim().toLowerCase();
    return diagrams.filter((diagram) => !term || diagram.name.toLowerCase().includes(term));
  }, [diagrams, search]);

  const createDiagram = () => {
    if (!userId) return;

    const diagram = diagramStore.create(userId, 'Untitled diagram');
    refreshDiagrams();
    setStatus(`Created "${diagram.name}".`);
    navigate(`/editor/${diagram.id}`);
  };

  const saveRename = (diagram: Diagram) => {
    const nextName = renameDraft.trim();
    if (!nextName) return;
    if (!userId) return;

    const renamed = diagramStore.rename(userId, diagram.id, nextName);
    refreshDiagrams();
    setStatus(`Renamed to "${renamed.name}".`);
    setRenamingId(null);
    setRenameDraft('');
  };

  const deleteDiagram = (diagram: Diagram) => {
    if (!userId) return;

    diagramStore.delete(userId, diagram.id);
    refreshDiagrams();
    setStatus(`Deleted "${diagram.name}".`);
  };

  return (
    <GridBackground>
      <div className="flex h-screen overflow-hidden">
        <aside className="flex w-64 shrink-0 flex-col border-r border-white/5 bg-black/78 backdrop-blur">
          <div className="flex h-16 items-center border-b border-white/5 px-5">
            <div className="flex items-center gap-2 font-black tracking-[0.2em] text-white">
              <Layers3 className="h-5 w-5 text-red-500" />
              DIAGRAMIFY
            </div>
          </div>

          <div className="border-b border-white/5 p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded border border-white/10 bg-neutral-900 text-sm font-bold text-red-200">
                {user?.email.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-white">{user?.email}</div>
                <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Session active
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs text-neutral-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>

          <nav className="flex-1 px-4 py-5">
            <button className="flex w-full items-center gap-3 rounded border border-white/10 bg-white/[0.08] px-3 py-2.5 text-sm font-semibold text-white">
              <FolderKanban className="h-4 w-4 text-red-300" />
              Recent diagrams
            </button>
          </nav>

          <div className="border-t border-white/5 p-4 font-mono text-[10px] text-neutral-500">
            <div>localStorage workspace</div>
            <div className="mt-2 truncate text-neutral-600">{status}</div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-24 items-end justify-between border-b border-white/5 bg-black/45 px-8 pb-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Dashboard</h1>
              <p className="mt-1 text-sm text-neutral-500">Create, rename, delete, and reopen your recent diagrams.</p>
            </div>
            <button
              type="button"
              onClick={createDiagram}
              className="flex items-center gap-2 rounded border border-red-400/40 bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500"
            >
              <Plus className="h-4 w-4" />
              Create diagram
            </button>
          </header>

          <div className="flex items-center justify-between px-8 py-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded border border-white/10 bg-black/55 py-2 pl-9 pr-3 font-mono text-xs text-white outline-none transition focus:border-red-500/60"
                placeholder="Search diagrams..."
              />
            </div>
            <span className="rounded border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-neutral-500">
              {filteredDiagrams.length} diagram(s)
            </span>
          </div>

          <section className="custom-scrollbar flex-1 overflow-y-auto px-8 pb-8">
            {filteredDiagrams.length === 0 ? (
              <div className="grid h-full min-h-[360px] place-items-center rounded-lg border border-dashed border-white/10 bg-black/35 px-6 text-center">
                <div>
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded border border-white/10 bg-white/[0.04]">
                    <FolderKanban className="h-7 w-7 text-neutral-400" />
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-white">
                    {search.trim() ? 'No matching diagrams' : 'No diagrams yet'}
                  </h2>
                  <p className="mt-2 max-w-sm text-sm text-neutral-500">
                    {search.trim()
                      ? 'Clear the search or create a new diagram for this workspace.'
                      : 'Create your first local diagram and open it in the editor.'}
                  </p>
                  <button
                    type="button"
                    onClick={createDiagram}
                    className="mt-5 inline-flex items-center gap-2 rounded border border-red-400/40 bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500"
                  >
                    <Plus className="h-4 w-4" />
                    Create diagram
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid auto-rows-min grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredDiagrams.map((diagram) => (
                  <article
                    key={diagram.id}
                    className="group rounded-lg border border-white/10 bg-black/55 p-5 shadow-xl shadow-black/20 transition hover:border-white/20 hover:bg-black/70"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="grid h-10 w-10 place-items-center rounded border border-white/10 bg-neutral-900">
                        <FolderKanban className="h-5 w-5 text-neutral-300 group-hover:text-white" />
                      </div>
                      <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 font-mono text-[10px] text-emerald-300">
                        local
                      </span>
                    </div>

                    {renamingId === diagram.id ? (
                      <div className="mb-3 flex items-center gap-2">
                        <input
                          autoFocus
                          value={renameDraft}
                          onChange={(event) => setRenameDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') saveRename(diagram);
                            if (event.key === 'Escape') setRenamingId(null);
                          }}
                          className="min-w-0 flex-1 rounded border border-white/10 bg-black/60 px-2 py-1.5 text-sm text-white outline-none focus:border-red-500/60"
                        />
                        <button
                          type="button"
                          onClick={() => saveRename(diagram)}
                          className="rounded border border-emerald-400/30 bg-emerald-500/10 p-1.5 text-emerald-300"
                          title="Save rename"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingId(null)}
                          className="rounded border border-white/10 bg-white/[0.04] p-1.5 text-neutral-300"
                          title="Cancel rename"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <h2 className="mb-1 truncate text-lg font-bold text-white">{diagram.name}</h2>
                    )}

                    <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500">
                      <Clock3 className="h-3.5 w-3.5" />
                      {new Date(diagram.updatedAt).toLocaleString()}
                    </div>

                    <div className="mt-5 flex items-center gap-2 border-t border-white/5 pt-4">
                      <button
                        type="button"
                        onClick={() => navigate(`/editor/${diagram.id}`)}
                        className="flex flex-1 items-center justify-center gap-2 rounded bg-white/[0.08] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.14]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open editor
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRenamingId(diagram.id);
                          setRenameDraft(diagram.name);
                        }}
                        className="rounded border border-white/10 bg-white/[0.04] p-2 text-neutral-300 transition hover:text-white"
                        title="Rename diagram"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDiagram(diagram)}
                        className="rounded border border-white/10 bg-white/[0.04] p-2 text-neutral-300 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200"
                        title="Delete diagram"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </GridBackground>
  );
}
