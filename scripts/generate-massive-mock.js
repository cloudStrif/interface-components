const fs = require('fs');
const path = require('path');

console.log('Generating massive realistic S3000L IRModelJSON mock (~98,000 lines)...');

const entityBases = [
  // PBS & Product Breakdown
  { name: 'ProductBreakdownStructure', table: 'sbd_pbs_item', domain: 'PBS', count: 38 },
  { name: 'BreakdownElement', table: 'sbd_breakdown_element', domain: 'PBS', count: 32 },
  { name: 'HardwareItem', table: 'sbd_hardware_item', domain: 'PBS', count: 36 },
  { name: 'SoftwareItem', table: 'sbd_software_item', domain: 'PBS', count: 30 },
  { name: 'FunctionalItem', table: 'sbd_functional_item', domain: 'PBS', count: 30 },
  { name: 'PhysicalItem', table: 'sbd_physical_item', domain: 'PBS', count: 32 },
  { name: 'StructuralItem', table: 'sbd_structural_item', domain: 'PBS', count: 32 },
  { name: 'Zone', table: 'sbd_zone_item', domain: 'PBS', count: 28 },
  { name: 'AccessPoint', table: 'sbd_access_point', domain: 'PBS', count: 28 },
  { name: 'CircuitBreaker', table: 'sbd_circuit_breaker', domain: 'PBS', count: 28 },
  { name: 'ConnectorItem', table: 'sbd_connector_item', domain: 'PBS', count: 28 },
  { name: 'WireHarness', table: 'sbd_wire_harness', domain: 'PBS', count: 28 },
  
  // Tasks & Maintenance
  { name: 'MaintenanceTask', table: 'sbd_maint_task', domain: 'MTA', count: 42 },
  { name: 'TaskStep', table: 'sbd_task_step', domain: 'MTA', count: 32 },
  { name: 'TaskWarningCautionNote', table: 'sbd_task_wcn', domain: 'MTA', count: 26 },
  { name: 'MaintenanceInterval', table: 'sbd_maint_interval', domain: 'MTA', count: 30 },
  { name: 'TaskThreshold', table: 'sbd_task_threshold', domain: 'MTA', count: 28 },
  { name: 'TaskLimit', table: 'sbd_task_limit', domain: 'MTA', count: 28 },
  { name: 'SamplingRequirement', table: 'sbd_sampling_req', domain: 'MTA', count: 28 },
  { name: 'ScheduledTask', table: 'sbd_scheduled_task', domain: 'MTA', count: 34 },
  { name: 'CorrectiveTask', table: 'sbd_corrective_task', domain: 'MTA', count: 34 },
  { name: 'PreventiveTask', table: 'sbd_preventive_task', domain: 'MTA', count: 34 },
  { name: 'InspectionTask', table: 'sbd_inspection_task', domain: 'MTA', count: 32 },
  { name: 'CalibrationTask', table: 'sbd_calibration_task', domain: 'MTA', count: 32 },
  { name: 'LubricationTask', table: 'sbd_lubrication_task', domain: 'MTA', count: 30 },
  { name: 'FunctionalTestTask', table: 'sbd_functional_test', domain: 'MTA', count: 32 },

  // Reliability & FMECA
  { name: 'FailureModeEffect', table: 'sbd_fmeca_record', domain: 'FMECA', count: 40 },
  { name: 'FailureCause', table: 'sbd_failure_cause', domain: 'FMECA', count: 32 },
  { name: 'FailureMechanism', table: 'sbd_failure_mechanism', domain: 'FMECA', count: 30 },
  { name: 'FailureEffectLocal', table: 'sbd_effect_local', domain: 'FMECA', count: 28 },
  { name: 'FailureEffectNextHigher', table: 'sbd_effect_next_higher', domain: 'FMECA', count: 28 },
  { name: 'FailureEffectEnd', table: 'sbd_effect_end', domain: 'FMECA', count: 28 },
  { name: 'DetectionMethod', table: 'sbd_detection_method', domain: 'FMECA', count: 28 },
  { name: 'CompensatingProvision', table: 'sbd_compensating_prov', domain: 'FMECA', count: 28 },
  { name: 'CriticalityMatrix', table: 'sbd_criticality_matrix', domain: 'FMECA', count: 30 },
  { name: 'SafetyHazardAssessment', table: 'sbd_safety_hazard', domain: 'FMECA', count: 34 },
  { name: 'ReliabilityPrediction', table: 'sbd_reliability_pred', domain: 'FMECA', count: 32 },

  // LORA & Supportability
  { name: 'LevelOfRepair', table: 'sbd_lora_analysis', domain: 'LORA', count: 38 },
  { name: 'EconomicAnalysis', table: 'sbd_lora_economic', domain: 'LORA', count: 34 },
  { name: 'NonEconomicAnalysis', table: 'sbd_lora_noneconomic', domain: 'LORA', count: 32 },
  { name: 'MaintenanceLevelCandidate', table: 'sbd_lora_candidate', domain: 'LORA', count: 30 },
  { name: 'MaintenanceLocation', table: 'sbd_maint_location', domain: 'LORA', count: 30 },
  { name: 'FacilityRequirement', table: 'sbd_facility_req', domain: 'LORA', count: 30 },
  { name: 'SkillRequirement', table: 'sbd_skill_req', domain: 'LORA', count: 30 },
  { name: 'PersonnelRequirement', table: 'sbd_personnel_req', domain: 'LORA', count: 30 },
  { name: 'TurnaroundTimeEvaluation', table: 'sbd_turnaround_eval', domain: 'LORA', count: 30 },

  // Support Equipment & Tools
  { name: 'SupportEquipment', table: 'sbd_support_equipment', domain: 'SUPPORT', count: 38 },
  { name: 'SpecialTool', table: 'sbd_special_tool', domain: 'SUPPORT', count: 32 },
  { name: 'StandardTool', table: 'sbd_standard_tool', domain: 'SUPPORT', count: 30 },
  { name: 'TestBench', table: 'sbd_test_bench', domain: 'SUPPORT', count: 34 },
  { name: 'CalibrationStandard', table: 'sbd_calibration_std', domain: 'SUPPORT', count: 30 },
  { name: 'SupportEquipSoftware', table: 'sbd_se_software', domain: 'SUPPORT', count: 30 },
  
  // Consumables & Spares
  { name: 'Consumable', table: 'sbd_consumable_item', domain: 'CONSUMABLE', count: 36 },
  { name: 'HazardousMaterial', table: 'sbd_hazardous_mat', domain: 'CONSUMABLE', count: 32 },
  { name: 'StorageRequirement', table: 'sbd_storage_req', domain: 'CONSUMABLE', count: 30 },
  { name: 'ShelfLifeSpec', table: 'sbd_shelf_life_spec', domain: 'CONSUMABLE', count: 30 },
  { name: 'PackagingRequirement', table: 'sbd_packaging_req', domain: 'CONSUMABLE', count: 30 },
  { name: 'DisposalInstruction', table: 'sbd_disposal_inst', domain: 'CONSUMABLE', count: 30 },
  { name: 'InitialProvisioningSpares', table: 'sbd_initial_spares', domain: 'CONSUMABLE', count: 34 },

  // Operations & Logistics
  { name: 'OperatingProfile', table: 'sbd_operating_profile', domain: 'OPS', count: 32 },
  { name: 'MissionProfile', table: 'sbd_mission_profile', domain: 'OPS', count: 32 },
  { name: 'EnvironmentCondition', table: 'sbd_env_condition', domain: 'OPS', count: 30 },
  { name: 'LogisticsDelayFactor', table: 'sbd_logistics_delay', domain: 'OPS', count: 30 },
  { name: 'TransportabilityReq', table: 'sbd_transport_req', domain: 'OPS', count: 30 },
  
  // Organizations & Contracts
  { name: 'Organization', table: 'sbd_organization', domain: 'ORG', count: 36 },
  { name: 'ContractorSpec', table: 'sbd_contractor_spec', domain: 'ORG', count: 30 },
  { name: 'OperatorProfile', table: 'sbd_operator_profile', domain: 'ORG', count: 30 },
  { name: 'MaintenanceContract', table: 'sbd_maint_contract', domain: 'ORG', count: 32 },
  { name: 'WarrantySpecification', table: 'sbd_warranty_spec', domain: 'ORG', count: 32 },

  // Aerospace Subsystems & ATA Chapters
  { name: 'EngineSystem', table: 'sbd_engine_system', domain: 'ATA72', count: 36 },
  { name: 'AvionicsSystem', table: 'sbd_avionics_system', domain: 'ATA34', count: 36 },
  { name: 'LandingGearSystem', table: 'sbd_landing_gear', domain: 'ATA32', count: 36 },
  { name: 'HydraulicSystem', table: 'sbd_hydraulic_system', domain: 'ATA29', count: 36 },
  { name: 'FuelSystem', table: 'sbd_fuel_system', domain: 'ATA28', count: 36 },
  { name: 'ElectricalPowerSystem', table: 'sbd_electrical_power', domain: 'ATA24', count: 36 },
  { name: 'FlightControlSystem', table: 'sbd_flight_controls', domain: 'ATA27', count: 36 },
  { name: 'EnvironmentalControlSystem', table: 'sbd_env_control', domain: 'ATA21', count: 36 },
  { name: 'OxygenSystem', table: 'sbd_oxygen_system', domain: 'ATA35', count: 34 },
  { name: 'NavigationSystem', table: 'sbd_navigation_sys', domain: 'ATA34', count: 34 },
  { name: 'CommunicationSystem', table: 'sbd_communication_sys', domain: 'ATA23', count: 34 },
  { name: 'AuxiliaryPowerUnit', table: 'sbd_apu_system', domain: 'ATA49', count: 36 }
];

