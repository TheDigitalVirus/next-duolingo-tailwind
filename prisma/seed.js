import {
  PrismaClient,
  ChallengeType,
  CourseCategory,
  CourseLevel,
  DifficultyLevel,
  SubscriptionTier,
  Intensity,
  Focus,
  UserStatus
} from "@prisma/client";
import { hash } from "bcrypt";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// ────────────────────────────────────────────────────────────────────────────────
// DATA DEFINITIONS
// ────────────────────────────────────────────────────────────────────────────────
const USER_ROLES = [
  { name: "OWNER", description: "System owner with full access" },
  { name: "ADMIN", description: "Administrator role" },
  { name: "STUDENT", description: "Default student role" },
];

const DEMO_USERS = [
  {
    email: "owner@platform.com",
    name: "System Owner",
    role: "OWNER",
    xp: 1000,
    gems: 500,
  },
  {
    email: "admin@platform.com",
    name: "Platform Admin",
    role: "ADMIN",
    xp: 500,
    gems: 200,
  },
  { 
    email: "student1@platform.com", 
    name: "Demo Student 1", 
    role: "STUDENT",
    xp: 150,
    gems: 50
  },
  { 
    email: "student2@platform.com", 
    name: "Demo Student 2", 
    role: "STUDENT",
    xp: 75,
    gems: 25
  },
];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
];

const BASIC_COURSES = LANGUAGES.map(lang => ({
  title: `${lang.name} for Beginners`,
  imageSrc: `/images/courses/${lang.code}.svg`,
  description: `Learn basic ${lang.name} vocabulary and grammar`,
  language: lang.code,
  category: CourseCategory.LANGUAGE,
  level: CourseLevel.BEGINNER,
  estimatedHours: 40 + Math.floor(Math.random() * 20),
}));

