/**
 * Modèle de Données Intermédiaire (IR - Intermediate Representation)
 * Utilisé pour la génération et l'introspection de schémas de base de données S3000L.
 */

/** Parsed, namespace-stripped XSD node consumed by the IR builder */
export interface XSDNode {
  [key: string]: unknown;
}

export type IRJSONType = string | Record<string, any>;
export type IRMaxOccurs = number | 'unbounded';
export type IRXMLKind = 'element' | 'attribute';
export type IRRelationKind =
  | 'one-to-many'
  | 'many-to-many'
  | 'one-to-one'
  | 'idrefs';

export type S3000LDialect = '1.1' | '2.0' | null;

export interface IRConstraints extends Record<string, any> {
  minLength?: string | number;
  maxLength?: string | number;
  minInclusive?: string | number;
  maxInclusive?: string | number;
  minExclusive?: string | number;
  maxExclusive?: string | number;
  pattern?: string;
  totalDigits?: string | number;
  fractionDigits?: string | number;
  enum?: string[];
}

export interface IRColumn {
  name: string;
  columnName: string;
  xmlName: string | null;
  xmlKind: IRXMLKind;
  minOccurs: number;
  maxOccurs: IRMaxOccurs;
  sqlType: string;
  jsonType: IRJSONType;
  nullable: boolean;
  defaultValue: string | number | boolean | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  referencesEntity: string | null;
  isEnum: boolean;
  enumRef: string | null;
  constraints: IRConstraints;
  documentation: string | null;
  xsdType: string | null;
}

export interface IRRelation {
  joinTable: string | null;
  parentColumn: string;
  flattened?: boolean;
  nullable: boolean;
  minOccurs: number;
  maxOccurs: IRMaxOccurs;
  targetEntity?: string;
  relationKind?: IRRelationKind;
  [key: string]: unknown;
}

export interface IREntity {
  name: string;
  tableName: string;
  columns: IRColumn[];
  relations: IRRelation[];
  abstract: boolean;
  parentType: string | null;
  documentation: string | null;
  [key: string]: unknown;
}

export interface IRJoinTable {
  name: string;
  tableName: string;
  leftEntity: string;
  leftColumn: string;
  rightEntity: string;
  rightColumn: string;
  documentation?: string | null;
  [key: string]: unknown;
}

export interface IREnum {
  name: string;
  tableName: string;
  values: string[];
  docs?: string | null;
}

export interface IRSimpleType {
  name: string;
  sqlType: string;
  jsonType: IRJSONType;
  constraints: IRConstraints;
  docs?: string | null;
}

export interface IRAssertionRule extends Record<string, any> {
  id?: string;
  description?: string;
  expression?: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface IRAssertionSet {
  typeName: string;
  rules: IRAssertionRule[];
  [key: string]: unknown;
}

export interface IRAssertionPath extends Record<string, any> {
  path?: string;
  target?: string;
}

export interface IRAssertionPathSet {
  typeName: string;
  paths: IRAssertionPath[];
  [key: string]: unknown;
}

export interface S3000LCollection extends Record<string, any> {
  name?: string;
  itemType?: string;
  cardinality?: string;
}

export type IRValueContentKind = 'sequence' | 'choice';

export interface IRValueTypeConstraints extends Record<string, unknown> {
  minLength?: string | number;
  maxLength?: string | number;
  minInclusive?: string | number;
  maxInclusive?: string | number;
  minExclusive?: string | number;
  maxExclusive?: string | number;
  pattern?: string;
  patterns?: string[];
  totalDigits?: string | number;
  fractionDigits?: string | number;
  enum?: string[];
  format?: string;
}

export interface IRValueFieldType {
  name?: string;
  sqlType?: string;
  jsonType?: IRJSONType;
  nullable?: boolean;
  documentation?: string | null;
  [key: string]: unknown;
}

export interface IRValueType {
  name: string;
  contentKind?: IRValueContentKind;
  fields?: Record<string, IRValueFieldType>;
  constraints?: IRValueTypeConstraints;
  docs?: string | null;
  [key: string]: unknown;
}

export interface IRModel {
  s3000lMode: boolean;
  s3000lDialect: S3000LDialect;
  s3000lCollections: Map<string, S3000LCollection>;
}

/** Représentation JSON-safe de IRModel où les Maps sont des Records */
export interface IRModelJSON {
  entities: Record<string, IREntity>;
  joinTables: Record<string, IRJoinTable>;
  enums: Record<string, IREnum>;
  simpleTypes: Record<string, IRSimpleType>;
  valueTypes: Record<string, IRValueType>;
  assertions: Record<string, IRAssertionSet>;
  assertionPaths: Record<string, IRAssertionPathSet>;
  s3000lMode: boolean;
  s3000lDialect: S3000LDialect;
  s3000lCollections: Record<string, S3000LCollection>;
}
