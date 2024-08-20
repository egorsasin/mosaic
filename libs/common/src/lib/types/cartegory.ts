import { ConfigurableOperation } from './configurable-operation';

export interface Category {
  __typename?: 'Category';
  createdAt: Date;
  description: string;
  filters: ConfigurableOperation[];
  id: number;
  slug: string;
  isPrivate: boolean;
  name: string;
}
