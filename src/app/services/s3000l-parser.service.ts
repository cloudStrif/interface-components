import { Injectable, signal } from '@angular/core';
import { S3000LTreeNode, S3000LNodeType, S3000LAttribute } from '../models/s3000l-tree.model';
import { MOCK_S3000L_ENGINE, MOCK_S3000L_LANDING_GEAR, MOCK_S3000L_AVIONICS } from '../mock-data/mock-s3000l.data';

/**
 * ============================================================================
 * S3000LParserService (Moteur d'arborescence & analyseur XML S3000L)
 * ============================================================================
 * 
 * Supporte :
 * 1. La norme internationale officielle ASD/AIA S3000L (Issue 1.1 / 1.2 / 2.0)
 *    - <breakdownElement>
 *    - <breakdownElementIdentifier breakdownElementIdentifierClass="lcn"> / <identifierValue>
 *    - <breakdownElementName> / <nameString>
 *    - <breakdownElementType> (system, subsystem, assembly, hardware, part...)
 *    - <breakdownElementRevision>
 *    - <lsaCandidateIndicator>
 *    - <breakdownElementRealization> / <partIdentifier> (<partNumberValue>, <enterpriseIdentifier>)
 *    - <breakdownElementStructure> avec arborescence imbriquée ou relationnelle (<childElementRef uri="#...">)
 * 2. Le format simplifié pour compatibilité ascendante et démonstrations rapides.
 * 3. L'export / dump inverse vers XML S3000L conforme Issue 2.0.
 */
@Injectable({
  providedIn: 'root'
})
export class S3000LParserService {
  public currentTree = signal<S3000LTreeNode | null>(null);
  public selectedNode = signal<S3000LTreeNode | null>(null);
  public searchQuery = signal<string>('');

  // ─── Tree Mutation ────────────────────────────────────────────────────────

  /**
   * Add a new child node to a given parent node and refresh the tree signal.
   */
  public addChildNode(
    parent: S3000LTreeNode,
    name: string,
    type: S3000LNodeType = 'element'
  ): S3000LTreeNode {
    const newNode: S3000LTreeNode = {
      id: `node-new-${Date.now().toString(36)}`,
      tagName: 'breakdownElement',
      name: name.trim() || 'Nouvel élément',
      lcn: this.generateNextLcn(parent),
      type,
      version: '2.0',
      description: `Élément créé manuellement sous "${parent.name}"`,
      attributes: [],
      children: [],
      expanded: false,
      selected: false,
      lsaCandidate: false,
    };

    parent.children = [...(parent.children ?? []), newNode];
    parent.expanded = true;

    // Force signal update by shallow-copying the root
    this.currentTree.update(root => root ? { ...root } : root);
    this.selectedNode.set(newNode);
    return newNode;
  }

  /**
   * Delete a node from the tree by its id. Selects the parent after deletion.
   */
  public deleteNode(nodeId: string): void {
    const root = this.currentTree();
    if (!root) return;

    const parent = this.findParent(root, nodeId);
    if (!parent) return; // cannot delete root

    parent.children = parent.children.filter(c => c.id !== nodeId);
    this.currentTree.update(r => r ? { ...r } : r);

    // If the deleted node was selected, select parent instead
    if (this.selectedNode()?.id === nodeId) {
      this.selectedNode.set(parent);
    }
  }

  /**
   * Rename a node in place and refresh the tree signal.
   */
  public renameNode(node: S3000LTreeNode, newName: string): void {
    node.name = newName.trim() || node.name;
    this.currentTree.update(r => r ? { ...r } : r);
    if (this.selectedNode()?.id === node.id) {
      this.selectedNode.set({ ...node });
    }
  }

  /** Find the parent of a node by child id (BFS). Returns null if nodeId is the root. */
  private findParent(root: S3000LTreeNode, nodeId: string): S3000LTreeNode | null {
    if (!root.children) return null;
    for (const child of root.children) {
      if (child.id === nodeId) return root;
      const found = this.findParent(child, nodeId);
      if (found) return found;
    }
    return null;
  }

  /** Generate a plausible next LCN for a new child of parent. */
  private generateNextLcn(parent: S3000LTreeNode): string {
    const count = (parent.children?.length ?? 0) + 1;
    const base = parent.lcn ?? 'N00-00';
    return `${base}-${String(count).padStart(2, '0')}`;
  }

  // ─── XML Parsing ──────────────────────────────────────────────────────────

