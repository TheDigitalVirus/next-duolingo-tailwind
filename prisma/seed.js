// prisma/seed.ts
import {
  PrismaClient,
  ChallengeType,
  CourseCategory,
  CourseLevel,
  DifficultyLevel,
  SubscriptionTier,
  Intensity,
  Focus
} from "@prisma/client";
import { hash } from "bcrypt";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// ────────────────────────────────────────────────────────────────────────────────
// DATA DEFINITIONS
// ────────────────────────────────────────────────────────────────────────────────
const USER_ROLES = [
  { name: "OWNER", description: "System OWNER with full access" },
  { name: "ADMIN", description: "Administrator role" },
  { name: "STUDENT", description: "Default STUDENT role" },
];

const DEMO_USERS = [
  {
    email: "OWNER@platform.com",
    name: "System Owner",
    role: "OWNER",
    xp: 1000,
    gems: 500,
  },
  {
    email: "ADMIN@platform.com",
    name: "Platform Admin",
    role: "ADMIN",
    xp: 500,
    gems: 200,
  },
  { email: "student1@platform.com", name: "Demo Student 1", role: "STUDENT" },
  { email: "student2@platform.com", name: "Demo Student 2", role: "STUDENT" },
];

const COURSES = [
  // Language Courses
  {
    title: "English for Beginners",
    imageSrc: "/images/courses/english-beginner.jpg",
    description: "Learn basic English vocabulary and grammar",
    language: "en",
    category: CourseCategory.LANGUAGE,
    level: CourseLevel.BEGINNER,
    estimatedHours: 40,
  },
  // Programming Courses
  {
    title: "JavaScript Fundamentals",
    imageSrc: "/images/courses/javascript-beginner.jpg",
    description: "Learn the basics of JavaScript programming",
    technology: "javascript",
    category: CourseCategory.PROGRAMMING,
    level: CourseLevel.BEGINNER,
    estimatedHours: 50,
  },
  {
    title: "Python for Beginners",
    imageSrc: "/images/courses/python-beginner.jpg",
    description: "Start your Python programming journey",
    technology: "python",
    category: CourseCategory.PROGRAMMING,
    level: CourseLevel.BEGINNER,
    estimatedHours: 55,
  },
];

