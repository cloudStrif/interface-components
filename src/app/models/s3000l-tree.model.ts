export type S3000LNodeType = 
  | 'root' 
  | 'product' 
  | 'system' 
  | 'subsystem' 
  | 'assembly' 
  | 'lci' // LSA Candidate Item
  | 'hardware' 
  | 'task' 
  | 'part' 
  | 'element' 
  | 'attribute';

export interface S3000LAttribute {
  name: string;
  value: string;
}

export interface S3000LTreeNode {
  id: string;
  tagName: string;
  name: string;
  lcn?: string; // Logistics Control Number (e.g. A01-02-03)
  type: S3000LNodeType;
  version: string;
  description?: string;
  attributes: S3000LAttribute[];
  children: S3000LTreeNode[];
  expanded?: boolean;
  selected?: boolean;
  xmlSnippet?: string;
  partNumber?: string;
  securityClass?: string;
  maintenanceInterval?: string;
  lsaCandidate?: boolean;
}