  /**
   * Parse XML content string into S3000LTreeNode hierarchy.
   */
  public parseXmlString(xmlContent: string, sampleName: string = 'S3000L Dataset'): S3000LTreeNode {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Check parsing error
    const parserError = xmlDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      throw new Error(`Erreur de parsing XML: ${parserError[0].textContent}`);
    }

    const rootElement = xmlDoc.documentElement;

    // Check if the document uses official S3000L specification (<breakdownElement>)
    const officialBreakdownElements = this.findDescendantsByLocalNames(rootElement, 'breakdownelement');

    let tree: S3000LTreeNode;
    if (officialBreakdownElements.length > 0) {
      tree = this.parseOfficialS3000L(rootElement, officialBreakdownElements);
    } else {
      tree = this.convertDomNodeToTreeNode(rootElement, '0');
    }

    this.currentTree.set(tree);
    if (tree.children && tree.children.length > 0) {
      this.selectedNode.set(tree.children[0]);
    } else {
      this.selectedNode.set(tree);
    }
    return tree;
  }

  /**
   * Parse an uploaded File object
   */
  public parseXmlFile(file: File): Promise<S3000LTreeNode> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const tree = this.parseXmlString(content, file.name);
          resolve(tree);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  }

  // ─── Official ASD/AIA S3000L Parser ──────────────────────────────────────

  /**
   * Parser for standard ASD/AIA S3000L XML format.
   * Handles both hierarchical nested structure and relational structure with <childElementRef>.
   */
  private parseOfficialS3000L(rootElement: Element, breakdownElements: Element[]): S3000LTreeNode {
    const nodeMap = new Map<string, S3000LTreeNode>();
    const childRefsMap = new Map<string, string[]>();
    const referencedAsChild = new Set<string>();

    for (let i = 0; i < breakdownElements.length; i++) {
      const el = breakdownElements[i];
      const parsed = this.convertOfficialBreakdownElement(el, i);
      nodeMap.set(parsed.node.id, parsed.node);

      if (parsed.childIds.length > 0) {
        childRefsMap.set(parsed.node.id, parsed.childIds);
        parsed.childIds.forEach(id => referencedAsChild.add(id));
      }
    }

    // Resolve relational references (<childElementRef uri="#...">)
    childRefsMap.forEach((childIds, parentId) => {
      const parent = nodeMap.get(parentId);
      if (parent) {
        const resolved: S3000LTreeNode[] = [];
        for (const cid of childIds) {
          const childNode = nodeMap.get(cid);
          if (childNode) {
            resolved.push(childNode);
          }
        }
        parent.children = [...(parent.children || []), ...resolved];
      }
    });

    // Determine top-level roots
    const topLevelNodes: S3000LTreeNode[] = [];
    nodeMap.forEach((node) => {
      if (!referencedAsChild.has(node.id)) {
        topLevelNodes.push(node);
      }
    });

    // Check if root element has product metadata
    const rootName = this.getDescendantText(rootElement, 'productname', 'namestring', 'name') 
      || this.getAttr(rootElement, 'name') 
      || 'Système Propulsion S3000L';

    const rootLcn = this.getDescendantText(rootElement, 'productidentifier', 'identifiervalue', 'lcn') 
      || this.getAttr(rootElement, 'documentNumber') 
      || 'P00';

    if (topLevelNodes.length === 1 && topLevelNodes[0].type === 'root') {
      topLevelNodes[0].expanded = true;
      return topLevelNodes[0];
    }

    const specVer = this.getAttr(rootElement, 'specVersion') || '2.0';
    const docNum = this.getAttr(rootElement, 'documentNumber') || 'S3000L-BASL-001';

    const rootNode: S3000LTreeNode = {
      id: `node-root-${Date.now().toString(36)}`,
      tagName: 'productBreakdown',
      name: rootName,
      lcn: rootLcn,
      type: 'root',
      version: specVer,
      description: 'Décomposition arborescente conforme spécification S3000L Issue 2.0',
      attributes: [
        { name: 'specVersion', value: specVer },
        { name: 'documentNumber', value: docNum }
      ],
      children: topLevelNodes.length > 0 ? topLevelNodes : Array.from(nodeMap.values()),
      expanded: true,
      selected: false,
      lsaCandidate: true
    };

    return rootNode;
  }

  private convertOfficialBreakdownElement(element: Element, index: number): { node: S3000LTreeNode; childIds: string[] } {
    const rawId = this.getAttr(element, 'id') || this.getAttr(element, 'uri') || `BE_${index}`;
    const normalizedId = rawId.startsWith('#') ? rawId.substring(1) : rawId;

    // 1. LCN Extraction: <breakdownElementIdentifier><identifierValue>M01-01</identifierValue>
    let lcn: string | undefined;
    const beIdElems = this.findDescendantsByLocalNames(element, 'breakdownelementidentifier');
    for (const beId of beIdElems) {
      const val = this.getDescendantText(beId, 'identifiervalue');
      if (val) {
        lcn = val;
        break;
      }
    }
    if (!lcn) {
      lcn = this.getDescendantText(element, 'identifiervalue', 'lcn', 'lcncode') 
        || this.getAttr(element, 'lcn') 
        || this.getAttr(element, 'identifier');
    }

    // 2. Name Extraction: <breakdownElementName><nameString>Module Soufflante</nameString>
    let name: string | undefined;
    const beNameElems = this.findDescendantsByLocalNames(element, 'breakdownelementname');
    if (beNameElems.length > 0) {
      name = this.getDescendantText(beNameElems[0], 'namestring', 'namevalue');
    }
    if (!name) {
      name = this.getDescendantText(element, 'namestring', 'namevalue', 'name', 'title') 
        || this.getAttr(element, 'name');
    }
    if (!name) {
      name = lcn ? `Élément ${lcn}` : `breakdownElement_${index}`;
    }

    // 3. Type: <breakdownElementType>system</breakdownElementType>
    const typeStr = (this.getDescendantText(element, 'breakdownelementtype') || this.getAttr(element, 'type') || '').toLowerCase();
    let nodeType: S3000LNodeType = 'element';
    if (typeStr.includes('root') || typeStr.includes('product')) nodeType = 'product';
    else if (typeStr.includes('system') && !typeStr.includes('sub')) nodeType = 'system';
    else if (typeStr.includes('subsystem')) nodeType = 'subsystem';
    else if (typeStr.includes('assembly') || typeStr.includes('module')) nodeType = 'assembly';
    else if (typeStr.includes('lci') || typeStr.includes('candidate')) nodeType = 'lci';
    else if (typeStr.includes('hardware') || typeStr.includes('item')) nodeType = 'hardware';
    else if (typeStr.includes('part')) nodeType = 'part';
    else {
      nodeType = this.determineNodeTypeFromLcn(lcn);
    }

    // 4. LSA Candidate: <lsaCandidateIndicator>true</lsaCandidateIndicator>
    const lsaCandStr = (this.getDescendantText(element, 'lsacandidateindicator', 'lsacandidate') || this.getAttr(element, 'lsaCandidate') || '').toLowerCase();
    const lsaCandidate = lsaCandStr === 'true' || lsaCandStr === '1' || lsaCandStr === 'yes' || nodeType === 'lci';

    // 5. Part Number, CAGE, SMR, QPA
    const partNumber = this.getDescendantText(element, 'partnumbervalue', 'partnumber', 'pn') || this.getAttr(element, 'partNumber');
    const cageCode = this.getDescendantText(element, 'enterpriseidentifier', 'cagecode', 'cage') || this.getAttr(element, 'cageCode');
    const smrCode = this.getDescendantText(element, 'sourcemaintenancerecoverabilitycode', 'smrcode') || this.getAttr(element, 'smrCode');
    const qpa = this.getDescendantText(element, 'quantityperassembly', 'qpa') || this.getAttr(element, 'qpa');

    // 6. Remarks / Description: <remarks><remarkText>...</remarkText>
    const description = this.getDescendantText(element, 'remarktext', 'remarks', 'description', 'comment') 
      || this.getAttr(element, 'description') 
      || `Élément conforme S3000L Issue 2.0 (${nodeType.toUpperCase()})`;

    // 7. Attributes
    const attributes: S3000LAttribute[] = [];
    if (lcn) attributes.push({ name: 'lcn', value: lcn });
    if (partNumber) attributes.push({ name: 'partNumber', value: partNumber });
    if (cageCode) attributes.push({ name: 'cageCode (Constructeur)', value: cageCode });
    if (smrCode) attributes.push({ name: 'smrCode', value: smrCode });
    if (qpa) attributes.push({ name: 'qpa', value: qpa });
    if (lsaCandidate) attributes.push({ name: 'lsaCandidateIndicator', value: 'true' });

    const revision = this.getDescendantText(element, 'revisionidentifier') || '01';
    attributes.push({ name: 'revision', value: revision });

    // 8. Find child references (<childElementRef uri="#BE_...">)
    const childIds: string[] = [];
    const refElems = this.findDescendantsByLocalNames(element, 'childelementref', 'childbreakdownelementref');
    for (const ref of refElems) {
      let refId = this.getAttr(ref, 'uri') || this.getAttr(ref, 'idRef') || this.getAttr(ref, 'href') || '';
      if (refId.startsWith('#')) refId = refId.substring(1);
      if (refId) {
        childIds.push(refId);
      }
    }

    // 9. Find directly nested <breakdownElement> inside this element's structure
    const nestedChildren: S3000LTreeNode[] = [];
    const structElems = this.findDirectChildrenByLocalNames(element, 'breakdownelementrevision', 'breakdownelementstructure');
    for (const struct of structElems) {
      const nestedBEs = this.findDirectChildrenByLocalNames(struct, 'breakdownelement');
      for (let j = 0; j < nestedBEs.length; j++) {
        const nestedRes = this.convertOfficialBreakdownElement(nestedBEs[j], index * 100 + j);
        nestedChildren.push(nestedRes.node);
      }
    }

    // Generate XML snippet
    const serializer = new XMLSerializer();
    const xmlSnippet = serializer.serializeToString(element);

    const node: S3000LTreeNode = {
      id: normalizedId,
      tagName: 'breakdownElement',
      name,
      lcn: lcn || this.generateFallbackLcn('breakdownElement', String(index)),
      type: nodeType,
      version: '2.0',
      description,
      attributes,
      children: nestedChildren,
      expanded: true,
      selected: false,
      xmlSnippet,
      partNumber,
      lsaCandidate
    };

    return { node, childIds };
  }

  // ─── DOM Helper Utilities ────────────────────────────────────────────────

  private getAttr(el: Element, name: string): string | undefined {
    const val = el.getAttribute(name);
    return val !== null ? val : undefined;
  }

  private getLocalName(el: Element): string {
    return (el.localName || el.tagName).toLowerCase();
  }

  private findDescendantsByLocalNames(parent: Element, ...localNames: string[]): Element[] {
    const targets = localNames.map(n => n.toLowerCase());
    const all = parent.getElementsByTagName('*');
    const matches: Element[] = [];
    for (let i = 0; i < all.length; i++) {
      if (targets.includes(this.getLocalName(all[i]))) {
        matches.push(all[i]);
      }
    }
    return matches;
  }

  private findDirectChildrenByLocalNames(parent: Element, ...localNames: string[]): Element[] {
    const targets = localNames.map(n => n.toLowerCase());
    const matches: Element[] = [];
    for (let i = 0; i < parent.children.length; i++) {
      if (targets.includes(this.getLocalName(parent.children[i]))) {
        matches.push(parent.children[i]);
      }
    }
    return matches;
  }

  private getDescendantText(parent: Element, ...localNames: string[]): string | undefined {
    const elems = this.findDescendantsByLocalNames(parent, ...localNames);
    if (elems.length > 0 && elems[0].textContent?.trim()) {
      return elems[0].textContent.trim();
    }
    return undefined;
  }

  private determineNodeTypeFromLcn(lcn?: string): S3000LNodeType {
    if (!lcn) return 'element';
    const parts = lcn.split('-');
    if (parts.length === 1) return 'system';
    if (parts.length === 2) return 'subsystem';
    if (parts.length === 3) return 'assembly';
    return 'hardware';
  }

  // ─── Fallback Parser (Format Simplifié) ──────────────────────────────────

  private convertDomNodeToTreeNode(element: Element, path: string): S3000LTreeNode {
    const attributes: S3000LAttribute[] = [];
    let lcn: string | undefined;
    let name = element.tagName;
    let partNumber: string | undefined;
    let lsaCandidate = false;

    // Extract attributes
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes.push({ name: attr.name, value: attr.value });

      if (['lcn', 'lcnCode', 'lsaCandidateId', 'identifier', 'breakdownId'].includes(attr.name)) {
        lcn = attr.value;
      }
      if (['name', 'title', 'label'].includes(attr.name)) {
        name = attr.value;
      }
      if (['partNumber', 'pn', 'partNo'].includes(attr.name)) {
        partNumber = attr.value;
      }
      if (attr.name === 'lsaCandidate' && attr.value === 'true') {
        lsaCandidate = true;
      }
    }

    if (name === element.tagName) {
      const titleElem = element.querySelector(':scope > name, :scope > title, :scope > label, :scope > elementName');
      if (titleElem && titleElem.textContent) {
        name = titleElem.textContent.trim();
      }
    }

    if (!lcn) {
      const lcnElem = element.querySelector(':scope > lcn, :scope > lcnCode, :scope > identifier');
      if (lcnElem && lcnElem.textContent) {
        lcn = lcnElem.textContent.trim();
      }
    }

    const nodeType = this.determineNodeType(element.tagName, attributes);
    const children: S3000LTreeNode[] = [];
    const childNodes = Array.from(element.children);
    let childIndex = 0;
    for (const child of childNodes) {
      children.push(this.convertDomNodeToTreeNode(child, `${path}-${childIndex++}`));
    }

    const serializer = new XMLSerializer();
    const xmlSnippet = serializer.serializeToString(element);

    return {
      id: `node-${path}-${Math.random().toString(36).substr(2, 6)}`,
      tagName: element.tagName,
      name: name || element.tagName,
      lcn: lcn || this.generateFallbackLcn(element.tagName, path),
      type: nodeType,
      version: '2.0',
      description: element.querySelector(':scope > description')?.textContent?.trim() || `Élément de structure S3000L (${element.tagName})`,
      attributes,
      children,
      expanded: true,
      selected: false,
      xmlSnippet,
      partNumber,
      lsaCandidate: lsaCandidate || element.tagName.toLowerCase().includes('lsa') || nodeType === 'lci'
    };
  }

  private determineNodeType(tagName: string, attributes: S3000LAttribute[]): S3000LNodeType {
    const tag = tagName.toLowerCase();
    if (tag.includes('s3000l') || tag.includes('project') || tag.includes('dataset') || tag.includes('root')) return 'root';
    if (tag.includes('product') || tag.includes('aircraft') || tag.includes('vehicle')) return 'product';
    if (tag.includes('system') && !tag.includes('sub')) return 'system';
    if (tag.includes('subsystem') || tag.includes('sub-system')) return 'subsystem';
    if (tag.includes('assembly') || tag.includes('module')) return 'assembly';
    if (tag.includes('lci') || tag.includes('candidate')) return 'lci';
    if (tag.includes('task') || tag.includes('requirement') || tag.includes('maintenance')) return 'task';
    if (tag.includes('hardware') || tag.includes('item') || tag.includes('component')) return 'hardware';
    if (tag.includes('part')) return 'part';
    return 'element';
  }

  private generateFallbackLcn(tag: string, path: string): string {
    const parts = path.split('-');
    if (parts.length <= 1) return 'P00-00';
    const major = String.fromCharCode(65 + Math.min(parts.length - 1, 25));
    const minor = parts.slice(1).map(p => p.padStart(2, '0')).join('-');
    return `${major}${minor}`;
  }

  /**
   * Load Default Sample S3000L Data
   */
  public loadSampleData(sampleType: 'engine' | 'landing_gear' | 'avionics'): S3000LTreeNode {
    let xmlContent = '';
    if (sampleType === 'engine') {
      xmlContent = MOCK_S3000L_ENGINE;
    } else if (sampleType === 'landing_gear') {
      xmlContent = MOCK_S3000L_LANDING_GEAR;
    } else {
      xmlContent = MOCK_S3000L_AVIONICS;
    }
    return this.parseXmlString(xmlContent, sampleType);
  }

  // ─── Official S3000L XML Export / Dump ───────────────────────────────────

  /**
   * Serialize an S3000LTreeNode hierarchy back into a valid formatted ASD/AIA S3000L Issue 2.0 XML.
   */
  public dumpTreeToXml(node?: S3000LTreeNode | null): string {
    const root = node ?? this.currentTree();
    if (!root) {
      return '';
    }

    const today = new Date().toISOString().split('T')[0];
    const lines: string[] = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<!--',
      '  ============================================================================',
      '  Spécification Internationale LSA — ASD/AIA S3000L Issue 2.0',
      '  Export généré par SLICwave Web (BASL Safran Suite)',
      `  Date d'émission : ${today}`,
      '  ============================================================================',
      '-->',
      '<s3000l:productBreakdown',
      '  xmlns:s3000l="http://www.s3000l.org/s3000l"',
      '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
      '  specVersion="2.0"',
      `  issueDate="${today}">`
    ];

    if (root.children && root.children.length > 0) {
      for (const child of root.children) {
        lines.push(this.serializeOfficialNodeToXml(child, 1));
      }
    } else {
      lines.push(this.serializeOfficialNodeToXml(root, 1));
    }

    lines.push('</s3000l:productBreakdown>');
    return lines.join('\n');
  }

  /**
   * Serialize an individual node using standard S3000L Issue 2.0 tags:
   * <breakdownElement>, <breakdownElementIdentifier>, <breakdownElementName>, etc.
   */
  private serializeOfficialNodeToXml(node: S3000LTreeNode, indentLevel: number): string {
    const indent = '  '.repeat(indentLevel);
    const subIndent = '  '.repeat(indentLevel + 1);
    const subSubIndent = '  '.repeat(indentLevel + 2);
    const idAttr = node.id.replace(/[^a-zA-Z0-9_-]/g, '_');

    const lines: string[] = [];
    lines.push(`${indent}<breakdownElement id="${idAttr}">`);

    // <breakdownElementIdentifier>
    if (node.lcn) {
      lines.push(`${subIndent}<breakdownElementIdentifier breakdownElementIdentifierClass="lcn">`);
      lines.push(`${subSubIndent}<identifierValue>${this.escapeXml(node.lcn)}</identifierValue>`);
      lines.push(`${subIndent}</breakdownElementIdentifier>`);
    }

    // <breakdownElementName>
    lines.push(`${subIndent}<breakdownElementName>`);
    lines.push(`${subSubIndent}<nameString>${this.escapeXml(node.name)}</nameString>`);
    lines.push(`${subIndent}</breakdownElementName>`);

    // <breakdownElementType>
    lines.push(`${subIndent}<breakdownElementType>${node.type}</breakdownElementType>`);

    // <breakdownElementRevision>
    lines.push(`${subIndent}<breakdownElementRevision>`);
    lines.push(`${subSubIndent}<revisionIdentifier>`);
    lines.push(`${subSubIndent}  <identifierValue>01</identifierValue>`);
    lines.push(`${subSubIndent}</revisionIdentifier>`);

    // <lsaCandidateIndicator>
    lines.push(`${subSubIndent}<lsaCandidateIndicator>${node.lsaCandidate ? 'true' : 'false'}</lsaCandidateIndicator>`);

    // <breakdownElementRealization> (Part Number & CAGE)
    if (node.partNumber) {
      const cage = node.attributes.find(a => a.name.toLowerCase().includes('cage'))?.value || 'F0221';
      lines.push(`${subSubIndent}<breakdownElementRealization>`);
      lines.push(`${subSubIndent}  <partIdentifier>`);
      lines.push(`${subSubIndent}    <partNumberValue>${this.escapeXml(node.partNumber)}</partNumberValue>`);
      lines.push(`${subSubIndent}    <enterpriseIdentifier>${this.escapeXml(cage)}</enterpriseIdentifier>`);
      lines.push(`${subSubIndent}  </partIdentifier>`);
      lines.push(`${subSubIndent}</breakdownElementRealization>`);
    }

    // <remarks>
    if (node.description && !node.description.startsWith('Élément de structure S3000L')) {
      lines.push(`${subSubIndent}<remarks>`);
      lines.push(`${subSubIndent}  <remarkText>${this.escapeXml(node.description.trim())}</remarkText>`);
      lines.push(`${subSubIndent}</remarks>`);
    }

    // <breakdownElementStructure>
    if (node.children && node.children.length > 0) {
      lines.push(`${subSubIndent}<breakdownElementStructure>`);
      for (const child of node.children) {
        lines.push(this.serializeOfficialNodeToXml(child, indentLevel + 3));
      }
      lines.push(`${subSubIndent}</breakdownElementStructure>`);
    }

    lines.push(`${subIndent}</breakdownElementRevision>`);
    lines.push(`${indent}</breakdownElement>`);

    return lines.join('\n');
  }

  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Export the current tree as an S3000L XML file download in the browser.
   */
  public exportXmlFile(suggestedFilename?: string): void {
    const tree = this.currentTree();
    if (!tree) return;

    const xmlContent = this.dumpTreeToXml(tree);
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const lcn = tree.lcn ? `_${tree.lcn.replace(/[^a-zA-Z0-9_-]/g, '-')}` : '';
    const date = new Date().toISOString().split('T')[0];
    const filename = suggestedFilename || `s3000l_export${lcn}_${date}.xml`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
