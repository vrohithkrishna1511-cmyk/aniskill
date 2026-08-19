const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDemoData() {
  console.log('Cleaning demo/test syllabus records from SQLite database...');

  const deletedTodos = await prisma.todoItem.deleteMany({});
  console.log(`Deleted ${deletedTodos.count} TodoItem records.`);

  const deletedCourses = await prisma.course.deleteMany({});
  console.log(`Deleted ${deletedCourses.count} Course records.`);

  const deletedSubjects = await prisma.subject.deleteMany({});
  console.log(`Deleted ${deletedSubjects.count} Subject records.`);

  const deletedSessions = await prisma.studySession.deleteMany({});
  console.log(`Deleted ${deletedSessions.count} StudySession records.`);

  const updatedUsers = await prisma.user.updateMany({
    data: {
      totalXp: 0,
      chakra: 0,
      currentStreak: 0,
      bestStreak: 0,
    }
  });
  console.log(`Reset ${updatedUsers.count} user records to 0 XP/Chakra/Streak.`);

  console.log('Successfully cleaned demo records from dev.db.');
}

cleanDemoData()
  .catch((e) => {
    console.error('Error cleaning demo records:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
