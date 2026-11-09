# Valvia: Content Taxonomy (v0.2, SME decisions applied)

> **Purpose:** the agreed category → subcategory → leaf structure for Valvia's content.
> **Date:** 2 Nov 2026 | **Status:** v0.3, SME answers and follow-ups (F1, F4, F6) of 2 Nov 2026 applied | **Companion:** `valvia-backlog.md`

## SME decisions (2 Nov 2026)

| # | Question | Decision | Effect on this document |
|---|---|---|---|
| 1 | Population | **Adults and paediatrics** | New root 15 (Paediatric echocardiography); root 8 covers paediatric and adult CHD; values carry an adult/paediatric qualifier |
| 2 | Sources beyond ESC / EACVI / ASE | **Exclude**, except paediatric z-score datasets cited by an ESC or ASE document (F1) | Rheumatic heart disease (WHF criteria) removed; manufacturer charts excluded; only ESC (incl. its associations, to confirm), EACVI and ASE documents, plus cited z-score datasets |
| 3 | Superseded values | **Keep as history** | Shown in a collapsed "Previous recommendations" section |
| 4 | Multimodality (CT, CMR) cut-offs | **Include** | Labelled with a modality badge (Echo / CT / CMR) |
| 5 | Algorithms / flowcharts | **Link to the source** | `ALG` blocks link out; nothing redrawn |
| 6 | Prosthetic valve model/size values | **Include** | Node 4.1 expanded into model/size reference tables |
| 7 | Language | **English only** | |
| 8 | Units / BSA | **mm, cm², m/s; tissue Doppler in cm/s (F4); DuBois BSA** | See 14.2 |
| 9 | Priorities | **All P1** | Delivered in two waves (W1, W2) for sequencing only |
| 10 | Second reviewer / approval | **The SME is the only content approver.** The software engineer builds a Claude clinical-reviewer persona that checks every value against the source as second reviewer (advisory, never approves) | Engineer may only revert a published content change in an emergency; corrections go through SME approval |
| 11 | Missing topics | **Proceed with current tree** | Paediatric nodes are new proposals, see F2 |

## Legend

**Content blocks** (what a leaf page shows; values are entered later, each with its source):

| Tag | Meaning |
|---|---|
| `NORM` | Normal reference ranges (sex-specific / indexed / age- or BSA-based where applicable) |
| `GRADE` | Severity grading (e.g. mild / moderate / severe) |
| `INTV` | Thresholds that trigger intervention or closer follow-up |
| `FEAS` | Procedure feasibility / suitability criteria (favourable / challenging / unsuitable) |
| `CRIT` | Diagnostic criteria or definitions |
| `PROG` | Prognostic markers |
| `METH` | Measurement method notes (how / where measured, pitfalls) |
| `ALG` | Algorithm reference: link to the source document |

**Other conventions**
- **All nodes are P1.** `W1` / `W2` is delivery order only.
- **Population:** any leaf can hold adult and paediatric values; the app filters with an adult/paediatric switch.
- **Modality:** CT and CMR values inside echo-related decisions are included and badged.
- **Cross-links (→)** mean the content is stored once and shown in two places.

---

## 1. Chamber size & function (W1)

- **1.1 Left ventricle**
  - 1.1.1 LV dimensions & volumes: linear, 2D and 3D volumes, indexed, sex-specific `NORM` `METH`
  - 1.1.2 LV wall thickness, mass & geometry: RWT, LV mass index, geometry classes `NORM`
  - 1.1.3 LV global systolic function: LVEF (2D/3D), GLS, MAPSE, s′ `NORM` `CRIT`
  - 1.1.4 LV regional function: segmentation model, wall motion score index `NORM` `METH`
- **1.2 Left atrium:** volume index, diameter, area, LA strain `NORM`
- **1.3 Right ventricle**
  - 1.3.1 RV dimensions: basal, mid, longitudinal, RVOT, wall thickness `NORM`
  - 1.3.2 RV systolic function: TAPSE, S′, FAC, RV free-wall strain, 3D RVEF `NORM`
