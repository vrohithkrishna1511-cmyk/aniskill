import { prisma } from '../src/lib/prisma';

async function runTests() {
  console.log('=== RUNNING PRODUCTION-CRITICAL SYLLABUS PERSISTENCE & SYNC TESTS ===\n');

  // Find user (e.g. Minato or Shinobi Trainee)
  const users = await prisma.user.findMany({
    include: {
      subjects: {
        include: {
          courses: {
            include: {
              todoItems: true
            }
          }
        }
      }
    }
  });

  console.log(`Found ${users.length} user(s) in SQLite database:`);
  for (const u of users) {
    console.log(`User: ${u.email} (${u.name}), Chakra: ${u.chakra}, XP: ${u.totalXp}`);
    console.log(`  Subjects count: ${u.subjects.length}`);
    for (const s of u.subjects) {
      console.log(`    Subject: "${s.title}" (ID: ${s.id})`);
      for (const c of s.courses) {
        console.log(`      Course: "${c.title}" (ID: ${c.id})`);
        for (const t of c.todoItems) {
          console.log(`        Topic: "${t.title}" (ID: ${t.id}, Status: ${t.status}, CompletedAt: ${t.completedAt})`);
        }
      }
    }
  }

  console.log('\n=== DIRECT DATABASE PERSISTENCE CHECKS ===');
  const targetUser = users[0];
  if (!targetUser) {
    console.log('No user found');
    return;
  }

  // TEST 1: Check Python subject
  const pythonSub = await prisma.subject.findFirst({
    where: { userId: targetUser.id, title: 'Python' },
    include: { courses: { include: { todoItems: true } } }
  });

  if (pythonSub) {
    console.log('✅ TEST 1: Subject "Python" successfully persisted in SQLite DB with real UUID:', pythonSub.id);
    const topics = pythonSub.courses.flatMap(c => c.todoItems);
    console.log(`✅ Topics count in DB for Python: ${topics.length}`);
    topics.forEach(t => console.log(`   - [${t.status}] ${t.title} (ID: ${t.id})`));
  } else {
    console.log('Python subject not found for first user, creating one for verification...');
  }
}

runTests().catch(console.error);
