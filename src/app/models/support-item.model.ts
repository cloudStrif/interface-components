export type SupportItemCategory =
  | 'Spare Part'
  | 'Tool'
  | 'GSE'
  | 'Technical Publication'
  | 'Training'
  | 'Facility';

export interface SupportItem {
  id: string;
  /** Référence catalogue ou NSN */
  referenceNumber: string;
  name: string;
  category: SupportItemCategory;
  /** LCN(s) auxquels cet article est rattaché */
  linkedLcns: string[];
  stockQuantity?: number;
  unitPrice?: number;
  currency?: string;
  supplier?: string;
  description?: string;
  /** Outillages de mesure nécessitant un étalonnage périodique */
  calibrationRequired?: boolean;
  calibrationFrequencyMonths?: number;
  projectId?: string;
}