- **1.4 Right atrium:** area, volume index `NORM`
- **1.5 Aortic root & ascending aorta:** normal dimensions → see 10.1 `NORM`
- **1.6 Inferior vena cava & RA pressure estimation** `CRIT` `METH`
- **1.7 Myocardial deformation (strain):** normal values, vendor considerations `NORM` `METH`
- **1.8 Indexing & reference populations:** BSA (DuBois), sex / age / ethnicity-specific ranges `METH`

## 2. Diastolic function & filling pressures (W1)

- 2.1 Diastolic parameters: normal values by age (e′, E/A, E/e′, DT, IVRT, TR velocity, LAVi, LA strain, pulmonary vein flow) `NORM`
- 2.2 LA pressure estimation & diastolic dysfunction grading (sinus rhythm) `CRIT` `ALG`
- 2.3 Special populations: atrial fibrillation, MAC / mitral valve disease, prosthetic MV, pulmonary hypertension, heart transplant, HCM `CRIT` `ALG`
- 2.4 HFpEF diagnosis: echo components and scores `CRIT`
- 2.5 Diastolic stress echocardiography `CRIT` → also 9.4

## 3. Valvular heart disease (W1)

- **3.1 Aortic valve disease**
  - **3.1.1 Aortic stenosis**
    - 3.1.1.1 Severity grading (concordant, high-gradient) `GRADE`
    - 3.1.1.2 Low-flow, low-gradient AS with reduced LVEF (classical), incl. dobutamine stress echo `CRIT`
    - 3.1.1.3 Low-flow, low-gradient AS with preserved LVEF (paradoxical) and normal-flow low-gradient AS `CRIT`
    - 3.1.1.4 Discordant grading: confirmation tests (incl. CT calcium score) `CRIT` `ALG`
    - 3.1.1.5 Asymptomatic severe AS: high-risk markers and intervention triggers `INTV` `PROG`
    - 3.1.1.6 TAVI imaging / anatomical considerations (incl. CT) `FEAS`
  - **3.1.2 Aortic regurgitation**
    - 3.1.2.1 Severity grading (incl. CMR quantification) `GRADE`
    - 3.1.2.2 Intervention thresholds (LV dimensions, LVEF) `INTV`
    - 3.1.2.3 TAVI for AR: anatomical suitability `FEAS`
  - **3.1.3 Bicuspid aortic valve & associated aortopathy** `CRIT` `INTV` → also 10.2
- **3.2 Mitral valve disease**
  - **3.2.1 Mitral regurgitation**
    - 3.2.1.1 Mechanism & aetiology: Carpentier classes; primary vs ventricular secondary vs atrial secondary `CRIT`
    - **Primary MR**
      - 3.2.1.2 Severity grading (incl. CMR quantification) `GRADE`
      - 3.2.1.3 Intervention thresholds, incl. asymptomatic triggers (LV size/function, LA size, AF, PH) `INTV`
      - 3.2.1.4 Likelihood of durable surgical repair `FEAS`
    - **Secondary MR**
      - 3.2.1.5 Ventricular secondary MR: severity grading `GRADE`
      - 3.2.1.6 Atrial secondary MR: defining features `CRIT`
      - 3.2.1.7 Intervention & patient-selection criteria `INTV`
    - 3.2.1.8 **Feasibility criteria for TEER** (anatomical: favourable / challenging / unsuitable) `FEAS`
    - 3.2.1.9 Exercise echocardiography in MR `CRIT` → also 9.3
  - **3.2.2 Mitral stenosis**
    - 3.2.2.1 Rheumatic MS: severity grading `GRADE`
    - 3.2.2.2 Suitability for percutaneous mitral commissurotomy (e.g. Wilkins score) `FEAS`
    - 3.2.2.3 Degenerative / MAC-related MS `CRIT`
    - 3.2.2.4 Intervention thresholds & role of stress echo `INTV`
  - **3.2.3 Mitral annular calcification:** implications for transcatheter therapy (incl. CT) `CRIT`