const lines = [];

function w(str = '') {
  lines.push(str);
}

w('// ============================================================================');
w('// MOCK OFFICIEL DE TEST DE CHARGE S3000L ISSUE 2.0 (MODÈLE COMPLET COMPLET)');
w('// Représentation JSON-safe IRModelJSON (~98 000 lignes de spécification)');
w('// ============================================================================');
w("import { IRModelJSON } from '../models/ir-model';");
w('');
w('export const MOCK_IR_MODEL_JSON: IRModelJSON = {');
w('  s3000lMode: true,');
w("  s3000lDialect: '2.0',");
w('');
w('  // ==========================================================================');
w('  // 1. ENTITÉS PRINCIPALES (CLASSES DE DONNÉES S3000L ISSUE 2.0)');
w('  // ==========================================================================');
w('  entities: {');

entityBases.forEach((e, eIndex) => {
  w(`    '${e.name}': {`);
  w(`      name: '${e.name}',`);
  w(`      tableName: '${e.table}',`);
  w(`      abstract: false,`);
  w(`      parentType: null,`);
  w(`      documentation: 'Spécification métier S3000L Issue 2.0 pour le domaine ${e.domain} - Classe ${e.name}',`);
  w('      columns: [');

  // Primary Key column
  w('        {');
  w("          name: 'id',");
  w("          columnName: 'id',");
  w("          xmlName: 'id',");
  w("          xmlKind: 'attribute',");
  w('          minOccurs: 1,');
  w('          maxOccurs: 1,');
  w("          sqlType: 'UUID',");
  w("          jsonType: 'string',");
  w('          nullable: false,');
  w("          defaultValue: 'gen_random_uuid()',");
  w('          isPrimaryKey: true,');
  w('          isForeignKey: false,');
  w('          referencesEntity: null,');
  w('          isEnum: false,');
  w('          enumRef: null,');
  w('          constraints: {');
  w("            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',");
  w('            minLength: 36,');
  w('            maxLength: 36');
  w('          },');
  w("          documentation: 'Identifiant unique immuable UUID v4 conforme S3000L',");
  w("          xsdType: 'xs:ID'");
  w('        },');

  // Foreign keys
  const prevEntity = eIndex > 0 ? entityBases[eIndex - 1] : null;
  if (prevEntity) {
    w('        {');
    w(`          name: '${prevEntity.name.toLowerCase()}Id',`);
    w(`          columnName: '${prevEntity.table}_id',`);
    w(`          xmlName: '${prevEntity.name.toLowerCase()}Ref',`);
    w("          xmlKind: 'element',");
    w('          minOccurs: 0,');
    w('          maxOccurs: 1,');
    w("          sqlType: 'UUID',");
    w("          jsonType: 'string',");
    w('          nullable: true,');
    w('          defaultValue: null,');
    w('          isPrimaryKey: false,');
    w('          isForeignKey: true,');
    w(`          referencesEntity: '${prevEntity.name}',`);
    w('          isEnum: false,');
    w('          enumRef: null,');
    w('          constraints: {');
    w('            minLength: 36,');
    w('            maxLength: 36');
    w('          },');
    w(`          documentation: 'Référence de clé étrangère vers ${prevEntity.name}',`);
    w("          xsdType: 'xs:IDREF'");
    w('        },');
  }

  // Generate specific columns
  const standardFields = [
    { name: 'identifier', col: 'identifier', type: 'VARCHAR(64)', json: 'string', xsd: 'xs:string', doc: 'Identifiant métier normalisé S3000L' },
    { name: 'name', col: 'name', type: 'VARCHAR(255)', json: 'string', xsd: 'xs:string', doc: 'Désignation officielle en clair' },
    { name: 'description', col: 'description', type: 'TEXT', json: 'string', xsd: 'xs:string', doc: 'Description textuelle détaillée' },
    { name: 'status', col: 'status', type: 'VARCHAR(32)', json: 'string', xsd: 'xs:string', doc: 'Statut du cycle de vie du composant', isEnum: true, enumRef: 'ItemStatusEnum' },
    { name: 'version', col: 'version', type: 'VARCHAR(16)', json: 'string', xsd: 'xs:string', doc: 'Numéro de révision ou version de référence' },
    { name: 'changeDate', col: 'change_date', type: 'TIMESTAMPTZ', json: 'string', xsd: 'xs:dateTime', doc: 'Horodatage de la dernière modification' },
    { name: 'remarks', col: 'remarks', type: 'TEXT', json: 'string', xsd: 'xs:string', doc: 'Remarques techniques et observations' },
    { name: 'activeFlag', col: 'active_flag', type: 'BOOLEAN', json: 'boolean', xsd: 'xs:boolean', doc: 'Drapeau d activation opérationnelle' },
    { name: 'cageCode', col: 'cage_code', type: 'VARCHAR(5)', json: 'string', xsd: 'xs:string', doc: 'Code constructeur CAGE Otan' },
    { name: 'lcn', col: 'lcn', type: 'VARCHAR(18)', json: 'string', xsd: 'xs:string', doc: 'Code de localisation logistique LCN' },
    { name: 'alcn', col: 'alcn', type: 'VARCHAR(2)', json: 'string', xsd: 'xs:string', doc: 'Indice alternatif ALCN' },
    { name: 'lcnType', col: 'lcn_type', type: 'VARCHAR(1)', json: 'string', xsd: 'xs:string', doc: 'Type de structure logistique' },
    { name: 'uom', col: 'unit_of_measure', type: 'VARCHAR(16)', json: 'string', xsd: 'xs:string', doc: 'Unité de mesure standard' },
    { name: 'quantity', col: 'quantity', type: 'NUMERIC(12,4)', json: 'number', xsd: 'xs:decimal', doc: 'Quantité unitaire applicable' },
    { name: 'meanTimeToRepair', col: 'mttr_hours', type: 'NUMERIC(8,2)', json: 'number', xsd: 'xs:decimal', doc: 'Moyenne des temps de réparation MTTR' },
    { name: 'meanTimeBetweenFailures', col: 'mtbf_hours', type: 'NUMERIC(10,2)', json: 'number', xsd: 'xs:decimal', doc: 'Moyenne des temps de bon fonctionnement MTBF' },
    { name: 'operatingCost', col: 'operating_cost', type: 'NUMERIC(14,2)', json: 'number', xsd: 'xs:decimal', doc: 'Coût opérationnel direct estimé' },
    { name: 'procurementLeadTime', col: 'lead_time_days', type: 'INTEGER', json: 'number', xsd: 'xs:integer', doc: 'Délai moyen d approvisionnement en jours' },
    { name: 'shelfLifeMonths', col: 'shelf_life_months', type: 'INTEGER', json: 'number', xsd: 'xs:integer', doc: 'Durée de vie maximale en stockage' },
    { name: 'safetyCriticality', col: 'safety_criticality', type: 'VARCHAR(16)', json: 'string', xsd: 'xs:string', doc: 'Niveau de criticité sécurité', isEnum: true, enumRef: 'CriticalityLevelEnum' },
    { name: 'environmentalImpact', col: 'env_impact', type: 'VARCHAR(32)', json: 'string', xsd: 'xs:string', doc: 'Classification d impact environnemental' },
    { name: 'securityLevel', col: 'security_level', type: 'VARCHAR(32)', json: 'string', xsd: 'xs:string', doc: 'Niveau d habilitation ou confidentialité' },
    { name: 'complianceStandard', col: 'compliance_std', type: 'VARCHAR(64)', json: 'string', xsd: 'xs:string', doc: 'Norme ou directive de conformité' },
    { name: 'approvalAuthority', col: 'approval_auth', type: 'VARCHAR(128)', json: 'string', xsd: 'xs:string', doc: 'Autorité de certification ou approbation' },
    { name: 'validFrom', col: 'valid_from', type: 'DATE', json: 'string', xsd: 'xs:date', doc: 'Date de début de validité opérationnelle' },
    { name: 'validUntil', col: 'valid_until', type: 'DATE', json: 'string', xsd: 'xs:date', doc: 'Date d expiration ou fin de validité' },
    { name: 'contractReference', col: 'contract_ref', type: 'VARCHAR(64)', json: 'string', xsd: 'xs:string', doc: 'Référence contractuelle d achat' },
    { name: 'drawingNumber', col: 'drawing_num', type: 'VARCHAR(64)', json: 'string', xsd: 'xs:string', doc: 'Numéro de plan technique 2D/3D' },
    { name: 'weightKg', col: 'weight_kg', type: 'NUMERIC(10,3)', json: 'number', xsd: 'xs:decimal', doc: 'Masse unitaire en kilogrammes' },
    { name: 'volumeM3', col: 'volume_m3', type: 'NUMERIC(10,4)', json: 'number', xsd: 'xs:decimal', doc: 'Volume unitaire en mètres cubes' },
    { name: 'temperatureMinC', col: 'temp_min_c', type: 'NUMERIC(5,1)', json: 'number', xsd: 'xs:decimal', doc: 'Température minimale opérationnelle' },
    { name: 'temperatureMaxC', col: 'temp_max_c', type: 'NUMERIC(5,1)', json: 'number', xsd: 'xs:decimal', doc: 'Température maximale opérationnelle' },
    { name: 'relativeHumidityMax', col: 'rel_humidity_max', type: 'NUMERIC(5,2)', json: 'number', xsd: 'xs:decimal', doc: 'Humidité relative maximale admissible' },
    { name: 'vibrationTolerance', col: 'vibration_tol', type: 'VARCHAR(64)', json: 'string', xsd: 'xs:string', doc: 'Tolérance vibratoire standard' },
    { name: 'checksum', col: 'checksum_sha256', type: 'VARCHAR(64)', json: 'string', xsd: 'xs:string', doc: 'Empreinte cryptographique de contrôle' }
  ];

  standardFields.slice(0, e.count).forEach((f) => {
    w('        {');
    w(`          name: '${f.name}',`);
    w(`          columnName: '${f.col}',`);
    w(`          xmlName: '${f.name}',`);
    w("          xmlKind: 'element',");
    w('          minOccurs: 0,');
    w('          maxOccurs: 1,');
    w(`          sqlType: '${f.type}',`);
    w(`          jsonType: '${f.json}',`);
    w('          nullable: true,');
    w('          defaultValue: null,');
    w('          isPrimaryKey: false,');
    w('          isForeignKey: false,');
    w('          referencesEntity: null,');
    w(`          isEnum: ${!!f.isEnum},`);
    w(`          enumRef: ${f.enumRef ? `'${f.enumRef}'` : 'null'},`);
    w('          constraints: {');
    w('            minLength: 1,');
    w('            maxLength: 255');
    w('          },');
    w(`          documentation: '${f.doc}',`);
    w(`          xsdType: '${f.xsd}'`);
    w('        },');
  });

  w('      ],');
  w('      relations: [');
  if (prevEntity) {
    w('        {');
    w(`          joinTable: null,`);
    w(`          parentColumn: '${prevEntity.table}_id',`);
    w(`          flattened: false,`);
    w(`          nullable: true,`);
    w('          minOccurs: 0,');
    w('          maxOccurs: 1');
    w('        },');
  }
  w('      ]');
  w('    },');
});

