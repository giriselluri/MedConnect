-- ==============================================================================
-- MedConnect AI — Comprehensive Seed Data
-- Fictional healthcare professionals, educational case studies, groups & posts
-- NOTE: All profiles and case studies are synthetic examples for professional demonstration.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Seed Specialties
-- ------------------------------------------------------------------------------
INSERT INTO public.specialties (id, name, category, description, icon) VALUES
('cardiology', 'Cardiology', 'Clinical Medicine', 'Cardiovascular diseases, interventions, and electrophysiology', 'Heart'),
('oncology', 'Oncology', 'Clinical Medicine', 'Medical, surgical, and radiation oncology therapeutics', 'ShieldAlert'),
('neurology', 'Neurology', 'Clinical Medicine', 'Brain, spinal cord, and neurodegenerative disorders', 'Brain'),
('pediatrics', 'Pediatrics', 'Clinical Medicine', 'Childhood development and pediatric acute/chronic illnesses', 'Baby'),
('dermatology', 'Dermatology', 'Clinical Medicine', 'Cutaneous pathology, inflammatory skin diseases, and dermato-oncology', 'Sparkles'),
('internal_medicine', 'Internal Medicine', 'Clinical Medicine', 'Adult primary care, multisystem chronic illness, and hospital medicine', 'Stethoscope'),
('radiology', 'Radiology', 'Diagnostic', 'Diagnostic imaging, MRI, CT, and interventional radiology', 'ScanLine'),
('immunology', 'Immunology & Allergy', 'Clinical Medicine', 'Autoimmune diseases, immunotherapies, and allergic reactions', 'Shield'),
('endocrinology', 'Endocrinology', 'Clinical Medicine', 'Metabolic diseases, diabetes care, and thyroid pathology', 'Activity'),
('emergency_medicine', 'Emergency Medicine', 'Acute Care', 'Trauma, critical resuscitation, and acute emergency care', 'Ambulance'),
('gastroenterology', 'Gastroenterology', 'Clinical Medicine', 'GI tract diseases, hepatology, and endoscopy', 'Microscope'),
('psychiatry', 'Psychiatry', 'Behavioral Health', 'Mental health disorders, neuropsychiatry, and psychotherapy', 'Smile'),
('pulmonology', 'Pulmonology', 'Clinical Medicine', 'Respiratory illnesses, critical care ventilation, and sleep medicine', 'Wind'),
('nephrology', 'Nephrology', 'Clinical Medicine', 'Renal diseases, dialysis, and electrolyte disorders', 'Droplet'),
('orthopedics', 'Orthopedic Surgery', 'Surgical', 'Musculoskeletal trauma, arthroplasty, and sports medicine', 'Bone')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. Seed Fictional Profiles
-- ------------------------------------------------------------------------------
INSERT INTO public.profiles (
    id, email, full_name, title, role, institution, location, bio, avatar_url,
    years_of_experience, qualifications, interests, is_admin, is_verified, connections_count
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'sarah.jenkins@medconnect.local',
    'Dr. Sarah Jenkins, MD, FACP',
    'Chief Medical Officer & Clinical Administrator',
    'admin',
    'Metropolitan Academic Health System',
    'Boston, MA',
    'Cardiovascular specialist and healthcare administrator passionate about evidence-based clinical leadership, hospital quality improvement, and interdisciplinary collaboration.',
    'https://images.unsplash.com/photo-1594824813629-4d6f43694f4c?auto=format&fit=crop&q=80&w=250',
    21,
    ARRAY['MD - Harvard Medical School', 'FACP - Fellow American College of Physicians', 'Executive Healthcare Leadership - MIT'],
    ARRAY['Clinical Governance', 'Health Systems Engineering', 'Cardiovascular Prevention', 'AI in Clinical Triage'],
    TRUE,
    TRUE,
    482
),
(
    '00000000-0000-0000-0000-000000000002',
    'marcus.chen@medconnect.local',
    'Dr. Marcus Chen, MD, FACC',
    'Attending Interventional Cardiologist',
    'healthcare_professional',
    'St. Jude Heart and Vascular Institute',
    'San Francisco, CA',
    'Specializing in complex coronary interventions, transcatheter aortic valve replacement (TAVR), and intravascular imaging (OCT/IVUS). Dedicated to medical education and clinical trial mentorship.',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250',
    14,
    ARRAY['MD - Johns Hopkins University', 'FACC - Fellow American College of Cardiology', 'Interventional Fellowship - Cleveland Clinic'],
    ARRAY['Transcatheter Valve Therapies', 'Intravascular Ultrasound', 'Cardiogenic Shock', 'Digital Stethoscopes'],
    FALSE,
    TRUE,
    340
),
(
    '00000000-0000-0000-0000-000000000003',
    'aris.thorne@medconnect.local',
    'Dr. Aris Thorne, MD',
    'Associate Professor & Medical Oncologist',
    'healthcare_professional',
    'Memorial Cancer Center',
    'New York, NY',
    'Investigating novel immune checkpoint inhibitor combinations and targeted therapies for advanced melanoma and non-small cell lung cancer (NSCLC).',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=250',
    11,
    ARRAY['MD - Columbia Vagelos College of Physicians', 'Hematology/Oncology Fellowship - Memorial Sloan Kettering'],
    ARRAY['Immune Checkpoint Blockade', 'Liquid Biopsies', 'Precision Oncology', 'Clinical Trial Design'],
    FALSE,
    TRUE,
    295
),
(
    '00000000-0000-0000-0000-000000000004',
    'sophia.vance@medconnect.local',
    'Dr. Sophia Vance, MD, PhD',
    'Neurocritical Care Specialist & Assistant Professor',
    'healthcare_professional',
    'Boston Neurological Institute',
    'Boston, MA',
    'Translational clinician-scientist caring for critically ill neurological patients with subarachnoid hemorrhage, refractory status epilepticus, and severe traumatic brain injury.',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250',
    9,
    ARRAY['MD/PhD - Stanford University', 'Neurocritical Care - Mass General Brigham'],
    ARRAY['Neurovascular Dynamics', 'Continuous EEG Monitoring', 'Targeted Temperature Management'],
    FALSE,
    TRUE,
    215
),
(
    '00000000-0000-0000-0000-000000000005',
    'amara.okafor@medconnect.local',
    'Dr. Amara Okafor, MD, FAAP',
    'Pediatric Pulmonologist',
    'healthcare_professional',
    'Children’s National Hospital',
    'Washington, DC',
    'Caring for pediatric patients with cystic fibrosis, severe refractory asthma, and congenital bronchopulmonary dysplasia. Advocate for pediatric global health equity.',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=250',
    8,
    ARRAY['MD - Yale School of Medicine', 'FAAP - Fellow American Academy of Pediatrics', 'Pediatric Pulmonology - Children’s Hospital of Philadelphia'],
    ARRAY['Cystic Fibrosis Modulators', 'Pediatric Aerosol Delivery', 'Rare Lung Diseases'],
    FALSE,
    TRUE,
    188
),
(
    '00000000-0000-0000-0000-000000000006',
    'julian.martinez@medconnect.local',
    'Dr. Julian Martinez, MD, FAAD',
    'Dermatopathologist & Clinical Assistant Professor',
    'healthcare_professional',
    'Pacific Skin Health Institute',
    'San Diego, CA',
    'Bridging clinical dermatology with histopathologic biopsy interpretation. Focused on early dermoscopic recognition of atypical melanocytic neoplasms.',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=250',
    12,
    ARRAY['MD - UCLA David Geffen School of Medicine', 'FAAD - Fellow American Academy of Dermatology', 'Dermatopathology Fellowship - UCSF'],
    ARRAY['Dermoscopy', 'Melanocytic Lesions', 'Inflammatory Dermatoses', 'Teledermatology'],
    FALSE,
    TRUE,
    310
),
(
    '00000000-0000-0000-0000-000000000007',
    'priya.nair@medconnect.local',
    'Dr. Priya Nair, MD',
    'Hospitalist & Academic Internal Medicine',
    'healthcare_professional',
    'Metro Health Systems',
    'Chicago, IL',
    'Practicing inpatient general internal medicine with a clinical focus on multisystem geriatric care, point-of-care ultrasound (POCUS), and diagnostic stewardship.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    7,
    ARRAY['MD - Northwestern Feinberg', 'Residency - Rush University Medical Center'],
    ARRAY['Point-of-Care Ultrasound (POCUS)', 'Diagnostic Stewardship', 'Sepsis Resuscitation Protocols'],
    FALSE,
    TRUE,
    175
),
(
    '00000000-0000-0000-0000-000000000008',
    'elena.rostova@medconnect.local',
    'Dr. Elena Rostova, PhD',
    'Principal Investigator in Molecular Genomics',
    'researcher',
    'Broad Institute of MIT and Harvard',
    'Cambridge, MA',
    'Leading wet-lab and computational pipelines deciphering tumor clonal heterogeneity and single-cell RNA sequencing signatures in therapy-resistant carcinomas.',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=250',
    10,
    ARRAY['PhD in Computational Biology - Oxford University', 'Postdoc Fellow - Broad Institute'],
    ARRAY['Single-Cell Genomics', 'CRISPR Functional Screens', 'Cancer Clonal Evolution'],
    FALSE,
    TRUE,
    260
),
(
    '00000000-0000-0000-0000-000000000009',
    'alex.rivera@medconnect.local',
    'Alex Rivera, MS',
    'Fourth-Year Medical Student (MS4)',
    'medical_student',
    'Johns Hopkins University School of Medicine',
    'Baltimore, MD',
    'Applying for Internal Medicine / Cardiology residency match. Co-author on 3 peer-reviewed abstracts in cardiac MRI and non-invasive hemodynamic monitoring.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    3,
    ARRAY['BS in Biomedical Engineering - Duke University', 'MD Candidate - Johns Hopkins (Class of 2027)'],
    ARRAY['Cardiology Fellowship Prep', 'Cardiac Hemodynamics', 'POCUS Training', 'Medical Education'],
    FALSE,
    FALSE,
    120
),
(
    '00000000-0000-0000-0000-000000000010',
    'david.vance@medconnect.local',
    'David Vance, PharmD, BCPS',
    'Senior Director of Medical Affairs',
    'pharmaceutical_professional',
    'BioVance Therapeutics',
    'Philadelphia, PA',
    'Overseeing medical science liaison (MSL) operations and phase III clinical registries in novel biologic therapies for rare rheumatologic and immunologic conditions.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    15,
    ARRAY['PharmD - University of North Carolina Chapel Hill', 'BCPS - Board Certified Pharmacotherapy Specialist'],
    ARRAY['Health Economics & Outcomes Research (HEOR)', 'Biologics & Biosimilars', 'Medical Science Liaison Strategy'],
    FALSE,
    TRUE,
    410
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. Seed Profile Specialties
-- ------------------------------------------------------------------------------
INSERT INTO public.profile_specialties (profile_id, specialty_id, is_primary) VALUES
('00000000-0000-0000-0000-000000000001', 'internal_medicine', TRUE),
('00000000-0000-0000-0000-000000000001', 'cardiology', FALSE),
('00000000-0000-0000-0000-000000000002', 'cardiology', TRUE),
('00000000-0000-0000-0000-000000000002', 'internal_medicine', FALSE),
('00000000-0000-0000-0000-000000000003', 'oncology', TRUE),
('00000000-0000-0000-0000-000000000003', 'immunology', FALSE),
('00000000-0000-0000-0000-000000000004', 'neurology', TRUE),
('00000000-0000-0000-0000-000000000005', 'pediatrics', TRUE),
('00000000-0000-0000-0000-000000000005', 'pulmonology', FALSE),
('00000000-0000-0000-0000-000000000006', 'dermatology', TRUE),
('00000000-0000-0000-0000-000000000007', 'internal_medicine', TRUE),
('00000000-0000-0000-0000-000000000007', 'emergency_medicine', FALSE),
('00000000-0000-0000-0000-000000000008', 'oncology', TRUE),
('00000000-0000-0000-0000-000000000008', 'immunology', FALSE),
('00000000-0000-0000-0000-000000000009', 'cardiology', TRUE),
('00000000-0000-0000-0000-000000000009', 'internal_medicine', FALSE),
('00000000-0000-0000-0000-000000000010', 'immunology', TRUE)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. Seed Communities / Groups
-- ------------------------------------------------------------------------------
INSERT INTO public.groups (id, name, slug, description, banner_url, specialty_id, topic_tags, members_count) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'Cardiology Clinical Exchange',
    'cardiology-clinical-exchange',
    'A collaborative forum for cardiologists, fellows, and cardiac surgeons to review hemodynamic tracings, complex ECGs, structural heart interventions, and guideline updates.',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    'cardiology',
    ARRAY['ECG', 'TAVR', 'HeartFailure', 'Electrophysiology'],
    1420
),
(
    '10000000-0000-0000-0000-000000000002',
    'Oncology Research & Precision Therapeutics',
    'oncology-research',
    'Peer group discussing clinical trials, ADC mechanisms, NGS liquid biopsy panels, and immunotherapy resistance in modern medical oncology.',
    'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800',
    'oncology',
    ARRAY['Immunotherapy', 'ADCs', 'PrecisionMedicine', 'ClinicalTrials'],
    980
),
(
    '10000000-0000-0000-0000-000000000003',
    'Clinical Research & Trial Methodologies',
    'clinical-research',
    'Dedicated to biostatistics, regulatory protocols, FDA/EMA submission frameworks, and pragmatic clinical trial designs.',
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800',
    'internal_medicine',
    ARRAY['Biostatistics', 'TrialDesign', 'Regulatory', 'Ethics'],
    740
),
(
    '10000000-0000-0000-0000-000000000004',
    'Pharmaceutical Industry & Medical Affairs',
    'pharmaceutical-industry',
    'Connecting MSLs, medical directors, and drug developers discussing phase I-IV pipelines, HEOR data, and global scientific dissemination.',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
    'immunology',
    ARRAY['MedicalAffairs', 'HEOR', 'Biosimilars', 'Pharmacovigilance'],
    620
),
(
    '10000000-0000-0000-0000-000000000005',
    'Medical Students & Residents Circle',
    'medical-students',
    'A safe, supportive space for medical students and resident trainees to share high-yield clinical pearls, USMLE/shelf exam advice, and residency interview tips.',
    'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800',
    'internal_medicine',
    ARRAY['MedEd', 'ResidencyMatch', 'ClinicalPearls', 'StudyGroups'],
    1150
),
(
    '10000000-0000-0000-0000-000000000006',
    'Healthcare AI & Digital Health Innovation',
    'healthcare-ai',
    'Exploring validated applications of generative AI, ambient clinical documentation, automated diagnostic imaging, and predictive risk stratification models.',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    'radiology',
    ARRAY['GenerativeAI', 'AmbientDictation', 'ImagingAI', 'EHRIntegration'],
    1840
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. Seed Educational Case Studies (Clearly labeled synthetic cases)
-- ------------------------------------------------------------------------------
INSERT INTO public.case_studies (
    id, title, short_summary, educational_content, learning_objectives,
    source_references, author_id, author_name, author_title, status, published_at, views_count, bookmarks_count
) VALUES
(
    '20000000-0000-0000-0000-000000000001',
    'Acute Coronary Syndrome with Multivessel Disease in an Elderly Patient',
    'Illustrative case exploring hemodynamic stabilization, timing of revascularization, and antiplatelet stewardship in non-ST-elevation myocardial infarction.',
    E'### Clinical Presentation\nAn illustrative 74-year-old male presents to the emergency department with 3 hours of substernal pressure radiating to the left arm accompanied by diaphoresis. Prior history includes type 2 diabetes mellitus, hypertension, and stage 3a chronic kidney disease.\n\n### Diagnostic Evaluation\n- **ECG:** 1.5mm horizontal ST-segment depressions in leads V4-V6 and leads II, III, aVF.\n- **Cardiac Troponin I:** 0.84 ng/mL on arrival, rising to 3.42 ng/mL at 2 hours.\n- **Bedside Echo:** Preserved EF of 50% with hypokinesis of the inferolateral wall.\n\n### Management & Clinical Decision-Making\nThe patient was stratified as high-risk NSTE-ACS requiring invasive angiography within 24 hours. The angiography demonstrated severe 85% proximal LAD stenosis, 90% mid-RCA stenosis, and diffuse 70% LCx disease with a Syntax score of 24.\n\nFollowing Heart Team consultation, multivessel PCI with drug-eluting stents was performed under intravascular ultrasound (IVUS) guidance to minimize iodinated contrast exposure given baseline renal impairment.\n\n### Outcome & Teaching Pearls\nPost-procedure courses remained uneventful with stable renal parameters. The patient was discharged on dual antiplatelet therapy (aspirin + clopidogrel), high-intensity atorvastatin, and guideline-directed medical therapy.',
    ARRAY[
        'Distinguish ischemic risk vs. bleeding risk when choosing P2Y12 inhibitors in elderly patients with chronic kidney disease',
        'Analyze the role of intravascular imaging (IVUS/OCT) in optimizing stent expansion and minimizing contrast nephropathy',
        'Understand the indications for Heart Team consultation in multivessel CAD'
    ],
    ARRAY[
        'ACC/AHA Guideline for the Management of Patients with Non-ST-Elevation Acute Coronary Syndromes',
        'ESC Guidelines for the management of acute coronary syndromes (2023)',
        'Nephrotoxicity reduction strategies during percutaneous coronary intervention'
    ],
    '00000000-0000-0000-0000-000000000002',
    'Dr. Marcus Chen, MD, FACC',
    'Attending Interventional Cardiologist',
    'published',
    NOW() - INTERVAL '3 days',
    428,
    64
),
(
    '20000000-0000-0000-0000-000000000002',
    'Management of Immune-Related Colitis Following Dual Checkpoint Inhibition',
    'Educational case study on timely diagnosis and steroid-sparing biologic intervention in grade 3 CTLA-4/PD-1 mediated immune-related adverse events.',
    E'### Clinical Scenario\nA 62-year-old patient with metastatic melanoma receiving second-cycle combination ipilimumab plus nivolumab presents with severe watery diarrhea (7 episodes daily above baseline), diffuse cramping abdominal pain, and low-grade pyrexia.\n\n### Diagnostic Workup\n- **Stool Diagnostics:** Negative for Clostridioides difficile, bacterial pathogens, ova and parasites.\n- **Laboratory:** Fecal calprotectin elevated to 840 mcg/g; serum CRP 48 mg/L.\n- **Flexible Sigmoidoscopy:** Revealed continuous mucosal erythema, loss of vascular pattern, and deep ulcerations in the rectosigmoid junction consistent with grade 3 immune-related colitis.\n\n### Therapeutic Strategy\nImmune checkpoint blockade was immediately withheld. High-dose intravenous methylprednisolone (1 mg/kg/day) was initiated. After 72 hours without adequate clinical symptom improvement, steroid-refractory colitis was diagnosed.\n\nInfliximab (5 mg/kg) was promptly administered, resulting in resolution of cramping and reduction of bowel movements to baseline within 48 hours.\n\n### Key Educational Takeaways\nEarly endoscopic evaluation within 48-72 hours confirms histological diagnosis and rules out alternative etiologies. Prompt escalation to infliximab or vedolizumab prevents bowel perforation and steroid dependence.',
    ARRAY[
        'Recognize the severity grading of immune-related diarrhea and enterocolitis',
        'Formulate a steroid escalation and biologic rescue protocol for steroid-refractory irAEs',
        'Evaluate the risks and benefits of checkpoint rechallenge versus permanent cessation'
    ],
    ARRAY[
        'ASCO Management of Immune-Related Adverse Events in Patients Treated with Immune Checkpoint Inhibitor Therapy',
        'NCCN Clinical Practice Guidelines in Oncology: Management of Immunotherapy-Related Toxicities',
        'Lancet Oncology: Biological rescue in refractory checkpoint enterocolitis'
    ],
    '00000000-0000-0000-0000-000000000003',
    'Dr. Aris Thorne, MD',
    'Associate Professor & Medical Oncologist',
    'published',
    NOW() - INTERVAL '5 days',
    380,
    51
),
(
    '20000000-0000-0000-0000-000000000003',
    'Rapid Progression of Bilateral Facial Palsy and Paresthesia in Guillain-Barré Syndrome',
    'Diagnostic nuances of acute inflammatory demyelinating polyneuropathy variant presenting with prominent cranial nerve involvement.',
    E'### Clinical Presentation\nA 36-year-old female presents with bilateral facial weakness and progressive distal paresthesias in both hands and feet 12 days after a mild diarrheal illness caused by Campylobacter jejuni.\n\n### Physical Findings\n- Bilateral lower motor neuron facial nerve palsy (inability to close eyelids fully or smile symmetrically).\n- Deep tendon reflexes were globally absent in lower extremities and diminished in upper extremities.\n- Preserved sensation to light touch with mild stocking-glove vibration decrement.\n\n### Diagnostics & Hospital Course\n- **Lumbar Puncture:** Albuminocytological dissociation (CSF protein 128 mg/dL, WBC 2 cells/mcL).\n- **NCS/EMG:** Prolonged distal motor latencies and absent F-waves consistent with demyelinating neuropathy.\n\n### Treatment\nIntravenous immunoglobulin (IVIg 0.4 g/kg/day for 5 consecutive days) was initiated promptly. Forced vital capacity (FVC) and negative inspiratory force (NIF) were trended every 4 hours in the neuro-ICU. Neurological recovery began at day 10, with significant facial motor return at 6-week follow-up.',
    ARRAY[
        'Identify albuminocytological dissociation in cerebrospinal fluid',
        'Manage respiratory failure risk through serial bedside spirometry monitoring (20/30/40 rule)',
        'Compare IVIg versus therapeutic plasma exchange in acute GBS'
    ],
    ARRAY[
        'AAN Practice Guideline: Immunotherapy for Guillain-Barré Syndrome',
        'NEJM: Diagnosis and Management of Guillain-Barré Syndrome',
        'Critical Care Neurology: Monitoring respiratory mechanics in neuromuscular weakness'
    ],
    '00000000-0000-0000-0000-000000000004',
    'Dr. Sophia Vance, MD, PhD',
    'Neurocritical Care Specialist',
    'published',
    NOW() - INTERVAL '7 days',
    512,
    77
),
(
    '20000000-0000-0000-0000-000000000004',
    'Atypical Kawasaki Disease in an Infant with Prolonged Fever and Rash',
    'Navigating diagnostic dilemmas in incomplete Kawasaki disease and coronary artery aneurysm prevention in pediatric practice.',
    E'### Case Overview\nA 7-month-old infant presents with 6 days of remittent fever up to 39.8°C, irritability, non-purulent bilateral conjunctivitis, and induration of both hands without strawberry tongue or cervical lymphadenopathy.\n\n### Workup\n- **ESR:** 88 mm/hr, **CRP:** 92 mg/L.\n- **Platelets:** 520,000/mcL.\n- **Echocardiogram:** Prominent left main coronary artery ectasia with a Z-score of +2.8.\n\n### Clinical Management\nThe diagnosis of incomplete/atypical Kawasaki disease was made. High-dose IVIg (2 g/kg single infusion over 12 hours) and medium-dose aspirin were administered immediately. Fever remitted within 14 hours. Repeat echocardiogram at 6 weeks demonstrated normal coronary lumen dimensions.',
    ARRAY[
        'Recognize atypical/incomplete Kawasaki disease diagnostic algorithm in infants under 12 months',
        'Apply echocardiographic Z-score criteria to assess coronary artery dilation',
        'Review indications for repeat IVIg and adjunct corticosteroids in resistant cases'
    ],
    ARRAY[
        'AHA Scientific Statement: Diagnosis, Treatment, and Long-Term Management of Kawasaki Disease',
        'Pediatrics: Incomplete Kawasaki Disease Clinical Guidelines'
    ],
    '00000000-0000-0000-0000-000000000005',
    'Dr. Amara Okafor, MD, FAAP',
    'Pediatric Pulmonologist',
    'published',
    NOW() - INTERVAL '9 days',
    340,
    44
),
(
    '20000000-0000-0000-0000-000000000005',
    'Subacute Cutaneous Lupus Erythematosus Triggered by Proton Pump Inhibitors',
    'Diagnostic recognition of drug-induced SCLE, serological anti-Ro/SSA antibody testing, and drug cessation recovery.',
    E'### Clinical Presentation\nA 58-year-old female presents with an annular, polycyclic erythematous eruption across the upper chest, shoulders, and dorsal arms that developed 6 weeks after initiating omeprazole for gastroesophageal reflux disease.\n\n### Diagnostic Findings\n- **Serology:** Anti-Ro/SSA strongly positive (>8.0 AI); Anti-La negative; ANA 1:160 speckled; normal complement C3 and C4.\n- **Punch Biopsy:** Vacuolar interface dermatitis, apoptotic keratinocytes, and dermal mucin deposition.\n\n### Resolution\nOmeprazole was discontinued and replaced with famotidine. Topical triamcinolone and strict photoprotection were prescribed. Complete cutaneous clearance occurred within 8 weeks without systemic organ involvement.',
    ARRAY[
        'List pharmacological culprits commonly implicated in drug-induced SCLE',
        'Differentiate SCLE from polymorphic light eruption, tinea corporis, and erythema annulare centrifugum',
        'Guide patients on photoprotection and safe alternative pharmacotherapy'
    ],
    ARRAY[
        'Journal of the American Academy of Dermatology: Drug-induced subacute cutaneous lupus',
        'British Journal of Dermatology: Cutaneous lupus erythematosus clinical update'
    ],
    '00000000-0000-0000-0000-000000000006',
    'Dr. Julian Martinez, MD, FAAD',
    'Dermatopathologist',
    'published',
    NOW() - INTERVAL '11 days',
    290,
    38
),
(
    '20000000-0000-0000-0000-000000000006',
    'Severe Sepsis from Community-Acquired Klebsiella Pneumoniae in Poorly Controlled Diabetes',
    'Point-of-care lung ultrasound stewardship, early goal resuscitation, and glycemic stabilization in diabetic bacteremia.',
    E'### Clinical Presentation\nA 53-year-old male with HbA1c of 11.2% presents with high fever, rigors, cough with red currant jelly sputum, and altered mental status. Blood pressure 84/48 mmHg, heart rate 124 bpm, oxygen saturation 89% on ambient air.\n\n### Clinical Management\nBedside lung ultrasound demonstrated extensive right upper lobe consolidation with dynamic air bronchograms and B-lines. Fluid resuscitation with balanced crystalloids was instituted and intravenous ceftriaxone plus azithromycin initiated within 45 minutes of arrival.\n\nBlood and sputum cultures confirmed hypervirulent Klebsiella pneumoniae sensitive to cephalosporins. After hemodynamic stabilization, continuous regular insulin infusion normalized hyperglycemia. The patient was stepped down to oral fluoroquinolones to complete a 14-day course.',
    ARRAY[
        'Deploy bedside POCUS in rapid hypoxemia and sepsis source identification',
        'Review antibiotic spectrum choices in diabetic patients susceptible to encapsulated organisms',
        'Manage severe hyperglycemia during septic stress state'
    ],
    ARRAY[
        'Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021',
        'Chest: Point-of-Care Ultrasonography in Respiratory Failure'
    ],
    '00000000-0000-0000-0000-000000000007',
    'Dr. Priya Nair, MD',
    'Hospitalist & Academic Internal Medicine',
    'published',
    NOW() - INTERVAL '14 days',
    460,
    59
),
-- Draft case study (MUST NOT appear in public results)
(
    '20000000-0000-0000-0000-000000000007',
    '[DRAFT] Novel Biomarkers in Early Lung Adenocarcinoma Detection',
    'Internal draft investigating circulating tumor DNA methylation signatures in stage I NSCLC screening protocols.',
    'Under active clinical peer review before publication approval. Content reflects preliminary single-center retrospective observational findings.',
    ARRAY['Evaluate circulating cfDNA methylation panels', 'Assess false-positive rates against low-dose spiral CT'],
    ARRAY['Preliminary trial data - Internal hospital registry'],
    '00000000-0000-0000-0000-000000000001',
    'Dr. Sarah Jenkins, MD, FACP',
    'Chief Medical Officer & Clinical Administrator',
    'draft',
    NULL,
    12,
    0
),
-- Archived case study (MUST NOT appear in public results)
(
    '20000000-0000-0000-0000-000000000008',
    '[ARCHIVED] Historical Evaluation of Digoxin Protocols in Heart Failure (1998-2005)',
    'Archived historical reference case superseded by current SGLT2i and ARNI guideline-directed medical therapy.',
    'This historical case has been archived in favor of modern 2023 ACC/AHA guidelines for HFrEF quadruple therapy.',
    ARRAY['Understand historical digoxin monitoring', 'Compare with modern GDMT quadruple therapy'],
    ARRAY['DIG Trial 1997', 'ACC/AHA 2005 Guideline Archive'],
    '00000000-0000-0000-0000-000000000001',
    'Dr. Sarah Jenkins, MD, FACP',
    'Chief Medical Officer & Clinical Administrator',
    'archived',
    NOW() - INTERVAL '60 days',
    95,
    3
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. Seed Case Study Specialties
-- ------------------------------------------------------------------------------
INSERT INTO public.case_study_specialties (case_study_id, specialty_id) VALUES
('20000000-0000-0000-0000-000000000001', 'cardiology'),
('20000000-0000-0000-0000-000000000001', 'internal_medicine'),
('20000000-0000-0000-0000-000000000002', 'oncology'),
('20000000-0000-0000-0000-000000000002', 'immunology'),
('20000000-0000-0000-0000-000000000002', 'gastroenterology'),
('20000000-0000-0000-0000-000000000003', 'neurology'),
('20000000-0000-0000-0000-000000000003', 'emergency_medicine'),
('20000000-0000-0000-0000-000000000004', 'pediatrics'),
('20000000-0000-0000-0000-000000000004', 'cardiology'),
('20000000-0000-0000-0000-000000000005', 'dermatology'),
('20000000-0000-0000-0000-000000000005', 'immunology'),
('20000000-0000-0000-0000-000000000006', 'internal_medicine'),
('20000000-0000-0000-0000-000000000006', 'pulmonology'),
('20000000-0000-0000-0000-000000000006', 'endocrinology'),
('20000000-0000-0000-0000-000000000007', 'oncology'),
('20000000-0000-0000-0000-000000000007', 'pulmonology'),
('20000000-0000-0000-0000-000000000008', 'cardiology')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. Seed Posts (Social & Professional Feed)
-- ------------------------------------------------------------------------------
INSERT INTO public.posts (
    id, author_id, content, article_url, article_title, article_source,
    specialty_id, topic_tags, likes_count, comments_count, reposts_count, created_at
) VALUES
(
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    E'In interventional cardiology, timing and physiological lesion assessment dictate long-term stent patency. We recently reviewed 12-month outcomes following intravascular ultrasound (IVUS)-guided vs. angiography-guided PCI in complex bifurcations.\n\nThe routine application of high-definition IVUS significantly lowered target lesion failure (TLF) from 7.1% to 3.8% (p=0.008). Ensuring minimum stent area (MSA) >5.5 mm² in the ostial LAD is one of the single most protective clinical steps we can take in the cath lab.\n\nColleagues: what is your current institutional threshold for post-dilatation in non-left-main bifurcations?',
    'https://www.jacc.org/doi/10.1016/j.jacc.2023.08.012',
    'Intravascular Imaging in Complex Coronary Bifurcations: A Multi-Center Registry',
    'Journal of the American College of Cardiology',
    'cardiology',
    ARRAY['InterventionalCardiology', 'IVUS', 'CathLabPearls', 'ClinicalOutcomes'],
    42,
    5,
    8,
    NOW() - INTERVAL '4 hours'
),
(
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    E'Exciting phase III data presented at this weekend’s thoracic symposium regarding antibody-drug conjugates (ADCs) in HER2-mutant non-small cell lung cancer.\n\nThe progression-free survival (PFS) hazard ratio of 0.62 against platinum doublets demonstrates that targeted internalization of cytotoxic payloads continues to reshape solid tumor oncology.\n\nCrucial point for oncologists: monitor pulmonary function tests closely, as interstitial lung disease (ILD) remains the most critical class adverse event to identify before progression.',
    'https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(23)00412-1/fulltext',
    'Antibody-Drug Conjugates in Advanced Non-Small-Cell Lung Cancer: A Landmark Trial',
    'The Lancet Oncology',
    'oncology',
    ARRAY['Oncology', 'ThoracicOncology', 'ADCs', 'PrecisionMedicine'],
    67,
    8,
    14,
    NOW() - INTERVAL '1 day'
),
(
    '30000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000008',
    E'We just uploaded our preprint on single-cell transcriptional profiling of tertiary lymphoid structures (TLS) in checkpoint-resistant solid tumors.\n\nOur data suggests that localized follicular helper T-cells (Tfh) and CD20+ B-cell cross-talk correlate directly with neoantigen-specific cytotoxic recruitment. We invite peer researchers and clinical oncologists to review the pipeline and collaborate on validation cohorts.',
    'https://www.nature.com/articles/s41586-024-07112-x',
    'Spatial Transcriptomics Reveals B-Cell Mediated Immunity in Tumor Microenvironments',
    'Nature Medicine',
    'oncology',
    ARRAY['Genomics', 'Bioinformatics', 'CancerResearch', 'SingleCell'],
    39,
    4,
    11,
    NOW() - INTERVAL '2 days'
),
(
    '30000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000009',
    E'Reflecting on my 4th year sub-internship in the Cardiac Intensive Care Unit (CICU):\n\nUnderstanding Swan-Ganz pulmonary artery catheter waveforms in cardiogenic shock was initially daunting, but correlating hemodynamic tracings with bedside echocardiography brought physiology alive. Invaluable mentoring from Dr. Marcus Chen and the fellowship team!\n\nTo fellow medical students: never hesitate to ask "why" on rounds when hemodynamics do not match the clinical textbook presentation.',
    NULL,
    NULL,
    NULL,
    'cardiology',
    ARRAY['MedEd', 'MedicalStudent', 'CICU', 'CardiologyFellowship'],
    58,
    11,
    3,
    NOW() - INTERVAL '3 days'
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 8. Seed Comments
-- ------------------------------------------------------------------------------
INSERT INTO public.comments (id, post_id, author_id, content, created_at) VALUES
(
    '40000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Superb analysis Dr. Chen. At our health system, incorporating mandatory IVUS checklists into our electronic registry reduced 30-day readmissions significantly. Quality data is paramount.',
    NOW() - INTERVAL '3 hours'
),
(
    '40000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000007',
    'From an inpatient hospitalist perspective, seeing these clear post-PCI parameters helps us guide our transition care and dual antiplatelet counseling before discharge.',
    NOW() - INTERVAL '2 hours'
),
(
    '40000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000010',
    'Strongly agree on ILD pharmacovigilance. In our medical affairs advisory boards, early baseline HRCT scans and rapid corticosteroid tapering protocols were universal recommendations.',
    NOW() - INTERVAL '18 hours'
),
(
    '40000000-0000-0000-0000-000000000004',
    '30000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'Proud of your dedication on the unit, Alex. You demonstrated exemplary clinical curiosity and bedside communication. Any residency program will be fortunate to match you.',
    NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 9. Seed Connections & Network
-- ------------------------------------------------------------------------------
INSERT INTO public.connections (id, requester_id, recipient_id, status, created_at, updated_at) VALUES
('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'accepted', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'accepted', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'pending', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'pending', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('50000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', 'accepted', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
('50000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', 'accepted', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
('50000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000002', 'accepted', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('50000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000003', 'accepted', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days')
ON CONFLICT (requester_id, recipient_id) DO UPDATE SET status = EXCLUDED.status, updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 10. Seed Group Members
-- ------------------------------------------------------------------------------
INSERT INTO public.group_members (group_id, user_id, role, joined_at) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'member', NOW()),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'admin', NOW()),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000009', 'member', NOW()),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'admin', NOW()),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000008', 'member', NOW()),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000009', 'admin', NOW()),
('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'member', NOW())
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 11. Seed Job Opportunities
-- ------------------------------------------------------------------------------
INSERT INTO public.jobs (
    id, title, organization, location, specialty_id, employment_type,
    description, requirements, apply_url, is_active, is_sample, created_at
) VALUES
(
    'job-001',
    'Attending Interventional Cardiologist',
    'Massachusetts Academic Heart Center',
    'Boston, MA (On-site)',
    'cardiology',
    'Full-time',
    'Lead cardiac catheterization interventions, complex PCI protocols, and participate in multi-center clinical trials within our cardiovascular research institute.',
    ARRAY['Board certified/eligible in Interventional Cardiology', 'Active Massachusetts medical license or eligibility', 'Proficiency in intravascular ultrasound (IVUS) and mechanical circulatory support', 'Demonstrated commitment to clinical trial investigation'],
    'https://example.com/careers/cardiology-001',
    TRUE,
    TRUE,
    NOW() - INTERVAL '3 days'
),
(
    'job-002',
    'Pediatric Critical Care Fellow / Junior Attending',
    'National Children''s Medical Center',
    'Washington, DC',
    'pediatrics',
    'Fellowship',
    'High-acuity pediatric intensive care training program emphasizing pediatric extracorporeal membrane oxygenation (ECMO) and acute resuscitation research.',
    ARRAY['Completion of ACGME-accredited Pediatric Residency', 'Active PALS and BLS certifications', 'Eligible for District of Columbia medical licensure'],
    'https://example.com/careers/pediatrics-002',
    TRUE,
    TRUE,
    NOW() - INTERVAL '5 days'
),
(
    'job-003',
    'Associate Director of Clinical Oncology Trials',
    'Metropolitan Cancer Research Institute',
    'New York, NY',
    'oncology',
    'Full-time',
    'Direct early-phase targeted oncology therapies and immunotherapy checkpoint resistance studies with 50% protected research time.',
    ARRAY['MD or MD/PhD with Fellowship in Hematology/Oncology', 'Minimum 4 years experience leading Phase I/II clinical trials', 'Track record of peer-reviewed clinical research publications'],
    'https://example.com/careers/oncology-003',
    TRUE,
    TRUE,
    NOW() - INTERVAL '7 days'
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 12. Seed Advertisements & Clinical Notices
-- ------------------------------------------------------------------------------
INSERT INTO public.advertisements (
    id, title, sponsor_name, headline, content, target_url, cta_label,
    specialty_id, badge_label, is_active, is_sample, created_at
) VALUES
(
    'ad-001',
    'CardioVascular Horizons 2026 Annual Symposium',
    'American Academy of Cardiology Education',
    'Advance Your Interventional & Imaging Clinical Skills',
    'Join 1,200+ cardiology peers for 3 days of live case transmissions, high-definition IVUS workshops, and 24 AMA PRA Category 1 CME Credits in Boston.',
    'https://example.com/cardio-horizons-2026',
    'Register for CME (Demo)',
    'cardiology',
    'Sponsored Clinical Notice',
    TRUE,
    TRUE,
    NOW() - INTERVAL '2 days'
),
(
    'ad-002',
    'DeepHistology Diagnostic AI Platform',
    'DeepHistology Clinical Systems',
    'Sub-cellular Tumor Margin Identification with 99.4% Concordance',
    'Streamline frozen section turnaround times and enhance pathology triage with real-time deep learning histology workflows. Request a clinical demonstration.',
    'https://example.com/deephistology-demo',
    'Request Clinical Demo (Demo)',
    'oncology',
    'Sponsored Clinical Notice',
    TRUE,
    TRUE,
    NOW() - INTERVAL '4 days'
)
ON CONFLICT (id) DO NOTHING;