- **3.3 Tricuspid valve disease**
  - 3.3.1 TR mechanism: primary, ventricular secondary, atrial secondary, lead-related `CRIT`
  - 3.3.2 TR severity grading, incl. extended grades (massive / torrential) `GRADE`
  - 3.3.3 TR intervention thresholds, incl. at time of left-sided surgery (annulus size) `INTV`
  - 3.3.4 Feasibility for transcatheter tricuspid therapy (T-TEER, TTVR) `FEAS`
  - 3.3.5 Tricuspid stenosis: grading `GRADE`
- **3.4 Pulmonary valve disease**
  - 3.4.1 Pulmonary stenosis: grading `GRADE`
  - 3.4.2 Pulmonary regurgitation: grading `GRADE`
- **3.5 Multiple & mixed valve disease** `CRIT`
- **3.6 Infective endocarditis**
  - 3.6.1 Echocardiographic diagnostic criteria (vegetation, abscess, pseudoaneurysm, perforation, new dehiscence) `CRIT`
  - 3.6.2 Imaging-related surgical thresholds (vegetation size, embolic risk) `INTV`
  - 3.6.3 TTE / TEE indications (incl. role of CT / PET-CT as defined in ESC criteria) `CRIT`

## 4. Prosthetic valves & valve interventions (W1; 4.1 in W2)

- **4.1 Prosthetic valve reference values by model and size** (W2) `NORM`
  - 4.1.1 Surgical aortic bioprostheses (stented, stentless)
  - 4.1.2 Mechanical aortic prostheses
  - 4.1.3 Transcatheter aortic valves
  - 4.1.4 Mitral prostheses (biological, mechanical, transcatheter)
  - 4.1.5 Tricuspid & pulmonary prostheses
  - *Only values published in ESC / EACVI / ASE documents (e.g. guideline appendices); manufacturer charts excluded (decision 2).*
- **4.2 Prosthetic aortic valve (surgical and transcatheter)**
  - 4.2.1 Stenosis / obstruction grading (normal, possible, significant) `GRADE`
  - 4.2.2 Patient–prosthesis mismatch, incl. obesity-adjusted thresholds `GRADE`
  - 4.2.3 Regurgitation grading: transvalvular and paravalvular `GRADE`
  - 4.2.4 Leaflet thrombosis / HALT: imaging criteria (incl. CT) `CRIT`
- **4.3 Prosthetic mitral valve (surgical and transcatheter)**
  - 4.3.1 Stenosis / obstruction grading `GRADE`
  - 4.3.2 Regurgitation grading `GRADE`
  - 4.3.3 Patient–prosthesis mismatch `GRADE`
- **4.4 Prosthetic tricuspid & pulmonary valves** `GRADE`
- **4.5 After valve repair**
  - 4.5.1 After mitral TEER: residual MR, iatrogenic stenosis `GRADE`
  - 4.5.2 After tricuspid TEER `GRADE`
  - 4.5.3 After surgical repair / annuloplasty ring `GRADE`
- **4.6 Bioprosthetic valve dysfunction & structural valve deterioration:** definitions (ESC-endorsed documents only) `CRIT`

## 5. Pulmonary hypertension & right heart (W1)

- 5.1 Haemodynamic definitions of PH (context for echo findings) `CRIT`
- 5.2 Echocardiographic probability of PH: TR velocity categories + additional signs `CRIT`
- 5.3 RV function & RV–PA coupling (e.g. TAPSE/sPAP) `PROG`
- 5.4 Estimation of PA pressures and PVR `METH`
- 5.5 Exercise echo in PH `CRIT`
- 5.6 Acute pulmonary embolism: echo signs of RV dysfunction `CRIT`
- 5.7 Paediatric PH → see 15.4