w('  },');
w('');

// Join Tables
w('  // ==========================================================================');
w('  // 2. TABLES DE JOINTURE N:M (JOIN TABLES S3000L)');
w('  // ==========================================================================');
w('  joinTables: {');

for (let j = 0; j < 80; j++) {
  const left = entityBases[j % entityBases.length];
  const right = entityBases[(j + 3) % entityBases.length];
  const joinName = `${left.name}To${right.name}_${j + 1}`;
  const tblName = `sbd_rel_${left.table.replace('sbd_', '')}_${right.table.replace('sbd_', '')}_${j + 1}`;

  w(`    '${joinName}': {`);
  w(`      name: '${joinName}',`);
  w(`      tableName: '${tblName}',`);
  w(`      leftEntity: '${left.name}',`);
  w(`      leftColumn: '${left.table}_id',`);
  w(`      rightEntity: '${right.name}',`);
  w(`      rightColumn: '${right.table}_id',`);
  w(`      documentation: 'Relation plusieurs-à-plusieurs N:M entre ${left.name} et ${right.name}'`);
  w('    },');
}

w('  },');
w('');

// Enums
w('  // ==========================================================================');
w('  // 3. ÉNUMÉRATIONS DU MODÈLE (ENUMS S3000L)');
w('  // ==========================================================================');
w('  enums: {');

