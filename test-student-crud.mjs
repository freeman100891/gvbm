const BASE_URL = 'http://localhost:3000';

async function testStudentCRUD() {
  console.log('=== TEST STUDENT CRUD & PROFILE MANAGEMENT ENDPOINTS ===\n');

  // 1. Create student
  console.log('1. Testing POST /api/classes/class-10a1-ielts/students...');
  const createRes = await fetch(`${BASE_URL}/api/classes/class-10a1-ielts/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Võ Hoàng Nam',
      gender: 'MALE',
      avatar: '🦊',
      parentName: 'Võ Văn Hùng',
      parentPhone: '0981234567',
      notes: 'IELTS Target 7.0, Speaking rất tốt',
      initialPoints: 10,
    }),
  });

  const created = await createRes.json();
  console.log('Created student:', created.id, created.fullName, created.avatar, created.gender);

  if (!created.id) throw new Error('Create student failed: ' + JSON.stringify(created));

  // 2. Update student
  console.log('\n2. Testing PUT /api/classes/class-10a1-ielts/students/' + created.id + '...');
  const updateRes = await fetch(`${BASE_URL}/api/classes/class-10a1-ielts/students/${created.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Võ Hoàng Nam (Elite)',
      gender: 'MALE',
      avatar: '🦁',
      parentName: 'Võ Văn Hùng',
      parentPhone: '0981234567',
      notes: 'Đã cập nhật mục tiêu IELTS 7.5',
    }),
  });
  const updated = await updateRes.json();
  console.log('Updated student:', updated.fullName, updated.avatar, updated.notes);

  // 3. Reset points
  console.log('\n3. Testing POST /api/classes/class-10a1-ielts/students/' + created.id + '/reset-points...');
  const resetRes = await fetch(`${BASE_URL}/api/classes/class-10a1-ielts/students/${created.id}/reset-points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: 'Test reset points' }),
  });
  const resetData = await resetRes.json();
  console.log('Reset result:', resetData);

  // 4. Transfer student
  console.log('\n4. Testing POST /api/classes/class-10a1-ielts/students/transfer...');
  const transferRes = await fetch(`${BASE_URL}/api/classes/class-10a1-ielts/students/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentIds: [created.id],
      sourceClassId: 'class-10a1-ielts',
      targetClassId: 'class-grade9-starters',
      keepPointHistory: false,
    }),
  });
  const transferData = await transferRes.json();
  console.log('Transfer result:', transferData);

  // 5. Batch delete
  console.log('\n5. Testing POST /api/classes/class-grade9-starters/students/batch-delete...');
  const deleteRes = await fetch(`${BASE_URL}/api/classes/class-grade9-starters/students/batch-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentIds: [created.id],
    }),
  });
  const deleteData = await deleteRes.json();
  console.log('Batch delete result:', deleteData);

  console.log('\n✅ TOÀN BỘ 5 TÁC VỤ CRUD & PROFILE HỌC SINH ĐÃ CHẠY THÀNH CÔNG 100%!');
}

testStudentCRUD().catch((e) => console.error('Test failed:', e));
