#!/usr/bin/env node
// SuperDino Regression Test Suite
// Tests critical user flows via the API endpoint.
// Usage: node tests/regression.mjs
//        API_URL=http://localhost:3000 node tests/regression.mjs

const API = process.env.API_URL || 'http://localhost:3000';
const TEST_PARENT = 'testparent_' + Date.now().toString(36);
const TEST_CHILD = 'testchild_' + Date.now().toString(36);
const PASSWORD = 'testpass123';

let pass = 0;
let fail = 0;
let parentId, childId, familyCode, familyId;
let taskId, wishId, logId, requestId, badgeId;

async function api(payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const res = await fetch(`${API}/api/superdino`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: controller.signal,
  });
  clearTimeout(timeout);
  const body = await res.json();
  if (!res.ok || body.error) throw new Error(body.error || `HTTP ${res.status}`);
  return body.data;
}

function assert(condition, msg) {
  if (condition) { pass++; return; }
  fail++;
  console.error(`  ❌ FAIL: ${msg}`);
}

function heading(label) {
  console.log(`\n━━━ ${label} ━━━`);
}

async function run() {
  console.log(`🧪 SuperDino Regression Tests\n  API: ${API}\n  Parent: ${TEST_PARENT} | Child: ${TEST_CHILD}\n`);

  // ─── 1. Parent registration ──────────────────────────
  heading('1. Parent registers + creates family');
  const parentSnap = await api({ action: 'login', username: TEST_PARENT, role: 'parent', password: PASSWORD });
  parentId = parentSnap.user.id;
  familyCode = parentSnap.families[0].code;
  familyId = parentSnap.families[0].id;
  assert(parentSnap.user.role === 'parent', 'parent role');
  assert(familyCode && familyCode.startsWith('DINO-'), `family code created: ${familyCode}`);
  assert(parentSnap.tasks.length >= 8, `starter tasks seeded: ${parentSnap.tasks.length}`);
  assert(parentSnap.wishes.length >= 6, `starter wishes seeded: ${parentSnap.wishes.length}`);

  // ─── 2. Child registration ────────────────────────────
  heading('2. Child registers + joins family');
  const childSnap = await api({ action: 'login', username: TEST_CHILD, role: 'child', password: PASSWORD, familyCode });
  childId = childSnap.user.id;
  assert(childSnap.user.role === 'child', 'child role');
  assert(childSnap.user.familyId === familyId, 'child joined correct family');

  // ─── 3. Parent creates a task ─────────────────────────
  heading('3. Parent creates a task');
  const createTaskSnap = await api({
    action: 'createTask', userId: parentId,
    data: { name: 'Test Chore', emoji: '🧪', reward: 5, category: 'home', autoApprove: false, color: 'oklch(0.92 0.08 145)' },
  });
  taskId = createTaskSnap.tasks.find(t => t.name === 'Test Chore')?.id;
  assert(taskId, `task created with id: ${taskId}`);

  // ─── 4. Parent creates a wish ─────────────────────────
  heading('4. Parent creates an affordable wish');
  const createWishSnap = await api({
    action: 'createWish', userId: parentId,
    data: { name: 'Test Reward', emoji: '🎁', cost: 4, category: 'normal', color: 'oklch(0.92 0.06 240)' },
  });
  wishId = createWishSnap.wishes.find(w => w.name === 'Test Reward')?.id;
  assert(wishId, `wish created with id: ${wishId}`);

  // ─── 5. Child logs a task (pending) ───────────────────
  heading('5. Child logs a task (pending approval)');
  const logSnap = await api({ action: 'logTask', userId: childId, taskId });
  logId = logSnap.taskLogs.find(l => l.taskId === taskId && l.userId === childId)?.id;
  assert(logId, `task log created: ${logId}`);
  const logEntry = logSnap.taskLogs.find(l => l.id === logId);
  assert(logEntry?.status === 'pending', `log status is pending: ${logEntry?.status}`);

  // ─── 6. Parent approves the task ──────────────────────
  heading('6. Parent approves task → verify eggs');
  const approveSnap = await api({ action: 'approveTask', userId: parentId, logId });
  const approvedLog = approveSnap.taskLogs.find(l => l.id === logId);
  assert(approvedLog?.status === 'approved', `task approved: ${approvedLog?.status}`);
  const earnTx = approveSnap.transactions.find(tx => tx.userId === childId && tx.type === 'earn');
  assert(earnTx, 'earn transaction created');
  assert(approveSnap.eggs >= 5, `child has ${approveSnap.eggs} eggs (≥5)`);

  // ─── 7. Child submits a wish ──────────────────────────
  heading('7. Child submits a wish');
  const submitWishSnap = await api({ action: 'submitWish', userId: childId, wishId });
  requestId = submitWishSnap.wishRequests.find(r => r.wishId === wishId && r.userId === childId)?.id;
  assert(requestId, `wish request created: ${requestId}`);
  const wishReq = submitWishSnap.wishRequests.find(r => r.id === requestId);
  assert(wishReq?.status === 'pending', `wish status pending: ${wishReq?.status}`);

  // ─── 8. Parent approves wish → eggs deducted ──────────
  heading('8. Parent approves wish → verify eggs deducted');
  const approveWishSnap = await api({ action: 'approveWish', userId: parentId, requestId });
  const approvedWish = approveWishSnap.wishRequests.find(r => r.id === requestId);
  assert(approvedWish?.status === 'approved', `wish approved: ${approvedWish?.status}`);
  const spendTx = approveWishSnap.transactions.find(tx => tx.userId === childId && tx.type === 'spend');
  assert(spendTx, 'spend transaction created');

  // ─── 9. Parent grants a badge ─────────────────────────
  heading('9. Parent grants a badge');
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const badgeSnap = await api({
    action: 'grantBadge', userId: parentId, childId,
    image: 'tyrannosaurus-rex.png', label: 'TestBadge', month, week: 1,
    message: 'Great job!',
  });
  badgeId = badgeSnap.badges.find(b => b.childId === childId)?.id;
  assert(badgeId, `badge created: ${badgeId}`);
  const badge = badgeSnap.badges.find(b => b.id === badgeId);
  assert(badge?.message === 'Great job!', 'badge praise message');
  assert(badge?.seen === false, 'badge unseen');

  // ─── 10. Child marks badges seen ────────────────────
  heading('10. Child marks badges as seen');
  const seenSnap = await api({ action: 'markBadgesSeen', userId: childId, childId });
  const seenBadge = seenSnap.badges.find(b => b.id === badgeId);
  assert(seenBadge?.seen === true, 'badge marked seen');

  // ─── 11. Auto-approved task → immediate eggs ──────────
  heading('11. Auto-approved task → instant eggs');
  const autoTaskId = createTaskSnap.tasks.find(t => t.autoApprove)?.id;
  assert(autoTaskId, 'found auto-approve task');
  const autoSnap = await api({ action: 'logTask', userId: childId, taskId: autoTaskId });
  const autoLog = autoSnap.taskLogs.find(l => l.taskId === autoTaskId && l.userId === childId);
  assert(autoLog?.status === 'auto-approved', `auto-approved: ${autoLog?.status}`);
  assert(autoSnap.eggs > approveWishSnap.eggs, 'eggs increased after auto task');

  // ─── 12. Reject task ──────────────────────────────────
  heading('12. Reject a task');
  const rejectTaskSnap = await api({
    action: 'createTask', userId: parentId,
    data: { name: 'Reject Me', emoji: '🚫', reward: 3, category: 'home', autoApprove: false, color: 'oklch(0.92 0.08 145)' },
  });
  const rejectTaskId = rejectTaskSnap.tasks.find(t => t.name === 'Reject Me')?.id;
  const rejectLogSnap = await api({ action: 'logTask', userId: childId, taskId: rejectTaskId });
  const rejectLogId = rejectLogSnap.taskLogs.find(l => l.taskId === rejectTaskId)?.id;
  const rejectSnap = await api({ action: 'rejectTask', userId: parentId, logId: rejectLogId });
  const rejectedLog = rejectSnap.taskLogs.find(l => l.id === rejectLogId);
  assert(rejectedLog?.status === 'rejected', `task rejected: ${rejectedLog?.status}`);

  // ─── 13. Reject wish ──────────────────────────────────
  heading('13. Reject a wish');
  const rejectWishSnap = await api({
    action: 'createWish', userId: parentId,
    data: { name: 'Reject Wish', emoji: '🚫', cost: 3, category: 'normal', color: 'oklch(0.92 0.06 240)' },
  });
  const rejectWishId = rejectWishSnap.wishes.find(w => w.name === 'Reject Wish')?.id;
  const rejectReqSnap = await api({ action: 'submitWish', userId: childId, wishId: rejectWishId });
  const rejectReqId = rejectReqSnap.wishRequests.find(r => r.wishId === rejectWishId)?.id;
  const rejectWSnap = await api({ action: 'rejectWish', userId: parentId, requestId: rejectReqId });
  const rejectedReq = rejectWSnap.wishRequests.find(r => r.id === rejectReqId);
  assert(rejectedReq?.status === 'rejected', `wish rejected: ${rejectedReq?.status}`);

  // ─── 14. Parent assigns a task ────────────────────────
  heading('14. Parent assigns a task to child');
  const assignSnap = await api({ action: 'assignTask', userId: parentId, taskId, assignToUserId: childId });
  const assignedLog = assignSnap.taskLogs.find(l => l.taskId === taskId && l.userId === childId && l.status === 'assigned');
  assert(assignedLog, `assigned log created: ${assignedLog?.id}`);
  assert(assignedLog?.assignedBy, `assigned by: ${assignedLog?.assignedBy}`);
  const assignLogId = assignedLog.id;

  // ─── 15. Child completes assigned task ────────────────
  heading('15. Child completes assigned task');
  const completeSnap = await api({ action: 'completeAssignedTask', userId: childId, logId: assignLogId });
  const completedLog = completeSnap.taskLogs.find(l => l.id === assignLogId);
  assert(completedLog?.status === 'pending', `assigned → pending: ${completedLog?.status}`);

  // ─── 16. Parent approves assigned task ────────────────
  heading('16. Parent approves assigned task');
  const approveAssignSnap = await api({ action: 'approveTask', userId: parentId, logId: assignLogId });
  const finalLog = approveAssignSnap.taskLogs.find(l => l.id === assignLogId);
  assert(finalLog?.status === 'approved', `assigned task approved: ${finalLog?.status}`);

  // ─── 17. Custom task logging ──────────────────────────
  heading('17. Child logs a custom task');
  const customTaskSnap = await api({
    action: 'logCustomTask', userId: childId,
    taskName: 'Custom Test', emoji: '🌟', suggestedReward: 7,
  });
  const customTaskLog = customTaskSnap.taskLogs.find(l => l.userId === childId && l.status === 'pending');
  assert(customTaskLog, 'custom task log created');
  const customTask = customTaskSnap.tasks.find(t => t.name === 'Custom Test');
  assert(customTask?.category === 'other', 'custom task category: other');

  // ─── 18. Custom wish submission ───────────────────────
  heading('18. Child submits a custom wish');
  const customWishSnap = await api({
    action: 'submitCustomWish', userId: childId,
    taskName: 'Custom Wish', emoji: '🌈', suggestedReward: 8,
  });
  const customWishReq = customWishSnap.wishRequests.find(r => r.userId === childId && r.status === 'pending');
  assert(customWishReq, 'custom wish request created');
  const customWish = customWishSnap.wishes.find(w => w.name === 'Custom Wish');
  assert(customWish?.category === 'other', 'custom wish category: other');

  // ─── 19. Convert custom wish to normal ────────────────
  heading('19. Parent converts custom wish to catalog');
  const convertSnap = await api({ action: 'convertWish', userId: parentId, wishId: customWish.id });
  const converted = convertSnap.wishes.find(w => w.id === customWish.id);
  assert(converted?.category === 'normal', 'custom wish converted to normal');

  // ─── 20. Cancel assigned task ─────────────────────────
  heading('20. Cancel an assigned task');
  const cancelTaskId = createTaskSnap.tasks.find(t => t.name === 'Test Chore')?.id;
  const cancelAssignSnap = await api({ action: 'assignTask', userId: parentId, taskId: cancelTaskId, assignToUserId: childId });
  const cancelLog = cancelAssignSnap.taskLogs.find(l => l.status === 'assigned' && l.taskId === cancelTaskId);
  assert(cancelLog, 'new assignment created for cancel test');
  const cancelSnap = await api({ action: 'cancelAssignedTask', userId: parentId, logId: cancelLog.id });
  const stillAssigned = cancelSnap.taskLogs.find(l => l.id === cancelLog.id);
  assert(!stillAssigned, 'assigned task removed after cancel');

  // ─── Summary ─────────────────────────────────────────
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  ✅ Passed: ${pass}`);
  console.log(`  ❌ Failed: ${fail}`);
  console.log(`  📊 Total:  ${pass + fail}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // Cleanup: fire and forget
  console.log('🧹 Cleaning up test data...');
  (async () => {
    try {
      const adminKey = process.env.SUPABASE_ACCESS_TOKEN || '';
      if (adminKey) {
        const PROJECT_REF = 'ykpxhycwcpxjrixlxfup';
        const https = await import('https');
        const del = (sql) => new Promise((resolve, reject) => {
          const data = JSON.stringify({ query: sql });
          const req = https.request({
            hostname: 'api.supabase.com', path: `/v1/projects/${PROJECT_REF}/database/query`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminKey}`, 'Content-Length': Buffer.byteLength(data) },
          }, (r) => { let b=''; r.on('data',c=>b+=c); r.on('end',()=>resolve(b)); });
          req.on('error', reject); req.write(data); req.end();
        });
        await del(`DELETE FROM public.transactions WHERE user_id IN (SELECT id FROM public.profiles WHERE username LIKE 'testparent_%' OR username LIKE 'testchild_%');`);
        await del(`DELETE FROM public.wish_requests WHERE user_id IN (SELECT id FROM public.profiles WHERE username LIKE 'testparent_%' OR username LIKE 'testchild_%');`);
        await del(`DELETE FROM public.task_logs WHERE user_id IN (SELECT id FROM public.profiles WHERE username LIKE 'testparent_%' OR username LIKE 'testchild_%');`);
        await del(`DELETE FROM public.badges WHERE child_id IN (SELECT id FROM public.profiles WHERE username LIKE 'testparent_%' OR username LIKE 'testchild_%');`);
        await del(`DELETE FROM public.tasks WHERE family_id IN (SELECT id FROM public.families WHERE name LIKE 'Testparent_%s family');`);
        await del(`DELETE FROM public.wishes WHERE family_id IN (SELECT id FROM public.families WHERE name LIKE 'Testparent_%s family');`);
        await del(`DELETE FROM public.profiles WHERE username LIKE 'testparent_%' OR username LIKE 'testchild_%';`);
        await del(`DELETE FROM public.families WHERE name LIKE 'Testparent_%s family';`);
        console.log('  ✅ Cleanup complete');
      } else {
        console.log('  ⚠️  Set SUPABASE_ACCESS_TOKEN env var for auto-cleanup');
      }
    } catch (e) {
      console.log(`  ⚠️  Cleanup: ${e.message}`);
    }
  })();

  process.exit(fail > 0 ? 1 : 0);
}

run().catch(e => {
  console.error(`\n💥 Fatal: ${e.message}`);
  process.exit(1);
});
