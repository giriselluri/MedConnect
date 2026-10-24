import http from 'http';

// We can start the Next.js standalone or run server
const BASE_URL = 'http://127.0.0.1:3000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('=== MedConnect AI — End-to-End Test Suite ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Ensure starting as Dr. Sarah Jenkins (Admin)
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000001' }),
    });

    // 1. Session & Profiles
    console.log('\n--- 1. Testing Session & Personas ---');
    const sessionRes = await request('/api/auth/session');
    assert(sessionRes.ok, 'Session API returns 200 OK');
    assert(sessionRes.data.user.full_name.includes('Dr. Sarah Jenkins'), 'Initial user is Dr. Sarah Jenkins (Admin)');
    assert(sessionRes.data.allProfiles.length >= 10, `Loaded ${sessionRes.data.allProfiles.length} seeded healthcare personas`);

    // 2. Specialty Catalogue
    console.log('\n--- 2. Testing Controlled Specialty Catalogue ---');
    const specRes = await request('/api/specialties');
    assert(specRes.ok && specRes.data.specialties.length >= 15, `Loaded ${specRes.data.specialties.length} canonical medical specialties`);
    const hasCardiology = specRes.data.specialties.some((s) => s.id === 'cardiology');
    assert(hasCardiology, 'Cardiology specialty present in controlled catalogue');

    // 3. Social Feed (Create Post, Like, Comment)
    console.log('\n--- 3. Testing Social Feed & Peer Interactions ---');
    const postsBefore = await request('/api/posts');
    const initialPostCount = postsBefore.data.posts.length;

    const createPostRes = await request('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'E2E Test: Observing high diagnostic sensitivity of point-of-care cardiac ultrasound in acute decompensated shock.',
        specialty_id: 'cardiology',
        topic_tags: ['POCUS', 'Hemodynamics'],
      }),
    });
    assert(createPostRes.status === 201, 'Post created successfully (201 Created)');
    const createdPostId = createPostRes.data.post.id;

    // Like the post
    const likeRes = await request(`/api/posts/${createdPostId}/like`, { method: 'POST' });
    assert(likeRes.ok && likeRes.data.is_liked === true, 'Endorsed (liked) post successfully');

    // Add comment
    const commentRes = await request(`/api/posts/${createdPostId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Excellent clinical point. Bedside correlation is key.' }),
    });
    assert(commentRes.status === 201, 'Added clinical comment to post');

    // Delete post cleanup
    const deletePostRes = await request(`/api/posts/${createdPostId}`, { method: 'DELETE' });
    assert(deletePostRes.ok, 'Deleted test post successfully');

    // 4. Critical Section 8 Acceptance Test: Case Study Lifecycle
    console.log('\n--- 4. MANDATORY ACCEPTANCE TEST: Case Study Lifecycle ---');
    // Step 1: Switch to Admin (Sarah Jenkins)
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000001' }),
    });

    // Step 2 & 3: Admin creates case study titled "Illustrative Cardiology Case Study" with Cardiology tag and publishes
    const createCaseRes = await request('/api/case-studies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Illustrative Cardiology Case Study',
        short_summary: 'Evaluation of complex coronary revascularization and hemodynamic assessment in cardiogenic shock.',
        educational_content: '### Clinical Presentation\nA 71-year-old patient presents with substernal chest discomfort.\n\n### Diagnostic Evaluation\n- Troponin: 4.2 ng/mL\n- ECG: ST elevation in V2-V4\n\n### Management & Clinical Decision-Making\nPrimary PCI of the proximal LAD was executed with IVUS confirmation.\n\n### Outcome & Teaching Pearls\nSuccessful recovery and restoration of TIMI 3 flow.',
        learning_objectives: ['Analyze hemodynamics in acute MI', 'Evaluate intravascular ultrasound stent expansion criteria'],
        source_references: ['ACC/AHA PCI Guidelines 2024'],
        specialty_ids: ['cardiology'],
        status: 'published',
      }),
    });
    assert(createCaseRes.status === 201, 'Admin created "Illustrative Cardiology Case Study" tagged with Cardiology (201 Created)');
    const caseStudyId = createCaseRes.data.caseStudy.id;

    // Step 4: Switch to a normal non-admin user (Dr. Marcus Chen)
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000002' }),
    });

    // Step 5 & 6: Normal user queries case studies filtered by Cardiology
    const publicCaseRes = await request('/api/case-studies?specialty=cardiology');
    assert(publicCaseRes.ok, 'Normal user fetched Cardiology case studies');

    // Step 7: New case study appears in results
    const foundNewCase = publicCaseRes.data.caseStudies.some(
      (c) => c.title === 'Illustrative Cardiology Case Study'
    );
    assert(foundNewCase, 'ACCEPTANCE TEST STEP 7: "Illustrative Cardiology Case Study" appears in public Cardiology filter results!');

    // Step 8: User opens it and sees correct content
    const detailRes = await request(`/api/case-studies/${caseStudyId}`);
    assert(detailRes.ok, 'ACCEPTANCE TEST STEP 8: Normal user can open full published case study');
    assert(
      detailRes.data.caseStudy.title === 'Illustrative Cardiology Case Study' &&
      detailRes.data.caseStudy.specialties.some((s) => s.id === 'cardiology'),
      'Published content and Cardiology specialty tag verified in detail view'
    );

    // Step 9: Draft and archived case studies MUST NOT appear in normal user results
    const publicAllRes = await request('/api/case-studies');
    const hasDraftInPublic = publicAllRes.data.caseStudies.some(
      (c) => c.status === 'draft' || c.status === 'archived'
    );
    assert(!hasDraftInPublic, 'ACCEPTANCE TEST STEP 9: Drafts and archived case studies are strictly excluded from public results!');

    // Step 10: Non-admin user can create a case study (public and private with connections)
    console.log('\n--- Testing User-Created Public & Private Case Studies ---');
    const userCreatedCaseRes = await request('/api/case-studies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Marcus Chen Clinical Case: Transcatheter Mitral Repair',
        short_summary: 'Edge-to-edge transcatheter mitral valve repair in severe degenerative mitral regurgitation.',
        educational_content: 'Transesophageal echocardiography (TEE) guidance and grasping protocol...',
        learning_objectives: ['Analyze transmitral gradients', 'Evaluate leaflet coaptation'],
        source_references: ['JACC Cardiovascular Interventions 2024'],
        specialty_ids: ['cardiology'],
        status: 'published',
        is_private: true,
        shared_with_user_ids: ['00000000-0000-0000-0000-000000000001'], // Shared with Dr. Sarah Jenkins
      }),
    });
    assert(userCreatedCaseRes.status === 201, 'Non-admin user can create a private case study shared with connections (201 Created)');
    const marcusCaseId = userCreatedCaseRes.data.caseStudy.id;

    // Dr. Marcus Chen (author) can open and view it
    const authorViewRes = await request(`/api/case-studies/${marcusCaseId}`);
    assert(authorViewRes.ok && authorViewRes.data.caseStudy.educational_content.includes('Transesophageal echocardiography'), 'Author can view their created private case study');

    // Switch to Sarah Jenkins (the shared connection)
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000001' }),
    });
    const sharedViewRes = await request(`/api/case-studies/${marcusCaseId}`);
    assert(sharedViewRes.ok, 'Shared connection can access the private case study');

    // Also test non-admin user creating a public case study with community/group audience
    const userPublicCaseRes = await request('/api/case-studies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Community Cardiology Case: Refractory Ventricular Tachycardia Storm',
        short_summary: 'Catheter ablation vs sympathetic blockade in refractory VT storm.',
        educational_content: 'Substrate mapping and endocardial-epicardial radiofrequency ablation.',
        learning_objectives: ['Identify VT storm exit sites', 'Review stellate ganglion block indications'],
        specialty_ids: ['cardiology'],
        status: 'published',
        is_private: false,
        visibility: 'group',
        group_id: '10000000-0000-0000-0000-000000000001',
      }),
    });
    assert(userPublicCaseRes.status === 201, 'User can create a public case study for a specific community/group');

    // 5. Communities & Groups
    console.log('\n--- 5. Testing Communities & Groups ---');
    const groupsRes = await request('/api/groups');
    assert(groupsRes.ok && groupsRes.data.groups.length >= 6, `Loaded ${groupsRes.data.groups.length} active communities`);
    const testGroup = groupsRes.data.groups[0];
    const joinRes = await request(`/api/groups/${testGroup.slug}/join`, { method: 'POST' });
    assert(joinRes.ok, `Joined/toggled community: ${testGroup.name}`);

    // 6. Professional Networking
    console.log('\n--- 6. Testing Networking & Connections ---');
    const connList = await request('/api/connections');
    assert(connList.ok, 'Connections API returns 200 OK');

    // 7. AI Research Assistant
    console.log('\n--- 7. Testing AI Research Assistant ---');
    const aiRes = await request('/api/ai/research-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'TAVR vs SAVR in Bicuspid Stenosis',
        text: 'Background: Bicuspid aortic valve anatomy presents unique challenges in transcatheter replacement. Methods: In an international cohort of 540 patients, we compared 1-year hemodynamic gradients and paravalvular regurgitation. Results: 30-day mortality was 1.2% in TAVR vs 1.4% in SAVR (p=0.82). Mean transvalvular gradient dropped from 44 mmHg to 9.2 mmHg. Conclusions: TAVR achieved non-inferior clinical outcomes at 1 year in intermediate-risk bicuspid anatomy.',
      }),
    });
    assert(aiRes.ok, 'AI Research Assistant returned 200 OK');
    assert(Boolean(aiRes.data.summary.plain_language_summary), 'Summary includes plain language synthesis');
    assert(Boolean(aiRes.data.summary.methodology), 'Summary includes extracted methodology');
    assert(aiRes.data.summary.key_findings.length > 0, 'Summary includes structured key findings');
    assert(aiRes.data.summary.discussion_questions.length > 0, 'Summary includes discussion prompts for rounds');

    // 8. Admin Metrics & Privileges
    console.log('\n--- 8. Testing Admin Metrics & Role Security ---');
    // As normal user, metrics should be forbidden
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000002' }),
    });
    const normalUserMetrics = await request('/api/admin/metrics');
    assert(normalUserMetrics.status === 403, 'Non-admin blocked from admin metrics (403 Forbidden)');

    // Switch back to Admin
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000001' }),
    });

    const adminMetrics = await request('/api/admin/metrics');
    assert(adminMetrics.ok, 'Admin successfully accesses admin metrics (200 OK)');
    assert(adminMetrics.data.metrics.totalUsers >= 10, 'Metrics reports 10+ registered professionals');
    assert(adminMetrics.data.metrics.publishedCaseStudies >= 7, 'Metrics reports published case studies count');

    // 9. Admin Profile DP Verification
    console.log('\n--- 9. Testing Admin DP Photo Verification ---');
    const adminProfileRes = await request('/api/profiles/00000000-0000-0000-0000-000000000001');
    assert(adminProfileRes.ok, 'Fetched Dr. Sarah Jenkins admin profile');
    assert(
      adminProfileRes.data.profile.avatar_url &&
      adminProfileRes.data.profile.avatar_url.includes('photo-1551601651-2a8555f1a136') &&
      !adminProfileRes.data.profile.avatar_url.includes('photo-1594824813629-4d6f43694f4c'),
      'Admin default DP updated to valid verified doctor photo (photo-1551601651-2a8555f1a136)'
    );

    // 10. Private Case Study Password Prompt & Gate Acceptance Test
    console.log('\n--- 10. Testing Private Case Study Password Prompt & Unlock ---');
    // Admin creates a private case study with password protection
    const createPrivateRes = await request('/api/case-studies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Confidential Neurosurgical Case: Giant Basilar Aneurysm',
        short_summary: 'Surgical clip ligation and endovascular flow diversion in complex cerebrovascular anatomy.',
        educational_content: 'Detailed operative surgical technique and intraoperative neuro-monitoring signals.',
        learning_objectives: ['Review skull base approaches', 'Evaluate flow diversion vs clipping'],
        source_references: ['Journal of Neurosurgery 2024'],
        specialty_ids: ['neurology'],
        status: 'published',
        password_protected: true,
        access_password: 'clinical2024',
      }),
    });
    assert(createPrivateRes.status === 201, 'Created password-protected private case study');
    const privateCaseId = createPrivateRes.data.caseStudy.id;

    // Opening private case study without password MUST be locked
    const lockedFetchRes = await request(`/api/case-studies/${privateCaseId}`);
    assert(lockedFetchRes.ok, 'Fetched private case study record');
    assert(lockedFetchRes.data.caseStudy.is_locked === true, 'Private case study is locked without password');
    assert(lockedFetchRes.data.caseStudy.educational_content === '', 'Educational clinical content is protected and hidden');

    // Attempting wrong password
    const wrongPassRes = await request(`/api/case-studies/${privateCaseId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrong-passcode' }),
    });
    assert(wrongPassRes.status === 401, 'Incorrect password rejected with 401 Unauthorized');

    // Entering correct password
    const unlockRes = await request(`/api/case-studies/${privateCaseId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'clinical2024' }),
    });
    assert(unlockRes.ok && unlockRes.data.success === true, 'Unlocked private case study with valid password');
    assert(unlockRes.data.caseStudy.is_locked === false, 'is_locked flag becomes false after unlocking');
    assert(unlockRes.data.caseStudy.educational_content.includes('Detailed operative surgical technique'), 'Full educational content revealed after unlocking');

    // 11. Auth Login Acceptance Test
    console.log('\n--- 11. Testing Login API & Persona Switching ---');
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'marcus.chen@medconnect.local', password: 'clinical2024' }),
    });
    assert(loginRes.ok && loginRes.data.success === true, 'Logged in with doctor email (Dr. Marcus Chen)');
    assert(loginRes.data.user.full_name === 'Dr. Marcus Chen, MD, FACC', 'Session switched to Dr. Marcus Chen');

    const invalidLoginRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent.user@hospital.com' }),
    });
    assert(invalidLoginRes.status === 404, 'Non-existent email returns 404 with helpful guidance');

    // 12. Auth Signup Acceptance Test
    console.log('\n--- 12. Testing Signup API & Onboarding ---');
    const testEmail = `dr.newuser.${Date.now()}@universityhospital.edu`;
    const signupRes = await request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Dr. Evelyn Reed, MD, PhD',
        email: testEmail,
        role: 'healthcare_professional',
        title: 'Attending Pediatric Cardiologist',
        institution: 'Boston Children’s Hospital',
        location: 'Boston, MA',
        specialty_ids: ['cardiology'],
        bio: 'Focused on congenital heart defects and pediatric echocardiography.',
        years_of_experience: 8,
      }),
    });
    assert(signupRes.status === 201, 'New doctor registered successfully (201 Created)');
    assert(signupRes.data.user.full_name === 'Dr. Evelyn Reed, MD, PhD', 'Profile contains registered clinical credentials');
    assert(signupRes.data.user.email === testEmail, 'Email assigned correctly');
    assert(signupRes.data.user.role === 'healthcare_professional', 'Healthcare professional role assigned and persisted');

    // Test registering remaining 5 professional categories
    const pharmaEmail = `pharma.${Date.now()}@biopharma.com`;
    const pharmaRes = await request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Dr. Michael Chang, PharmD',
        email: pharmaEmail,
        role: 'pharmaceutical_professional',
        title: 'Director of Medical Affairs',
        institution: 'NovaPharma Life Sciences',
        location: 'Philadelphia, PA',
        specialty_ids: ['oncology'],
      }),
    });
    assert(pharmaRes.status === 201 && pharmaRes.data.user.role === 'pharmaceutical_professional', 'Pharmaceutical Professional registered with correct role');

    const alliedEmail = `allied.${Date.now()}@clinic.org`;
    const alliedRes = await request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Sarah Connor, MSN, APRN, FNP-C',
        email: alliedEmail,
        role: 'other_healthcare_professional',
        title: 'Family Nurse Practitioner',
        institution: 'Metropolitan Community Health',
        location: 'Denver, CO',
        specialty_ids: ['internal_medicine'],
      }),
    });
    assert(alliedRes.status === 201 && alliedRes.data.user.role === 'other_healthcare_professional', 'Other Healthcare Professional registered with correct role');

    const studentEmail = `student.${Date.now()}@medschool.edu`;
    const studentRes = await request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'David Kim, BS',
        email: studentEmail,
        role: 'medical_student',
        title: 'MS-3 Medical Student',
        institution: 'Stanford School of Medicine',
        location: 'Palo Alto, CA',
        specialty_ids: ['neurology'],
      }),
    });
    assert(studentRes.status === 201 && studentRes.data.user.role === 'medical_student', 'Medical Student registered with correct role');

    const researcherEmail = `researcher.${Date.now()}@genomics.org`;
    const researcherRes = await request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Dr. Laura Martinez, PhD',
        email: researcherEmail,
        role: 'researcher',
        title: 'Principal Investigator',
        institution: 'National Genome Center',
        location: 'Bethesda, MD',
        bio: 'Functional genomics and computational variant analysis.',
      }),
    });
    assert(researcherRes.status === 201 && researcherRes.data.user.role === 'researcher', 'Clinical Researcher registered with correct role');

    // Duplicate email registration should fail
    const dupSignupRes = await request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Dr. Duplicate User',
        email: testEmail,
        role: 'healthcare_professional',
        title: 'Physician',
      }),
    });
    assert(dupSignupRes.status === 400, 'Duplicate email registration rejected (400 Bad Request)');

    // 13. Jobs API & Admin Management
    console.log('\n--- 13. Testing Jobs API & Admin Management ---');
    // Ensure admin user
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000001' }),
    });

    const createJobRes = await request('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Attending Interventional Cardiologist',
        organization: 'Seattle Children’s Heart Center',
        location: 'Seattle, WA',
        job_type: 'Full-Time',
        specialty_id: 'cardiology',
        description: 'Seeking board-certified cardiologist with expertise in structural interventions.',
        application_url: 'https://careers.seattlechildrens.org',
        is_active: true,
      }),
    });
    assert(createJobRes.status === 201, 'Admin created new job listing (201 Created)');
    const createdJobId = createJobRes.data.job.id;

    // Normal user queries jobs
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000002' }),
    });
    const publicJobsRes = await request('/api/jobs');
    assert(publicJobsRes.ok, 'Public jobs endpoint returns 200 OK');
    const jobFound = publicJobsRes.data.jobs.some((j) => j.id === createdJobId);
    assert(jobFound, 'Newly created job listing appears in public listings');

    // Admin updates and deactivates job
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000001' }),
    });
    const updateJobRes = await request(`/api/jobs/${createdJobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: false }),
    });
    assert(updateJobRes.ok && updateJobRes.data.job.is_active === false, 'Admin deactivated job listing');

    // Admin deletes test job
    const deleteJobRes = await request(`/api/jobs/${createdJobId}`, { method: 'DELETE' });
    assert(deleteJobRes.ok, 'Admin successfully deleted test job listing');

    // 14. Advertisements API & Admin Management
    console.log('\n--- 14. Testing Advertisements API & Admin Management ---');
    const createAdRes = await request('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Global Cardiovascular Therapeutics Summit 2026',
        advertiser_name: 'American College of Cardiology Foundation',
        headline: 'Early-Bird Registration Open for CME Accredited Transcatheter Workshops',
        body_text: 'Join 4,000+ clinical specialists in Chicago or virtually for live case transmissions.',
        destination_url: 'https://acc26.org/symposium',
        format: 'banner',
        placement: 'feed',
        specialty_id: 'cardiology',
        is_active: true,
      }),
    });
    assert(createAdRes.status === 201, 'Admin created sponsored advertisement notice (201 Created)');
    const createdAdId = createAdRes.data.ad?.id || createAdRes.data.advertisement?.id;

    const publicAdsRes = await request('/api/ads');
    assert(publicAdsRes.ok, 'Public ads endpoint returns 200 OK');
    const adFound = (publicAdsRes.data.ads || publicAdsRes.data.advertisements || []).some((a) => a.id === createdAdId);
    assert(adFound, 'New advertisement appears in public listings');

    // Delete test ad
    const deleteAdRes = await request(`/api/ads/${createdAdId}`, { method: 'DELETE' });
    assert(deleteAdRes.ok, 'Admin successfully deleted test advertisement');

    // 15. Follow / Unfollow System
    console.log('\n--- 15. Testing Follow / Unfollow System ---');
    // Switch to Dr. Marcus Chen
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000002' }),
    });

    const targetDocId = '00000000-0000-0000-0000-000000000003'; // Dr. Elena Rostova
    // Follow
    const followRes = await request(`/api/profiles/${targetDocId}/follow`, { method: 'POST' });
    assert(followRes.ok && followRes.data.is_following === true, 'Dr. Marcus Chen followed Dr. Elena Rostova');

    // Check status
    const statusRes = await request(`/api/profiles/${targetDocId}/follow`);
    assert(statusRes.ok && statusRes.data.is_following === true, 'Follow status query confirms active following');

    // Unfollow
    const unfollowRes = await request(`/api/profiles/${targetDocId}/follow`, { method: 'POST' });
    assert(unfollowRes.ok && unfollowRes.data.is_following === false, 'Dr. Marcus Chen successfully unfollowed Dr. Elena Rostova');

    // 16. Reposting with Attribution
    console.log('\n--- 16. Testing Reposting with Original Author Attribution ---');
    // Create base post as Dr. Marcus Chen
    const basePostRes = await request('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Original clinical insight: New trial data on GLP-1 receptor agonist cardioprotection.',
        specialty_id: 'cardiology',
      }),
    });
    assert(basePostRes.status === 201, 'Created original post for repost test');
    const basePostId = basePostRes.data.post.id;

    // Switch to Dr. Sarah Jenkins to repost
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000001' }),
    });

    const repostRes = await request(`/api/posts/${basePostId}/repost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quote_comment: 'Agree with Dr. Chen. Highly relevant for metabolic cardiology rounds.',
      }),
    });
    assert(repostRes.status === 201, 'Repost created with quote comment (201 Created)');
    assert(repostRes.data.post.repost_of_id === basePostId, 'Repost references correct original post ID');
    assert(repostRes.data.post.repost_of?.author?.full_name?.includes('Marcus Chen'), 'Repost includes original author attribution');

    // 17. Comment Edit & Delete Functionality
    console.log('\n--- 17. Testing Comment Edit and Delete with Ownership Checks ---');
    const testCommentRes = await request(`/api/posts/${basePostId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Initial draft comment.' }),
    });
    assert(testCommentRes.status === 201, 'Created initial comment');
    const commentId = testCommentRes.data.comment.id;

    // Edit comment
    const editCommentRes = await request(`/api/posts/${basePostId}/comments`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comment_id: commentId,
        content: 'Revised and polished clinical comment with expanded evidence references.',
      }),
    });
    assert(editCommentRes.ok && editCommentRes.data.comment.content.includes('Revised'), 'Comment edited successfully with updated content');

    // Delete comment
    const deleteCommentRes = await request(`/api/posts/${basePostId}/comments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment_id: commentId }),
    });
    assert(deleteCommentRes.ok && deleteCommentRes.data.success === true, 'Comment deleted successfully');

    // Clean up base post
    await request(`/api/posts/${basePostId}`, { method: 'DELETE' });

    // 18. Notifications System
    console.log('\n--- 18. Testing Notifications System ---');
    const notifsRes = await request('/api/notifications');
    assert(notifsRes.ok, 'Notifications endpoint returned 200 OK');
    assert(Array.isArray(notifsRes.data.notifications), 'Notifications returned as an array');
    assert(typeof notifsRes.data.unread_count === 'number', 'Unread count returned as numeric badge');

    // Mark all as read
    const markReadRes = await request('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mark_all: true }),
    });
    const afterNotifsRes = await request('/api/notifications');
    assert(
      markReadRes.ok && (markReadRes.data?.unread_count === 0 || afterNotifsRes.data?.unread_count === 0),
      'Marked all notifications as read (unread count = 0)'
    );

    // 19. Community Creation
    console.log('\n--- 19. Testing Specialty Community Creation ---');
    const createGroupRes = await request('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Pediatric Cardiac Critical Care Network',
        description: 'Collaborative peer forum for post-operative congenital heart surgery ICU management.',
        specialty_id: 'pediatrics',
      }),
    });
    assert(createGroupRes.status === 201, 'Created new specialty community (201 Created)');
    assert(createGroupRes.data.group.name === 'Pediatric Cardiac Critical Care Network', 'Community name matches input');

    // 20. AI Assistant Model Metadata & Rate Limiting Headers
    console.log('\n--- 20. Testing AI Assistant Model Metadata & Rate Limiting ---');
    const aiSummaryRes = await request('/api/ai/research-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Trial of Sodium-Glucose Cotransporter 2 Inhibitors in HFpEF',
        text: 'Background: In patients with heart failure with preserved ejection fraction, the effects of empagliflozin on major outcomes remain uncertain. Methods: We randomly assigned 5,988 patients with class II-IV heart failure to empagliflozin or placebo.',
      }),
    });
    assert(aiSummaryRes.ok, 'AI Assistant endpoint responded 200 OK');
    assert(
      aiSummaryRes.data.summary.model_used === 'gemini-1.5-flash' ||
      aiSummaryRes.data.summary.model_used === 'clinical-heuristic-fallback',
      `Synthesis engine model metadata verified: "${aiSummaryRes.data.summary.model_used}"`
    );

    // 21. Registered User Isolation & Admin Option Shielding
    console.log('\n--- 21. Testing Registered User Isolation & Admin Option Shielding ---');
    const signupTestRes = await request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Dr. Jane Registered Clinician',
        email: `jane.registered.${Date.now()}@hospital.org`,
        role: 'healthcare_professional',
        title: 'Attending Neurologist',
        institution: 'Metro General Hospital',
        location: 'Seattle, WA',
        specialty_ids: ['neurology'],
        years_of_experience: 7,
      }),
    });
    assert(signupTestRes.status === 201, 'Registered new clinician via signup (201 Created)');
    const newRegUser = signupTestRes.data.user;
    assert(newRegUser.is_admin === false, 'Newly registered user has is_admin strictly false');
    assert(newRegUser.is_demo === false, 'Newly registered user has is_demo strictly false');

    // Switch active session to this newly registered user
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: newRegUser.id }),
    });

    const regSessionRes = await request('/api/auth/session');
    assert(regSessionRes.ok, 'Session API returns 200 OK for registered user');
    assert(regSessionRes.data.user.id === newRegUser.id, 'Session user is the registered user');
    assert(regSessionRes.data.isDemo === false, 'Session isDemo flag is false for registered user');
    assert(
      regSessionRes.data.allProfiles.length === 1 && regSessionRes.data.allProfiles[0].id === newRegUser.id,
      'Registered user receives ONLY their own profile (all other profiles & admin credentials hidden)'
    );

    // Reset back to Dr. Sarah Jenkins (Demo Admin)
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000001' }),
    });

    const demoSessionRes = await request('/api/auth/session');
    assert(demoSessionRes.data.isDemo === true, 'Switched back to demo admin: isDemo is true');
    assert(demoSessionRes.data.allProfiles.length >= 10, 'Demo users can view all seeded personas');

    // 22. Testing Exit & Logout Session Invalidation
    console.log('\n--- 22. Testing Exit & Logout Session Invalidation ---');
    const logoutRes = await request('/api/auth/logout', { method: 'POST' });
    assert(logoutRes.ok, 'Logout API returns 200 OK');
    assert(logoutRes.data.success === true, 'Logout API reports success: true');

    // 23. Testing Case Study Author Attribution, Personalised Feed, and New User Feed Isolation
    console.log('\n--- 23. Testing Case Study Author, Personalised Feed & Feed Isolation ---');
    // Step A: Register Dr. Alice (Cardiologist)
    const aliceSignup = await request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Dr. Alice Cardiologist',
        email: `alice.cardio.${Date.now()}@clinic.org`,
        role: 'healthcare_professional',
        title: 'Attending Cardiologist',
        institution: 'Heart & Vascular Institute',
        location: 'Boston, MA',
        specialty_ids: ['cardiology'],
        years_of_experience: 10,
      }),
    });
    assert(aliceSignup.status === 201, 'Registered Dr. Alice (Cardiologist)');
    const aliceUser = aliceSignup.data.user;

    // Step B: Register Dr. Bob (Neurologist)
    const bobSignup = await request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Dr. Bob Neurologist',
        email: `bob.neuro.${Date.now()}@clinic.org`,
        role: 'healthcare_professional',
        title: 'Attending Neurologist',
        institution: 'Brain Health Center',
        location: 'Chicago, IL',
        specialty_ids: ['neurology'],
        years_of_experience: 8,
      }),
    });
    assert(bobSignup.status === 201, 'Registered Dr. Bob (Neurologist)');
    const bobUser = bobSignup.data.user;

    // Step C: Register Dr. Charlie (Cardiologist)
    const charlieSignup = await request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Dr. Charlie Cardiologist',
        email: `charlie.cardio.${Date.now()}@clinic.org`,
        role: 'healthcare_professional',
        title: 'Cardiology Fellow',
        institution: 'Academic Medical Center',
        location: 'New York, NY',
        specialty_ids: ['cardiology'],
        years_of_experience: 3,
      }),
    });
    assert(charlieSignup.status === 201, 'Registered Dr. Charlie (Cardiologist)');
    const charlieUser = charlieSignup.data.user;

    // Step D: Verify Alice creates a case study & author details match Alice perfectly
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: aliceUser.id }),
    });

    const aliceCaseRes = await request('/api/case-studies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Acute Aortic Dissection Type A in a Normotensive Triathlete',
        short_summary: 'Unusual presentation of acute Stanford Type A dissection following intense endurance exertion.',
        educational_content: 'Clinical Presentation: 38-year-old male presents with sharp interscapular pain after a marathon.',
        learning_objectives: ['Recognize atypical aortic dissection', 'Evaluate urgent TTE/CT findings'],
        specialty_ids: ['cardiology'],
        status: 'published',
      }),
    });
    assert(aliceCaseRes.status === 201, 'Alice created Cardiology Case Study (201 Created)');
    const aliceCase = aliceCaseRes.data.caseStudy;
    assert(aliceCase.author_id === aliceUser.id, 'Case study author_id matches Alice exactly');
    assert(aliceCase.author_name === 'Dr. Alice Cardiologist', 'Case study author_name is Dr. Alice Cardiologist');
    assert(Boolean(aliceCase.author_avatar_url), 'Case study author_avatar_url is populated with Alice avatar');

    // Fetch single case study via GET /api/case-studies/[id]
    const singleCaseRes = await request(`/api/case-studies/${aliceCase.id}`);
    assert(singleCaseRes.ok, 'Fetched single case study by ID');
    assert(singleCaseRes.data.caseStudy.author_name === 'Dr. Alice Cardiologist', 'Single case view preserves correct author name');
    assert(Boolean(singleCaseRes.data.caseStudy.author_avatar_url), 'Single case view preserves author avatar');

    // Step E: Personalised Case Study Feed verification
    // Switch to Dr. Bob (Neurologist, not connected to Alice yet)
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: bobUser.id }),
    });

    const bobPersonalizedBefore = await request('/api/case-studies?personalized=true');
    assert(bobPersonalizedBefore.ok, 'Bob fetched personalized case study feed');
    const bobHasAliceCaseBefore = bobPersonalizedBefore.data.caseStudies.some((c) => c.id === aliceCase.id);
    assert(!bobHasAliceCaseBefore, 'Alice cardiology case does NOT appear in Bob personalized feed (different specialty & not connected)');

    // Switch to Dr. Charlie (Cardiologist, not connected to Alice, but shares cardiology specialty)
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: charlieUser.id }),
    });
    const charliePersonalized = await request('/api/case-studies?personalized=true');
    const charlieHasAliceCase = charliePersonalized.data.caseStudies.some((c) => c.id === aliceCase.id);
    assert(charlieHasAliceCase, 'Alice case DOES appear in Charlie personalized feed based on relevant clinical specialisation');

    // Connect Bob and Alice
    // Bob sends connection request to Alice
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: bobUser.id }),
    });
    const connectReq = await request('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId: aliceUser.id, recipient_id: aliceUser.id }),
    });
    assert(connectReq.status === 201, 'Bob sent connection request to Alice');
    const connId = connectReq.data.connection.id;

    // Alice accepts connection request
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: aliceUser.id }),
    });
    const acceptRes = await request(`/api/connections/${connId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    });
    assert(acceptRes.ok, 'Alice accepted connection request from Bob');

    // Switch back to Bob: now Bob is connected to Alice, so Alice case should appear in Bob personalized feed
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: bobUser.id }),
    });
    const bobPersonalizedAfter = await request('/api/case-studies?personalized=true');
    const bobHasAliceCaseAfter = bobPersonalizedAfter.data.caseStudies.some((c) => c.id === aliceCase.id);
    assert(bobHasAliceCaseAfter, 'Alice case DOES appear in Bob personalized feed after establishing peer connection');

    // Step F: Verify Newly Registered User Feed Isolation (No Default/Sample Posts)
    const bobFeedRes = await request('/api/posts');
    assert(bobFeedRes.ok, 'Fetched feed for newly registered user');
    const samplePostsInBobFeed = bobFeedRes.data.posts.filter((p) => p.id.startsWith('30000000-') || (p.author_id && p.author_id.startsWith('00000000-')));
    assert(samplePostsInBobFeed.length === 0, 'Newly registered user feed contains ZERO sample/hardcoded posts');

    // Bob publishes a real post
    const bobPostRes = await request('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Clinical Note: Acetylcholine receptor antibody titers in ocular myasthenia gravis.',
        specialty_id: 'neurology',
      }),
    });
    assert(bobPostRes.status === 201, 'Bob published a real clinical post');

    const bobFeedAfterPost = await request('/api/posts');
    assert(
      bobFeedAfterPost.data.posts.some((p) => p.id === bobPostRes.data.post.id) &&
      bobFeedAfterPost.data.posts.every((p) => !p.id.startsWith('30000000-') && !p.author_id.startsWith('00000000-')),
      'Newly registered user feed displays only their real post with no sample posts'
    );

    // Clean up test post
    await request(`/api/posts/${bobPostRes.data.post.id}`, { method: 'DELETE' });

    // --- 24. Testing Connections Network State & Case Study Sharing with Connections ---
    console.log('\n--- 24. Testing Connections Network State & Case Study Sharing ---');
    // Bob checks connections endpoint
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: bobUser.id }),
    });
    const bobConnectionsRes = await request('/api/connections');
    assert(bobConnectionsRes.ok, 'Bob fetched connections successfully');
    assert(Array.isArray(bobConnectionsRes.data.connections), 'Connections returned as array');
    assert(Array.isArray(bobConnectionsRes.data.pendingIncoming), 'pendingIncoming returned as array');
    assert(Array.isArray(bobConnectionsRes.data.pendingOutgoing), 'pendingOutgoing returned as array');
    const bobHasAlice = bobConnectionsRes.data.connections.some(
      (c) => c.requester_id === aliceUser.id || c.recipient_id === aliceUser.id
    );
    assert(bobHasAlice, 'Alice appears in Bob active connections list');

    // Alice checks connections endpoint
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: aliceUser.id }),
    });
    const aliceConnectionsRes = await request('/api/connections');
    const aliceHasBob = aliceConnectionsRes.data.connections.some(
      (c) => c.requester_id === bobUser.id || c.recipient_id === bobUser.id
    );
    assert(aliceHasBob, 'Bob appears in Alice active connections list');

    // Alice creates a private case study shared specifically with her accepted connection (Bob)
    const alicePrivateCaseRes = await request('/api/case-studies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Confidential Case Shared with Bob',
        short_summary: 'Targeted case consultation shared with accepted peer Dr. Bob.',
        educational_content: '### Confidential Clinical Observation\nRare hemodynamic presentation.',
        specialty_ids: ['cardiology'],
        status: 'published',
        is_private: true,
        shared_with_user_ids: [bobUser.id],
      }),
    });
    assert(alicePrivateCaseRes.status === 201, 'Alice created private case study shared with connection Bob');
    const alicePrivateCaseId = alicePrivateCaseRes.data.caseStudy.id;

    // Bob views the private case study
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: bobUser.id }),
    });
    const bobViewPrivateCase = await request(`/api/case-studies/${alicePrivateCaseId}`);
    assert(bobViewPrivateCase.ok, 'Accepted connection (Bob) can access Alice private case study');
    assert(
      bobViewPrivateCase.data.caseStudy.educational_content.includes('Rare hemodynamic presentation'),
      'Bob can read full educational content of shared private case'
    );

    // Charlie (not shared with) cannot access the private case study
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: charlieUser.id }),
    });
    const charlieViewPrivateCase = await request(`/api/case-studies/${alicePrivateCaseId}`);
    assert(
      !charlieViewPrivateCase.ok || charlieViewPrivateCase.status === 404 || !charlieViewPrivateCase.data?.caseStudy,
      'Unconnected/unshared user (Charlie) is blocked from accessing private case study'
    );

    // --- 25. Testing Global Search API & Searchable Specialty Filtering ---
    console.log('\n--- 25. Testing Global Search & Searchable Specialty Filtering ---');
    // Global search for doctor name
    const searchDoctorRes = await request('/api/search?q=Jenkins');
    assert(searchDoctorRes.ok, 'Global search endpoint responds 200 OK');
    assert(
      searchDoctorRes.data.profiles.some((p) => p.full_name.includes('Dr. Sarah Jenkins')),
      'Global search successfully locates professional by name (Dr. Sarah Jenkins)'
    );

    // Global search by clinical keyword / condition
    const searchKeywordRes = await request('/api/search?q=Cardiology');
    assert(searchKeywordRes.ok, 'Global search by clinical keyword returns 200 OK');
    assert(
      searchKeywordRes.data.profiles.length > 0 || searchKeywordRes.data.caseStudies.length > 0,
      'Global search finds clinical professionals and case studies for "Cardiology"'
    );

    // Global search with specialty filter
    const searchSpecialtyRes = await request('/api/search?specialty=cardiology');
    assert(searchSpecialtyRes.ok, 'Global search with specialty filter returns 200 OK');
    assert(
      searchSpecialtyRes.data.caseStudies.every((cs) =>
        cs.specialties.some((s) => s.id.toLowerCase() === 'cardiology' || s.name.toLowerCase() === 'cardiology')
      ),
      'All case studies returned by specialty filter belong to Cardiology'
    );

    // Profiles specialty filter check
    const profilesSpecRes = await request('/api/profiles?specialty=cardiology');
    assert(profilesSpecRes.ok, 'Profiles filtered by specialty returns 200 OK');
    assert(
      profilesSpecRes.data.profiles.every((p) =>
        p.specialties.some((s) => s.id.toLowerCase() === 'cardiology' || s.name.toLowerCase() === 'cardiology')
      ),
      'All profiles returned by specialty filter have Cardiology specialty'
    );

    // Case studies specialty filter check
    const caseStudiesSpecRes = await request('/api/case-studies?specialty=cardiology');
    assert(caseStudiesSpecRes.ok, 'Case studies filtered by specialty returns 200 OK');
    assert(
      caseStudiesSpecRes.data.caseStudies.every((cs) =>
        cs.specialties.some((s) => s.id.toLowerCase() === 'cardiology' || s.name.toLowerCase() === 'cardiology')
      ),
      'Case studies endpoint correctly filters by clinical specialty'
    );

    // Non-existent search query returns clean empty state
    const emptySearchRes = await request('/api/search?q=xyznonexistentterm123');
    assert(emptySearchRes.ok && emptySearchRes.data.total === 0, 'Non-existent search term returns 200 OK with total = 0');

    // 18. Testing Private Case Study Password Notification & Access Gate Flow
    console.log('\n--- 18. Testing Private Case Study Password Notification & Access Gate Flow ---');

    // Switch to Author (Dr. Sarah Jenkins)
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000001' }),
    });

    const viewerAId = '00000000-0000-0000-0000-000000000002'; // Dr. Marcus Chen
    const viewerBId = '00000000-0000-0000-0000-000000000003'; // Dr. Aris Thorne
    const sharedPassword = 'cardioSecure2025!';

    // Author creates a private case study with password shared with Viewer A
    const createPrivateSharedRes = await request('/api/case-studies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Confidential Case: Post-Infarction Ventricular Septal Defect',
        short_summary: 'Emergent hemodynamic stabilization and surgical patch repair.',
        educational_content: 'Step-by-step mechanical circulatory support and delayed surgical repair pearls.',
        learning_objectives: ['Identify cardiogenic shock hemodynamics', 'Plan ECMO vs Impella bridging'],
        source_references: ['JACC Heart Failure 2025'],
        specialty_ids: ['cardiology'],
        status: 'published',
        is_private: true,
        password_protected: true,
        access_password: sharedPassword,
        shared_with_user_ids: [viewerAId],
      }),
    });

    assert(createPrivateSharedRes.status === 201, 'Created private case study with access password and shared with Viewer A');
    const privateSharedCase = createPrivateSharedRes.data.caseStudy;
    assert(privateSharedCase.access_password === undefined, 'Password is NOT exposed in case study creation response');

    // Verify public case studies endpoint does not leak password
    const publicCaseListRes = await request('/api/case-studies');
    const leakedPasswordFound = publicCaseListRes.data.caseStudies.some((c) => Boolean(c.access_password));
    assert(!leakedPasswordFound, 'Public case study feeds strictly NEVER expose access passwords');

    // Switch to Viewer A (Marcus Chen) to verify in-app notification
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: viewerAId }),
    });

    const viewerANotifsRes = await request('/api/notifications');
    assert(viewerANotifsRes.ok, 'Viewer A fetched in-app notifications');
    const sharedNotifForA = viewerANotifsRes.data.notifications.find(
      (n) => n.item_id === privateSharedCase.id || n.link === `/case-studies/${privateSharedCase.id}`
    );

    assert(Boolean(sharedNotifForA), 'Viewer A received in-app notification for shared private case study');
    assert(sharedNotifForA.actor_id === '00000000-0000-0000-0000-000000000001', 'Notification correctly identifies sender (Dr. Sarah Jenkins)');
    assert(sharedNotifForA.message.includes('Confidential Case: Post-Infarction Ventricular Septal Defect'), 'Notification message includes case study title');
    assert(sharedNotifForA.message.includes(sharedPassword), 'Notification message includes the access password for Viewer A');
    assert(sharedNotifForA.link === `/case-studies/${privateSharedCase.id}`, 'Notification includes link to open the case study');

    // Switch to Viewer B (Aris Thorne - not shared with) to verify no unauthorized notification
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: viewerBId }),
    });

    const viewerBNotifsRes = await request('/api/notifications');
    const sharedNotifForB = (viewerBNotifsRes.data.notifications || []).find(
      (n) => n.item_id === privateSharedCase.id || n.link === `/case-studies/${privateSharedCase.id}`
    );
    assert(!sharedNotifForB, 'Unshared user (Viewer B) did NOT receive the notification or password');

    // Viewer B attempts to view or unlock private case study
    const viewerBViewRes = await request(`/api/case-studies/${privateSharedCase.id}`);
    assert(!viewerBViewRes.ok || viewerBViewRes.status === 404, 'Unshared user cannot access private case study');
    const viewerBUnlockRes = await request(`/api/case-studies/${privateSharedCase.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: sharedPassword }),
    });
    assert(!viewerBUnlockRes.ok, 'Unshared user cannot unlock private case study even with password');

    // Switch back to Viewer A: test link opening and password gate flow
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: viewerAId }),
    });

    // Opening via link: verify link and fetch case study record
    assert(sharedNotifForA.link === `/case-studies/${privateSharedCase.id}`, 'Notification link correctly points to /case-studies/:id');
    const viewerAFetchCaseRes = await request(`/api/case-studies/${privateSharedCase.id}`);
    assert(viewerAFetchCaseRes.ok, 'Viewer A can fetch case study record');
    assert(viewerAFetchCaseRes.data.caseStudy.is_locked === true, 'Case study prompts Viewer A with locked gate');
    assert(viewerAFetchCaseRes.data.caseStudy.educational_content === '', 'Educational content is protected until unlocked');

    // Viewer A enters incorrect password
    const wrongAttemptRes = await request(`/api/case-studies/${privateSharedCase.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'incorrect-test-pass' }),
    });
    assert(wrongAttemptRes.status === 401, 'Incorrect password rejected with 401 Unauthorized');
    assert(Boolean(wrongAttemptRes.data.error), 'Incorrect password returns descriptive error message');

    // Viewer A enters correct password from notification
    const correctAttemptRes = await request(`/api/case-studies/${privateSharedCase.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: sharedPassword }),
    });
    assert(correctAttemptRes.ok && correctAttemptRes.data.success === true, 'Correct password accepted (200 OK)');
    assert(correctAttemptRes.data.caseStudy.is_locked === false, 'Case study is unlocked for Viewer A');
    assert(
      correctAttemptRes.data.caseStudy.educational_content.includes('Step-by-step mechanical circulatory support'),
      'Full clinical educational content is revealed to Viewer A'
    );

    // Test sharing an existing case study via POST /api/case-studies/[id]/share
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000001' }),
    });

    const shareWithBRes = await request(`/api/case-studies/${privateSharedCase.id}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient_id: viewerBId }),
    });
    assert(shareWithBRes.ok && shareWithBRes.data.success === true, 'Author shared case study with Viewer B via share endpoint');

    // Verify Viewer B now receives notification
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: viewerBId }),
    });

    const viewerBNewNotifs = await request('/api/notifications');
    const notifForBAfterShare = viewerBNewNotifs.data.notifications.find(
      (n) => n.item_id === privateSharedCase.id || n.link === `/case-studies/${privateSharedCase.id}`
    );
    assert(Boolean(notifForBAfterShare), 'Viewer B now receives notification with access password after being shared');
    assert(notifForBAfterShare.message.includes(sharedPassword), 'Viewer B notification includes the access password');

    // Viewer B can now unlock with the password
    const viewerBUnlockSuccess = await request(`/api/case-studies/${privateSharedCase.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: sharedPassword }),
    });
    assert(viewerBUnlockSuccess.ok && viewerBUnlockSuccess.data.caseStudy.is_locked === false, 'Viewer B can now unlock and access the shared private case study');

    // Switch back to Admin for clean state
    await request('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000001' }),
    });

    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution failed with error:', error);
    process.exit(1);
  }
}

runTests();
