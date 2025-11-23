import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = [
    // USERS
    {
      name: "User One",
      library_id: "LIB100001",
      email: "user1@example.com",
      role: "USER",
      domain_dev: "ANDROID_FLUTTER",
      domain_dsa: "CPP",
      year: 1,
    },
    {
      name: "User Two",
      library_id: "LIB100002",
      email: "user2@example.com",
      role: "USER",
      domain_dev: "ARVR",
      domain_dsa: "JAVA",
      year: 2,
    },
    {
      name: "User Three",
      library_id: "LIB100003",
      email: "user3@example.com",
      role: "USER",
      domain_dev: "ML",
      domain_dsa: "CPP",
      year: 3,
    },
    {
      name: "User Four",
      library_id: "LIB100004",
      email: "user4@example.com",
      role: "USER",
      domain_dev: "WEBDEV",
      domain_dsa: "JAVA",
      year: 2,
    },
    {
      name: "User Five",
      library_id: "LIB100005",
      email: "user5@example.com",
      role: "USER",
      domain_dev: "UIUX",
      domain_dsa: "CPP",
      year: 4,
    },
    {
      name: "User Six",
      library_id: "LIB100020",
      email: "user6@example.com", 
      role: "USER",
      domain_dev: "ANDROID_KOTLIN",
      domain_dsa: "CPP",
      year: 4,
    },

    // COORDINATORS
    {
      name: "Coord One",
      library_id: "LIB100006",
      email: "coord1@example.com",
      role: "COORDINATOR",
      domain_dev: "ANDROID_FLUTTER",
      domain_dsa: "JAVA",
      year: 3,
    },
    {
      name: "Coord Two",
      library_id: "LIB100007",
      email: "coord2@example.com",
      role: "COORDINATOR",
      domain_dev: "ARVR",
      domain_dsa: "CPP",
      year: 2,
    },
    {
      name: "Coord Three",
      library_id: "LIB100008",
      email: "coord3@example.com",
      role: "COORDINATOR",
      domain_dev: "ML",
      domain_dsa: "JAVA",
      year: 1,
    },
    {
      name: "Coord Four",
      library_id: "LIB100009",
      email: "coord4@example.com",
      role: "COORDINATOR",
      domain_dev: "WEBDEV",
      domain_dsa: "CPP",
      year: 4,
    },
    {
      name: "Coord Five",
      library_id: "LIB100010",
      email: "coord5@example.com",
      role: "COORDINATOR",
      domain_dev: "UIUX",
      domain_dsa: "JAVA",
      year: 3,
    },

    {
      name: "Coord Six",
      library_id: "LIB100030",
      email: "coord6@example.com",
      role: "COORDINATOR",
      domain_dev: "ANDROID_KOTLIN",
      domain_dsa: "JAVA",
      year: 3,
    },

    // LEADS
    {
      name: "Lead One",
      library_id: "LIB100011",
      email: "lead1@example.com",
      role: "LEAD",
      domain_dev: "ANDROID_FLUTTER",
      domain_dsa: "CPP",
      year: 2,
    },
    {
      name: "Lead Two",
      library_id: "LIB100012",
      email: "lead2@example.com",
      role: "LEAD",
      domain_dev: "ARVR",
      domain_dsa: "JAVA",
      year: 4,
    },
    {
      name: "Lead Three",
      library_id: "LIB100013",
      email: "lead3@example.com",
      role: "LEAD",
      domain_dev: "ML",
      domain_dsa: "CPP",
      year: 3,
    },
    {
      name: "Lead Four",
      library_id: "LIB100014",
      email: "lead4@example.com",
      role: "LEAD",
      domain_dev: "WEBDEV",
      domain_dsa: "JAVA",
      year: 2,
    },
    {
      name: "Lead Five",
      library_id: "LIB100015",
      email: "lead5@example.com",
      role: "LEAD",
      domain_dev: "UIUX",
      domain_dsa: "CPP",
      year: 1,
    },
    {
      name: "Lead Six",
      library_id: "LIB100031",
      email: "lead6@example.com",
      role: "LEAD",
      domain_dev: "ANDROID_KOTLIN",
      domain_dsa: "CPP",
      year: 2,
    },
  ];

  for (const user of users) {
    const createdUser = await prisma.user.create({
      data: {
        ...user,
        password: hashedPassword,
      },
    });
    
    const tracker = await prisma.trackerDashboard.create({
      data: {
        userId: createdUser.id,
        past5: [0, 0, 0, 0, 0],
        skills: ["JavaScript", "React"],
      },
    });

    await prisma.leetcode.create({
      data: {
        trackerId: tracker.id,
        username: "Roushan_Srivastav",
        url: "https://leetcode.com/Roushan_Srivastav/",
        solvedProblems: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        calendar: "",
      },
    });

    await prisma.gitHub.create({
      data: {
        trackerId: tracker.id,
        username: "RoushanSri",
        url: "https://github.com/RoushanSri",
        contributions: 0,
        prs: 0,
        repos: 0,
      },
    });
  }

  console.log(`✅ Seeded ${users.length} users successfully.`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding users:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
