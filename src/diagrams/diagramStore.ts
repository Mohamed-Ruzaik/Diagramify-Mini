import { localDiagramStore } from './localDiagramStore';
import type { DesignSchema, Diagram } from './types';

export type DiagramStore = {
  list: (userId: string) => Diagram[];
  get: (userId: string, diagramId: string) => Diagram;
  create: (userId: string, name: string) => Diagram;
  rename: (userId: string, diagramId: string, name: string) => Diagram;
  delete: (userId: string, diagramId: string) => void;
  save: (userId: string, diagramId: string, schema: DesignSchema) => Diagram;
};

// TODO: Add a DynamoDB-backed DiagramStore implementation behind this same interface.
// Backend options: API Gateway + Lambda or AppSync.
// DynamoDB key design: PK USER#<userId>, SK DIAGRAM#<diagramId>.
export const diagramStore: DiagramStore = localDiagramStore;
