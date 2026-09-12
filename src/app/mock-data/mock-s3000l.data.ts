/**
 * ============================================================================
 * MOCK DATASET: Fichiers XML S3000L d'exemple (Issue 1.1 / Issue 2.0)
 * ============================================================================
 * Vous pouvez éditer ou ajouter de nouveaux jeux d'arborescence XML ci-dessous.
 * 
 * // TODO: [API BACKEND] Pour brancher le traitement réel :
 * // 1. Uploader les fichiers vers votre API (ex: POST /api/v1/s3000l/upload en multipart/form-data)
 * // 2. Récupérer l'arborescence JSON sérialisée ou parser côté client via S3000LParserService
 * // 3. Remplacer les chaînes statiques par un appel GET /api/v1/projects/:id/tree
 */

export const MOCK_S3000L_ENGINE = `<?xml version="1.0" encoding="UTF-8"?>
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

export const MOCK_S3000L_LANDING_GEAR = `<?xml version="1.0" encoding="UTF-8"?>
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

export const MOCK_S3000L_AVIONICS = `<?xml version="1.0" encoding="UTF-8"?>
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