const SPANISH_COURSE_DATA = {
  title: "Espanhol para Iniciantes",
  imageSrc: "/es.svg",
  language: "es",
  category: CourseCategory.LANGUAGE,
  level: CourseLevel.BEGINNER,
  units: [
    {
      title: "Unidade 1 - Básico",
      description: "Aprenda o básico do espanhol para conversas do dia a dia",
      order: 1,
      estimatedHours: 8,
      lessons: [
        {
          title: "Saudações",
          order: 1,
          estimatedMinutes: 25,
          challenges: [
            {
              type: ChallengeType.SELECT,
              question: 'Qual destas opções significa "olá" em espanhol?',
              order: 1,
              difficulty: DifficultyLevel.EASY,
              options: [
                { text: "hola", correct: true, audioSrc: "/es_hola.mp3" },
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
                { text: "hola", correct: false, audioSrc: "/es_hola.mp3" },
                { text: "adiós", correct: true },
                { text: "por favor", correct: false },
              ],
            },
            {
              type: ChallengeType.ASSIST,
              question: "Escute o áudio. Qual palavra você ouviu?",
              order: 3,
              audioSrc: "/es_hola.mp3",
              difficulty: DifficultyLevel.MEDIUM,
              options: [
                { text: "hola", correct: true, audioSrc: "/es_hola.mp3" },
                { text: "adiós", correct: false },
                { text: "gracias", correct: false },
              ],
            },
            // NOVO: Desafio FILL_BLANK
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
          title: "Pessoas e Gênero",
          order: 2,
          estimatedMinutes: 35,
          challenges: [
            {
              type: ChallengeType.SELECT,
              question: 'Como se diz "o homem" em espanhol?',
              order: 1,
              difficulty: DifficultyLevel.EASY,
              options: [
                { text: "el hombre", correct: true, audioSrc: "/es_man.mp3" },
                { text: "la mujer", correct: false, audioSrc: "/es_woman.mp3" },
                { text: "el niño", correct: false, audioSrc: "/es_boy.mp3" },
              ],
            },
            {
              type: ChallengeType.MATCH,
              question: "Relacione as palavras com suas traduções",
              order: 2,
              difficulty: DifficultyLevel.MEDIUM,
              options: [
                { text: "hombre → man", correct: true },
                { text: "mujer → woman", correct: true },
                { text: "niño → girl", correct: false },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Unidade 2 - Família e Crianças",
      description: "Aprenda vocabulário sobre família e pessoas",
      order: 2,
      estimatedHours: 10,
      lessons: [
        {
          title: "Membros da Família",
          order: 1,
          estimatedMinutes: 30,
          challenges: [
            {
              type: ChallengeType.SELECT,
              question: 'Como se diz "o menino" em espanhol?',
              order: 1,
              difficulty: DifficultyLevel.EASY,
              options: [
                { text: "el niño", correct: true, audioSrc: "/es_boy.mp3" },
                { text: "la niña", correct: false, audioSrc: "/es_girl.mp3" },
                { text: "el hombre", correct: false, audioSrc: "/es_man.mp3" },
              ],
            },
            {
              type: ChallengeType.REORDER,
              question: "Ordene as palavras da menor para a maior idade",
              order: 2,
              difficulty: DifficultyLevel.MEDIUM,
              options: [
                { text: "niño", correct: true, order: 1 },
                { text: "hombre", correct: true, order: 2 },
                { text: "abuelo", correct: true, order: 3 },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const JAVASCRIPT_COURSE_DATA = {
  title: "JavaScript Fundamentals",
  imageSrc: "/images/courses/javascript-beginner.jpg",
  technology: "javascript",
  category: CourseCategory.PROGRAMMING,
  level: CourseLevel.BEGINNER,
  units: [
    {
      title: "Unit 1 - Basics",
      description: "Learn JavaScript fundamentals",
      order: 1,
      estimatedHours: 15,
      lessons: [
        {
          title: "Variables and Data Types",
          order: 1,
          estimatedMinutes: 45,
          challenges: [
            // NOVO: Desafio CODE
            {
              type: ChallengeType.CODE,
              question: "Declare a variable called 'name' and assign your name to it",
              order: 1,
              difficulty: DifficultyLevel.EASY,
              options: [
                {
                  text: "let name = 'John';",
                  correct: true,
                  codeSnippet: "let name = 'John';",
                  explanation: "Correct! This declares a variable using let and assigns a string.",
                },
                {
                  text: "const name = 'John';",
                  correct: true,
                  codeSnippet: "const name = 'John';",
                  explanation: "Also correct! const is used for constants.",
                },
                {
                  text: "name = 'John';",
                  correct: false,
                  codeSnippet: "name = 'John';",
                  explanation: "Incorrect. This would work but is not recommended without declaration.",
                },
              ],
            },
            {
              type: ChallengeType.SELECT,
              question: "Which keyword is used to declare a constant in JavaScript?",
              order: 2,
              difficulty: DifficultyLevel.EASY,
              options: [
                { text: "const", correct: true },
                { text: "let", correct: false },
                { text: "var", correct: false },
              ],
            },
            {
              type: ChallengeType.FILL_BLANK,
              question: "Complete the code: ___ age = 25;",
              order: 3,
              difficulty: DifficultyLevel.MEDIUM,
              options: [
                { text: "let", correct: true },
                { text: "const", correct: true },
                { text: "var", correct: true },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
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
    { model: "user", method: () => prisma.user.deleteMany() },
    { model: "userRole", method: () => prisma.userRole.deleteMany() },
  ];

  for (const { model, method } of deletionOrder) {
    try {
      await method();
    } catch (error) {
      if (!error.message.includes("does not exist")) {
        console.log(`ℹ️  ${model} table doesn't exist yet or couldn't be cleared`);
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

  // Criar cursos básicos
  const basicCourses = await Promise.all(
    COURSES.map((course) => prisma.course.create({ data: course }))
  );

  // Criar curso de espanhol com conteúdo real
  const spanishCourse = await prisma.course.create({
    data: {
      title: SPANISH_COURSE_DATA.title,
      imageSrc: SPANISH_COURSE_DATA.imageSrc,
      language: SPANISH_COURSE_DATA.language,
      category: SPANISH_COURSE_DATA.category,
      level: SPANISH_COURSE_DATA.level,
      estimatedHours: 18,
    },
  });

  // Criar curso de JavaScript com desafios de código
  const jsCourse = await prisma.course.create({
    data: {
      title: JAVASCRIPT_COURSE_DATA.title,
      imageSrc: JAVASCRIPT_COURSE_DATA.imageSrc,
      technology: JAVASCRIPT_COURSE_DATA.technology,
      category: JAVASCRIPT_COURSE_DATA.category,
      level: JAVASCRIPT_COURSE_DATA.level,
      estimatedHours: JAVASCRIPT_COURSE_DATA.units.reduce(
        (acc, unit) => acc + unit.estimatedHours,
        0
      ),
    },
  });

  return [...basicCourses, spanishCourse, jsCourse];
};

const createCourseStructure = async (course, courseData) => {
  // SE courseData existe, usar os dados reais, SENÃO usar faker
  const unitsData = courseData?.units || Array.from({ length: 3 }, (_, i) => ({
    title: `Unit ${i + 1}: ${faker.word.words(2)}`,
    description: faker.lorem.sentence(),
    order: i + 1,
    estimatedHours: 8 + i * 2,
    lessons: Array.from({ length: 3 }, (_, j) => ({
      title: `Lesson ${j + 1}: ${faker.word.words(2)}`,
      order: j + 1,
      estimatedMinutes: 20 + j * 10,
      challenges: Array.from({ length: 2 }, (_, k) => ({
        type: k % 2 === 0 ? ChallengeType.SELECT : ChallengeType.ASSIST,
        question: faker.lorem.sentence() + "?",
        order: k + 1,
        difficulty: k === 0 ? DifficultyLevel.EASY : DifficultyLevel.MEDIUM,
        options: [
          { text: faker.word.words(2), correct: true, explanation: "Correct answer" },
          { text: faker.word.words(2), correct: false, explanation: "Incorrect" },
          { text: faker.word.words(2), correct: false, explanation: "Incorrect" },
        ],
      })),
    })),
  }));

  for (const unitData of unitsData) {
    const unit = await prisma.unit.create({
      data: {
        title: unitData.title,
        description: unitData.description,
        courseId: course.id,
        order: unitData.order,
        estimatedHours: unitData.estimatedHours,
      },
    });

    console.log(`   📖 Created unit: ${unit.title}`);

    for (const lessonData of unitData.lessons) {
      const lesson = await prisma.lesson.create({
        data: {
          title: lessonData.title,
          unitId: unit.id,
          order: lessonData.order,
          estimatedMinutes: lessonData.estimatedMinutes,
        },
      });

      console.log(`     📝 Created lesson: ${lesson.title}`);

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

        await prisma.challengeOption.createMany({
          data: challengeData.options.map((option) => ({
            challengeId: challenge.id,
            text: option.text,
            correct: option.correct,
            explanation: option.explanation,
            audioSrc: option.audioSrc,
          })),
        });
      }
    }
  }
};

const createUsers = async (roles) => {
  console.log("👤 Creating users...");
  const hashedPassword = await hash("123456", 12);

  return Promise.all(
    DEMO_USERS.map((user) =>
      prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          password: hashedPassword,
          roleId: roles[user.role].id,
          emailVerifiedAt: new Date(),
          status: "ACTIVE",
          xp: user.xp || 0,
          gems: user.gems || 0,
        },
      })
    )
  );
};

const createUserSubscriptions = async (users) => {
  console.log("💰 Creating user subscriptions...");

  await prisma.userSubscription.create({
    data: {
      userId: users[0].id, // owner
      tier: SubscriptionTier.PRO,
      stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    },
  });

  await prisma.userSubscription.create({
    data: {
      userId: users[1].id, // admin
      tier: SubscriptionTier.PRO, 
      stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
};

const createUserProgress = async (users, courses) => {
  console.log("📊 Creating user progress...");

  const progressData = [
    {
      userId: users[2].id, // student1
      courseId: courses[0].id, // English
      hearts: 5,
      points: 250,
      level: 2,
    },
    {
      userId: users[3].id, // student2
      courseId: courses[1].id, // JavaScript (agora é o segundo curso)
      hearts: 3,
      points: 180,
      level: 1,
    },
  ];

  await Promise.all(
    progressData.map((data) =>
      prisma.userProgress.create({
        data: {
          userId: data.userId,
          activeCourseId: data.courseId,
          hearts: data.hearts,
          points: data.points,
          level: data.level,
          currentStreak: 3,
          longestStreak: 7,
        },
      })
    )
  );
};

const createUserQuestionnaires = async (users, courses) => {
  console.log("📝 Creating user questionnaires...");

  await prisma.userQuestionnaire.create({
    data: {
      userId: users[2].id, // student1
      discoverySource: "friend",
      learningGoal: "Become fluent in English for work",
      languageLevel: "beginner", 
      dailyGoal: "30 minutes",
      intensity: Intensity.REGULAR,
      focus: Focus.BUSINESS,
      selectedCourseId: courses[0].id, // English
      courseLevel: CourseLevel.BEGINNER,
    },
  });

  await prisma.userQuestionnaire.create({
    data: {
      userId: users[3].id, // student2
      discoverySource: "online",
      learningGoal: "Learn programming to change careers",
      languageLevel: "beginner",
      dailyGoal: "60 minutes", 
      intensity: Intensity.INTENSE,
      focus: Focus.ACADEMIC,
      selectedCourseId: courses[1].id, // JavaScript
      courseLevel: CourseLevel.BEGINNER,
    },
  });
};

const createUserAchievements = async (users) => {
  console.log("🏆 Creating user achievements...");

  await prisma.userAchievement.createMany({
    data: [
      {
        userId: users[2].id,
        achievement: "First Streak! - Complete 3 days in a row",
      },
      {
        userId: users[3].id,
        achievement: "First Lesson Completed",
      },
      {
        userId: users[2].id,
        achievement: "Language Learner - Complete 10 exercises",
      },
    ],
  });
};

// ────────────────────────────────────────────────────────────────────────────────
// MAIN SEED FUNCTION
// ────────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Starting database seeding...");

  try {
    await deleteAllData();

    // Create core data
    const roles = await createUserRoles();
    const courses = await createCourses();

    // Create course structures
    console.log("🏗️ Building course structures...");
    for (const course of courses) {
      // CORREÇÃO: Verificar pelo título correto do curso de espanhol
      const isSpanishCourse = course.title === "Espanhol para Iniciantes";
      console.log(`   Building: ${course.title}`);
      await createCourseStructure(
        course,
        isSpanishCourse ? SPANISH_COURSE_DATA : undefined
      );
    }

    // Create users and their data
    // Criar usuários com roles
    const users = await createUsers(roles);

    // Criar estruturas dos cursos específicos
    console.log("🏗️ Building course structures...");

    // Curso de Espanhol
    const spanishCourse = courses.find((c) => c.language === "es");
    console.log(`   Building: ${spanishCourse.title}`);
    await createCourseStructure(spanishCourse, SPANISH_COURSE_DATA);

    // Curso de JavaScript
    const jsCourse = courses.find((c) => c.technology === "javascript");
    console.log(`   Building: ${jsCourse.title}`);
    await createCourseStructure(jsCourse, JAVASCRIPT_COURSE_DATA);

    // Criar dados dos usuários
    await createUserProgress(users, courses);
    await createUserSubscriptions(users);
    await createUserQuestionnaires(users, courses);
    await createUserAchievements(users);

    // Update users with selected courses
    await prisma.user.update({
      where: { id: users[2].id },
      data: { selectedCourseId: courses[0].id }, // English
    });
    await prisma.user.update({
      where: { id: users[3].id },
      data: { selectedCourseId: courses[1].id }, // JavaScript
    });

    console.log("✅ Database seeded successfully!");
    console.log("\n🔐 Login Credentials:");
    DEMO_USERS.forEach((user) => {
      console.log(`   ${user.name}: ${user.email} / 123456`);
    });
    console.log("\n📚 Available courses:");
    courses.forEach((course) => {
      console.log(`   - ${course.title} (${course.category})`);
    });
    console.log("\n🎯 Demo setup:");
    console.log(`   Student 1: Learning English`);
    console.log(`   Student 2: Learning JavaScript`);
    console.log(`   Spanish course: ${SPANISH_COURSE_DATA.units.length} units with real content`);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
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