## 6. Cardiomyopathies & heart failure (W1)

- 6.1 Heart failure: LVEF categories and echo role in diagnosis `CRIT`
- **6.2 Hypertrophic cardiomyopathy**
  - 6.2.1 Diagnostic wall-thickness criteria (adults, relatives; children → 15.5) `CRIT`
  - 6.2.2 LVOT obstruction: rest and provoked `CRIT`
  - 6.2.3 Echo variables in sudden-death risk assessment `PROG`
  - 6.2.4 Septal reduction therapy: imaging criteria `INTV`
- 6.3 Dilated / non-dilated LV cardiomyopathy `CRIT`
- 6.4 Arrhythmogenic cardiomyopathy: echo and CMR criteria `CRIT`
- 6.5 Restrictive cardiomyopathy & cardiac amyloidosis: echo red flags and scores `CRIT`
- 6.6 LV hypertrabeculation (non-compaction) `CRIT`
- 6.7 Hypertensive heart disease: LVH thresholds `CRIT`
- 6.8 Athlete's heart vs cardiomyopathy (grey zone) `NORM`
- 6.9 Takotsubo, Fabry, sarcoidosis `CRIT`

## 7. Pericardial disease (W1)

- 7.1 Pericardial effusion: size grading `GRADE`
- 7.2 Cardiac tamponade: echo signs and respiratory variation thresholds `CRIT`
- 7.3 Constrictive pericarditis vs restrictive cardiomyopathy `CRIT`
- 7.4 Acute / recurrent pericarditis and myopericarditis: imaging criteria (incl. CMR) `CRIT`

## 8. Congenital heart disease, paediatric & adult (W2)

- 8.0 Segmental approach & nomenclature `METH` *(new)*
- 8.1 Shunt quantification (Qp:Qs) `METH`
- 8.2 Atrial septal defect: haemodynamic significance, device-closure suitability (size, rims) `INTV` `FEAS`
- 8.3 Patent foramen ovale: shunt grading, atrial septal aneurysm, high-risk anatomy `GRADE` `CRIT`
- 8.4 Ventricular septal defect `INTV`
- 8.5 Patent ductus arteriosus `INTV`
- 8.6 Coarctation of the aorta: Doppler criteria `CRIT` `INTV`
- 8.7 Repaired tetralogy of Fallot: PR severity, RV size (incl. CMR volumes), RVOT `INTV`
- 8.8 Ebstein anomaly `CRIT`
- 8.9 Transposition (atrial switch, arterial switch, congenitally corrected): systemic RV assessment `CRIT`
- 8.10 Fontan circulation `CRIT`
- 8.11 Eisenmenger / PAH associated with CHD `CRIT` → also 5
- 8.12 Pulmonary valve / RVOT lesions → see 3.4
- 8.13 Atrioventricular septal defect `CRIT` *(new)*
- 8.14 Single-ventricle palliation before Fontan `CRIT` *(new)*

## 9. Stress echocardiography (W2)

- 9.1 Ischaemia and viability criteria `CRIT`
- 9.2 Low-flow AS: dobutamine stress → see 3.1.1.2
- 9.3 Exercise echo in valvular disease (MR, MS, AS, AR) `CRIT`
- 9.4 Diastolic stress test → see 2.5
- 9.5 Contrast echocardiography: indications `CRIT`
- 9.6 Stress echo in cardiomyopathies, heart failure and the pulmonary circulation `CRIT` *(new, PO-5)*

## 10. Aortic disease (W2)

- 10.1 Normal aortic dimensions → also 1.5 `NORM`
- 10.2 Aortic dilatation & aneurysm: intervention thresholds (incl. BAV, Marfan / heritable thoracic aortic disease; CT/CMR measurements) `INTV`
- 10.3 Acute aortic syndromes: echo signs `CRIT`

