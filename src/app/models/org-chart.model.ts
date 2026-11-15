import { TreeNode } from '@openng/optimus-ui/api';

export type SbdOrgNodeType = 'root' | 'system' | 'subsystem' | 'assembly' | 'component' | 'department';

export type SbdOrgNodeStatus = 'active' | 'maintenance' | 'critical' | 'planned';

export interface SbdOrgNodeData {
  id: string;
  code: string;
  title: string;
  category?: string;
  department?: string;
  manager?: string;
  avatar?: string;
  status?: SbdOrgNodeStatus;
  description?: string;
  stats?: {
    componentsCount?: number;
    tasksCount?: number;
    reliabilityRate?: string;
    mtbfHours?: number;
  };
  themeColor?: 'indigo' | 'blue' | 'emerald' | 'amber' | 'violet' | 'sky' | 'rose';
  tags?: string[];
}

export type SbdOrgTreeNode = TreeNode<SbdOrgNodeData>;
