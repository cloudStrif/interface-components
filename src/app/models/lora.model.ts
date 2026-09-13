/** O=Organizational, I=Intermediate, D=Depot, Discard=Rebut */
export type LoraLevel = 'O' | 'I' | 'D' | 'Discard';

export type LoraDecision = 'Repair' | 'Discard' | 'Return to Supplier';

export interface LoraRecord {
  id: string;
  lcn: string;
  itemName: string;
  partNumber: string;
  /** Niveau recommandé par l'analyse économique */
  recommendedLevel: LoraLevel;
  decision: LoraDecision;
  /** Coûts de réparation à chaque échelon (€) */
  repairCostO?: number;
  repairCostI?: number;
  repairCostD?: number;
  acquisitionCost?: number;
  /** Délai de remise en service (Turn-Around-Time) en jours */
  tatO?: number;
  tatI?: number;
  tatD?: number;
  justification?: string;
  projectId?: string;
}