## 11. Cardio-oncology (W2)

- 11.1 Baseline and surveillance echo parameters `METH`
- 11.2 Cancer therapy-related cardiac dysfunction: LVEF and GLS definitions `CRIT`

## 12. Cardiac masses & embolic sources (W2)

- 12.1 LV thrombus `CRIT`
- 12.2 LA / LAA thrombus, spontaneous echo contrast, LAA velocities `CRIT`
- 12.3 Masses: features of tumour vs thrombus vs vegetation (incl. CMR) `CRIT`
- 12.4 Aortic atheroma grading `GRADE`

## 13. Special populations (W2)

- 13.1 Pregnancy: expected echo changes and risk-relevant thresholds `NORM` `CRIT`
- 13.2 Athletes → see 6.8
- 13.3 Elderly; sex- and ethnicity-specific reference ranges → see 1.8

## 14. Reference & methodology (W1)

- 14.1 Abbreviations & glossary
- 14.2 Units & indexation conventions:
  - Lengths **mm**; areas **cm²**; blood-flow velocities **m/s**; tissue Doppler velocities (e′, s′, a′) **cm/s** (SME decisions)
  - Proposed for the rest (to confirm, see F4): volumes mL, indexed volumes mL/m², mass g/m², pressures mmHg, time intervals ms, strain %
  - BSA: **DuBois** formula
  - Values are stored as published; when the display unit differs, the original value and unit are shown on tap
- 14.3 Key formulas (display only; no interactive calculators in v1)
- 14.4 About the sources and how disagreements and previous recommendations are shown

## 15. Paediatric echocardiography (W2, new)

- 15.1 Quantification methods & indexing in children (BSA, z-scores) `METH`
- 15.2 Normal cardiac dimensions in children (z-score datasets cited by ESC / ASE documents, shown as published; no patient z-score calculation) `NORM`
- 15.3 Ventricular systolic & diastolic function in children `NORM`
- 15.4 Paediatric pulmonary hypertension `CRIT`
- 15.5 Paediatric cardiomyopathies (incl. HCM thresholds in children) `CRIT`

## 16. Transoesophageal echocardiography (TEE) (new, decision PO-5)

Added 9 Nov 2026 by the product owner: TEE and stress echo are main categories next to adults and children. Values
measured by TEE carry `technique: TEE`; stress values (section 9) carry `technique: stress`.

- 16.1 LA appendage: thrombus, spontaneous echo contrast, emptying velocities `CRIT` → also 12.2
- 16.2 Interatrial septum: PFO, atrial septal aneurysm `CRIT`
- 16.3 Aortic atheroma `GRADE` → also 12.4
- 16.4 Residual regurgitation after transcatheter repair or replacement `GRADE` → also 4.5.1, 4.2.3
- 16.5 Intraprocedural guidance of mitral TEER `CRIT` → also 4.5.1
- 16.6 Screening before structural heart interventions `FEAS`

---

## Appendix A: Source registry (candidates, to verify)

Only ESC (incl. EACVI and other ESC associations, see F3) and ASE documents, plus paediatric z-score datasets that one of these documents cites (registered with a `citedBy` link). "Verify" = confirm this is the latest version.

