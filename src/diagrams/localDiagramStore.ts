import type { DesignSchema, Diagram } from './types';
import type { DiagramStore } from './diagramStore';
import { createBlankSchema as createEditorBlankSchema, normalizeSchema } from '../editor/schema';

const storageKeyForUser = (userId: string): string => `diagramify:diagrams:${userId}`;

const nowIso = (): string => new Date().toISOString();

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `diagram-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
};

export const createBlankSchema = (title?: string): DesignSchema => createEditorBlankSchema(title);

const readDiagrams = (userId: string): Diagram[] => {
  const raw = window.localStorage.getItem(storageKeyForUser(userId));
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is Diagram => {
      if (!item || typeof item !== 'object') return false;
      const candidate = item as Partial<Diagram>;
      return (
        typeof candidate.id === 'string' &&
        typeof candidate.userId === 'string' &&
        typeof candidate.name === 'string' &&
        typeof candidate.createdAt === 'string' &&
        typeof candidate.updatedAt === 'string' &&
        Boolean(candidate.schema)
      );
    }).map((diagram) => ({ ...diagram, schema: normalizeSchema(diagram.schema) }));
  } catch {
    return [];
  }
};

const writeDiagrams = (userId: string, diagrams: Diagram[]): void => {
  window.localStorage.setItem(storageKeyForUser(userId), JSON.stringify(diagrams));
};

const assertUserId = (userId: string): void => {
  if (!userId.trim()) {
    throw new Error('userId is required.');
  }
};

export const listDiagrams = (userId: string): Diagram[] => {
  assertUserId(userId);

  return readDiagrams(userId)
    .filter((diagram) => diagram.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
};

export const getDiagram = (userId: string, diagramId: string): Diagram => {
  assertUserId(userId);
  const diagram = readDiagrams(userId).find((item) => item.userId === userId && item.id === diagramId);

  if (!diagram) {
    throw new Error('Diagram not found.');
  }

  return diagram;
};

export const createDiagram = (userId: string, name: string): Diagram => {
  assertUserId(userId);

  const timestamp = nowIso();
  const diagram: Diagram = {
    id: createId(),
    userId,
    name: name.trim() || 'Untitled diagram',
    schema: createBlankSchema(name?.trim() || 'Untitled diagram'),
    createdAt: timestamp,
    updatedAt: timestamp
  };

  writeDiagrams(userId, [...readDiagrams(userId), diagram]);
  return diagram;
};

export const renameDiagram = (userId: string, diagramId: string, name: string): Diagram => {
  assertUserId(userId);
  const nextName = name.trim();
  if (!nextName) {
    throw new Error('Diagram name is required.');
  }

  let renamed: Diagram | null = null;
  const diagrams = readDiagrams(userId).map((diagram) => {
    if (diagram.userId !== userId || diagram.id !== diagramId) {
      return diagram;
    }

    renamed = {
      ...diagram,
      name: nextName,
      updatedAt: nowIso()
    };
    return renamed;
  });

  if (!renamed) {
    throw new Error('Diagram not found.');
  }

  writeDiagrams(userId, diagrams);
  return renamed;
};

export const deleteDiagram = (userId: string, diagramId: string): void => {
  assertUserId(userId);
  const diagrams = readDiagrams(userId);
  const nextDiagrams = diagrams.filter((diagram) => !(diagram.userId === userId && diagram.id === diagramId));

  if (nextDiagrams.length === diagrams.length) {
    throw new Error('Diagram not found.');
  }

  writeDiagrams(userId, nextDiagrams);
};

export const saveDiagram = (userId: string, diagramId: string, schema: DesignSchema): Diagram => {
  assertUserId(userId);

  let saved: Diagram | null = null;
  const diagrams = readDiagrams(userId).map((diagram) => {
    if (diagram.userId !== userId || diagram.id !== diagramId) {
      return diagram;
    }

    saved = {
      ...diagram,
      schema: normalizeSchema(schema),
      updatedAt: nowIso()
    };
    return saved;
  });

  if (!saved) {
    throw new Error('Diagram not found.');
  }

  writeDiagrams(userId, diagrams);
  return saved;
};

export const localDiagramStore: DiagramStore = {
  list: listDiagrams,
  get: getDiagram,
  create: createDiagram,
  rename: renameDiagram,
  delete: deleteDiagram,
  save: saveDiagram
};