const enumTemplates = [
  { name: 'ItemStatusEnum', table: 'enum_item_status', vals: ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'FROZEN', 'RELEASED', 'OBSOLETE', 'SUPERSEDED', 'CANCELLED'] },
  { name: 'SMRCodeEnum', table: 'enum_smr_code', vals: ['PAOFD', 'PAOGD', 'PAOHD', 'PCOFD', 'PCOGD', 'PCOHD', 'KDOFD', 'KAFHD', 'MOOFD', 'MOOGD', 'MPOFD', 'ZFZZZ'] },
  { name: 'TaskTypeEnum', table: 'enum_task_type', vals: ['PREVENTIVE', 'CORRECTIVE', 'MODIFICATION', 'SAMPLING', 'INSPECTION', 'SERVICING', 'SPECIAL_CHECK', 'OPERATIONAL_TEST'] },
  { name: 'CriticalityLevelEnum', table: 'enum_criticality_level', vals: ['CAT_I_CATASTROPHIC', 'CAT_II_CRITICAL', 'CAT_III_MARGINAL', 'CAT_IV_NEGLIGIBLE'] },
  { name: 'RepairLevelEnum', table: 'enum_repair_level', vals: ['ORG_FLIGHT_LINE', 'INTERMEDIATE_SHOP', 'DEPOT_OVERHAUL', 'OEM_FACTORY', 'DISCARD_SCRAP'] },
  { name: 'DialectDialectEnum', table: 'enum_s3000l_dialect', vals: ['ISSUE_1_0', 'ISSUE_1_1', 'ISSUE_1_2', 'ISSUE_2_0', 'ISSUE_2_1', 'CUSTOM_EXT'] },
  { name: 'HazardLevelEnum', table: 'enum_hazard_level', vals: ['FREQUENT', 'PROBABLE', 'OCCASIONAL', 'REMOTE', 'IMPROBABLE', 'ELIMINATED'] },
  { name: 'UnitOfMeasureEnum', table: 'enum_unit_measure', vals: ['KG', 'LITER', 'METER', 'MILLIMETER', 'INCH', 'POUND', 'SQUARE_METER', 'CUBIC_METER', 'HOURS', 'CYCLES', 'FLIGHTS'] },
  { name: 'ActionCodeEnum', table: 'enum_action_code', vals: ['INSPECT', 'DISASSEMBLE', 'CLEAN', 'CALIBRATE', 'LUBRICATE', 'REPLACE', 'REPAIR', 'TEST', 'REASSEMBLE'] },
  { name: 'SecurityClassEnum', table: 'enum_security_class', vals: ['UNCLASSIFIED', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET', 'NATO_CONFIDENTIAL'] }
];

for (let eIdx = 0; eIdx < 110; eIdx++) {
  const baseEnum = enumTemplates[eIdx % enumTemplates.length];
  const eName = eIdx < enumTemplates.length ? baseEnum.name : `${baseEnum.name}_Sub_${eIdx}`;
  const tbl = eIdx < enumTemplates.length ? baseEnum.table : `${baseEnum.table}_${eIdx}`;

  w(`    '${eName}': {`);
  w(`      name: '${eName}',`);
  w(`      tableName: '${tbl}',`);
  w('      values: [');
  baseEnum.vals.forEach(v => {
    w(`        '${v}',`);
  });
  w('      ],');
  w(`      docs: 'Énumération S3000L contrôlée pour ${eName}'`);
  w('    },');
}

w('  },');
w('');

// Simple Types
w('  // ==========================================================================');
w('  // 4. TYPES SIMPLES (SIMPLE TYPES RESTRICTIONS)');
w('  // ==========================================================================');
w('  simpleTypes: {');

for (let s = 1; s <= 220; s++) {
  const sName = `SimpleType_${s}_${s % 2 === 0 ? 'Code' : 'Value'}`;
  w(`    '${sName}': {`);
  w(`      name: '${sName}',`);
  w(`      sqlType: '${s % 3 === 0 ? 'NUMERIC(14,4)' : s % 2 === 0 ? 'VARCHAR(64)' : 'TEXT'}',`);
  w(`      jsonType: '${s % 3 === 0 ? 'number' : 'string'}',`);
  w('      constraints: {');
  w(`        minLength: ${s % 5 + 1},`);
  w(`        maxLength: ${s % 10 + 20},`);
  w(`        pattern: '^[A-Z0-9_-]{${s % 5 + 1},${s % 10 + 20}}$',`);
  w(`        minInclusive: 0,`);
  w(`        maxInclusive: 999999`);
  w('      },');
  w(`      docs: 'Type simple S3000L restreint n°${s} avec contrainte regex et bornes numériques'`);
  w('    },');
}

w('  },');
w('');

// Value Types
w('  // ==========================================================================');
w('  // 5. TYPES DE VALEURS COMPLEXES (VALUE TYPES)');
w('  // ==========================================================================');
w('  valueTypes: {');

for (let v = 1; v <= 220; v++) {
  const vName = `ValueType_${v}_Complex`;
  w(`    '${vName}': {`);
  w(`      name: '${vName}',`);
  w(`      contentKind: '${v % 2 === 0 ? 'sequence' : 'choice'}',`);
  w('      constraints: {');
  w(`        minLength: 1,`);
  w(`        maxLength: 256,`);
  w(`        pattern: '^[a-zA-Z0-9_.-]+$'`);
  w('      },');
  w('      fields: {');
  w("        nominalValue: {");
  w(`          name: 'nominalValue',`);
  w("          jsonType: 'number',");
  w("          sqlType: 'NUMERIC(12,4)',");
  w('          nullable: false,');
  w("          documentation: 'Valeur nominale standard de mesure'");
  w('        },');
  w("        toleranceUpper: {");
  w(`          name: 'toleranceUpper',`);
  w("          jsonType: 'number',");
  w("          sqlType: 'NUMERIC(8,4)',");
  w('          nullable: true,');
  w("          documentation: 'Tolérance d écart supérieure admise'");
  w('        },');
  w("        toleranceLower: {");
  w(`          name: 'toleranceLower',`);
  w("          jsonType: 'number',");
  w("          sqlType: 'NUMERIC(8,4)',");
  w('          nullable: true,');
  w("          documentation: 'Tolérance d écart inférieure admise'");
  w('        },');
  w("        unitSymbol: {");
  w(`          name: 'unitSymbol',`);
  w("          jsonType: 'string',");
  w("          sqlType: 'VARCHAR(16)',");
  w('          nullable: false,');
  w("          documentation: 'Symbole normalisé de l unité de mesure'");
  w('        }');
  w('      },');
  w(`      docs: 'Structure de valeur composée pour mesures techniques S3000L n°${v}'`);
  w('    },');
}

w('  },');
w('');

// Assertions
w('  // ==========================================================================');
w('  // 6. RÈGLES D ASSERTION S3000L (ASSERTIONS)');
w('  // ==========================================================================');
w('  assertions: {');

for (let a = 1; a <= 360; a++) {
  const aName = `AssertionSet_S3000L_${a}`;
  w(`    '${aName}': {`);
  w(`      typeName: '${aName}',`);
  w('      rules: [');
  w('        {');
  w(`          ruleId: 'RULE_${a}_A',`);
  w(`          description: 'Vérification de cohérence S3000L règle ${a}-A: la valeur doit être supérieure au seuil',`);
  w(`          severity: 'error',`);
  w(`          expression: '$this.value >= 0 and $this.identifier != null',`);
  w(`          targetProperty: 'nominalValue'`);
  w('        },');
  w('        {');
  w(`          ruleId: 'RULE_${a}_B',`);
  w(`          description: 'Vérification d intégrité référentielle règle ${a}-B: validité du cycle de vie',`);
  w(`          severity: 'warning',`);
  w(`          expression: '$this.status in ["APPROVED", "RELEASED", "FROZEN"]',`);
  w(`          targetProperty: 'status'`);
  w('        },');
  w('        {');
  w(`          ruleId: 'RULE_${a}_C',`);
  w(`          description: 'Vérification temporelle: date d expiration postérieure à la date d effet',`);
  w(`          severity: 'error',`);
  w(`          expression: '$this.validUntil >= $this.validFrom',`);
  w(`          targetProperty: 'validUntil'`);
  w('        }');
  w('      ]');
  w('    },');
}

w('  },');
w('');

// Assertion Paths
w('  // ==========================================================================');
w('  // 7. CHEMINS DE VALIDATION DES ASSERTIONS (ASSERTION PATHS)');
w('  // ==========================================================================');
w('  assertionPaths: {');

for (let p = 1; p <= 360; p++) {
  const pName = `AssertionPathSet_${p}`;
  w(`    '${pName}': {`);
  w(`      typeName: '${pName}',`);
  w('      paths: [');
  w('        {');
  w(`          pathId: 'PATH_${p}_01',`);
  w(`          xpath: '/s3000l:root/s3000l:subsystem[${p}]/s3000l:element',`);
  w(`          description: 'Chemin de navigation hiérarchique XPath n°${p}',`);
  w(`          mandatory: true`);
  w('        },');
  w('        {');
  w(`          pathId: 'PATH_${p}_02',`);
  w(`          xpath: '/s3000l:root/s3000l:subsystem[${p}]/s3000l:element/s3000l:attribute',`);
  w(`          description: 'Chemin d attributs de validation descendante n°${p}',`);
  w(`          mandatory: false`);
  w('        }');
  w('      ]');
  w('    },');
}

w('  },');
w('');

// Collections
w('  // ==========================================================================');
w('  // 8. COLLECTIONS SPÉCIFIQUES S3000L');
w('  // ==========================================================================');
w('  s3000lCollections: {');

for (let c = 1; c <= 405; c++) {
  const cName = `Collection_S3000L_${c}`;
  w(`    '${cName}': {`);
  w(`      collectionId: '${cName}',`);
  w(`      category: 'S3000L_CAT_${c % 10 + 1}',`);
  w(`      scope: '${c % 2 === 0 ? 'GLOBAL_PRODUCT' : 'LOCAL_MAINTENANCE'}',`);
  w(`      itemCount: ${c * 15},`);
  w(`      description: 'Ensemble de collections logistiques S3000L catégorie ${c % 10 + 1} révision 2.0',`);
  w(`      lastUpdated: '2026-11-28T12:00:00Z',`);
  w(`      verifiedBy: 'S3000L_SPEC_VALIDATOR'`);
  w('    },');
}

w('  }');
w('};');
w('');
w('export const MOCK_IR_MODEL = MOCK_IR_MODEL_JSON;');

console.log(`Writing file... Total lines: ${lines.length}`);
fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'mock-data', 'mock-ir-model.data.ts'), lines.join('\n'), 'utf8');
console.log('Done!');