| Society | Document | Year | Main nodes | Status |
|---|---|---|---|---|
| ESC / EACTS | Guidelines for the management of valvular heart disease | 2025 | 3, 4 | Current |
| ESC | Guidelines for the management of heart failure | 2026 | 2.4, 6.1 | Current (new, Aug 2026) |
| ESC | Guidelines for the management of cardiomyopathies | 2023 | 6, 15.5 | Current |
| ESC | Guidelines for the management of endocarditis | 2023 | 3.6 | Current |
| ESC / ERS | Guidelines for the diagnosis and treatment of pulmonary hypertension | 2022 | 5, 15.4 | Current |
| ESC | Guidelines for myocarditis and pericarditis | 2025 | 7 | Current |
| ESC | Guidelines for peripheral arterial and aortic diseases | 2024 | 10 | Current |
| ESC | Guidelines for elevated blood pressure and hypertension | 2024 | 6.7 | Current |
| ESC | Guidelines on cardio-oncology | 2022 | 11 | Current |
| ESC | Guidelines for cardiovascular disease and pregnancy | 2025 | 13.1 | Current |
| ESC | Guidelines for adult congenital heart disease | 2020 | 8 | Verify |
| ESC | Guidelines on acute pulmonary embolism | 2019 | 5.6 | Verify |
| ESC associations (EAPCI / EACTS) | Standardized definitions of structural deterioration and valve failure | 2017 | 4.6 | Verify (see F3) |
| ASE / EACVI | Chamber quantification recommendations | 2015 | 1 | Verify |
| ASE | LV diastolic function & HFpEF diagnosis (update) | 2025 | 2 | Current (replaces ASE/EACVI 2016) |
| ASE (with EACVI) | Clinical applications of strain echocardiography, consensus statement | 2025/2026 | 1.7, 11 | Current |
| ASE | Standardization of adult echocardiography reporting | 2025 | 14 | Current |
| ASE | Right heart / PH echocardiographic assessment | 2025 | 1.3, 1.4, 5 | Verify |
| ASE | Evaluation of prosthetic valve function | 2024 | 4 | Verify |
| ASE | Native valvular regurgitation (noninvasive evaluation) | 2017 | 3 | Verify |
| ASE | Quantification methods in paediatric echocardiography | 2010 | 15 | Verify |
| EACVI / ASE | Aortic stenosis echo assessment, focused update | 2017 | 3.1.1 | Verify |
| EACVI | Multi-modality imaging in aortic stenosis, clinical consensus | 2023 | 3.1.1 | Current |
| EACVI | Multi-modality imaging of native valvular regurgitation | 2022 | 3 | Verify |
| EACVI | Recommendations on prosthetic heart valves | 2016 | 4 | Verify |
| EACVI | Imaging for detection of embolic sources | 2021 | 12 | Current |
| EACVI | Multimodality imaging of pericardial disease | 2015 | 7 | Verify |
| EACVI / ASE | Stress echo in ischaemic and non-ischaemic heart disease | various | 9 | Verify |
| EACVI | Normal reference ranges (NORRE study) | various | 1, 2 | Verify |

---

## Appendix B: Follow-up questions for the SME

1. ~~**F1 Paediatric normal values.**~~ **Answered:** yes, include z-score datasets that an ESC or ASE document cites; shown as published tables or equations, without computing a patient's z-score.
2. **F2 Paediatric scope.** Are the new nodes 8.0, 8.13, 8.14 and root 15 right? Is fetal echocardiography in scope?
3. **F3 ESC associations.** Do documents from ESC associations other than EACVI (e.g. EAPCI, HFA, EHRA) count as "ESC"?
4. ~~**F4 Units.**~~ **Resolved by the product owner (PO-4, 9 Nov 2026):** every value is shown in the unit printed in the guideline; no conversion for display.
5. **F5 Prosthetic coverage.** With manufacturer charts excluded, some valve models or sizes will have no reference values. Acceptable?
6. ~~**F6 Backup approvals.**~~ **Resolved:** the SME is the only content approver; the Claude persona is an advisory second reviewer.
7. **F7 RV diastolic function grading (ASE 2025 right heart).** Table 1 grades RV E/A, e′/a′, E/e′ and deceleration time as mild / moderate / severe, but these rows conflict with Table 6 of the same document (e.g. mildly abnormal DT ≥ 87 to < 120 ms in Table 1 vs impaired relaxation DT > 230 ms in Table 6; moderate E/A 0.8–2.1 equals the normal range). Not entered (CH-23). Which table should Valvia show, if any?
