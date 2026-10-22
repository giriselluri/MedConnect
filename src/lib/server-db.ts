import { isSupabaseConfigured } from './supabase';
import { supabaseDb } from './supabase-db';
import {
  Profile,
  Specialty,
  Post,
  Comment,
  CaseStudy,
  Group,
  Connection,
  Bookmark,
  AISession,
  ContentReport,
  ConnectionStatus,
  CaseStudyStatus,
  UserRole,
  Role,
  JobListing,
  Advertisement,
  Notification,
  Follow,
  AdminMetrics,
} from '@/types';



export interface DatabaseState {
  specialties: Specialty[];
  profiles: Profile[];
  profile_specialties: { profile_id: string; specialty_id: string; is_primary?: boolean }[];
  posts: Post[];
  post_likes: { post_id: string; user_id: string; created_at: string }[];
  comments: Comment[];
  case_studies: CaseStudy[];
  groups: Group[];
  group_members: { group_id: string; user_id: string; role: string; joined_at: string }[];
  connections: Connection[];
  follows: { follower_id: string; following_id: string; created_at: string }[];
  bookmarks: Bookmark[];
  ai_sessions: AISession[];
  content_reports: ContentReport[];
  jobs: JobListing[];
  advertisements: Advertisement[];
  notifications: Notification[];
  current_user_id: string; // for demo switching
}

