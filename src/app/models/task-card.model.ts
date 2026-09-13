export type TaskType = 'Preventive' | 'Corrective' | 'Servicing' | 'Inspection' | 'Diagnostic';

/** O=Organizational (ligne), I=Intermediate (atelier), D=Depot (révision générale) */
export type MaintenanceLevel = 'O' | 'I' | 'D';

export type TaskFrequencyUnit = 'FH' | 'FC' | 'Days' | 'Months' | 'Years' | 'On Condition';

export interface TaskResource {
  role: string;
  count: number;
  durationHours: number;
}

export interface TaskCard {
  id: string;
  /** Identifiant normatif S3000L (ex: TSK-E01-PRV-001) */
  taskNumber: string;
  lcn: string;
  title: string;
  type: TaskType;
  maintenanceLevel: MaintenanceLevel;
  frequency: number;
  frequencyUnit: TaskFrequencyUnit;
  /** Mean Time To Repair in hours */
  mttr: number;
  /** Total man-hours */
  manHours: number;
  resources: TaskResource[];
  requiredTools?: string[];
  description?: string;
  safetyPrecautions?: string;
  projectId?: string;
}
