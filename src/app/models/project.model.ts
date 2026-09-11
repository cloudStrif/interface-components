export type S3000LVersion = '1.1' | '2.0';

export interface Project {
  id: string;
  name: string;
  s3000lVersion: S3000LVersion;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  nodeCount?: number;
  isDefault?: boolean;
}
