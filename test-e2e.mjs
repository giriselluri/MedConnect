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

    // Step 10: Non-admin user cannot create case studies
    const forbiddenCreateRes = await request('/api/case-studies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Unauthorized Case Study Attempt',
        short_summary: 'Test',
        educational_content: 'Test',
        specialty_ids: ['cardiology'],
      }),
    });
    assert(forbiddenCreateRes.status === 403, 'Security Guard: Non-admin user blocked from creating case studies (403 Forbidden)');

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

    // Reset back to Dr. Sarah Jenkins
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
