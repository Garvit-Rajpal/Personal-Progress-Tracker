const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 191 Striver SDE Sheet Questions...');

  const rawData = fs.readFileSync(path.join(__dirname, '191_striver_questions.json'), 'utf-8');
  const dsaQuestions = JSON.parse(rawData);

  // 1. Delete all existing DSA progress and questions
  await prisma.userDSAProgress.deleteMany({});
  await prisma.dailyDSASet.deleteMany({});
  await prisma.dSAQuestion.deleteMany({});

  console.log('Cleared existing DSA questions.');

  // 2. Prepare the data for bulk insertion
  const formattedQuestions = dsaQuestions.map(q => ({
    title: q.title,
    topic: q.topic,
    difficulty: q.difficulty.toUpperCase(), // Map "Medium" -> "MEDIUM"
    link: q.link || "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/" // Fallback for null links
  }));

  // 3. Insert questions
  await prisma.dSAQuestion.createMany({
    data: formattedQuestions,
    skipDuplicates: true,
  });

  const insertedQuestions = await prisma.dSAQuestion.findMany({});
  console.log(`Inserted ${insertedQuestions.length} DSA questions.`);

  // 4. Mark 140 of them as solved for the default user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found to assign progress to. Skipping progress creation.');
    return;
  }

  // Shuffle or slice 140
  const questionsToSolve = insertedQuestions.slice(0, 140);
  
  const progressData = questionsToSolve.map(q => ({
    userId: user.id,
    questionId: q.id,
    solved: true,
    solvedAt: new Date()
  }));

  await prisma.userDSAProgress.createMany({
    data: progressData,
    skipDuplicates: true
  });

  console.log(`Marked 140 questions as solved for user ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
