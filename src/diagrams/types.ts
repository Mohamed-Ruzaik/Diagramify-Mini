export type { DesignBlock, DesignSchema } from '../editor/types';
import type { DesignSchema } from '../editor/types';

export type Diagram = {
  id: string;
  userId: string;
  name: string;
  schema: DesignSchema;
  createdAt: string;
  updatedAt: string;
};
