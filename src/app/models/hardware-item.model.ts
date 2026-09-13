export type SmrCode =
  | 'PAOGH' | 'PAOGE' | 'PAOMD' | 'XAOGH' | 'XBOFH'
  | 'PAOXD' | 'PAOGD' | string;

export type ReplaceabilityLevel = 'O' | 'I' | 'D' | 'O/I' | 'O/I/D' | 'Discard';

export interface HardwareItem {
  id: string;
  lcn: string;
  name: string;
  partNumber: string;
  nsnNumber?: string;
  cageCode: string;
  smrCode: SmrCode;
  /** Quantity Per Application */
  qpa: number;
  unitPrice?: number;
  currency?: string;
  replacementLevel: ReplaceabilityLevel;
  /** Lead time in calendar days */
  leadTimeDays: number;
  /** Weight in kg */
  weight?: number;
  /** Line Replaceable Unit */
  isLru: boolean;
  /** Shop Replaceable Unit */
  isSru: boolean;
  description?: string;
  interchangeableWith?: string[];
  /** Project scope: filter by project */
  projectId?: string;
}
