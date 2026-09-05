/**
 * Standard File Tree Node interface.
 */
export interface SafranTreeNode<T = unknown> {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  size?: string;
  modifiedDate?: string;
  badge?: string;
  badgeColor?: 'blue' | 'cyan' | 'green' | 'amber' | 'purple' | 'red';
  icon?: string;
  children?: SafranTreeNode<T>[];
  isExpanded?: boolean;
  disabled?: boolean;
  data?: T;
}

/**
 * Event payload emitted when a tree node action button is clicked.
 */
export interface SafranNodeActionEvent<T = unknown> {
  action: 'open' | 'download' | 'preview' | 'delete' | 'details' | string;
  node: SafranTreeNode<T>;
  event: MouseEvent;
}