export const INITIAL_SPECIALTIES: Specialty[] = [
  { id: 'cardiology', name: 'Cardiology', category: 'Clinical Medicine', description: 'Cardiovascular diseases, interventions, and electrophysiology', icon: 'Heart' },
  { id: 'oncology', name: 'Oncology', category: 'Clinical Medicine', description: 'Medical, surgical, and radiation oncology therapeutics', icon: 'ShieldAlert' },
  { id: 'neurology', name: 'Neurology', category: 'Clinical Medicine', description: 'Brain, spinal cord, and neurodegenerative disorders', icon: 'Brain' },
  { id: 'pediatrics', name: 'Pediatrics', category: 'Clinical Medicine', description: 'Childhood development and pediatric acute/chronic illnesses', icon: 'Baby' },
  { id: 'dermatology', name: 'Dermatology', category: 'Clinical Medicine', description: 'Cutaneous pathology, inflammatory skin diseases, and dermato-oncology', icon: 'Sparkles' },
  { id: 'internal_medicine', name: 'Internal Medicine', category: 'Clinical Medicine', description: 'Adult primary care, multisystem chronic illness, and hospital medicine', icon: 'Stethoscope' },
  { id: 'radiology', name: 'Radiology', category: 'Diagnostic', description: 'Diagnostic imaging, MRI, CT, and interventional radiology', icon: 'ScanLine' },
  { id: 'immunology', name: 'Immunology & Allergy', category: 'Clinical Medicine', description: 'Autoimmune diseases, immunotherapies, and allergic reactions', icon: 'Shield' },
  { id: 'endocrinology', name: 'Endocrinology', category: 'Clinical Medicine', description: 'Metabolic diseases, diabetes care, and thyroid pathology', icon: 'Activity' },
  { id: 'emergency_medicine', name: 'Emergency Medicine', category: 'Acute Care', description: 'Trauma, critical resuscitation, and acute emergency care', icon: 'Ambulance' },
  { id: 'gastroenterology', name: 'Gastroenterology', category: 'Clinical Medicine', description: 'GI tract diseases, hepatology, and endoscopy', icon: 'Microscope' },
  { id: 'psychiatry', name: 'Psychiatry', category: 'Behavioral Health', description: 'Mental health disorders, neuropsychiatry, and psychotherapy', icon: 'Smile' },
  { id: 'pulmonology', name: 'Pulmonology', category: 'Clinical Medicine', description: 'Respiratory illnesses, critical care ventilation, and sleep medicine', icon: 'Wind' },
  { id: 'nephrology', name: 'Nephrology', category: 'Clinical Medicine', description: 'Renal diseases, dialysis, and electrolyte disorders', icon: 'Droplet' },
  { id: 'orthopedics', name: 'Orthopedic Surgery', category: 'Surgical', description: 'Musculoskeletal trauma, arthroplasty, and sports medicine', icon: 'Bone' },
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'sarah.jenkins@medconnect.local',
    full_name: 'Dr. Sarah Jenkins, MD, FACP',
    title: 'Chief Medical Officer & Clinical Administrator',
    role: 'admin',
    institution: 'Metropolitan Academic Health System',
    location: 'Boston, MA',
    bio: 'Cardiovascular specialist and healthcare administrator passionate about evidence-based clinical leadership, hospital quality improvement, and interdisciplinary collaboration.',
    avatar_url: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=250',
    years_of_experience: 21,
    qualifications: ['MD - Harvard Medical School', 'FACP - Fellow American College of Physicians', 'Executive Healthcare Leadership - MIT'],
    interests: ['Clinical Governance', 'Health Systems Engineering', 'Cardiovascular Prevention', 'AI in Clinical Triage'],
    is_admin: true,
    is_verified: true,
    connections_count: 482,
    created_at: new Date(Date.now() - 365 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'marcus.chen@medconnect.local',
    full_name: 'Dr. Marcus Chen, MD, FACC',
    title: 'Attending Interventional Cardiologist',
    role: 'healthcare_professional',
    institution: 'St. Jude Heart and Vascular Institute',
    location: 'San Francisco, CA',
    bio: 'Specializing in complex coronary interventions, transcatheter aortic valve replacement (TAVR), and intravascular imaging (OCT/IVUS). Dedicated to medical education and clinical trial mentorship.',
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250',
    years_of_experience: 14,
    qualifications: ['MD - Johns Hopkins University', 'FACC - Fellow American College of Cardiology', 'Interventional Fellowship - Cleveland Clinic'],
    interests: ['Transcatheter Valve Therapies', 'Intravascular Ultrasound', 'Cardiogenic Shock', 'Digital Stethoscopes'],
    is_admin: false,
    is_verified: true,
    connections_count: 340,
    created_at: new Date(Date.now() - 300 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'aris.thorne@medconnect.local',
    full_name: 'Dr. Aris Thorne, MD',
    title: 'Associate Professor & Medical Oncologist',
    role: 'healthcare_professional',
    institution: 'Memorial Cancer Center',
    location: 'New York, NY',
    bio: 'Investigating novel immune checkpoint inhibitor combinations and targeted therapies for advanced melanoma and non-small cell lung cancer (NSCLC).',
    avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=250',
    years_of_experience: 11,
    qualifications: ['MD - Columbia Vagelos College of Physicians', 'Hematology/Oncology Fellowship - Memorial Sloan Kettering'],
    interests: ['Immune Checkpoint Blockade', 'Liquid Biopsies', 'Precision Oncology', 'Clinical Trial Design'],
    is_admin: false,
    is_verified: true,
    connections_count: 295,
    created_at: new Date(Date.now() - 250 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'sophia.vance@medconnect.local',
    full_name: 'Dr. Sophia Vance, MD, PhD',
    title: 'Neurocritical Care Specialist & Assistant Professor',
    role: 'healthcare_professional',
    institution: 'Boston Neurological Institute',
    location: 'Boston, MA',
    bio: 'Translational clinician-scientist caring for critically ill neurological patients with subarachnoid hemorrhage, refractory status epilepticus, and severe traumatic brain injury.',
    avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250',
    years_of_experience: 9,
    qualifications: ['MD/PhD - Stanford University', 'Neurocritical Care - Mass General Brigham'],
    interests: ['Neurovascular Dynamics', 'Continuous EEG Monitoring', 'Targeted Temperature Management'],
    is_admin: false,
    is_verified: true,
    connections_count: 215,
    created_at: new Date(Date.now() - 200 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'amara.okafor@medconnect.local',
    full_name: 'Dr. Amara Okafor, MD, FAAP',
    title: 'Pediatric Pulmonologist',
    role: 'healthcare_professional',
    institution: 'Children’s National Hospital',
    location: 'Washington, DC',
    bio: 'Caring for pediatric patients with cystic fibrosis, severe refractory asthma, and congenital bronchopulmonary dysplasia. Advocate for pediatric global health equity.',
    avatar_url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=250',
    years_of_experience: 8,
    qualifications: ['MD - Yale School of Medicine', 'FAAP - Fellow American Academy of Pediatrics', 'Pediatric Pulmonology - Children’s Hospital of Philadelphia'],
    interests: ['Cystic Fibrosis Modulators', 'Pediatric Aerosol Delivery', 'Rare Lung Diseases'],
    is_admin: false,
    is_verified: true,
    connections_count: 188,
    created_at: new Date(Date.now() - 180 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    email: 'julian.martinez@medconnect.local',
    full_name: 'Dr. Julian Martinez, MD, FAAD',
    title: 'Dermatopathologist & Clinical Assistant Professor',
    role: 'healthcare_professional',
    institution: 'Pacific Skin Health Institute',
    location: 'San Diego, CA',
    bio: 'Bridging clinical dermatology with histopathologic biopsy interpretation. Focused on early dermoscopic recognition of atypical melanocytic neoplasms.',
    avatar_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=250',
    years_of_experience: 12,
    qualifications: ['MD - UCLA David Geffen School of Medicine', 'FAAD - Fellow American Academy of Dermatology', 'Dermatopathology Fellowship - UCSF'],
    interests: ['Dermoscopy', 'Melanocytic Lesions', 'Inflammatory Dermatoses', 'Teledermatology'],
    is_admin: false,
    is_verified: true,
    connections_count: 310,
    created_at: new Date(Date.now() - 170 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    email: 'priya.nair@medconnect.local',
    full_name: 'Dr. Priya Nair, MD',
    title: 'Hospitalist & Academic Internal Medicine',
    role: 'healthcare_professional',
    institution: 'Metro Health Systems',
    location: 'Chicago, IL',
    bio: 'Practicing inpatient general internal medicine with a clinical focus on multisystem geriatric care, point-of-care ultrasound (POCUS), and diagnostic stewardship.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    years_of_experience: 7,
    qualifications: ['MD - Northwestern Feinberg', 'Residency - Rush University Medical Center'],
    interests: ['Point-of-Care Ultrasound (POCUS)', 'Diagnostic Stewardship', 'Sepsis Resuscitation Protocols'],
    is_admin: false,
    is_verified: true,
    connections_count: 175,
    created_at: new Date(Date.now() - 150 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    email: 'elena.rostova@medconnect.local',
    full_name: 'Dr. Elena Rostova, PhD',
    title: 'Principal Investigator in Molecular Genomics',
    role: 'researcher',
    institution: 'Broad Institute of MIT and Harvard',
    location: 'Cambridge, MA',
    bio: 'Leading wet-lab and computational pipelines deciphering tumor clonal heterogeneity and single-cell RNA sequencing signatures in therapy-resistant carcinomas.',
    avatar_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=250',
    years_of_experience: 10,
    qualifications: ['PhD in Computational Biology - Oxford University', 'Postdoc Fellow - Broad Institute'],
    interests: ['Single-Cell Genomics', 'CRISPR Functional Screens', 'Cancer Clonal Evolution'],
    is_admin: false,
    is_verified: true,
    connections_count: 260,
    created_at: new Date(Date.now() - 140 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    email: 'alex.rivera@medconnect.local',
    full_name: 'Alex Rivera, MS',
    title: 'Fourth-Year Medical Student (MS4)',
    role: 'medical_student',
    institution: 'Johns Hopkins University School of Medicine',
    location: 'Baltimore, MD',
    bio: 'Applying for Internal Medicine / Cardiology residency match. Co-author on 3 peer-reviewed abstracts in cardiac MRI and non-invasive hemodynamic monitoring.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    years_of_experience: 3,
    qualifications: ['BS in Biomedical Engineering - Duke University', 'MD Candidate - Johns Hopkins (Class of 2027)'],
    interests: ['Cardiology Fellowship Prep', 'Cardiac Hemodynamics', 'POCUS Training', 'Medical Education'],
    is_admin: false,
    is_verified: false,
    connections_count: 120,
    created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000010',
    email: 'david.vance@medconnect.local',
    full_name: 'David Vance, PharmD, BCPS',
    title: 'Senior Director of Medical Affairs',
    role: 'pharmaceutical_professional',
    institution: 'BioVance Therapeutics',
    location: 'Philadelphia, PA',
    bio: 'Overseeing medical science liaison (MSL) operations and phase III clinical registries in novel biologic therapies for rare rheumatologic and immunologic conditions.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    years_of_experience: 15,
    qualifications: ['PharmD - University of North Carolina Chapel Hill', 'BCPS - Board Certified Pharmacotherapy Specialist'],
    interests: ['Health Economics & Outcomes Research (HEOR)', 'Biologics & Biosimilars', 'Medical Science Liaison Strategy'],
    is_admin: false,
    is_verified: true,
    connections_count: 410,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
];

export const INITIAL_PROFILE_SPECIALTIES = [
  { profile_id: '00000000-0000-0000-0000-000000000001', specialty_id: 'internal_medicine', is_primary: true },
  { profile_id: '00000000-0000-0000-0000-000000000001', specialty_id: 'cardiology', is_primary: false },
  { profile_id: '00000000-0000-0000-0000-000000000002', specialty_id: 'cardiology', is_primary: true },
  { profile_id: '00000000-0000-0000-0000-000000000002', specialty_id: 'internal_medicine', is_primary: false },
  { profile_id: '00000000-0000-0000-0000-000000000003', specialty_id: 'oncology', is_primary: true },
  { profile_id: '00000000-0000-0000-0000-000000000003', specialty_id: 'immunology', is_primary: false },
  { profile_id: '00000000-0000-0000-0000-000000000004', specialty_id: 'neurology', is_primary: true },
  { profile_id: '00000000-0000-0000-0000-000000000005', specialty_id: 'pediatrics', is_primary: true },
  { profile_id: '00000000-0000-0000-0000-000000000005', specialty_id: 'pulmonology', is_primary: false },
  { profile_id: '00000000-0000-0000-0000-000000000006', specialty_id: 'dermatology', is_primary: true },
  { profile_id: '00000000-0000-0000-0000-000000000007', specialty_id: 'internal_medicine', is_primary: true },
  { profile_id: '00000000-0000-0000-0000-000000000007', specialty_id: 'emergency_medicine', is_primary: false },
  { profile_id: '00000000-0000-0000-0000-000000000008', specialty_id: 'oncology', is_primary: true },
  { profile_id: '00000000-0000-0000-0000-000000000008', specialty_id: 'immunology', is_primary: false },
  { profile_id: '00000000-0000-0000-0000-000000000009', specialty_id: 'cardiology', is_primary: true },
  { profile_id: '00000000-0000-0000-0000-000000000009', specialty_id: 'internal_medicine', is_primary: false },
  { profile_id: '00000000-0000-0000-0000-000000000010', specialty_id: 'immunology', is_primary: true },
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    name: 'Cardiology Clinical Exchange',
    slug: 'cardiology-clinical-exchange',
    description: 'A collaborative forum for cardiologists, fellows, and cardiac surgeons to review hemodynamic tracings, complex ECGs, structural heart interventions, and guideline updates.',
    banner_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    specialty_id: 'cardiology',
    topic_tags: ['ECG', 'TAVR', 'HeartFailure', 'Electrophysiology'],
    members_count: 1420,
    created_at: new Date(Date.now() - 180 * 86400000).toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    name: 'Oncology Research & Precision Therapeutics',
    slug: 'oncology-research',
    description: 'Peer group discussing clinical trials, ADC mechanisms, NGS liquid biopsy panels, and immunotherapy resistance in modern medical oncology.',
    banner_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800',
    specialty_id: 'oncology',
    topic_tags: ['Immunotherapy', 'ADCs', 'PrecisionMedicine', 'ClinicalTrials'],
    members_count: 980,
    created_at: new Date(Date.now() - 170 * 86400000).toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    name: 'Clinical Research & Trial Methodologies',
    slug: 'clinical-research',
    description: 'Dedicated to biostatistics, regulatory protocols, FDA/EMA submission frameworks, and pragmatic clinical trial designs.',
    banner_url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800',
    specialty_id: 'internal_medicine',
    topic_tags: ['Biostatistics', 'TrialDesign', 'Regulatory', 'Ethics'],
    members_count: 740,
    created_at: new Date(Date.now() - 160 * 86400000).toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    name: 'Pharmaceutical Industry & Medical Affairs',
    slug: 'pharmaceutical-industry',
    description: 'Connecting MSLs, medical directors, and drug developers discussing phase I-IV pipelines, HEOR data, and global scientific dissemination.',
    banner_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
    specialty_id: 'immunology',
    topic_tags: ['MedicalAffairs', 'HEOR', 'Biosimilars', 'Pharmacovigilance'],
    members_count: 620,
    created_at: new Date(Date.now() - 150 * 86400000).toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    name: 'Medical Students & Residents Circle',
    slug: 'medical-students',
    description: 'A safe, supportive space for medical students and resident trainees to share high-yield clinical pearls, USMLE/shelf exam advice, and residency interview tips.',
    banner_url: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800',
    specialty_id: 'internal_medicine',
    topic_tags: ['MedEd', 'ResidencyMatch', 'ClinicalPearls', 'StudyGroups'],
    members_count: 1150,
    created_at: new Date(Date.now() - 140 * 86400000).toISOString(),
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    name: 'Healthcare AI & Digital Health Innovation',
    slug: 'healthcare-ai',
    description: 'Exploring validated applications of generative AI, ambient clinical documentation, automated diagnostic imaging, and predictive risk stratification models.',
    banner_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    specialty_id: 'radiology',
    topic_tags: ['GenerativeAI', 'AmbientDictation', 'ImagingAI', 'EHRIntegration'],
    members_count: 1840,
    created_at: new Date(Date.now() - 130 * 86400000).toISOString(),
  },
];

export const INITIAL_CASE_STUDIES: CaseStudy[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    title: 'Acute Coronary Syndrome with Multivessel Disease in an Elderly Patient',
    short_summary: 'Illustrative case exploring hemodynamic stabilization, timing of revascularization, and antiplatelet stewardship in non-ST-elevation myocardial infarction.',
    educational_content: `### Clinical Presentation
An illustrative 74-year-old male presents to the emergency department with 3 hours of substernal pressure radiating to the left arm accompanied by diaphoresis. Prior history includes type 2 diabetes mellitus, hypertension, and stage 3a chronic kidney disease.

### Diagnostic Evaluation
- **ECG:** 1.5mm horizontal ST-segment depressions in leads V4-V6 and leads II, III, aVF.
- **Cardiac Troponin I:** 0.84 ng/mL on arrival, rising to 3.42 ng/mL at 2 hours.
- **Bedside Echo:** Preserved EF of 50% with hypokinesis of the inferolateral wall.

### Management & Clinical Decision-Making
The patient was stratified as high-risk NSTE-ACS requiring invasive angiography within 24 hours. The angiography demonstrated severe 85% proximal LAD stenosis, 90% mid-RCA stenosis, and diffuse 70% LCx disease with a Syntax score of 24.

Following Heart Team consultation, multivessel PCI with drug-eluting stents was performed under intravascular ultrasound (IVUS) guidance to minimize iodinated contrast exposure given baseline renal impairment.

### Outcome & Teaching Pearls
Post-procedure courses remained uneventful with stable renal parameters. The patient was discharged on dual antiplatelet therapy (aspirin + clopidogrel), high-intensity atorvastatin, and guideline-directed medical therapy.`,
    learning_objectives: [
      'Distinguish ischemic risk vs. bleeding risk when choosing P2Y12 inhibitors in elderly patients with chronic kidney disease',
      'Analyze the role of intravascular imaging (IVUS/OCT) in optimizing stent expansion and minimizing contrast nephropathy',
      'Understand the indications for Heart Team consultation in multivessel CAD',
    ],
    source_references: [
      'ACC/AHA Guideline for the Management of Patients with Non-ST-Elevation Acute Coronary Syndromes',
      'ESC Guidelines for the management of acute coronary syndromes (2023)',
      'Nephrotoxicity reduction strategies during percutaneous coronary intervention',
    ],
    author_id: '00000000-0000-0000-0000-000000000002',
    author_name: 'Dr. Marcus Chen, MD, FACC',
    author_title: 'Attending Interventional Cardiologist',
    status: 'published',
    published_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    views_count: 428,
    bookmarks_count: 64,
    specialties: [
      { id: 'cardiology', name: 'Cardiology', category: 'Clinical Medicine' },
      { id: 'internal_medicine', name: 'Internal Medicine', category: 'Clinical Medicine' },
    ],
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    title: 'Management of Immune-Related Colitis Following Dual Checkpoint Inhibition',
    short_summary: 'Educational case study on timely diagnosis and steroid-sparing biologic intervention in grade 3 CTLA-4/PD-1 mediated immune-related adverse events.',
    educational_content: `### Clinical Scenario
A 62-year-old patient with metastatic melanoma receiving second-cycle combination ipilimumab plus nivolumab presents with severe watery diarrhea (7 episodes daily above baseline), diffuse cramping abdominal pain, and low-grade pyrexia.

### Diagnostic Workup
- **Stool Diagnostics:** Negative for Clostridioides difficile, bacterial pathogens, ova and parasites.
- **Laboratory:** Fecal calprotectin elevated to 840 mcg/g; serum CRP 48 mg/L.
- **Flexible Sigmoidoscopy:** Revealed continuous mucosal erythema, loss of vascular pattern, and deep ulcerations in the rectosigmoid junction consistent with grade 3 immune-related colitis.

### Therapeutic Strategy
Immune checkpoint blockade was immediately withheld. High-dose intravenous methylprednisolone (1 mg/kg/day) was initiated. After 72 hours without adequate clinical symptom improvement, steroid-refractory colitis was diagnosed.

Infliximab (5 mg/kg) was promptly administered, resulting in resolution of cramping and reduction of bowel movements to baseline within 48 hours.

### Key Educational Takeaways
Early endoscopic evaluation within 48-72 hours confirms histological diagnosis and rules out alternative etiologies. Prompt escalation to infliximab or vedolizumab prevents bowel perforation and steroid dependence.`,
    learning_objectives: [
      'Recognize the severity grading of immune-related diarrhea and enterocolitis',
      'Formulate a steroid escalation and biologic rescue protocol for steroid-refractory irAEs',
      'Evaluate the risks and benefits of checkpoint rechallenge versus permanent cessation',
    ],
    source_references: [
      'ASCO Management of Immune-Related Adverse Events in Patients Treated with Immune Checkpoint Inhibitor Therapy',
      'NCCN Clinical Practice Guidelines in Oncology: Management of Immunotherapy-Related Toxicities',
      'Lancet Oncology: Biological rescue in refractory checkpoint enterocolitis',
    ],
    author_id: '00000000-0000-0000-0000-000000000003',
    author_name: 'Dr. Aris Thorne, MD',
    author_title: 'Associate Professor & Medical Oncologist',
    status: 'published',
    published_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    views_count: 380,
    bookmarks_count: 51,
    specialties: [
      { id: 'oncology', name: 'Oncology', category: 'Clinical Medicine' },
      { id: 'immunology', name: 'Immunology & Allergy', category: 'Clinical Medicine' },
      { id: 'gastroenterology', name: 'Gastroenterology', category: 'Clinical Medicine' },
    ],
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    title: 'Rapid Progression of Bilateral Facial Palsy and Paresthesia in Guillain-Barré Syndrome',
    short_summary: 'Diagnostic nuances of acute inflammatory demyelinating polyneuropathy variant presenting with prominent cranial nerve involvement.',
    educational_content: `### Clinical Presentation
A 36-year-old female presents with bilateral facial weakness and progressive distal paresthesias in both hands and feet 12 days after a mild diarrheal illness caused by Campylobacter jejuni.

### Physical Findings
- Bilateral lower motor neuron facial nerve palsy (inability to close eyelids fully or smile symmetrically).
- Deep tendon reflexes were globally absent in lower extremities and diminished in upper extremities.
- Preserved sensation to light touch with mild stocking-glove vibration decrement.

### Diagnostics & Hospital Course
- **Lumbar Puncture:** Albuminocytological dissociation (CSF protein 128 mg/dL, WBC 2 cells/mcL).
- **NCS/EMG:** Prolonged distal motor latencies and absent F-waves consistent with demyelinating neuropathy.

### Treatment
Intravenous immunoglobulin (IVIg 0.4 g/kg/day for 5 consecutive days) was initiated promptly. Forced vital capacity (FVC) and negative inspiratory force (NIF) were trended every 4 hours in the neuro-ICU. Neurological recovery began at day 10, with significant facial motor return at 6-week follow-up.`,
    learning_objectives: [
      'Identify albuminocytological dissociation in cerebrospinal fluid',
      'Manage respiratory failure risk through serial bedside spirometry monitoring (20/30/40 rule)',
      'Compare IVIg versus therapeutic plasma exchange in acute GBS',
    ],
    source_references: [
      'AAN Practice Guideline: Immunotherapy for Guillain-Barré Syndrome',
      'NEJM: Diagnosis and Management of Guillain-Barré Syndrome',
      'Critical Care Neurology: Monitoring respiratory mechanics in neuromuscular weakness',
    ],
    author_id: '00000000-0000-0000-0000-000000000004',
    author_name: 'Dr. Sophia Vance, MD, PhD',
    author_title: 'Neurocritical Care Specialist',
    status: 'published',
    published_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    views_count: 512,
    bookmarks_count: 77,
    specialties: [
      { id: 'neurology', name: 'Neurology', category: 'Clinical Medicine' },
      { id: 'emergency_medicine', name: 'Emergency Medicine', category: 'Acute Care' },
    ],
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    title: 'Atypical Kawasaki Disease in an Infant with Prolonged Fever and Rash',
    short_summary: 'Navigating diagnostic dilemmas in incomplete Kawasaki disease and coronary artery aneurysm prevention in pediatric practice.',
    educational_content: `### Case Overview
A 7-month-old infant presents with 6 days of remittent fever up to 39.8°C, irritability, non-purulent bilateral conjunctivitis, and induration of both hands without strawberry tongue or cervical lymphadenopathy.

### Workup
- **ESR:** 88 mm/hr, **CRP:** 92 mg/L.
- **Platelets:** 520,000/mcL.
- **Echocardiogram:** Prominent left main coronary artery ectasia with a Z-score of +2.8.

### Clinical Management
The diagnosis of incomplete/atypical Kawasaki disease was made. High-dose IVIg (2 g/kg single infusion over 12 hours) and medium-dose aspirin were administered immediately. Fever remitted within 14 hours. Repeat echocardiogram at 6 weeks demonstrated normal coronary lumen dimensions.`,
    learning_objectives: [
      'Recognize atypical/incomplete Kawasaki disease diagnostic algorithm in infants under 12 months',
      'Apply echocardiographic Z-score criteria to assess coronary artery dilation',
      'Review indications for repeat IVIg and adjunct corticosteroids in resistant cases',
    ],
    source_references: [
      'AHA Scientific Statement: Diagnosis, Treatment, and Long-Term Management of Kawasaki Disease',
      'Pediatrics: Incomplete Kawasaki Disease Clinical Guidelines',
    ],
    author_id: '00000000-0000-0000-0000-000000000005',
    author_name: 'Dr. Amara Okafor, MD, FAAP',
    author_title: 'Pediatric Pulmonologist',
    status: 'published',
    published_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    views_count: 340,
    bookmarks_count: 44,
    specialties: [
      { id: 'pediatrics', name: 'Pediatrics', category: 'Clinical Medicine' },
      { id: 'cardiology', name: 'Cardiology', category: 'Clinical Medicine' },
    ],
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    title: 'Subacute Cutaneous Lupus Erythematosus Triggered by Proton Pump Inhibitors',
    short_summary: 'Diagnostic recognition of drug-induced SCLE, serological anti-Ro/SSA antibody testing, and drug cessation recovery.',
    educational_content: `### Clinical Presentation
A 58-year-old female presents with an annular, polycyclic erythematous eruption across the upper chest, shoulders, and dorsal arms that developed 6 weeks after initiating omeprazole for gastroesophageal reflux disease.

### Diagnostic Findings
- **Serology:** Anti-Ro/SSA strongly positive (>8.0 AI); Anti-La negative; ANA 1:160 speckled; normal complement C3 and C4.
- **Punch Biopsy:** Vacuolar interface dermatitis, apoptotic keratinocytes, and dermal mucin deposition.

### Resolution
Omeprazole was discontinued and replaced with famotidine. Topical triamcinolone and strict photoprotection were prescribed. Complete cutaneous clearance occurred within 8 weeks without systemic organ involvement.`,
    learning_objectives: [
      'List pharmacological culprits commonly implicated in drug-induced SCLE',
      'Differentiate SCLE from polymorphic light eruption, tinea corporis, and erythema annulare centrifugum',
      'Guide patients on photoprotection and safe alternative pharmacotherapy',
    ],
    source_references: [
      'Journal of the American Academy of Dermatology: Drug-induced subacute cutaneous lupus',
      'British Journal of Dermatology: Cutaneous lupus erythematosus clinical update',
    ],
    author_id: '00000000-0000-0000-0000-000000000006',
    author_name: 'Dr. Julian Martinez, MD, FAAD',
    author_title: 'Dermatopathologist',
    status: 'published',
    published_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    views_count: 290,
    bookmarks_count: 38,
    password_protected: true,
    access_password: 'clinical2024',
    specialties: [
      { id: 'dermatology', name: 'Dermatology', category: 'Clinical Medicine' },
      { id: 'immunology', name: 'Immunology & Allergy', category: 'Clinical Medicine' },
    ],
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 11 * 86400000).toISOString(),
  },
  {
    id: '20000000-0000-0000-0000-000000000006',
    title: 'Severe Sepsis from Community-Acquired Klebsiella Pneumoniae in Poorly Controlled Diabetes',
    short_summary: 'Point-of-care lung ultrasound stewardship, early goal resuscitation, and glycemic stabilization in diabetic bacteremia.',
    educational_content: `### Clinical Presentation
A 53-year-old male with HbA1c of 11.2% presents with high fever, rigors, cough with red currant jelly sputum, and altered mental status. Blood pressure 84/48 mmHg, heart rate 124 bpm, oxygen saturation 89% on ambient air.

### Clinical Management
Bedside lung ultrasound demonstrated extensive right upper lobe consolidation with dynamic air bronchograms and B-lines. Fluid resuscitation with balanced crystalloids was instituted and intravenous ceftriaxone plus azithromycin initiated within 45 minutes of arrival.

Blood and sputum cultures confirmed hypervirulent Klebsiella pneumoniae sensitive to cephalosporins. After hemodynamic stabilization, continuous regular insulin infusion normalized hyperglycemia. The patient was stepped down to oral fluoroquinolones to complete a 14-day course.`,
    learning_objectives: [
      'Deploy bedside POCUS in rapid hypoxemia and sepsis source identification',
      'Review antibiotic spectrum choices in diabetic patients susceptible to encapsulated organisms',
      'Manage severe hyperglycemia during septic stress state',
    ],
    source_references: [
      'Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021',
      'Chest: Point-of-Care Ultrasonography in Respiratory Failure',
    ],
    author_id: '00000000-0000-0000-0000-000000000007',
    author_name: 'Dr. Priya Nair, MD',
    author_title: 'Hospitalist & Academic Internal Medicine',
    status: 'published',
    published_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    views_count: 460,
    bookmarks_count: 59,
    specialties: [
      { id: 'internal_medicine', name: 'Internal Medicine', category: 'Clinical Medicine' },
      { id: 'pulmonology', name: 'Pulmonology', category: 'Clinical Medicine' },
      { id: 'endocrinology', name: 'Endocrinology', category: 'Clinical Medicine' },
    ],
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: '20000000-0000-0000-0000-000000000007',
    title: '[DRAFT] Novel Biomarkers in Early Lung Adenocarcinoma Detection',
    short_summary: 'Internal draft investigating circulating tumor DNA methylation signatures in stage I NSCLC screening protocols.',
    educational_content: 'Under active clinical peer review before publication approval. Content reflects preliminary single-center retrospective observational findings.',
    learning_objectives: [
      'Evaluate circulating cfDNA methylation panels',
      'Assess false-positive rates against low-dose spiral CT',
    ],
    source_references: ['Preliminary trial data - Internal hospital registry'],
    author_id: '00000000-0000-0000-0000-000000000001',
    author_name: 'Dr. Sarah Jenkins, MD, FACP',
    author_title: 'Chief Medical Officer & Clinical Administrator',
    status: 'draft',
    published_at: null,
    views_count: 12,
    bookmarks_count: 0,
    specialties: [
      { id: 'oncology', name: 'Oncology', category: 'Clinical Medicine' },
      { id: 'pulmonology', name: 'Pulmonology', category: 'Clinical Medicine' },
    ],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: '20000000-0000-0000-0000-000000000008',
    title: '[ARCHIVED] Historical Evaluation of Digoxin Protocols in Heart Failure (1998-2005)',
    short_summary: 'Archived historical reference case superseded by current SGLT2i and ARNI guideline-directed medical therapy.',
    educational_content: 'This historical case has been archived in favor of modern 2023 ACC/AHA guidelines for HFrEF quadruple therapy.',
    learning_objectives: [
      'Understand historical digoxin monitoring',
      'Compare with modern GDMT quadruple therapy',
    ],
    source_references: ['DIG Trial 1997', 'ACC/AHA 2005 Guideline Archive'],
    author_id: '00000000-0000-0000-0000-000000000001',
    author_name: 'Dr. Sarah Jenkins, MD, FACP',
    author_title: 'Chief Medical Officer & Clinical Administrator',
    status: 'archived',
    published_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    views_count: 95,
    bookmarks_count: 3,
    specialties: [
      { id: 'cardiology', name: 'Cardiology', category: 'Clinical Medicine' },
    ],
    created_at: new Date(Date.now() - 65 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    author_id: '00000000-0000-0000-0000-000000000002',
    author: INITIAL_PROFILES[1],
    content: `In interventional cardiology, timing and physiological lesion assessment dictate long-term stent patency. We recently reviewed 12-month outcomes following intravascular ultrasound (IVUS)-guided vs. angiography-guided PCI in complex bifurcations.\n\nThe routine application of high-definition IVUS significantly lowered target lesion failure (TLF) from 7.1% to 3.8% (p=0.008). Ensuring minimum stent area (MSA) >5.5 mm² in the ostial LAD is one of the single most protective clinical steps we can take in the cath lab.\n\nColleagues: what is your current institutional threshold for post-dilatation in non-left-main bifurcations?`,
    article_url: 'https://www.jacc.org/doi/10.1016/j.jacc.2023.08.012',
    article_title: 'Intravascular Imaging in Complex Coronary Bifurcations: A Multi-Center Registry',
    article_source: 'Journal of the American College of Cardiology',
    specialty_id: 'cardiology',
    specialty: INITIAL_SPECIALTIES[0],
    topic_tags: ['InterventionalCardiology', 'IVUS', 'CathLabPearls', 'ClinicalOutcomes'],
    likes_count: 42,
    comments_count: 2,
    reposts_count: 8,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    comments: [
      {
        id: '40000000-0000-0000-0000-000000000001',
        post_id: '30000000-0000-0000-0000-000000000001',
        author_id: '00000000-0000-0000-0000-000000000001',
        author: INITIAL_PROFILES[0],
        content: 'Superb analysis Dr. Chen. At our health system, incorporating mandatory IVUS checklists into our electronic registry reduced 30-day readmissions significantly. Quality data is paramount.',
        created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
      },
      {
        id: '40000000-0000-0000-0000-000000000002',
        post_id: '30000000-0000-0000-0000-000000000001',
        author_id: '00000000-0000-0000-0000-000000000007',
        author: INITIAL_PROFILES[6],
        content: 'From an inpatient hospitalist perspective, seeing these clear post-PCI parameters helps us guide our transition care and dual antiplatelet counseling before discharge.',
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
    ],
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    author_id: '00000000-0000-0000-0000-000000000003',
    author: INITIAL_PROFILES[2],
    content: `Exciting phase III data presented at this weekend’s thoracic symposium regarding antibody-drug conjugates (ADCs) in HER2-mutant non-small cell lung cancer.\n\nThe progression-free survival (PFS) hazard ratio of 0.62 against platinum doublets demonstrates that targeted internalization of cytotoxic payloads continues to reshape solid tumor oncology.\n\nCrucial point for oncologists: monitor pulmonary function tests closely, as interstitial lung disease (ILD) remains the most critical class adverse event to identify before progression.`,
    article_url: 'https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(23)00412-1/fulltext',
    article_title: 'Antibody-Drug Conjugates in Advanced Non-Small-Cell Lung Cancer: A Landmark Trial',
    article_source: 'The Lancet Oncology',
    specialty_id: 'oncology',
    specialty: INITIAL_SPECIALTIES[1],
    topic_tags: ['Oncology', 'ThoracicOncology', 'ADCs', 'PrecisionMedicine'],
    likes_count: 67,
    comments_count: 1,
    reposts_count: 14,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    comments: [
      {
        id: '40000000-0000-0000-0000-000000000003',
        post_id: '30000000-0000-0000-0000-000000000002',
        author_id: '00000000-0000-0000-0000-000000000010',
        author: INITIAL_PROFILES[9],
        content: 'Strongly agree on ILD pharmacovigilance. In our medical affairs advisory boards, early baseline HRCT scans and rapid corticosteroid tapering protocols were universal recommendations.',
        created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
        updated_at: new Date(Date.now() - 18 * 3600000).toISOString(),
      },
    ],
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    author_id: '00000000-0000-0000-0000-000000000008',
    author: INITIAL_PROFILES[7],
    content: `We just uploaded our preprint on single-cell transcriptional profiling of tertiary lymphoid structures (TLS) in checkpoint-resistant solid tumors.\n\nOur data suggests that localized follicular helper T-cells (Tfh) and CD20+ B-cell cross-talk correlate directly with neoantigen-specific cytotoxic recruitment. We invite peer researchers and clinical oncologists to review the pipeline and collaborate on validation cohorts.`,
    article_url: 'https://www.nature.com/articles/s41586-024-07112-x',
    article_title: 'Spatial Transcriptomics Reveals B-Cell Mediated Immunity in Tumor Microenvironments',
    article_source: 'Nature Medicine',
    specialty_id: 'oncology',
    specialty: INITIAL_SPECIALTIES[1],
    topic_tags: ['Genomics', 'Bioinformatics', 'CancerResearch', 'SingleCell'],
    likes_count: 39,
    comments_count: 0,
    reposts_count: 11,
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    comments: [],
  },
  {
    id: '30000000-0000-0000-0000-000000000004',
    author_id: '00000000-0000-0000-0000-000000000009',
    author: INITIAL_PROFILES[8],
    content: `Reflecting on my 4th year sub-internship in the Cardiac Intensive Care Unit (CICU):\n\nUnderstanding Swan-Ganz pulmonary artery catheter waveforms in cardiogenic shock was initially daunting, but correlating hemodynamic tracings with bedside echocardiography brought physiology alive. Invaluable mentoring from Dr. Marcus Chen and the fellowship team!\n\nTo fellow medical students: never hesitate to ask "why" on rounds when hemodynamics do not match the clinical textbook presentation.`,
    specialty_id: 'cardiology',
    specialty: INITIAL_SPECIALTIES[0],
    topic_tags: ['MedEd', 'MedicalStudent', 'CICU', 'CardiologyFellowship'],
    likes_count: 58,
    comments_count: 1,
    reposts_count: 3,
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    comments: [
      {
        id: '40000000-0000-0000-0000-000000000004',
        post_id: '30000000-0000-0000-0000-000000000004',
        author_id: '00000000-0000-0000-0000-000000000002',
        author: INITIAL_PROFILES[1],
        content: 'Proud of your dedication on the unit, Alex. You demonstrated exemplary clinical curiosity and bedside communication. Any residency program will be fortunate to match you.',
        created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
        updated_at: new Date(Date.now() - 48 * 3600000).toISOString(),
      },
    ],
  },
];

export const INITIAL_CONNECTIONS: Connection[] = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    requester_id: '00000000-0000-0000-0000-000000000001',
    recipient_id: '00000000-0000-0000-0000-000000000002',
    status: 'accepted',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    requester_id: '00000000-0000-0000-0000-000000000001',
    recipient_id: '00000000-0000-0000-0000-000000000003',
    status: 'accepted',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: '50000000-0000-0000-0000-000000000003',
    requester_id: '00000000-0000-0000-0000-000000000004',
    recipient_id: '00000000-0000-0000-0000-000000000001',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: '50000000-0000-0000-0000-000000000004',
    requester_id: '00000000-0000-0000-0000-000000000005',
    recipient_id: '00000000-0000-0000-0000-000000000001',
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const INITIAL_REPORTS: ContentReport[] = [
  {
    id: '60000000-0000-0000-0000-000000000001',
    reporter_id: '00000000-0000-0000-0000-000000000007',
    content_type: 'post',
    content_id: '30000000-0000-0000-0000-000000000001',
    reason: 'Routine peer verification of citation link',
    status: 'reviewed',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    reviewed_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    reviewed_by: '00000000-0000-0000-0000-000000000001',
  },
];

export const INITIAL_JOBS: JobListing[] = [
  {
    id: 'job-001',
    title: 'Attending Interventional Cardiologist',
    organization: 'Massachusetts Academic Heart Center',
    location: 'Boston, MA (On-site)',
    employment_type: 'Full-time',
    specialty_id: 'cardiology',
    specialty_name: 'Cardiology',
    salary_range: '$420,000 - $510,000 / year',
    description: 'Lead cardiac catheterization interventions, complex PCI protocols, and participate in multi-center clinical trials within our cardiovascular research institute.',
    requirements: [
      'Board certified/eligible in Interventional Cardiology',
      'Active Massachusetts medical license or eligibility',
      'Proficiency in intravascular ultrasound (IVUS) and mechanical circulatory support',
      'Demonstrated commitment to clinical trial investigation',
    ],
    apply_url: 'https://example.com/careers/cardiology-001',
    is_active: true,
    is_demo: true,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'job-002',
    title: 'Pediatric Critical Care Fellow / Junior Attending',
    organization: "National Children's Medical Center",
    location: 'Washington, DC',
    employment_type: 'Fellowship',
    specialty_id: 'pediatrics',
    specialty_name: 'Pediatrics',
    salary_range: '$195,000 - $240,000 / year',
    description: 'High-acuity pediatric intensive care training program emphasizing pediatric extracorporeal membrane oxygenation (ECMO) and acute resuscitation research.',
    requirements: [
      'Completion of ACGME-accredited Pediatric Residency',
      'Active PALS and BLS certifications',
      'Eligible for District of Columbia medical licensure',
    ],
    apply_url: 'https://example.com/careers/pediatrics-002',
    is_active: true,
    is_demo: true,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'job-003',
    title: 'Associate Director of Clinical Oncology Trials',
    organization: 'Metropolitan Cancer Research Institute',
    location: 'New York, NY',
    employment_type: 'Full-time',
    specialty_id: 'oncology',
    specialty_name: 'Oncology',
    salary_range: '$390,000 - $480,000 / year',
    description: 'Direct early-phase targeted oncology therapies and immunotherapy checkpoint resistance studies with 50% protected research time.',
    requirements: [
      'MD or MD/PhD with Fellowship in Hematology/Oncology',
      'Minimum 4 years experience leading Phase I/II clinical trials',
      'Track record of peer-reviewed clinical research publications',
    ],
    apply_url: 'https://example.com/careers/oncology-003',
    is_active: true,
    is_demo: true,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

export const INITIAL_ADVERTISEMENTS: Advertisement[] = [
  {
    id: 'ad-001',
    title: 'CardioVascular Horizons 2026 Annual Symposium',
    sponsor: 'American Academy of Cardiology Education',
    headline: 'Advance Your Interventional & Imaging Clinical Skills',
    body_text: 'Join 1,200+ cardiology peers for 3 days of live case transmissions, high-definition IVUS workshops, and 24 AMA PRA Category 1 CME Credits in Boston.',
    target_url: 'https://example.com/cardio-horizons-2026',
    cta_text: 'Register for CME (Demo)',
    specialty_id: 'cardiology',
    specialty_name: 'Cardiology',
    is_active: true,
    is_demo: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'ad-002',
    title: 'DeepHistology Diagnostic AI Platform',
    sponsor: 'DeepHistology Clinical Systems',
    headline: 'Sub-cellular Tumor Margin Identification with 99.4% Concordance',
    body_text: 'Streamline frozen section turnaround times and enhance pathology triage with real-time deep learning histology workflows. Request a clinical demonstration.',
    target_url: 'https://example.com/deephistology-demo',
    cta_text: 'Request Clinical Demo (Demo)',
    specialty_id: 'oncology',
    specialty_name: 'Oncology',
    is_active: true,
    is_demo: true,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    user_id: '00000000-0000-0000-0000-000000000001', // Sarah Jenkins
    actor_id: '00000000-0000-0000-0000-000000000002', // Marcus Chen
    type: 'post_like',
    message: 'Dr. Marcus Chen, MD, FACC liked your post.',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-002',
    user_id: '00000000-0000-0000-0000-000000000001',
    actor_id: '00000000-0000-0000-0000-000000000003', // Aris Thorne
    type: 'connection_request',
    message: 'Dr. Aris Thorne, MD sent you a connection request.',
    is_read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'notif-003',
    user_id: '00000000-0000-0000-0000-000000000001',
    actor_id: '00000000-0000-0000-0000-000000000004', // Sophia Vance
    type: 'post_comment',
    message: 'Dr. Sophia Vance, MD, PhD commented on your case study.',
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export class ServerDatabase {
  private static instance: ServerDatabase;
  private state: DatabaseState;

  private constructor() {
    this.state = this.loadState();
  }

  public static getInstance(): ServerDatabase {
    if (!ServerDatabase.instance) {
      ServerDatabase.instance = new ServerDatabase();
    }
    return ServerDatabase.instance;
  }

  private loadState(): DatabaseState {
    const defaultState: DatabaseState = {
      specialties: INITIAL_SPECIALTIES,
      profiles: INITIAL_PROFILES,
      profile_specialties: INITIAL_PROFILE_SPECIALTIES,
      posts: INITIAL_POSTS,
      post_likes: [],
      comments: [
        INITIAL_POSTS[0].comments![0],
        INITIAL_POSTS[0].comments![1],
        INITIAL_POSTS[1].comments![0],
        INITIAL_POSTS[3].comments![0],
      ],
      case_studies: INITIAL_CASE_STUDIES,
      groups: INITIAL_GROUPS,
      group_members: [
        { group_id: '10000000-0000-0000-0000-000000000001', user_id: '00000000-0000-0000-0000-000000000001', role: 'member', joined_at: new Date().toISOString() },
        { group_id: '10000000-0000-0000-0000-000000000001', user_id: '00000000-0000-0000-0000-000000000002', role: 'admin', joined_at: new Date().toISOString() },
        { group_id: '10000000-0000-0000-0000-000000000002', user_id: '00000000-0000-0000-0000-000000000003', role: 'admin', joined_at: new Date().toISOString() },
      ],
      connections: INITIAL_CONNECTIONS,
      follows: [],
      bookmarks: [],
      ai_sessions: [],
      content_reports: INITIAL_REPORTS,
      jobs: INITIAL_JOBS,
      advertisements: INITIAL_ADVERTISEMENTS,
      notifications: INITIAL_NOTIFICATIONS,
      current_user_id: '00000000-0000-0000-0000-000000000001', // Default to Sarah Jenkins (Admin)
    };

    return defaultState;
  }

  private saveState(_state: DatabaseState) {
    // In-memory state is preserved directly in instance memory; persistent storage is handled by Supabase Postgres.
  }

  // --- Auth & Current Session ---
  public async getCurrentUser(): Promise<Profile> {
    let effectiveUserId = this.state.current_user_id;
    try {
      const { cookies } = require('next/headers');
      const cookieStore = cookies();
      const sessionUserId = cookieStore.get('medconnect_session_user_id')?.value;
      if (sessionUserId) {
        effectiveUserId = sessionUserId;
      }
    } catch {
      // outside request context or build time
    }

    if (isSupabaseConfigured) {
      const p = await supabaseDb.getProfileById(effectiveUserId);
      if (p) return p;
      const all = await supabaseDb.getProfiles();
      if (all.length > 0) return all[0];
    }

    const profile = this.state.profiles.find((p) => p.id === effectiveUserId);
    if (profile) {
      return this.enrichProfile(profile);
    }
    return this.enrichProfile(this.state.profiles[0]);
  }

  public async switchUser(userId: string): Promise<Profile | null> {
    if (isSupabaseConfigured) {
      const profile = await supabaseDb.getProfileById(userId);
      if (!profile) return null;
      this.state.current_user_id = userId;
      return profile;
    }
    const profile = this.state.profiles.find((p) => p.id === userId);
    if (!profile) return null;
    this.state.current_user_id = userId;
    this.saveState(this.state);
    return this.enrichProfile(profile);
  }

  public async loginUser(identifier: string): Promise<Profile | null> {
    if (isSupabaseConfigured) {
      return supabaseDb.loginUser(identifier);
    }
    const q = identifier.trim().toLowerCase();
    const profile = this.state.profiles.find(
      (p) =>
        p.email.toLowerCase() === q ||
        p.id === identifier ||
        p.full_name.toLowerCase().includes(q)
    );
    if (!profile) return null;
    this.state.current_user_id = profile.id;
    this.saveState(this.state);
    return this.enrichProfile(profile);
  }

  public async registerUser(payload: {
    full_name: string;
    email: string;
    role: Role;
    title: string;
    institution?: string;
    location?: string;
    specialty_ids?: string[];
    bio?: string;
    years_of_experience?: number;
    qualifications?: string[];
    password?: string;
  }): Promise<Profile> {
    if (isSupabaseConfigured) {
      return supabaseDb.registerUser(payload);
    }
    const existing = this.state.profiles.find(
      (p) => p.email.toLowerCase() === payload.email.trim().toLowerCase()
    );
    if (existing) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      payload.full_name
    )}&background=0d9488&color=fff&bold=true`;

    const newProfile: Profile = {
      id: newId,
      email: payload.email.trim().toLowerCase(),
      full_name: payload.full_name.trim(),
      title: payload.title.trim(),
      role: payload.role,
      institution: payload.institution?.trim() || 'Academic Medical Center',
      location: payload.location?.trim() || 'United States',
      bio: payload.bio?.trim() || 'Practicing healthcare professional dedicated to evidence-based clinical care.',
      avatar_url: avatar,
      years_of_experience: Number(payload.years_of_experience) || 5,
      qualifications: payload.qualifications && payload.qualifications.length > 0
        ? payload.qualifications
        : ['MD / Healthcare Credential'],
      interests: [],
      is_admin: false, // Newly registered users are strictly regular users, never platform admins
      is_demo: false, // Distinguish registered users from seeded demo personas
      is_verified: true,
      connections_count: 0,
      created_at: new Date().toISOString(),
    };

    this.state.profiles.push(newProfile);

    if (payload.specialty_ids && payload.specialty_ids.length > 0) {
      for (const spId of payload.specialty_ids) {
        this.state.profile_specialties.push({
          profile_id: newId,
          specialty_id: spId,
        });
      }
    }

    this.state.current_user_id = newId;
    this.saveState(this.state);
    return this.enrichProfile(newProfile);
  }

  // --- Specialties ---
  public async getSpecialties(): Promise<Specialty[]> {
    if (isSupabaseConfigured) {
      return supabaseDb.getSpecialties();
    }
    return this.state.specialties;
  }

  // --- Profiles ---
  private enrichProfile(profile: Profile): Profile {
    const specialtyIds = this.state.profile_specialties
      .filter((ps) => ps.profile_id === profile.id)
      .map((ps) => ps.specialty_id);
    const specialties = this.state.specialties.filter((s) => specialtyIds.includes(s.id));
    return {
      ...profile,
      specialties,
    };
  }

  public async getProfiles(filters?: { role?: string; specialty?: string; search?: string }): Promise<Profile[]> {
    if (isSupabaseConfigured) {
      return supabaseDb.getProfiles(filters);
    }
    let result = this.state.profiles.map((p) => this.enrichProfile(p));

    if (filters?.role) {
      result = result.filter((p) => p.role === filters.role);
    }
    if (filters?.specialty) {
      result = result.filter((p) =>
        p.specialties?.some((s) => s.id === filters.specialty || s.name.toLowerCase() === filters.specialty?.toLowerCase())
      );
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.institution?.toLowerCase().includes(q) ||
          p.bio?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.specialties?.some((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) ||
          p.qualifications?.some((qual) => qual.toLowerCase().includes(q))
      );
    }
    return result;
  }

  private getLocalProfileById(id: string): Profile | null {
    const p = this.state.profiles.find((x) => x.id === id);
    if (!p) return null;
    return this.enrichProfile(p);
  }

  public async getProfileById(id: string): Promise<Profile | null> {
    if (isSupabaseConfigured) {
      return supabaseDb.getProfileById(id);
    }
    return this.getLocalProfileById(id);
  }

  public async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    if (isSupabaseConfigured) {
      return supabaseDb.updateProfile(id, updates);
    }
    const idx = this.state.profiles.findIndex((x) => x.id === id);
    if (idx === -1) return null;

    // Security check: Protect admin flag from unauthorized client escalation
    const currentUser = await this.getCurrentUser();
    if (updates.is_admin !== undefined && !currentUser.is_admin) {
      delete updates.is_admin;
    }
    if (updates.role !== undefined && updates.role === 'admin' && !currentUser.is_admin) {
      delete updates.role;
    }

    this.state.profiles[idx] = {
      ...this.state.profiles[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveState(this.state);
    return this.enrichProfile(this.state.profiles[idx]);
  }

  // --- Posts ---
  public async getPosts(currentUserId?: string, groupId?: string): Promise<Post[]> {
    if (isSupabaseConfigured) {
      return supabaseDb.getPosts(currentUserId, groupId);
    }
    const effectiveUserId = currentUserId || this.state.current_user_id;
    let list = this.state.posts;
    if (groupId) {
      list = list.filter((p) => p.group_id === groupId);
    }

    const user = this.getLocalProfileById(effectiveUserId);
    const isDemo = Boolean(user && user.is_demo !== false && user.id?.startsWith('00000000-'));

    // Remove default/sample feeds for newly registered users.
    // Show only relevant real user content.
    if (!isDemo) {
      list = list.filter((p) => {
        // Exclude hardcoded/sample feed posts
        if (p.id.startsWith('30000000-')) return false;

        const postAuthor = this.getLocalProfileById(p.author_id);
        // Exclude posts authored by default demo accounts
        if (postAuthor?.is_demo || p.author_id.startsWith('00000000-')) {
          return false;
        }

        // Include own posts
        if (p.author_id === effectiveUserId) return true;

        // Check audience visibility:
        if (p.visibility === 'connections') {
          return this.areUsersConnected(effectiveUserId, p.author_id);
        }
        if (p.visibility === 'followers') {
          return this.isLocalFollowing(effectiveUserId, p.author_id) || this.areUsersConnected(effectiveUserId, p.author_id);
        }
        if (p.visibility === 'group' && p.group_id) {
          return this.isUserInGroup(effectiveUserId, p.group_id);
        }

        // Real user public posts: show relevant content (connected, followed, or matching user's specialties)
        const isConnected = this.areUsersConnected(effectiveUserId, p.author_id);
        const isFollowing = this.isLocalFollowing(effectiveUserId, p.author_id);
        const userSpecs = this.state.profile_specialties
          .filter((ps) => ps.profile_id === effectiveUserId)
          .map((ps) => ps.specialty_id);
        const matchesSpecialty = Boolean(p.specialty_id && userSpecs.includes(p.specialty_id));

        return isConnected || isFollowing || matchesSpecialty;
      });
    }

    return list
      .map((post) => {
        const author = this.getLocalProfileById(post.author_id) || INITIAL_PROFILES[0];
        const specialty = post.specialty_id ? this.state.specialties.find((s) => s.id === post.specialty_id) : undefined;
        const postComments = this.state.comments
          .filter((c) => c.post_id === post.id)
          .map((c) => ({
            ...c,
            author: this.getLocalProfileById(c.author_id) || INITIAL_PROFILES[0],
          }))
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        const is_liked = this.state.post_likes.some(
          (l) => l.post_id === post.id && l.user_id === effectiveUserId
        );
        const is_bookmarked = this.state.bookmarks.some(
          (b) => b.user_id === effectiveUserId && b.item_type === 'post' && b.item_id === post.id
        );

        let repost_of: Post | undefined = undefined;
        if (post.repost_of_id) {
          const orig = this.state.posts.find((p) => p.id === post.repost_of_id);
          if (orig) {
            repost_of = {
              ...orig,
              author: this.getLocalProfileById(orig.author_id) || INITIAL_PROFILES[0],
              specialty: orig.specialty_id ? this.state.specialties.find((s) => s.id === orig.specialty_id) : undefined,
            };
          }
        }

        return {
          ...post,
          author,
          specialty,
          comments: postComments,
          comments_count: postComments.length,
          is_liked,
          is_bookmarked,
          repost_of,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async createPost(payload: {
    content: string;
    author_id?: string;
    specialty_id?: string;
    topic_tags?: string[];
    article_url?: string;
    article_title?: string;
    article_source?: string;
    group_id?: string;
    visibility?: 'everyone' | 'connections' | 'followers' | 'group';
  }): Promise<Post> {
    if (isSupabaseConfigured) {
      return supabaseDb.createPost({
        author_id: payload.author_id || this.state.current_user_id,
        content: payload.content,
        specialty_id: payload.specialty_id,
        topic_tags: payload.topic_tags,
        article_url: payload.article_url,
        article_title: payload.article_title,
        article_source: payload.article_source,
        group_id: payload.group_id,
        visibility: payload.visibility,
      });
    }
    const author_id = payload.author_id || this.state.current_user_id;
    const author = this.getLocalProfileById(author_id) || INITIAL_PROFILES[0];
    const specialty = payload.specialty_id ? this.state.specialties.find((s) => s.id === payload.specialty_id) : undefined;

    const newPost: Post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      author_id,
      author,
      content: payload.content,
      article_url: payload.article_url,
      article_title: payload.article_title,
      article_source: payload.article_source,
      specialty_id: payload.specialty_id,
      specialty,
      topic_tags: payload.topic_tags || [],
      group_id: payload.group_id,
      visibility: payload.visibility || 'everyone',
      likes_count: 0,
      comments_count: 0,
      reposts_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      comments: [],
    };

    this.state.posts.unshift(newPost);
    this.saveState(this.state);
    return newPost;
  }

  public async deletePost(id: string, userId: string, isAdmin: boolean): Promise<boolean> {
    if (isSupabaseConfigured) {
      return supabaseDb.deletePost(id, userId, isAdmin);
    }
    const post = this.state.posts.find((p) => p.id === id);
    if (!post) return false;
    if (post.author_id !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this post');
    }
    this.state.posts = this.state.posts.filter((p) => p.id !== id);
    this.state.comments = this.state.comments.filter((c) => c.post_id !== id);
    this.state.post_likes = this.state.post_likes.filter((l) => l.post_id !== id);
    this.saveState(this.state);
    return true;
  }

  public async toggleLikePost(postId: string, userId: string): Promise<{ likes_count: number; is_liked: boolean }> {
    if (isSupabaseConfigured) {
      return supabaseDb.toggleLikePost(postId, userId);
    }
    const post = this.state.posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    const existingIndex = this.state.post_likes.findIndex(
      (l) => l.post_id === postId && l.user_id === userId
    );

    let is_liked: boolean;
    if (existingIndex >= 0) {
      this.state.post_likes.splice(existingIndex, 1);
      post.likes_count = Math.max(0, post.likes_count - 1);
      is_liked = false;
    } else {
      this.state.post_likes.push({
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
      post.likes_count += 1;
      is_liked = true;

      // Trigger notification if liking someone else's post
      if (post.author_id !== userId) {
        const actor = this.getLocalProfileById(userId);
        this.createNotification({
          user_id: post.author_id,
          actor_id: userId,
          type: 'post_like',
          item_id: post.id,
          item_title: post.content.substring(0, 45) + '...',
          message: `${actor?.full_name || 'A user'} liked your post.`,
        });
      }
    }
    this.saveState(this.state);
    return { likes_count: post.likes_count, is_liked };
  }

  public async addComment(postId: string, authorId: string, content: string): Promise<Comment> {
    if (isSupabaseConfigured) {
      return supabaseDb.addComment(postId, authorId, content);
    }
    const post = this.state.posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    const author = this.getLocalProfileById(authorId) || INITIAL_PROFILES[0];
    const newComment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      post_id: postId,
      author_id: authorId,
      author,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.comments.push(newComment);
    post.comments_count += 1;

    // Trigger notification if commenting on someone else's post
    if (post.author_id !== authorId) {
      this.createNotification({
        user_id: post.author_id,
        actor_id: authorId,
        type: 'post_comment',
        item_id: post.id,
        item_title: post.content.substring(0, 45) + '...',
        message: `${author.full_name} commented on your post: "${content.substring(0, 30)}..."`,
      });
    }

    this.saveState(this.state);
    return newComment;
  }

  public async updateComment(commentId: string, content: string, userId: string, isAdmin: boolean): Promise<Comment> {
    if (isSupabaseConfigured) {
      return supabaseDb.updateComment(commentId, content, userId, isAdmin);
    }
    const comment = this.state.comments.find((c) => c.id === commentId);
    if (!comment) throw new Error('Comment not found');
    if (comment.author_id !== userId && !isAdmin) {
      throw new Error('Unauthorized to edit this comment');
    }
    comment.content = content.trim();
    comment.updated_at = new Date().toISOString();
    this.saveState(this.state);
    return {
      ...comment,
      author: this.getLocalProfileById(comment.author_id) || INITIAL_PROFILES[0],
    };
  }

  public async deleteComment(commentId: string, userId: string, isAdmin: boolean): Promise<boolean> {
    if (isSupabaseConfigured) {
      return supabaseDb.deleteComment(commentId, userId, isAdmin);
    }
    const comment = this.state.comments.find((c) => c.id === commentId);
    if (!comment) return false;
    if (comment.author_id !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this comment');
    }
    this.state.comments = this.state.comments.filter((c) => c.id !== commentId);
    const post = this.state.posts.find((p) => p.id === comment.post_id);
    if (post) {
      post.comments_count = Math.max(0, post.comments_count - 1);
    }
    this.saveState(this.state);
    return true;
  }

  public async repostPost(postId: string, userId: string, quoteComment?: string): Promise<Post> {
    if (isSupabaseConfigured) {
      return supabaseDb.repostPost(postId, userId, quoteComment);
    }
    const originalPost = this.state.posts.find((p) => p.id === postId);
    if (!originalPost) throw new Error('Original post not found');

    const author = this.getLocalProfileById(userId) || INITIAL_PROFILES[0];
    const newPost: Post = {
      id: `repost_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      author_id: userId,
      author,
      content: quoteComment?.trim() || '',
      repost_of_id: originalPost.id,
      specialty_id: originalPost.specialty_id,
      topic_tags: originalPost.topic_tags,
      visibility: 'everyone',
      likes_count: 0,
      comments_count: 0,
      reposts_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      comments: [],
    };

    originalPost.reposts_count = (originalPost.reposts_count || 0) + 1;
    this.state.posts.unshift(newPost);

    if (originalPost.author_id !== userId) {
      this.createNotification({
        user_id: originalPost.author_id,
        actor_id: userId,
        type: 'repost',
        item_id: newPost.id,
        item_title: originalPost.content.substring(0, 45) + '...',
        message: `${author.full_name} reposted your post.`,
      });
    }

    this.saveState(this.state);
    return {
      ...newPost,
      repost_of: {
        ...originalPost,
        author: this.getLocalProfileById(originalPost.author_id) || INITIAL_PROFILES[0],
      },
    };
  }

  public areUsersConnected(userA?: string, userB?: string): boolean {
    if (!userA || !userB) return false;
    if (userA === userB) return true;
    return this.state.connections.some(
      (c) =>
        c.status === 'accepted' &&
        ((c.requester_id === userA && c.recipient_id === userB) ||
         (c.requester_id === userB && c.recipient_id === userA))
    );
  }

  public isUserInGroup(userId?: string, groupId?: string): boolean {
    if (!userId || !groupId) return false;
    return this.state.group_members.some(
      (gm) => gm.group_id === groupId && gm.user_id === userId
    );
  }

  // --- Case Studies (Critical End-to-End Feature) ---
  public async getCaseStudies(options: {
    specialtyIds?: string[];
    search?: string;
    includeDraftsAndArchived?: boolean;
    currentUserId?: string;
    isAdmin?: boolean;
    personalized?: boolean;
  }): Promise<CaseStudy[]> {
    if (isSupabaseConfigured) {
      return supabaseDb.getCaseStudies(options);
    }
    const effectiveUserId = options.currentUserId || this.state.current_user_id;
    let list = this.state.case_studies;

    // Rule: Non-admin users see published case studies, or their own drafts
    if (!options.isAdmin && !options.includeDraftsAndArchived) {
      list = list.filter((c) => c.status === 'published' || c.author_id === effectiveUserId);
    }

    // Privacy & Audience Filtering
    if (!options.isAdmin) {
      list = list.filter((c) => {
        // Author can always see their own
        if (c.author_id === effectiveUserId) return true;

        // If private: author, shared connections, or password-protected
        if (c.is_private) {
          if (c.shared_with_user_ids?.includes(effectiveUserId)) return true;
          if (c.password_protected) return true;
          return false;
        }

        // If public: check audience visibility
        if (!c.visibility || c.visibility === 'everyone') {
          return true;
        }
        if (c.visibility === 'connections') {
          return this.areUsersConnected(effectiveUserId, c.author_id);
        }
        if (c.visibility === 'followers') {
          return this.areUsersConnected(effectiveUserId, c.author_id);
        }
        if (c.visibility === 'group' && c.group_id) {
          return this.isUserInGroup(effectiveUserId, c.group_id);
        }
        return true;
      });
    }

    // Personalization: Show case studies based on relevant specialisation and professional connections
    if (options.personalized && !options.isAdmin) {
      const userProfile = this.getLocalProfileById(effectiveUserId);
      const userSpecialtyIds = (userProfile?.specialties || []).map((s) => s.id.toLowerCase());

      list = list.filter((c) => {
        // Author's own case studies
        if (c.author_id === effectiveUserId) return true;

        // Author is an established connection
        if (this.areUsersConnected(effectiveUserId, c.author_id)) return true;

        // Explicitly shared with user
        if (c.shared_with_user_ids?.includes(effectiveUserId)) return true;

        // Relevant clinical specialisation
        if (userSpecialtyIds.length > 0) {
          return c.specialties?.some((sp) =>
            userSpecialtyIds.includes(sp.id.toLowerCase()) ||
            userSpecialtyIds.includes(sp.name.toLowerCase())
          );
        }

        return true;
      });
    }

    // Filter by Specialty IDs (Canonical matching)
    if (options.specialtyIds && options.specialtyIds.length > 0) {
      const targetIds = options.specialtyIds.map((s) => s.toLowerCase());
      list = list.filter((c) =>
        c.specialties.some(
          (sp) => targetIds.includes(sp.id.toLowerCase()) || targetIds.includes(sp.name.toLowerCase())
        )
      );
    }

    // Keyword Search
    if (options.search && options.search.trim().length > 0) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.short_summary.toLowerCase().includes(q) ||
          c.author_name.toLowerCase().includes(q) ||
          c.educational_content.toLowerCase().includes(q) ||
          c.specialties.some((s) => s.name.toLowerCase().includes(q))
      );
    }

    return list
      .map((cs) => {
        const { access_password, ...sanitized } = cs;
        const group = cs.group_id ? this.state.groups.find((g) => g.id === cs.group_id) : undefined;
        const author = cs.author_id ? this.getLocalProfileById(cs.author_id) : null;
        return {
          ...sanitized,
          author_name: author?.full_name || cs.author_name,
          author_title: author?.title || cs.author_title,
          author_avatar_url: author?.avatar_url || cs.author_avatar_url || (cs.author_name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(cs.author_name)}&background=0d9488&color=fff&bold=true` : undefined),
          author_institution: author?.institution || cs.author_institution,
          group,
          password_protected: Boolean(cs.password_protected),
          is_bookmarked: this.state.bookmarks.some(
            (b) => b.user_id === effectiveUserId && b.item_type === 'case_study' && b.item_id === cs.id
          ),
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async getCaseStudyById(
    id: string,
    isAdmin: boolean = false,
    password?: string,
    bypass: boolean = false,
    currentUserId?: string
  ): Promise<(CaseStudy & { is_locked?: boolean }) | null> {
    if (isSupabaseConfigured) {
      return supabaseDb.getCaseStudyById(id, isAdmin, password, bypass, currentUserId);
    }
    const cs = this.state.case_studies.find((c) => c.id === id);
    if (!cs) return null;
    const effectiveUserId = currentUserId || this.state.current_user_id;

    if (cs.status !== 'published' && !isAdmin && cs.author_id !== effectiveUserId) {
      return null;
    }

    const isAuthor = cs.author_id === effectiveUserId;
    const isShared = Boolean(cs.shared_with_user_ids?.includes(effectiveUserId));

    // If private without password, must be author, shared connection, or admin
    if (cs.is_private && !cs.password_protected && !isAuthor && !isShared && !isAdmin) {
      return null;
    }

    const isProtected = Boolean(cs.password_protected);
    const isUnlocked = !isProtected || (bypass && isAdmin) || (Boolean(password) && password === cs.access_password);

    const { access_password, ...sanitized } = cs;
    const group = cs.group_id ? this.state.groups.find((g) => g.id === cs.group_id) : undefined;
    const author = cs.author_id ? this.getLocalProfileById(cs.author_id) : null;
    const author_name = author?.full_name || cs.author_name;
    const author_title = author?.title || cs.author_title;
    const author_avatar_url =
      author?.avatar_url ||
      cs.author_avatar_url ||
      (author_name
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(author_name)}&background=0d9488&color=fff&bold=true`
        : undefined);
    const author_institution = author?.institution || cs.author_institution;

    if (!isUnlocked) {
      return {
        ...sanitized,
        author_name,
        author_title,
        author_avatar_url,
        author_institution,
        group,
        is_locked: true,
        educational_content: '',
        learning_objectives: [],
        source_references: [],
      };
    }

    return {
      ...sanitized,
      author_name,
      author_title,
      author_avatar_url,
      author_institution,
      group,
      is_locked: false,
    };
  }

  public async verifyCaseStudyPassword(id: string, password: string): Promise<{ valid: boolean; caseStudy?: CaseStudy & { is_locked: boolean }; error?: string }> {
    if (isSupabaseConfigured) {
      return supabaseDb.verifyCaseStudyPassword(id, password);
    }
    const cs = this.state.case_studies.find((c) => c.id === id);
    if (!cs) {
      return { valid: false, error: 'Case study not found' };
    }
    const author = cs.author_id ? this.getLocalProfileById(cs.author_id) : null;
    const author_name = author?.full_name || cs.author_name;
    const author_title = author?.title || cs.author_title;
    const author_avatar_url =
      author?.avatar_url ||
      cs.author_avatar_url ||
      (author_name
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(author_name)}&background=0d9488&color=fff&bold=true`
        : undefined);
    const author_institution = author?.institution || cs.author_institution;

    if (!cs.password_protected) {
      const { access_password, ...sanitized } = cs;
      return {
        valid: true,
        caseStudy: {
          ...sanitized,
          author_name,
          author_title,
          author_avatar_url,
          author_institution,
          is_locked: false,
        },
      };
    }
    if (cs.access_password === password.trim()) {
      const { access_password, ...sanitized } = cs;
      return {
        valid: true,
        caseStudy: {
          ...sanitized,
          author_name,
          author_title,
          author_avatar_url,
          author_institution,
          is_locked: false,
        },
      };
    }
    return { valid: false, error: 'Incorrect access password. Please try again.' };
  }

  public async createCaseStudy(
    payload: {
      title: string;
      short_summary: string;
      educational_content: string;
      learning_objectives: string[];
      source_references: string[];
      specialty_ids: string[];
      author_id?: string;
      status: CaseStudyStatus;
      password_protected?: boolean;
      access_password?: string;
      is_private?: boolean;
      shared_with_user_ids?: string[];
      visibility?: 'everyone' | 'connections' | 'followers' | 'group';
      group_id?: string;
    },
    userId: string,
    isAdmin: boolean = false
  ): Promise<CaseStudy> {
    if (isSupabaseConfigured) {
      return supabaseDb.createCaseStudy(payload, userId);
    }
    const author = (payload.author_id ? this.getLocalProfileById(payload.author_id) : null) || this.getLocalProfileById(userId) || (await this.getCurrentUser());
    const specialties = this.state.specialties.filter((s) => payload.specialty_ids.includes(s.id));
    const group = payload.group_id ? this.state.groups.find((g) => g.id === payload.group_id) : undefined;

    const isPrivate = Boolean(payload.is_private);
    const passwordProtected = Boolean(payload.password_protected) || Boolean(payload.access_password && payload.access_password.trim());

    const newCaseStudy: CaseStudy = {
      id: `case_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: payload.title,
      short_summary: payload.short_summary,
      educational_content: payload.educational_content,
      learning_objectives: payload.learning_objectives,
      source_references: payload.source_references || [],
      author_id: author.id,
      author_name: author.full_name,
      author_title: author.title,
      author_avatar_url:
        author.avatar_url ||
        (author.full_name
          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(author.full_name)}&background=0d9488&color=fff&bold=true`
          : undefined),
      author_institution: author.institution,
      status: payload.status || 'published',
      published_at: payload.status !== 'draft' ? new Date().toISOString() : null,
      views_count: 0,
      bookmarks_count: 0,
      password_protected: passwordProtected,
      access_password: payload.access_password?.trim() || (passwordProtected ? 'clinical2024' : undefined),
      is_private: isPrivate,
      shared_with_user_ids: isPrivate && Array.isArray(payload.shared_with_user_ids) ? payload.shared_with_user_ids : [],
      visibility: isPrivate ? undefined : (payload.visibility || 'everyone'),
      group_id: isPrivate ? undefined : payload.group_id,
      group,
      specialties: specialties.length > 0 ? specialties : [this.state.specialties[0]],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.case_studies.unshift(newCaseStudy);
    this.saveState(this.state);
    const { access_password, ...sanitized } = newCaseStudy;
    return sanitized;
  }

  public async updateCaseStudy(
    id: string,
    updates: Partial<CaseStudy> & { specialty_ids?: string[]; access_password?: string },
    userId: string,
    isAdmin: boolean
  ): Promise<CaseStudy> {
    if (isSupabaseConfigured) {
      return supabaseDb.updateCaseStudy(id, updates, userId, isAdmin);
    }
    const cs = this.state.case_studies.find((c) => c.id === id);
    if (!cs) throw new Error('Case study not found');
    if (!isAdmin && cs.author_id !== userId) {
      throw new Error('Forbidden: You can only edit your own case studies');
    }

    const idx = this.state.case_studies.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Case study not found');

    const existing = this.state.case_studies[idx];
    let updatedSpecialties = existing.specialties;
    if (updates.specialty_ids) {
      updatedSpecialties = this.state.specialties.filter((s) => updates.specialty_ids?.includes(s.id));
    }

    let published_at = existing.published_at;
    if (updates.status === 'published' && existing.status !== 'published') {
      published_at = new Date().toISOString();
    } else if (updates.status === 'draft' || updates.status === 'archived') {
      // keep or clear
    }

    const updated: CaseStudy = {
      ...existing,
      ...updates,
      specialties: updatedSpecialties,
      published_at,
      updated_at: new Date().toISOString(),
    };

    this.state.case_studies[idx] = updated;
    this.saveState(this.state);
    const { access_password, ...sanitized } = updated;
    return sanitized;
  }

  public async deleteCaseStudy(id: string, userId: string, isAdmin: boolean): Promise<boolean> {
    if (isSupabaseConfigured) {
      return supabaseDb.deleteCaseStudy(id, userId, isAdmin);
    }
    if (!isAdmin) {
      throw new Error('Forbidden: Only administrators can delete case studies');
    }
    const idx = this.state.case_studies.findIndex((c) => c.id === id);
    if (idx === -1) return false;

    this.state.case_studies.splice(idx, 1);
    this.saveState(this.state);
    return true;
  }

  // --- Groups / Communities ---
  public async getGroups(currentUserId?: string): Promise<Group[]> {
    if (isSupabaseConfigured) {
      return supabaseDb.getGroups();
    }
    const effectiveUserId = currentUserId || this.state.current_user_id;
    return this.state.groups.map((group) => {
      const specialty = group.specialty_id ? this.state.specialties.find((s) => s.id === group.specialty_id) : undefined;
      const is_member = this.state.group_members.some(
        (gm) => gm.group_id === group.id && gm.user_id === effectiveUserId
      );
      const members_count = this.state.group_members.filter((gm) => gm.group_id === group.id).length + group.members_count;
      return {
        ...group,
        specialty,
        is_member,
        members_count,
      };
    });
  }

  public async getGroupBySlug(slug: string, currentUserId?: string): Promise<Group | null> {
    if (isSupabaseConfigured) {
      return supabaseDb.getGroupBySlug(slug, currentUserId);
    }
    const group = this.state.groups.find((g) => g.slug === slug || g.id === slug);
    if (!group) return null;
    const effectiveUserId = currentUserId || this.state.current_user_id;
    const specialty = group.specialty_id ? this.state.specialties.find((s) => s.id === group.specialty_id) : undefined;
    const is_member = this.state.group_members.some(
      (gm) => gm.group_id === group.id && gm.user_id === effectiveUserId
    );
    const members_count = this.state.group_members.filter((gm) => gm.group_id === group.id).length + group.members_count;
    return {
      ...group,
      specialty,
      is_member,
      members_count,
    };
  }

  public async toggleJoinGroup(groupId: string, userId: string): Promise<{ is_member: boolean; members_count: number }> {
    if (isSupabaseConfigured) {
      const res = await supabaseDb.toggleGroupMembership(groupId, userId);
      return { is_member: res.joined, members_count: res.members_count };
    }
    const group = this.state.groups.find((g) => g.id === groupId);
    if (!group) throw new Error('Group not found');

    const existingIdx = this.state.group_members.findIndex(
      (gm) => gm.group_id === groupId && gm.user_id === userId
    );

    let is_member: boolean;
    if (existingIdx >= 0) {
      this.state.group_members.splice(existingIdx, 1);
      is_member = false;
    } else {
      this.state.group_members.push({
        group_id: groupId,
        user_id: userId,
        role: 'member',
        joined_at: new Date().toISOString(),
      });
      is_member = true;
    }
    this.saveState(this.state);
    const members_count = this.state.group_members.filter((gm) => gm.group_id === groupId).length + group.members_count;
    return { is_member, members_count };
  }

  public async createGroup(payload: {
    name: string;
    description: string;
    specialty_id?: string;
    category?: string;
    avatar_url?: string;
    is_private?: boolean;
  }, creatorId: string): Promise<Group> {
    if (isSupabaseConfigured) {
      return supabaseDb.createGroup(payload, creatorId);
    }
    const slug = payload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `group-${Date.now()}`;

    const newGroup: Group = {
      id: `grp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: payload.name.trim(),
      slug,
      description: payload.description.trim(),
      specialty_id: payload.specialty_id,
      banner_url: payload.avatar_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
      topic_tags: [],
      created_by: creatorId,
      members_count: 1,
      created_at: new Date().toISOString(),
    };

    this.state.groups.push(newGroup);
    this.state.group_members.push({
      group_id: newGroup.id,
      user_id: creatorId,
      role: 'admin',
      joined_at: new Date().toISOString(),
    });

    this.saveState(this.state);
    return newGroup;
  }

  // --- Connections & Follows ---
  public async getConnections(userId: string): Promise<{
    connections: Connection[];
    pendingIncoming: Connection[];
    pendingOutgoing: Connection[];
    pending_sent?: Connection[];
    pending_received?: Connection[];
  }> {
    if (isSupabaseConfigured) {
      const res = await supabaseDb.getConnections(userId);
      return {
        connections: res.connections,
        pendingIncoming: res.pendingIncoming || res.pending_received || [],
        pendingOutgoing: res.pendingOutgoing || res.pending_sent || [],
        pending_sent: res.pending_sent || res.pendingOutgoing || [],
        pending_received: res.pending_received || res.pendingIncoming || [],
      };
    }
    const connections: Connection[] = [];
    const pendingIncoming: Connection[] = [];
    const pendingOutgoing: Connection[] = [];

    for (const c of this.state.connections) {
      const requester = this.getLocalProfileById(c.requester_id) || undefined;
      const recipient = this.getLocalProfileById(c.recipient_id) || undefined;
      const enriched: Connection = { ...c, requester, recipient };

      if (c.status === 'accepted' && (c.requester_id === userId || c.recipient_id === userId)) {
        connections.push(enriched);
      } else if (c.status === 'pending') {
        if (c.recipient_id === userId) {
          pendingIncoming.push(enriched);
        } else if (c.requester_id === userId) {
          pendingOutgoing.push(enriched);
        }
      }
    }

    return {
      connections,
      pendingIncoming,
      pendingOutgoing,
      pending_sent: pendingOutgoing,
      pending_received: pendingIncoming,
    };
  }

  public async sendConnectionRequest(requesterId: string, recipientId: string): Promise<Connection> {
    if (isSupabaseConfigured) {
      return supabaseDb.sendConnectionRequest(requesterId, recipientId);
    }
    if (requesterId === recipientId) {
      throw new Error('Cannot send connection request to yourself');
    }

    const existing = this.state.connections.find(
      (c) =>
        (c.requester_id === requesterId && c.recipient_id === recipientId) ||
        (c.requester_id === recipientId && c.recipient_id === requesterId)
    );

    if (existing) {
      if (existing.status === 'accepted') throw new Error('Already connected');
      if (existing.status === 'pending') throw new Error('Connection request already exists');
      existing.status = 'pending';
      existing.updated_at = new Date().toISOString();
      this.saveState(this.state);
      return existing;
    }

    const newConnection: Connection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      requester_id: requesterId,
      recipient_id: recipientId,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.connections.push(newConnection);

    // Trigger notification to recipient
    const requester = this.enrichProfile(this.state.profiles.find((p) => p.id === requesterId) || this.state.profiles[0]);
    await this.createNotification({
      user_id: recipientId,
      actor_id: requesterId,
      type: 'connection_request',
      message: `${requester?.full_name || 'A clinician'} sent you a connection request.`,
    });

    this.saveState(this.state);
    return newConnection;
  }

  public async updateConnectionStatus(connectionId: string, status: ConnectionStatus, userId: string): Promise<Connection> {
    if (isSupabaseConfigured) {
      return supabaseDb.updateConnectionStatus(connectionId, status, userId);
    }
    const conn = this.state.connections.find((c) => c.id === connectionId);
    if (!conn) throw new Error('Connection not found');

    if (conn.recipient_id !== userId && conn.requester_id !== userId) {
      throw new Error('Unauthorized');
    }

    conn.status = status;
    conn.updated_at = new Date().toISOString();

    if (status === 'accepted') {
      const p1 = this.state.profiles.find((p) => p.id === conn.requester_id);
      const p2 = this.state.profiles.find((p) => p.id === conn.recipient_id);
      if (p1) p1.connections_count = (p1.connections_count || 0) + 1;
      if (p2) p2.connections_count = (p2.connections_count || 0) + 1;

      // Notify the other user that their connection request was accepted
      const targetUserId = conn.requester_id === userId ? conn.recipient_id : conn.requester_id;
      const accepter = this.enrichProfile(this.state.profiles.find((p) => p.id === userId) || this.state.profiles[0]);
      await this.createNotification({
        user_id: targetUserId,
        actor_id: userId,
        type: 'connection_accepted',
        message: `${accepter?.full_name || 'Your peer'} accepted your connection request.`,
      });
    }

    this.saveState(this.state);
    return conn;
  }

  public async removeConnection(connectionId: string, userId: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      return supabaseDb.removeConnection(connectionId, userId);
    }
    const idx = this.state.connections.findIndex((c) => c.id === connectionId);
    if (idx === -1) return false;
    const conn = this.state.connections[idx];

    if (conn.requester_id !== userId && conn.recipient_id !== userId) {
      throw new Error('Unauthorized');
    }

    if (conn.status === 'accepted') {
      const p1 = this.state.profiles.find((p) => p.id === conn.requester_id);
      const p2 = this.state.profiles.find((p) => p.id === conn.recipient_id);
      if (p1 && p1.connections_count) p1.connections_count = Math.max(0, p1.connections_count - 1);
      if (p2 && p2.connections_count) p2.connections_count = Math.max(0, p2.connections_count - 1);
    }

    this.state.connections.splice(idx, 1);
    this.saveState(this.state);
    return true;
  }

  // --- Follows ---
  public async followUser(followerId: string, followingId: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      return supabaseDb.followUser(followerId, followingId);
    }
    if (followerId === followingId) return false;
    if (!this.state.follows) this.state.follows = [];
    const exists = this.state.follows.some(
      (f) => f.follower_id === followerId && f.following_id === followingId
    );
    if (exists) return true;

    this.state.follows.push({
      follower_id: followerId,
      following_id: followingId,
      created_at: new Date().toISOString(),
    });

    const follower = this.enrichProfile(this.state.profiles.find((p) => p.id === followerId) || this.state.profiles[0]);
    await this.createNotification({
      user_id: followingId,
      actor_id: followerId,
      type: 'follow',
      message: `${follower?.full_name || 'A clinician'} started following you.`,
    });

    this.saveState(this.state);
    return true;
  }

  public async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      return supabaseDb.unfollowUser(followerId, followingId);
    }
    if (!this.state.follows) return true;
    this.state.follows = this.state.follows.filter(
      (f) => !(f.follower_id === followerId && f.following_id === followingId)
    );
    this.saveState(this.state);
    return true;
  }

  private isLocalFollowing(followerId?: string, followingId?: string): boolean {
    if (!followerId || !followingId || !this.state.follows) return false;
    return this.state.follows.some(
      (f) => f.follower_id === followerId && f.following_id === followingId
    );
  }

  public async isFollowing(followerId?: string, followingId?: string): Promise<boolean> {
    if (isSupabaseConfigured && followerId && followingId) {
      return supabaseDb.isFollowing(followerId, followingId);
    }
    return this.isLocalFollowing(followerId, followingId);
  }

  public async getFollowStats(userId: string): Promise<{ followersCount: number; followingCount: number }> {
    if (isSupabaseConfigured) {
      const stats = await supabaseDb.getFollowStats(userId);
      return { followersCount: stats.followers_count, followingCount: stats.following_count };
    }
    if (!this.state.follows) return { followersCount: 0, followingCount: 0 };
    const followersCount = this.state.follows.filter((f) => f.following_id === userId).length;
    const followingCount = this.state.follows.filter((f) => f.follower_id === userId).length;
    return { followersCount, followingCount };
  }

  // --- Bookmarks ---
  public async getBookmarks(userId: string): Promise<Bookmark[]> {
    if (isSupabaseConfigured) {
      return supabaseDb.getBookmarks(userId);
    }
    return this.state.bookmarks.filter((b) => b.user_id === userId);
  }

  public async toggleBookmark(payload: {
    user_id: string;
    item_type: 'post' | 'case_study' | 'news' | 'journal';
    item_id: string;
    item_title?: string;
    item_summary?: string;
    item_url?: string;
  }): Promise<{ is_bookmarked: boolean }> {
    if (isSupabaseConfigured) {
      const res = await supabaseDb.toggleBookmark(payload);
      return { is_bookmarked: res.bookmarked };
    }
    const idx = this.state.bookmarks.findIndex(
      (b) => b.user_id === payload.user_id && b.item_type === payload.item_type && b.item_id === payload.item_id
    );

    let is_bookmarked: boolean;
    if (idx >= 0) {
      this.state.bookmarks.splice(idx, 1);
      is_bookmarked = false;
    } else {
      this.state.bookmarks.push({
        id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        user_id: payload.user_id,
        item_type: payload.item_type,
        item_id: payload.item_id,
        item_title: payload.item_title,
        item_summary: payload.item_summary,
        item_url: payload.item_url,
        created_at: new Date().toISOString(),
      });
      is_bookmarked = true;
    }
    this.saveState(this.state);
    return { is_bookmarked };
  }

  // --- AI Sessions ---
  public async getAISessions(userId: string): Promise<AISession[]> {
    if (isSupabaseConfigured) {
      return supabaseDb.getAISessions(userId);
    }
    return this.state.ai_sessions
      .filter((s) => s.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async saveAISession(session: {
    user_id: string;
    title: string;
    source_text: string;
    source_url?: string;
    structured_summary: AISession['structured_summary'];
  }): Promise<AISession> {
    if (isSupabaseConfigured) {
      return supabaseDb.saveAISession(session);
    }
    const newSession: AISession = {
      id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: session.user_id,
      title: session.title,
      source_text: session.source_text,
      source_url: session.source_url,
      structured_summary: session.structured_summary,
      created_at: new Date().toISOString(),
    };
    this.state.ai_sessions.unshift(newSession);
    this.saveState(this.state);
    return newSession;
  }

  // --- Admin Portal Metrics & Management ---
  public async getAdminMetrics(): Promise<AdminMetrics> {
    if (isSupabaseConfigured) {
      return supabaseDb.getAdminMetrics();
    }
    const totalUsers = this.state.profiles.length;
    const totalPosts = this.state.posts.length;
    const totalCaseStudies = this.state.case_studies.length;
    const publishedCaseStudies = this.state.case_studies.filter((c) => c.status === 'published').length;
    const draftCaseStudies = this.state.case_studies.filter((c) => c.status === 'draft').length;
    const archivedCaseStudies = this.state.case_studies.filter((c) => c.status === 'archived').length;
    const totalGroups = this.state.groups.length;
    const pendingReports = this.state.content_reports.filter((r) => r.status === 'pending').length;

    const totalJobs = (this.state.jobs || []).length;
    const activeJobs = (this.state.jobs || []).filter((j) => j.is_active).length;
    const totalAds = (this.state.advertisements || []).length;
    const activeAds = (this.state.advertisements || []).filter((a) => a.is_active).length;

    return {
      totalUsers,
      totalPosts,
      totalCaseStudies,
      publishedCaseStudies,
      draftCaseStudies,
      archivedCaseStudies,
      totalGroups,
      pendingReports,
      totalJobs,
      activeJobs,
      totalAds,
      activeAds,
    };
  }

  public async getReports(): Promise<ContentReport[]> {
    if (isSupabaseConfigured) {
      return supabaseDb.getContentReports();
    }
    return this.state.content_reports.map((r) => ({
      ...r,
      reporter: this.enrichProfile(this.state.profiles.find((p) => p.id === r.reporter_id) || this.state.profiles[0]),
    }));
  }

  public async updateReportStatus(reportId: string, status: 'reviewed' | 'dismissed' | 'action_taken', adminId: string): Promise<ContentReport> {
    if (isSupabaseConfigured) {
      return supabaseDb.updateContentReportStatus(reportId, status, adminId);
    }
    const report = this.state.content_reports.find((r) => r.id === reportId);
    if (!report) throw new Error('Report not found');
    report.status = status;
    report.reviewed_at = new Date().toISOString();
    report.reviewed_by = adminId;
    this.saveState(this.state);
    return report;
  }

  // --- Jobs Management ---
  public async getJobs(options?: { specialty_id?: string; is_active?: boolean; search?: string }): Promise<JobListing[]> {
    if (isSupabaseConfigured) {
      return supabaseDb.getJobs(options);
    }
    let list = this.state.jobs || [];
    if (options?.is_active !== undefined) {
      list = list.filter((j) => j.is_active === options.is_active);
    }
    if (options?.specialty_id) {
      list = list.filter((j) => j.specialty_id === options.specialty_id);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter((j) =>
        j.title.toLowerCase().includes(q) ||
        j.organization.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async getJobById(id: string): Promise<JobListing | null> {
    if (isSupabaseConfigured) {
      return supabaseDb.getJobById(id);
    }
    return (this.state.jobs || []).find((j) => j.id === id) || null;
  }

  public async createJob(payload: Partial<JobListing>): Promise<JobListing> {
    if (isSupabaseConfigured) {
      return supabaseDb.createJob(payload);
    }
    const newJob: JobListing = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: payload.title || 'Untitled Opportunity',
      organization: payload.organization || 'Medical Institution',
      location: payload.location || 'Remote / Hybrid',
      employment_type: payload.employment_type || 'Full-time',
      specialty_id: payload.specialty_id,
      specialty_name: payload.specialty_name,
      salary_range: payload.salary_range,
      description: payload.description || '',
      requirements: payload.requirements || [],
      apply_url: payload.apply_url || 'https://example.com/apply',
      is_active: payload.is_active !== undefined ? payload.is_active : true,
      is_demo: payload.is_demo !== undefined ? payload.is_demo : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (!this.state.jobs) this.state.jobs = [];
    this.state.jobs.unshift(newJob);
    this.saveState(this.state);
    return newJob;
  }

  public async updateJob(id: string, payload: Partial<JobListing>): Promise<JobListing> {
    if (isSupabaseConfigured) {
      return supabaseDb.updateJob(id, payload);
    }
    const job = (this.state.jobs || []).find((j) => j.id === id);
    if (!job) throw new Error('Job listing not found');
    Object.assign(job, payload, { updated_at: new Date().toISOString() });
    this.saveState(this.state);
    return job;
  }

  public async deleteJob(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      return supabaseDb.deleteJob(id);
    }
    const beforeLen = (this.state.jobs || []).length;
    this.state.jobs = (this.state.jobs || []).filter((j) => j.id !== id);
    if (this.state.jobs.length !== beforeLen) {
      this.saveState(this.state);
      return true;
    }
    return false;
  }

  // --- Advertisements Management ---
  public async getAdvertisements(options?: { specialty_id?: string; is_active?: boolean; search?: string }): Promise<Advertisement[]> {
    if (isSupabaseConfigured) {
      return supabaseDb.getAdvertisements(options);
    }
    let list = this.state.advertisements || [];
    if (options?.is_active !== undefined) {
      list = list.filter((a) => a.is_active === options.is_active);
    }
    if (options?.specialty_id) {
      list = list.filter((a) => a.specialty_id === options.specialty_id);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter((a) =>
        a.title.toLowerCase().includes(q) ||
        a.sponsor.toLowerCase().includes(q) ||
        a.headline.toLowerCase().includes(q) ||
        a.body_text.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async getAdvertisementById(id: string): Promise<Advertisement | null> {
    if (isSupabaseConfigured) {
      return supabaseDb.getAdvertisementById(id);
    }
    return (this.state.advertisements || []).find((a) => a.id === id) || null;
  }

  public async createAdvertisement(payload: Partial<Advertisement>): Promise<Advertisement> {
    if (isSupabaseConfigured) {
      return supabaseDb.createAdvertisement(payload);
    }
    const newAd: Advertisement = {
      id: `ad_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: payload.title || 'Featured Educational Program',
      sponsor: payload.sponsor || 'Clinical Sponsor',
      headline: payload.headline || '',
      body_text: payload.body_text || '',
      image_url: payload.image_url,
      target_url: payload.target_url || 'https://example.com',
      cta_text: payload.cta_text || 'Learn More (Demo)',
      specialty_id: payload.specialty_id,
      specialty_name: payload.specialty_name,
      is_active: payload.is_active !== undefined ? payload.is_active : true,
      is_demo: payload.is_demo !== undefined ? payload.is_demo : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (!this.state.advertisements) this.state.advertisements = [];
    this.state.advertisements.unshift(newAd);
    this.saveState(this.state);
    return newAd;
  }

  public async updateAdvertisement(id: string, payload: Partial<Advertisement>): Promise<Advertisement> {
    if (isSupabaseConfigured) {
      return supabaseDb.updateAdvertisement(id, payload);
    }
    const ad = (this.state.advertisements || []).find((a) => a.id === id);
    if (!ad) throw new Error('Advertisement not found');
    Object.assign(ad, payload, { updated_at: new Date().toISOString() });
    this.saveState(this.state);
    return ad;
  }

  public async deleteAdvertisement(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      return supabaseDb.deleteAdvertisement(id);
    }
    const beforeLen = (this.state.advertisements || []).length;
    this.state.advertisements = (this.state.advertisements || []).filter((a) => a.id !== id);
    if (this.state.advertisements.length !== beforeLen) {
      this.saveState(this.state);
      return true;
    }
    return false;
  }

  // --- Notifications Management ---
  public async createNotification(payload: {
    user_id: string;
    actor_id: string;
    type: Notification['type'];
    item_id?: string;
    item_title?: string;
    message: string;
  }): Promise<Notification | null> {
    if (isSupabaseConfigured) {
      return supabaseDb.createNotification(payload);
    }
    if (payload.user_id === payload.actor_id) return null;
    if (!this.state.notifications) this.state.notifications = [];

    const newNotif: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: payload.user_id,
      actor_id: payload.actor_id,
      type: payload.type,
      item_id: payload.item_id,
      item_title: payload.item_title,
      message: payload.message,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    this.state.notifications.unshift(newNotif);
    this.saveState(this.state);
    return newNotif;
  }

  public async getNotifications(userId: string): Promise<{ notifications: Notification[]; unread_count: number }> {
    if (isSupabaseConfigured) {
      return supabaseDb.getNotifications(userId);
    }
    const list = (this.state.notifications || [])
      .filter((n) => n.user_id === userId)
      .map((n) => ({
        ...n,
        actor: this.enrichProfile(this.state.profiles.find((p) => p.id === n.actor_id) || this.state.profiles[0]),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const unread_count = list.filter((n) => !n.is_read).length;
    return { notifications: list, unread_count };
  }

  public async markNotificationRead(notificationId: string, userId: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      return supabaseDb.markNotificationRead(notificationId, userId);
    }
    const notif = (this.state.notifications || []).find((n) => n.id === notificationId && n.user_id === userId);
    if (!notif) return false;
    notif.is_read = true;
    this.saveState(this.state);
    return true;
  }

  public async markAllNotificationsRead(userId: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      return supabaseDb.markAllNotificationsRead(userId);
    }
    let updated = false;
    for (const n of this.state.notifications || []) {
      if (n.user_id === userId && !n.is_read) {
        n.is_read = true;
        updated = true;
      }
    }
    if (updated) this.saveState(this.state);
    return true;
  }
}

export const serverDb = ServerDatabase.getInstance();
