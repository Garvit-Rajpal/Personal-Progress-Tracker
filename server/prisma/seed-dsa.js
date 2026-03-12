const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Sample subset of Striver's SDE Sheet to seed
const questions = [
  // Arrays Part 1
  { title: "Set Matrix Zeroes", topic: "Arrays", difficulty: "MEDIUM", link: "https://takeuforward.org/data-structure/set-matrix-zero/" },
  { title: "Pascal's Triangle", topic: "Arrays", difficulty: "EASY", link: "https://takeuforward.org/data-structure/program-to-generate-pascals-triangle/" },
  { title: "Next Permutation", topic: "Arrays", difficulty: "MEDIUM", link: "https://takeuforward.org/data-structure/next_permutation-find-next-lexicographically-greater-permutation/" },
  { title: "Kadane's Algorithm", topic: "Arrays", difficulty: "MEDIUM", link: "https://takeuforward.org/data-structure/kadanes-algorithm-maximum-subarray-sum-in-an-array/" },
  { title: "Sort an array of 0s, 1s and 2s", topic: "Arrays", difficulty: "MEDIUM", link: "https://takeuforward.org/data-structure/sort-an-array-of-0s-1s-and-2s/" },
  { title: "Stock buy and Sell", topic: "Arrays", difficulty: "EASY", link: "https://takeuforward.org/data-structure/stock-buy-and-sell/" },

  // Arrays Part 2
  { title: "Rotate Matrix", topic: "Arrays Part-II", difficulty: "MEDIUM", link: "https://takeuforward.org/data-structure/rotate-image-by-90-degree/" },
  { title: "Merge Overlapping Subintervals", topic: "Arrays Part-II", difficulty: "MEDIUM", link: "https://takeuforward.org/data-structure/merge-overlapping-sub-intervals/" },
  { title: "Merge two Sorted Arrays Without Extra Space", topic: "Arrays Part-II", difficulty: "HARD", link: "https://takeuforward.org/data-structure/merge-two-sorted-arrays-without-extra-space/" },
  { title: "Find the duplicate in an array of N+1 integers", topic: "Arrays Part-II", difficulty: "MEDIUM", link: "https://takeuforward.org/data-structure/find-the-duplicate-in-an-array-of-n1-integers/" },
  { title: "Repeat and Missing Number", topic: "Arrays Part-II", difficulty: "MEDIUM", link: "https://takeuforward.org/data-structure/find-the-repeating-and-missing-numbers/" },
  { title: "Inversion of Array (Pre-req: Merge Sort)", topic: "Arrays Part-II", difficulty: "HARD", link: "https://takeuforward.org/data-structure/count-inversions-in-an-array/" },

  // Linked List
  { title: "Reverse a LinkedList", topic: "Linked List", difficulty: "EASY", link: "https://takeuforward.org/data-structure/reverse-a-linked-list/" },
  { title: "Find the middle of LinkedList", topic: "Linked List", difficulty: "EASY", link: "https://takeuforward.org/data-structure/find-middle-element-in-a-linked-list/" },
  { title: "Merge two sorted Linked List", topic: "Linked List", difficulty: "EASY", link: "https://takeuforward.org/data-structure/merge-two-sorted-linked-lists/" },
  { title: "Remove N-th node from back of LinkedList", topic: "Linked List", difficulty: "MEDIUM", link: "https://takeuforward.org/data-structure/remove-n-th-node-from-the-end-of-a-linked-list/" },
  { title: "Add two numbers as LinkedList", topic: "Linked List", difficulty: "MEDIUM", link: "https://takeuforward.org/data-structure/add-two-numbers-represented-as-linked-lists/" },
  { title: "Delete a given Node when a node is given.", topic: "Linked List", difficulty: "EASY", link: "https://takeuforward.org/data-structure/delete-given-node-in-a-linked-list-o1-approach/" },
];

async function main() {
  console.log('Clearing existing DSA data...');
  await prisma.dSAQuestion.deleteMany();

  // Create questions
  console.log('Seeding DSA Questions...');
  for (const q of questions) {
    await prisma.dSAQuestion.create({
      data: {
        title: q.title,
        topic: q.topic,
        difficulty: q.difficulty,
        link: q.link
      }
    });
  }

  // Create a Daily DSA Set for today just so user has a Daily View if needed
  // We'll add 3 random questions to a daily set
  const dsaRecords = await prisma.dSAQuestion.findMany({ take: 3 });
  
  if (dsaRecords.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // clear old daily sets
    await prisma.dailyDSASet.deleteMany();

    await prisma.dailyDSASet.create({
      data: {
        date: today,
        questions: {
          connect: dsaRecords.map(q => ({ id: q.id }))
        }
      }
    });
  }
  
  console.log('Finished seeding DSA!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