const SPANISH_COURSE_DATA = {
  title: "Espanhol para Iniciantes",
  imageSrc: "/images/courses/es.svg",
  description: "Aprenda espanhol do zero com lições práticas",
  language: "es",
  category: CourseCategory.LANGUAGE,
  level: CourseLevel.BEGINNER,
  estimatedHours: 48,
  units: [
    {
      title: "Básico 1",
      description: "Saudações e apresentações",
      order: 1,
      estimatedHours: 8,
      lessons: [
        {
          title: "Saudações",
          description: "Aprenda a cumprimentar em espanhol",
          order: 1,
          estimatedMinutes: 25,
          challenges: [
            {
              type: ChallengeType.SELECT,
              question: 'Como se diz "olá" em espanhol?',
              order: 1,
              difficulty: DifficultyLevel.EASY,
              options: [
                { text: "hola", correct: true, audioSrc: "/audio/es/hola.mp3" },
                { text: "adiós", correct: false },
                { text: "gracias", correct: false },
              ],
            },
            {
              type: ChallengeType.SELECT,
              question: 'Como se diz "adeus" em espanhol?',
              order: 2,
              difficulty: DifficultyLevel.EASY,
              options: [
                { text: "hola", correct: false },
                { text: "adiós", correct: true },
                { text: "por favor", correct: false },
              ],
            },
            {
              type: ChallengeType.ASSIST,
              question: "Escute o áudio. Qual palavra você ouviu?",
              order: 3,
              audioSrc: "/audio/es/hola.mp3",
              difficulty: DifficultyLevel.MEDIUM,
              options: [
                { text: "hola", correct: true },
                { text: "adiós", correct: false },
                { text: "gracias", correct: false },
              ],
            },
            {
              type: ChallengeType.FILL_BLANK,
              question: 'Complete a frase: "___ me llamo Juan"',
              order: 4,
              difficulty: DifficultyLevel.MEDIUM,
              options: [
                { text: "Hola", correct: true },
                { text: "Adiós", correct: false },
                { text: "Gracias", correct: false },
              ],
            },
          ],
        },
        {
          title: "Números 1-10",
          description: "Aprenda a contar em espanhol",
          order: 2,
          estimatedMinutes: 35,
          challenges: [
            {
              type: ChallengeType.SELECT,
              question: 'Como se diz "um" em espanhol?',
              order: 1,
              difficulty: DifficultyLevel.EASY,
              options: [
                { text: "uno", correct: true },
                { text: "dos", correct: false },
                { text: "tres", correct: false },
              ],
            },
            {
              type: ChallengeType.MATCH,
              question: "Relacione os números com seus nomes",
              order: 2,
              difficulty: DifficultyLevel.MEDIUM,
              options: [
                { text: "dos → 2", correct: true },
                { text: "cinco → 5", correct: true },
                { text: "siete → 8", correct: false },
              ],
            },
            {
              type: ChallengeType.REORDER,
              question: "Ordene os números de 1 a 5",
              order: 3,
              difficulty: DifficultyLevel.MEDIUM,
              options: [
                { text: "uno", correct: true },
                { text: "dos", correct: true },
                { text: "tres", correct: true },
                { text: "cuatro", correct: true },
                { text: "cinco", correct: true },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Básico 2",
      description: "Pessoas e família",
      order: 2,
      estimatedHours: 10,
      lessons: [
        {
          title: "Membros da Família",
          description: "Aprenda nomes de familiares",
          order: 1,
          estimatedMinutes: 30,
          challenges: [
            {
              type: ChallengeType.SELECT,
              question: 'Como se diz "mãe" em espanhol?',
              order: 1,
              difficulty: DifficultyLevel.EASY,
              options: [
                { text: "madre", correct: true },
                { text: "padre", correct: false },
                { text: "hermano", correct: false },
              ],
            },
            {
              type: ChallengeType.SELECT,
              question: 'Como se diz "irmão" em espanhol?',
              order: 2,
              difficulty: DifficultyLevel.EASY,
              options: [
                { text: "hermano", correct: true },
                { text: "hermana", correct: false },
                { text: "tío", correct: false },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const ENGLISH_COURSE_DATA = {
  title: "Inglês para Iniciantes",
  imageSrc: "/images/courses/en.svg",
  description: "Aprenda inglês do zero com lições práticas",
  language: "en",
  category: CourseCategory.LANGUAGE,
  level: CourseLevel.BEGINNER,
  estimatedHours: 50,
  units: [
    {
      title: "Básico 1",
      description: "Greetings and introductions",
      order: 1,
      estimatedHours: 10,
      lessons: [
        {
          title: "Greetings",
          description: "Learn basic English greetings",
          order: 1,
          estimatedMinutes: 30,
          challenges: [
            {
              type: ChallengeType.SELECT,
              question: 'How do you say "olá" in English?',
              order: 1,
              difficulty: DifficultyLevel.EASY,
              options: [
                { text: "hello", correct: true },
                { text: "goodbye", correct: false },
                { text: "thank you", correct: false },
              ],
            },
            {
              type: ChallengeType.FILL_BLANK,
              question: 'Complete: "How ___ you?"',
              order: 2,
              difficulty: DifficultyLevel.MEDIUM,
              options: [
                { text: "are", correct: true },
                { text: "is", correct: false },
                { text: "am", correct: false },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────────
const deleteAllData = async () => {
  console.log("🧹 Cleaning database...");

  const deletionOrder = [
    { model: "userAchievement", method: () => prisma.userAchievement.deleteMany() },
    { model: "challengeProgress", method: () => prisma.challengeProgress.deleteMany() },
    { model: "userProgress", method: () => prisma.userProgress.deleteMany() },
    { model: "userQuestionnaire", method: () => prisma.userQuestionnaire.deleteMany() },
    { model: "challengeOption", method: () => prisma.challengeOption.deleteMany() },
    { model: "challenge", method: () => prisma.challenge.deleteMany() },
    { model: "lesson", method: () => prisma.lesson.deleteMany() },
    { model: "unit", method: () => prisma.unit.deleteMany() },
    { model: "course", method: () => prisma.course.deleteMany() },
    { model: "userSubscription", method: () => prisma.userSubscription.deleteMany() },
    { model: "user", method: () => prisma.user.deleteMany() },
    { model: "userRole", method: () => prisma.userRole.deleteMany() },
  ];

  for (const { model, method } of deletionOrder) {
    try {
      const result = await method();
      console.log(`✅ Cleared ${model}: ${result.count} records`);
    } catch (error) {
      if (!error.message?.includes("does not exist") && !error.message?.includes("find")) {
        console.log(`⚠️  Error clearing ${model}:`, error.message);
      }
    }
  }
};

const createUserRoles = async () => {
  console.log("👥 Creating user roles...");

  const roles = await Promise.all(
    USER_ROLES.map((role) => prisma.userRole.create({ data: role }))
  );

  return Object.fromEntries(roles.map((role) => [role.name, role]));
};

const createCourses = async () => {
  console.log("📚 Creating courses...");

  // Create basic language courses
  const basicCourses = await Promise.all(
    BASIC_COURSES.map((course) => prisma.course.create({ data: course }))
  );

  // Create Spanish course with detailed content
  const spanishCourse = await prisma.course.create({
    data: {
      title: SPANISH_COURSE_DATA.title,
      imageSrc: SPANISH_COURSE_DATA.imageSrc,
      description: SPANISH_COURSE_DATA.description,
      language: SPANISH_COURSE_DATA.language,
      category: SPANISH_COURSE_DATA.category,
      level: SPANISH_COURSE_DATA.level,
      estimatedHours: SPANISH_COURSE_DATA.estimatedHours,
    },
  });

  // Create English course with detailed content
  const englishCourse = await prisma.course.create({
    data: {
      title: ENGLISH_COURSE_DATA.title,
      imageSrc: ENGLISH_COURSE_DATA.imageSrc,
      description: ENGLISH_COURSE_DATA.description,
      language: ENGLISH_COURSE_DATA.language,
      category: ENGLISH_COURSE_DATA.category,
      level: ENGLISH_COURSE_DATA.level,
      estimatedHours: ENGLISH_COURSE_DATA.estimatedHours,
    },
  });

  return [...basicCourses, spanishCourse, englishCourse];
};

const createCourseStructure = async (course, courseData = null) => {
  console.log(`   🏗️ Building structure for: ${course.title}`);
  
  let unitsData;
  
  if (courseData && courseData.units) {
    unitsData = courseData.units;
  } else {
    // Generate fake data for basic courses
    unitsData = Array.from({ length: 4 }, (_, i) => ({
      title: `Unit ${i + 1}: ${faker.word.words(2)}`,
      description: faker.lorem.sentence(),
      order: i + 1,
      estimatedHours: 8 + i * 2,
      lessons: Array.from({ length: 4 }, (_, j) => ({
        title: `Lesson ${j + 1}: ${faker.word.words(2)}`,
        description: faker.lorem.sentence(),
        order: j + 1,
        estimatedMinutes: 15 + j * 5,
        challenges: Array.from({ length: 3 }, (_, k) => ({
          type: [ChallengeType.SELECT, ChallengeType.ASSIST, ChallengeType.FILL_BLANK][k % 3],
          question: faker.lorem.sentence() + "?",
          order: k + 1,
          difficulty: [DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.HARD][k % 3],
          options: [
            { text: faker.word.words(2), correct: true, explanation: "This is the correct answer" },
            { text: faker.word.words(2), correct: false, explanation: "This is incorrect" },
            { text: faker.word.words(2), correct: false, explanation: "This is incorrect" },
          ],
        })),
      })),
    }));
  }

  for (const unitData of unitsData) {
    const unit = await prisma.unit.create({
      data: {
        title: unitData.title,
        description: unitData.description,
        courseId: course.id,
        order: unitData.order,
        estimatedHours: unitData.estimatedHours,
        totalExercises: unitData.lessons.reduce((sum, lesson) => sum + lesson.challenges.length, 0),
      },
    });

    for (const lessonData of unitData.lessons) {
      const lesson = await prisma.lesson.create({
        data: {
          title: lessonData.title,
          description: lessonData.description,
          unitId: unit.id,
          order: lessonData.order,
          estimatedMinutes: lessonData.estimatedMinutes,
          totalExercises: lessonData.challenges.length,
        },
      });

      for (const challengeData of lessonData.challenges) {
        const challenge = await prisma.challenge.create({
          data: {
            lessonId: lesson.id,
            type: challengeData.type,
            question: challengeData.question,
            order: challengeData.order,
            difficulty: challengeData.difficulty,
          },
        });

        // Create challenge options
        for (const optionData of challengeData.options) {
          await prisma.challengeOption.create({
            data: {
              challengeId: challenge.id,
              text: optionData.text,
              correct: optionData.correct,
              explanation: optionData.explanation || null,
              audioSrc: optionData.audioSrc || null,
            },
          });
        }
      }
    }
  }
};

const createUsers = async (roles) => {
  console.log("👤 Creating users...");
  const hashedPassword = await hash("123456", 12);

  const users = [];
  
  for (const userData of DEMO_USERS) {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        roleId: roles[userData.role].id,
        emailVerifiedAt: new Date(),
        status: UserStatus.ACTIVE,
        xp: userData.xp || 0,
        gems: userData.gems || 0,
      },
    });
    users.push(user);
    console.log(`   ✅ Created user: ${user.email} (${userData.role})`);
  }

  return users;
};

const createUserSubscriptions = async (users) => {
  console.log("💰 Creating user subscriptions...");

  // Create PRO subscription for owner
  await prisma.userSubscription.create({
    data: {
      userId: users[0].id,
      tier: SubscriptionTier.PRO,
      stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Create PRO subscription for admin
  await prisma.userSubscription.create({
    data: {
      userId: users[1].id,
      tier: SubscriptionTier.PRO,
      stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Students have FREE tier (default)
  await prisma.userSubscription.create({
    data: {
      userId: users[2].id,
      tier: SubscriptionTier.FREE,
    },
  });

  await prisma.userSubscription.create({
    data: {
      userId: users[3].id,
      tier: SubscriptionTier.FREE,
    },
  });
};

const createUserProgress = async (users, courses) => {
  console.log("📊 Creating user progress...");

  // Find specific courses
  const spanishCourse = courses.find(c => c.language === "es");
  const englishCourse = courses.find(c => c.language === "en");
  const frenchCourse = courses.find(c => c.language === "fr");

  // Create progress for each user
  const progressData = [
    {
      userId: users[0].id,
      activeCourseId: englishCourse.id,
      hearts: 5,
      points: 1000,
      level: 5,
      currentStreak: 10,
      longestStreak: 15,
    },
    {
      userId: users[1].id,
      activeCourseId: spanishCourse.id,
      hearts: 5,
      points: 750,
      level: 4,
      currentStreak: 7,
      longestStreak: 12,
    },
    {
      userId: users[2].id,
      activeCourseId: englishCourse.id,
      hearts: 3,
      points: 250,
      level: 2,
      currentStreak: 3,
      longestStreak: 5,
    },
    {
      userId: users[3].id,
      activeCourseId: frenchCourse.id,
      hearts: 4,
      points: 180,
      level: 1,
      currentStreak: 2,
      longestStreak: 3,
    },
  ];

  for (const data of progressData) {
    await prisma.userProgress.create({
      data: {
        userId: data.userId,
        userName: users.find(u => u.id === data.userId).name,
        activeCourseId: data.activeCourseId,
        hearts: data.hearts,
        points: data.points,
        level: data.level,
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
        lastActivityAt: new Date(),
      },
    });
  }
};

const createUserQuestionnaires = async (users, courses) => {
  console.log("📝 Creating user questionnaires...");

  const spanishCourse = courses.find(c => c.language === "es");
  const englishCourse = courses.find(c => c.language === "en");

  // Questionnaire for student1
  await prisma.userQuestionnaire.create({
    data: {
      userId: users[2].id,
      discoverySource: "friend",
      learningGoal: "Become fluent in English for work",
      languageLevel: "beginner",
      dailyGoal: "30 minutes",
      intensity: Intensity.REGULAR,
      focus: Focus.BUSINESS,
      selectedCourseId: englishCourse.id,
      selectedCourseTitle: englishCourse.title,
      courseLevel: CourseLevel.BEGINNER,
      recommendedUnits: [1, 2],
    },
  });

  // Questionnaire for student2
  await prisma.userQuestionnaire.create({
    data: {
      userId: users[3].id,
      discoverySource: "online",
      learningGoal: "Learn Spanish for travel",
      languageLevel: "beginner",
      dailyGoal: "20 minutes",
      intensity: Intensity.CASUAL,
      focus: Focus.TRAVEL,
      selectedCourseId: spanishCourse.id,
      selectedCourseTitle: spanishCourse.title,
      courseLevel: CourseLevel.BEGINNER,
      recommendedUnits: [1],
    },
  });
};

const createUserAchievements = async (users) => {
  console.log("🏆 Creating user achievements...");

  const achievements = [
    { name: "First Lesson", description: "Complete your first lesson" },
    { name: "7-Day Streak", description: "Practice for 7 days in a row" },
    { name: "Perfect Lesson", description: "Complete a lesson with no mistakes" },
    { name: "Early Bird", description: "Complete a lesson before 8 AM" },
    { name: "Weekend Warrior", description: "Complete lessons on both Saturday and Sunday" },
    { name: "Language Explorer", description: "Try 3 different language courses" },
  ];

  // Give random achievements to users
  for (const user of users) {
    const randomAchievements = faker.helpers.arrayElements(achievements, faker.number.int({ min: 1, max: 3 }));
    
    for (const achievement of randomAchievements) {
      await prisma.userAchievement.create({
        data: {
          userId: user.id,
          achievement: achievement.name,
          earnedAt: faker.date.recent({ days: 30 }),
        },
      });
    }
  }
};

// ────────────────────────────────────────────────────────────────────────────────
// MAIN SEED FUNCTION
// ────────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Starting database seeding...");
  console.log("=".repeat(50));

  try {
    // Step 1: Clean database
    await deleteAllData();
    console.log("=".repeat(50));

    // Step 2: Create user roles
    const roles = await createUserRoles();
    console.log("=".repeat(50));

    // Step 3: Create courses
    const courses = await createCourses();
    console.log("=".repeat(50));

    // Step 4: Build course structures
    console.log("🏗️ Building course structures...");
    for (const course of courses) {
      // Use real data for Spanish and English courses, fake data for others
      if (course.language === "es") {
        await createCourseStructure(course, SPANISH_COURSE_DATA);
      } else if (course.language === "en") {
        await createCourseStructure(course, ENGLISH_COURSE_DATA);
      } else {
        await createCourseStructure(course);
      }
    }
    console.log("=".repeat(50));

    // Step 5: Create users
    const users = await createUsers(roles);
    console.log("=".repeat(50));

    // Step 6: Create user data
    await createUserSubscriptions(users);
    await createUserProgress(users, courses);
    await createUserQuestionnaires(users, courses);
    await createUserAchievements(users);
    console.log("=".repeat(50));

    // Step 7: Update users with selected courses
    const spanishCourse = courses.find(c => c.language === "es");
    const englishCourse = courses.find(c => c.language === "en");
    const frenchCourse = courses.find(c => c.language === "fr");

    await prisma.user.update({
      where: { id: users[0].id },
      data: { selectedCourseId: englishCourse.id },
    });
    await prisma.user.update({
      where: { id: users[1].id },
      data: { selectedCourseId: spanishCourse.id },
    });
    await prisma.user.update({
      where: { id: users[2].id },
      data: { selectedCourseId: englishCourse.id },
    });
    await prisma.user.update({
      where: { id: users[3].id },
      data: { selectedCourseId: frenchCourse.id },
    });

    console.log("✅ Database seeded successfully!");
    console.log("=".repeat(50));
    console.log("\n🔐 Login Credentials:");
    console.log("-".repeat(30));
    DEMO_USERS.forEach((user, index) => {
      console.log(`   ${user.name}: ${user.email} / 123456`);
    });
    
    console.log("\n📚 Available Courses:");
    console.log("-".repeat(30));
    courses.forEach((course) => {
      console.log(`   - ${course.title} (${course.language?.toUpperCase() || 'N/A'})`);
    });
    
    console.log("\n🎯 Demo Setup:");
    console.log("-".repeat(30));
    console.log(`   👑 Owner: Learning English (PRO member)`);
    console.log(`   👨‍💼 Admin: Learning Spanish (PRO member)`);
    console.log(`   👨‍🎓 Student 1: Learning English (FREE tier)`);
    console.log(`   👩‍🎓 Student 2: Learning French (FREE tier)`);
    console.log(`   📖 Spanish course: ${SPANISH_COURSE_DATA.units.length} units with real content`);
    console.log(`   📖 English course: ${ENGLISH_COURSE_DATA.units.length} units with real content`);
    console.log("\n");

  } catch (error) {
    console.error("❌ Seeding failed:");
    console.error(error);
    throw error;
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// EXECUTION
// ────────────────────────────────────────────────────────────────────────────────
main()
  .catch((e) => {
    console.error("💥 Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });