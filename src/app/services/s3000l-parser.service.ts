import { Injectable, signal } from '@angular/core';
import { S3000LTreeNode, S3000LNodeType, S3000LAttribute } from '../models/s3000l-tree.model';

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
    // refresh selected node reference
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

  /**
   * Parse XML content string into S3000LTreeNode hierarchy
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
    const tree = this.convertDomNodeToTreeNode(rootElement, '0');
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

    // Look for name or title sub-elements if name is still tag name
    if (name === element.tagName) {
      const titleElem = element.querySelector(':scope > name, :scope > title, :scope > label, :scope > elementName');
      if (titleElem && titleElem.textContent) {
        name = titleElem.textContent.trim();
      }
    }

    // Look for LCN sub-elements if not found in attributes
    if (!lcn) {
      const lcnElem = element.querySelector(':scope > lcn, :scope > lcnCode, :scope > identifier');
      if (lcnElem && lcnElem.textContent) {
        lcn = lcnElem.textContent.trim();
      }
    }

    const nodeType = this.determineNodeType(element.tagName, attributes);

    // Convert child XML elements
    const children: S3000LTreeNode[] = [];
    const childNodes = Array.from(element.children);
    
    // Filter out simple leaf metadata elements (like <name>, <description> if already extracted)
    let childIndex = 0;
    for (const child of childNodes) {
      // If child is a complex element with subchildren or key structural tag
      children.push(this.convertDomNodeToTreeNode(child, `${path}-${childIndex++}`));
    }

    // Generate XML snippet representation
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
      attributes: attributes,
      children: children,
      expanded: true,
      selected: false,
      xmlSnippet: xmlSnippet,
      partNumber: partNumber,
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
    if (tag.includes('lsa') || tag.includes('candidate') || tag.includes('lci')) return 'lci';
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
      xmlContent = S3000L_SAMPLE_ENGINE;
    } else if (sampleType === 'landing_gear') {
      xmlContent = S3000L_SAMPLE_LANDING_GEAR;
    } else {
      xmlContent = S3000L_SAMPLE_AVIONICS;
    }
    return this.parseXmlString(xmlContent, sampleType);
  }
}

/* ========================================================================
   SAMPLE S3000L XML DATASETS (COMPLIANT WITH S3000L ISSUE 1.1 / ISSUE 2.0)
   ======================================================================== */

const S3000L_SAMPLE_ENGINE = `<?xml version="1.0" encoding="UTF-8"?>
<s3000lProductBreakdown xmlns="http://www.s3000l.org/s3000l" specVersion="2.0" securityClassification="RESTRICTED">
  <productIdentifier id="PROD-M88" name="Ensemble Propulsion Turboréacteur M88" lcn="E00-00">
    <description>Structure de découpage du système de propulsion militaire haute performance S3000L 2.0</description>
    <systemBreakdown name="Système de Compressation Haute Pression (HP)" lcn="E01-00" lsaCandidate="true">
      <breakdownElement name="Rotor de Compresseur HP" lcn="E01-01" partNumber="PN-HP-ROT-409" lsaCandidate="true">
        <description>Ensemble aubagé monobloc titane avec traitement thermique de surface</description>
        <hardwareItem name="Aubes de Compresseur HP (Étage 1-3)" lcn="E01-01-01" partNumber="PN-BLD-7812" />
        <hardwareItem name="Disque de Rotor Principal" lcn="E01-01-02" partNumber="PN-DSC-9901" />
        <taskRequirement name="Inspection Boroscopique des Aubes" taskType="Preventive" interval="150 FH" />
      </breakdownElement>
      <breakdownElement name="Stator et Carter de Compresseur" lcn="E01-02" partNumber="PN-CAS-102">
        <hardwareItem name="Vannes de Décharge (Bleed Valves)" lcn="E01-02-01" partNumber="PN-VLV-334" lsaCandidate="true" />
        <hardwareItem name="Directrices à Géométrie Variable (VSV)" lcn="E01-02-02" partNumber="PN-VSV-881" />
      </breakdownElement>
    </systemBreakdown>
    <systemBreakdown name="Chambre de Combustion et Turbine" lcn="E02-00" lsaCandidate="true">
      <breakdownElement name="Module Injecteurs de Carburant" lcn="E02-01" partNumber="PN-INJ-550">
        <hardwareItem name="Gicleur Haute Pression" lcn="E02-01-01" partNumber="PN-NOZ-011" />
        <hardwareItem name="Raccord Hydraulique Avio" lcn="E02-01-02" partNumber="PN-FIT-902" />
        <taskRequirement name="Contrôle d'Étancheité et Calibrage Débit" taskType="Corrective" interval="300 FH" />
      </breakdownElement>
      <breakdownElement name="Turbine HP et Distributeur" lcn="E02-02" partNumber="PN-TURB-771" lsaCandidate="true">
        <hardwareItem name="Aubes de Turbine Monocristallines" lcn="E02-02-01" partNumber="PN-BLD-MONO-09" />
        <hardwareItem name="Bouclier Thermique céramique" lcn="E02-02-02" partNumber="PN-SHD-339" />
      </breakdownElement>
    </systemBreakdown>
    <systemBreakdown name="Calculateur Régulation FADEC &amp; Capteurs" lcn="E03-00" lsaCandidate="true">
      <breakdownElement name="Unité de Contrôle Numérique (ECU)" lcn="E03-01" partNumber="PN-ECU-9900X">
        <hardwareItem name="Carte Processeur Redondante A/B" lcn="E03-01-01" partNumber="PN-BRD-882" />
        <hardwareItem name="Module Capteurs de Pression P3" lcn="E03-01-02" partNumber="PN-SNS-P3" />
        <taskRequirement name="Téléchargement des Logs de Maintenance FADEC" taskType="Diagnostic" interval="A chaque vol" />
      </breakdownElement>
    </systemBreakdown>
  </productIdentifier>
</s3000lProductBreakdown>`;

const S3000L_SAMPLE_LANDING_GEAR = `<?xml version="1.0" encoding="UTF-8"?>
<s3000lProductBreakdown xmlns="http://www.s3000l.org/s3000l" specVersion="1.1">
  <productIdentifier id="PROD-LG-11" name="Système d'Atterrisseur Principal" lcn="L00-00">
    <systemBreakdown name="Jambe d'Atterrisseur et Amortisseur Oleo-pneumatique" lcn="L01-00" lsaCandidate="true">
      <breakdownElement name="Caisson de Jambe Principal" lcn="L01-01" partNumber="PN-STRUT-101">
        <hardwareItem name="Tige de Piston Chromée" lcn="L01-01-01" partNumber="PN-PST-88" />
        <hardwareItem name="Joints Haute Pression Azote/Huile" lcn="L01-01-02" partNumber="PN-SEAL-Kit-04" lsaCandidate="true" />
        <taskRequirement name="Purge et Repression en Azote" taskType="Preventive" interval="50 Cyc" />
      </breakdownElement>
      <breakdownElement name="Compas d'Orientation et Vérin d'Escamotage" lcn="L01-02" partNumber="PN-ACT-202">
        <hardwareItem name="Vérin Hydraulique Principal" lcn="L01-02-01" partNumber="PN-CYL-441" />
        <hardwareItem name="Capteurs de Verrouillage Bas" lcn="L01-02-02" partNumber="PN-PROX-099" />
      </breakdownElement>
    </systemBreakdown>
    <systemBreakdown name="Ensemble Freinage et Roues" lcn="L02-00" lsaCandidate="true">
      <breakdownElement name="Bloc Frein Carbone Haute Température" lcn="L02-01" partNumber="PN-BRK-CARB-99">
        <hardwareItem name="Disques Stators et Rotors Carbone" lcn="L02-01-01" partNumber="PN-DISC-SET-12" />
        <hardwareItem name="Pistons Hydrauliques d'Étrier" lcn="L02-01-02" partNumber="PN-PST-CAL-08" />
        <taskRequirement name="Mesure d'Usure des Disques de Frein" taskType="Inspection" interval="100 Cyc" />
      </breakdownElement>
    </systemBreakdown>
  </productIdentifier>
</s3000lProductBreakdown>`;

const S3000L_SAMPLE_AVIONICS = `<?xml version="1.0" encoding="UTF-8"?>
<s3000lProductBreakdown xmlns="http://www.s3000l.org/s3000l" specVersion="2.0">
  <productIdentifier id="PROD-AV-20" name="Calculateurs d'Avionique et Bus AFDX" lcn="A00-00">
    <systemBreakdown name="Rack d'Avionique Modulaire Intégrée (IMA)" lcn="A01-00" lsaCandidate="true">
      <breakdownElement name="Module Processeur Général (CPM)" lcn="A01-01" partNumber="PN-CPM-700">
        <hardwareItem name="Carte Mère Dual Core AERO-64" lcn="A01-01-01" partNumber="PN-MB-64" />
        <hardwareItem name="Switch Ethernet AFDX Dédié" lcn="A01-01-02" partNumber="PN-SW-AFDX-08" />
      </breakdownElement>
      <breakdownElement name="Centrale à Inertie et GPS (IRS/GPS)" lcn="A02-01" partNumber="PN-IRS-3000" lsaCandidate="true">
        <hardwareItem name="Gyromètres Laser Tri-Axe" lcn="A02-01-01" partNumber="PN-GYRO-TRI" />
        <hardwareItem name="Récepteur GPS/Galileo Sécurisé" lcn="A02-01-02" partNumber="PN-REC-GPS-02" />
      </breakdownElement>
    </systemBreakdown>
  </productIdentifier>
</s3000lProductBreakdown>`;
