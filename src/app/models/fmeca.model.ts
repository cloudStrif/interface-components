/**
 * Criticality categories (MIL-STD-1629A / S3000L)
 * Cat I  : Catastrophic — Perte du système ou risque pour la vie
 * Cat II : Critical     — Dommage majeur ou mission compromise
 * Cat III: Marginal     — Dégradation de performance
 * Cat IV : Minor        — Inconvénient sans impact mission
 */
export type FmecaCriticality = 'I' | 'II' | 'III' | 'IV';

export interface FmecaRecord {
  id: string;
  lcn: string;
  itemName: string;
  /** Fonction de l'élément dans le système */
  function: string;
  failureMode: string;
  failureCause: string;
  localEffect: string;
  systemEffect: string;
  missionEffect: string;
  detectionMethod: string;
  compensatingProvision?: string;
  severity: FmecaCriticality;
  /** Taux de défaillance λ en failures/10^6 hours */
  failureRate: number;
  /** MTBF calculé en heures de vol */
  mtbf?: number;
  projectId?: string;
}
