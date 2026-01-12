import {
  PrismaClient,
  ChallengeType,
  CourseCategory,
  CourseLevel,
  DifficultyLevel,
  SubscriptionTier,
  Intensity,
  Focus,
  UserStatus,
  EnrollmentStatus
} from "@prisma/client";
import { hash } from "bcrypt";
import { faker } from "@faker-js/faker";
import prisma from "@/lib/prisma";

// ────────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ────────────────────────────────────────────────────────────────────────────────
type UserRoleData = {
  name: string;
  description: string;
};

type DemoUserData = {
  email: string;
  name: string;
  role: "OWNER" | "ADMIN" | "STUDENT";
  xp: number;
  gems: number;
};

type CourseData = {
  title: string;
  imageSrc: string;
  description: string | null;
  language: string | null;
  category: CourseCategory;
  level: CourseLevel;
  estimatedHours: number;
};

type UnitData = {
  title: string;
  description: string;
  order: number;
  estimatedHours: number;
  lessons: LessonData[];
};

type LessonData = {
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  challenges: ChallengeData[];
};

type ChallengeData = {
  type: ChallengeType;
  question: string;
  order: number;
  difficulty: DifficultyLevel;
  options: ChallengeOptionData[];
  audioSrc?: string;
};

type ChallengeOptionData = {
  text: string;
  correct: boolean;
  explanation?: string;
  audioSrc?: string;
};

type DetailedCourseData = {
  title: string;
  imageSrc: string;
  description: string;
  language: string;
  category: CourseCategory;
  level: CourseLevel;
  estimatedHours: number;
  units: UnitData[];
};

type EnrollmentConfig = {
  course: CourseData & { id: number };
  isActive: boolean;
  progressPercent: number;
};

type UserEnrollmentConfig = {
  userId: string;
  enrollments: EnrollmentConfig[];
};

// ────────────────────────────────────────────────────────────────────────────────
// DATA CONSTANTS - ATUALIZADO COM OS CURSOS DO courses_rows.json
// ────────────────────────────────────────────────────────────────────────────────
const USER_ROLES: UserRoleData[] = [
  { name: "OWNER", description: "System owner with full access" },
  { name: "ADMIN", description: "Administrator role" },
  { name: "STUDENT", description: "Default student role" },
];

const DEMO_USERS: DemoUserData[] = [
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

// Todos os cursos do seu arquivo courses_rows.json
const ALL_COURSES: CourseData[] = [
  {
    title: "French",
    imageSrc: "/images/courses/fr.svg",
    description: "Learn basic French vocabulary and grammar",
    language: "en",
    category: CourseCategory.LANGUAGE,
    level: CourseLevel.BEGINNER,
    estimatedHours: 44,
  },
  {
    title: "Spanish",
    imageSrc: "/images/courses/es.svg",
    description: "Learn basic Spanish vocabulary and grammar",
    language: "en",
    category: CourseCategory.LANGUAGE,
    level: CourseLevel.BEGINNER,
    estimatedHours: 48,
  },
  {
    title: "Korean",
    imageSrc: "/images/courses/ko.svg",
    description: "Learn basic Korean vocabulary and grammar",
    language: "en",
    category: CourseCategory.LANGUAGE,
    level: CourseLevel.BEGINNER,
    estimatedHours: 50,
  },
  {
    title: "Chinese",
    imageSrc: "/images/courses/zh.svg",
    description: "Learn basic Chinese vocabulary and grammar",
    language: "en",
    category: CourseCategory.LANGUAGE,
    level: CourseLevel.BEGINNER,
    estimatedHours: 58,
  },
  {
    title: "Japanese",
    imageSrc: "/images/courses/ja.svg",
    description: "Learn basic Japanese vocabulary and grammar",
    language: "en",
    category: CourseCategory.LANGUAGE,
    level: CourseLevel.BEGINNER,
    estimatedHours: 52,
  },
  {
    title: "Italian",
    imageSrc: "/images/courses/it.svg",
    description: "Learn basic Italian vocabulary and grammar",
    language: "en",
    category: CourseCategory.LANGUAGE,
    level: CourseLevel.BEGINNER,
    estimatedHours: 52,
  },
  {
    title: "German",
    imageSrc: "/images/courses/de.svg",
    description: "Learn basic German vocabulary and grammar",
    language: "en",
    category: CourseCategory.LANGUAGE,
    level: CourseLevel.BEGINNER,
    estimatedHours: 53,
  },
  {
    title: "Portuguese",
    imageSrc: "/images/courses/pt.svg",
    description: "Learn basic Portuguese vocabulary and grammar",
    language: "en",
    category: CourseCategory.LANGUAGE,
    level: CourseLevel.BEGINNER,
    estimatedHours: 41,
  },
  {
    title: "Francês",
    imageSrc: "/images/courses/fr.svg",
    description: "Aprenda francês do zero com lições práticas",
    language: "pt-BR",
    category: CourseCategory.LANGUAGE,
    level: CourseLevel.BEGINNER,
    estimatedHours: 48,
  },
  {
    title: "Coreano",
    imageSrc: "/images/courses/ko.svg",
    description: "Aprenda coreano do zero com lições práticas",
    language: "pt-BR",
    category: CourseCategory.LANGUAGE,
    level: CourseLevel.BEGINNER,
    estimatedHours: 50,
  },
  {
    title: "Chinês",
    imageSrc: "/images/courses/zh.svg",
    description: "Aprenda chinês do zero com lições práticas",
    language: "pt-BR",
    category: CourseCategory.LANGUAGE,
    level: CourseLevel.BEGINNER,
    estimatedHours: 50,
  },
  {
    title: "Japonês",
    imageSrc: "/images/courses/ja.svg",
    description: "Aprenda japonês do zero com lições práticas",
    language: "pt-BR",
    category: CourseCategory.LANGUAGE,
    level: CourseLevel.BEGINNER,
    estimatedHours: 51,
  },
  {
    title: "Italiano",
    imageSrc: "/images/courses/it.svg",
    description: "Aprenda italiano do zero com lições práticas",
    language: "pt-BR",
    category: CourseCategory.LANGUAGE,
    level: CourseLevel.BEGINNER,
    estimatedHours: 52,
  },
  {
    title: "Alemão",
    imageSrc: "/images/courses/de.svg",
    description: "Aprenda alemão do zero com lições práticas",
    language: "pt-BR",
    category: CourseCategory.LANGUAGE,
    level: CourseLevel.BEGINNER,
    estimatedHours: 53,
  },
];

const SPANISH_COURSE_DATA: DetailedCourseData = {
  title: "Espanhol",
  imageSrc: "/images/courses/es.svg",
  description: "Aprenda espanhol do zero com lições práticas",
  language: "pt-BR",
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

const ENGLISH_COURSE_DATA: DetailedCourseData = {
  title: "Inglês",
  imageSrc: "/images/courses/en.svg",
  description: "Aprenda inglês do zero com lições práticas",
  language: "pt-BR",
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

type DeletionOrder = Array<{
  model: string;
  method: () => Promise<{ count: number }>;
}>;

// ────────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────────
const deleteAllData = async (): Promise<void> => {
  console.log("🧹 Cleaning database...");

  const deletionOrder: DeletionOrder = [
    { model: "userAchievement", method: () => prisma.userAchievement.deleteMany() },
    { model: "challengeProgress", method: () => prisma.challengeProgress.deleteMany() },
    { model: "userEnrollment", method: () => prisma.userEnrollment.deleteMany() },
    { model: "userQuestionnaire", method: () => prisma.userQuestionnaire.deleteMany() },
    { model: "challengeOption", method: () => prisma.challengeOption.deleteMany() },
    { model: "challenge", method: () => prisma.challenge.deleteMany() },
    { model: "lesson", method: () => prisma.lesson.deleteMany() },
    { model: "unit", method: () => prisma.unit.deleteMany() },
    { model: "course", method: () => prisma.course.deleteMany() },
    { model: "userSubscription", method: () => prisma.userSubscription.deleteMany() },
    { model: "image", method: () => prisma.image.deleteMany() },
    { model: "session", method: () => prisma.session.deleteMany() },
    { model: "account", method: () => prisma.account.deleteMany() },
    { model: "verificationToken", method: () => prisma.verificationToken.deleteMany() },
    { model: "systemLog", method: () => prisma.systemLog.deleteMany() },
    { model: "user", method: () => prisma.user.deleteMany() },
    { model: "userRole", method: () => prisma.userRole.deleteMany() },
  ];

  for (const { model, method } of deletionOrder) {
    try {
      const result = await method();
      console.log(`✅ Cleared ${model}: ${result.count} records`);
    } catch (error: any) {
      if (!error.message?.includes("does not exist") && !error.message?.includes("find")) {
        console.log(`⚠️  Error clearing ${model}:`, error.message);
      }
    }
  }
};

const createUserRoles = async (): Promise<Record<string, { id: string; name: string; description: string | null }>> => {
  console.log("👥 Creating user roles...");

  const roles = await Promise.all(
    USER_ROLES.map((role) => prisma.userRole.create({ data: role }))
  );

  return roles.reduce((acc, role) => {
    acc[role.name] = role;
    return acc;
  }, {} as Record<string, typeof roles[0]>);
};

const createCourses = async (): Promise<Array<CourseData & { id: number; isFeatured: boolean; isPublic: boolean }>> => {
  console.log("📚 Creating courses...");

  const createdCourses: Array<CourseData & { id: number; isFeatured: boolean; isPublic: boolean }> = [];
  
  // Criar todos os cursos da lista ALL_COURSES
  for (const courseData of ALL_COURSES) {
    const course = await prisma.course.create({
      data: {
        ...courseData,
        isFeatured: Math.random() > 0.5,
        isPublic: true,
      },
    });
    createdCourses.push(course);
    console.log(`   ✅ Created course: ${course.title} (${course.language})`);
  }

  const detailedSpanishCourse = await prisma.course.create({
    data: {
      title: SPANISH_COURSE_DATA.title,
      imageSrc: SPANISH_COURSE_DATA.imageSrc,
      description: SPANISH_COURSE_DATA.description,
      language: SPANISH_COURSE_DATA.language,
      category: SPANISH_COURSE_DATA.category,
      level: SPANISH_COURSE_DATA.level,
      estimatedHours: SPANISH_COURSE_DATA.estimatedHours,
      isFeatured: true,
      isPublic: true,
    },
  });
  createdCourses.push(detailedSpanishCourse);

  const detailedEnglishCourse = await prisma.course.create({
    data: {
      title: ENGLISH_COURSE_DATA.title,
      imageSrc: ENGLISH_COURSE_DATA.imageSrc,
      description: ENGLISH_COURSE_DATA.description,
      language: ENGLISH_COURSE_DATA.language,
      category: ENGLISH_COURSE_DATA.category,
      level: ENGLISH_COURSE_DATA.level,
      estimatedHours: ENGLISH_COURSE_DATA.estimatedHours,
      isFeatured: true,
      isPublic: true,
    },
  });
  createdCourses.push(detailedEnglishCourse);

  return createdCourses;
};

const createCourseStructure = async (course: CourseData & { id: number }): Promise<void> => {
  console.log(`   🏗️ Building structure for: ${course.title}`);
  
  let unitsData: UnitData[];
  
  // Criar estrutura detalhada apenas para cursos específicos
  if (course.title === "Espanhol" && course.language === "pt-BR") {
    unitsData = SPANISH_COURSE_DATA.units;
  } else if (course.title === "Inglês" && course.language === "pt-BR") {
    unitsData = ENGLISH_COURSE_DATA.units;
  } else {
    // Estrutura mínima para outros cursos
    const courseName = course.title.split(' ')[0]; // Pega a primeira palavra do título
    
    unitsData = [
      {
        title: "Introdução",
        description: `Introdução ao curso de ${courseName}`,
        order: 1,
        estimatedHours: 2,
        lessons: [
          {
            title: "Bem-vindo",
            description: `Bem-vindo ao curso de ${courseName}`,
            order: 1,
            estimatedMinutes: 15,
            challenges: [
              {
                type: ChallengeType.SELECT,
                question: `Você está pronto para aprender ${courseName}?`,
                order: 1,
                difficulty: DifficultyLevel.EASY,
                options: [
                  { text: "Sim", correct: true },
                  { text: "Não", correct: false },
                ],
              },
            ],
          },
        ],
      },
    ];
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

const createUsers = async (roles: Record<string, { id: string; name: string; description: string | null }>): Promise<Array<{
  id: string;
  email: string;
  name: string | null;
  roleId: string;
  xp: number;
  gems: number;
  hearts: number;
  totalPoints: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  dailyStudyTime: number;
  perfectExercises: number;
}>> => {
  console.log("👤 Creating users...");
  const hashedPassword = await hash("123456", 12);

  const users: Array<ReturnType<typeof prisma.user.create> extends Promise<infer T> ? T : never> = [];
  
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
        hearts: 5,
        totalPoints: userData.xp || 0,
        level: Math.floor((userData.xp || 0) / 100) + 1,
        currentStreak: faker.number.int({ min: 0, max: 10 }),
        longestStreak: faker.number.int({ min: 5, max: 20 }),
        totalStudyTime: faker.number.int({ min: 100, max: 1000 }),
        dailyStudyTime: faker.number.int({ min: 10, max: 60 }),
        perfectExercises: faker.number.int({ min: 5, max: 50 }),
        lastActiveAt: new Date(),
      },
    });
    users.push(user);
    console.log(`   ✅ Created user: ${user.email} (${userData.role})`);
  }

  return users;
};

const createUserEnrollments = async (
  users: Array<{ id: string }>,
  courses: Array<CourseData & { id: number }>
): Promise<Array<{
  id: number;
  userId: string;
  courseId: number;
  isActive: boolean;
  progressPercent: number;
}>> => {
  console.log("🎫 Creating user enrollments...");

  // Buscar cursos específicos com lógica mais flexível
  const spanishCourse = courses.find(c => 
    (c.title.includes("Espanhol") || c.title.includes("Spanish")) && 
    c.language === "pt-BR"
  );
  
  const englishCourse = courses.find(c => 
    (c.title.includes("Inglês") || c.title.includes("English")) && 
    c.language === "pt-BR"
  );
  
  const frenchCourse = courses.find(c => 
    (c.title.includes("Francês") || c.title.includes("French")) && 
    (c.language === "pt-BR" || c.language === "en")
  );
  
  const germanCourse = courses.find(c => 
    (c.title.includes("Alemão") || c.title.includes("German")) && 
    (c.language === "pt-BR" || c.language === "en")
  );

  // Se não encontrar cursos em pt-BR, usar versões em inglês
  const spanishCourseFinal = spanishCourse || courses.find(c => c.title.includes("Spanish"));
  const englishCourseFinal = englishCourse || courses.find(c => c.title.includes("English"));
  const frenchCourseFinal = frenchCourse || courses.find(c => c.title.includes("French"));
  const germanCourseFinal = germanCourse || courses.find(c => c.title.includes("German"));

  if (!spanishCourseFinal || !englishCourseFinal || !frenchCourseFinal || !germanCourseFinal) {
    console.error("❌ Cursos não encontrados:");
    console.error(`   Espanhol: ${!!spanishCourseFinal}`);
    console.error(`   Inglês: ${!!englishCourseFinal}`);
    console.error(`   Francês: ${!!frenchCourseFinal}`);
    console.error(`   Alemão: ${!!germanCourseFinal}`);
    
    // Usar os primeiros cursos disponíveis como fallback
    const fallbackCourses = courses.slice(0, 4);
    console.log("📌 Usando cursos fallback:", fallbackCourses.map(c => c.title));
    
    // Configuração de fallback
    const enrollmentConfigs: UserEnrollmentConfig[] = [
      {
        userId: users[0].id, // Owner
        enrollments: [
          { course: fallbackCourses[0], isActive: true, progressPercent: 75 },
          { course: fallbackCourses[1], isActive: false, progressPercent: 40 },
          { course: fallbackCourses[2], isActive: false, progressPercent: 20 },
        ],
      },
      {
        userId: users[1].id, // Admin
        enrollments: [
          { course: fallbackCourses[1], isActive: true, progressPercent: 60 },
          { course: fallbackCourses[0], isActive: false, progressPercent: 30 },
        ],
      },
      {
        userId: users[2].id, // Student 1
        enrollments: [
          { course: fallbackCourses[0], isActive: true, progressPercent: 45 },
          { course: fallbackCourses[3], isActive: false, progressPercent: 10 },
        ],
      },
      {
        userId: users[3].id, // Student 2
        enrollments: [
          { course: fallbackCourses[2], isActive: true, progressPercent: 25 },
          { course: fallbackCourses[1], isActive: false, progressPercent: 15 },
        ],
      },
    ];

    return await createEnrollmentsFromConfig(enrollmentConfigs);
  }

  // Configuração original com cursos encontrados
  const enrollmentConfigs: UserEnrollmentConfig[] = [
    {
      userId: users[0].id, // Owner
      enrollments: [
        { course: englishCourseFinal, isActive: true, progressPercent: 75 },
        { course: spanishCourseFinal, isActive: false, progressPercent: 40 },
        { course: frenchCourseFinal, isActive: false, progressPercent: 20 },
      ],
    },
    {
      userId: users[1].id, // Admin
      enrollments: [
        { course: spanishCourseFinal, isActive: true, progressPercent: 60 },
        { course: englishCourseFinal, isActive: false, progressPercent: 30 },
      ],
    },
    {
      userId: users[2].id, // Student 1
      enrollments: [
        { course: englishCourseFinal, isActive: true, progressPercent: 45 },
        { course: germanCourseFinal, isActive: false, progressPercent: 10 },
      ],
    },
    {
      userId: users[3].id, // Student 2
      enrollments: [
        { course: frenchCourseFinal, isActive: true, progressPercent: 25 },
        { course: spanishCourseFinal, isActive: false, progressPercent: 15 },
      ],
    },
  ];

  return await createEnrollmentsFromConfig(enrollmentConfigs);
};

const createEnrollmentsFromConfig = async (
  enrollmentConfigs: UserEnrollmentConfig[]
): Promise<Array<{
  id: number;
  userId: string;
  courseId: number;
  isActive: boolean;
  progressPercent: number;
}>> => {
  const allEnrollments: Array<{
    id: number;
    userId: string;
    courseId: number;
    isActive: boolean;
    progressPercent: number;
  }> = [];

  for (const config of enrollmentConfigs) {
    for (const enrollmentData of config.enrollments) {
      // Get first lesson of the course to set as current
      const firstLesson = await prisma.lesson.findFirst({
        where: {
          unit: {
            courseId: enrollmentData.course.id,
          },
        },
        orderBy: {
          order: 'asc',
        },
        include: {
          unit: true,
        },
      });

      const enrollment = await prisma.userEnrollment.create({
        data: {
          userId: config.userId,
          courseId: enrollmentData.course.id,
          status: EnrollmentStatus.ACTIVE,
          isActive: enrollmentData.isActive,
          progressPercent: enrollmentData.progressPercent,
          completedLessons: [],
          completedChallenges: [],
          coursePoints: Math.floor(enrollmentData.progressPercent * 10),
          courseHearts: 5,
          perfectChallenges: Math.floor(enrollmentData.progressPercent / 10),
          totalTimeSpent: Math.floor(enrollmentData.progressPercent * 60), // minutes
          enrolledAt: faker.date.past({ years: 1 }),
          startedAt: faker.date.recent({ days: 30 }),
          lastAccessedAt: enrollmentData.isActive ? new Date() : faker.date.recent({ days: 7 }),
          currentUnitId: firstLesson?.unitId,
          currentLessonId: firstLesson?.id,
        },
      });

      allEnrollments.push({
        id: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        isActive: enrollment.isActive,
        progressPercent: enrollment.progressPercent,
      });
      console.log(`   ✅ Enrolled user ${config.userId} in ${enrollmentData.course.title} (${enrollmentData.progressPercent}% progress)`);
    }
  }

  return allEnrollments;
};

const createChallengeProgress = async (
  users: Array<{ id: string }>,
  enrollments: Array<{ id: number; userId: string; courseId: number; isActive: boolean }>
): Promise<void> => {
  console.log("📈 Creating challenge progress...");

  // For each active enrollment, create some challenge progress
  for (const enrollment of enrollments.filter(e => e.isActive)) {
    // Get some challenges from the course
    const challenges = await prisma.challenge.findMany({
      where: {
        lesson: {
          unit: {
            courseId: enrollment.courseId,
          },
        },
      },
      take: 10, // Create progress for first 10 challenges
    });

    const completedChallenges: number[] = [];
    
    for (const challenge of challenges) {
      const completed = Math.random() > 0.3; // 70% chance of completion
      
      await prisma.challengeProgress.create({
        data: {
          userId: enrollment.userId,
          challengeId: challenge.id,
          enrollmentId: enrollment.id,
          completed,
          completedAt: completed ? faker.date.recent() : null,
          score: completed ? faker.number.int({ min: 70, max: 100 }) : null,
          attempts: completed ? faker.number.int({ min: 1, max: 3 }) : 0,
        },
      });

      if (completed) {
        completedChallenges.push(challenge.id);
      }
    }

    // Update enrollment with completed challenges
    if (completedChallenges.length > 0) {
      await prisma.userEnrollment.update({
        where: { id: enrollment.id },
        data: {
          completedChallenges,
        },
      });
    }
  }
};

const createUserSubscriptions = async (users: Array<{ id: string }>): Promise<void> => {
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

const createUserQuestionnaires = async (
  users: Array<{ id: string }>,
  courses: Array<CourseData & { id: number }>
): Promise<void> => {
  console.log("📝 Creating user questionnaires...");

  const spanishCourse = courses.find(c => 
    (c.title.includes("Espanhol") || c.title.includes("Spanish")) && 
    c.language === "pt-BR"
  );
  
  const englishCourse = courses.find(c => 
    (c.title.includes("Inglês") || c.title.includes("English")) && 
    c.language === "pt-BR"
  );

  if (!spanishCourse || !englishCourse) {
    console.log("⚠️  Using fallback courses for questionnaires");
    // Usar os primeiros 2 cursos como fallback
    const [course1, course2] = courses.slice(0, 2);
    
    await prisma.userQuestionnaire.create({
      data: {
        userId: users[2].id,
        discoverySource: "friend",
        learningGoal: "Become fluent for work",
        languageLevel: "beginner",
        dailyGoal: "30 minutes",
        intensity: Intensity.REGULAR,
        focus: Focus.BUSINESS,
        selectedCourseId: course1.id,
        selectedCourseTitle: course1.title,
        courseLevel: CourseLevel.BEGINNER,
        recommendedCourses: [course1.id, course2.id],
      },
    });

    await prisma.userQuestionnaire.create({
      data: {
        userId: users[3].id,
        discoverySource: "online",
        learningGoal: "Learn for travel",
        languageLevel: "beginner",
        dailyGoal: "20 minutes",
        intensity: Intensity.CASUAL,
        focus: Focus.TRAVEL,
        selectedCourseId: course2.id,
        selectedCourseTitle: course2.title,
        courseLevel: CourseLevel.BEGINNER,
        recommendedCourses: [course2.id],
      },
    });
    return;
  }

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
      recommendedCourses: [englishCourse.id, spanishCourse.id],
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
      recommendedCourses: [spanishCourse.id],
    },
  });
};

const createUserAchievements = async (users: Array<{ id: string }>): Promise<void> => {
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
async function main(): Promise<void> {
  console.log("🚀 Starting database seeding...");
  console.log("=".repeat(50));

  try {
    // Step 1: Clean database
    await deleteAllData();
    console.log("=".repeat(50));

    // Step 2: Create user roles
    const roles = await createUserRoles();
    console.log("=".repeat(50));

    // Step 3: Create ALL courses from the list
    const courses = await createCourses();
    console.log(`✅ Total courses created: ${courses.length}`);
    console.log("=".repeat(50));

    // Step 4: Build course structures
    console.log("🏗️ Building course structures...");
    for (const course of courses) {
      await createCourseStructure(course);
    }
    console.log("=".repeat(50));

    // Step 5: Create users
    const users = await createUsers(roles);
    console.log("=".repeat(50));

    // Step 6: Create user enrollments (multiple courses per user)
    const enrollments = await createUserEnrollments(users, courses);
    console.log(`✅ Total enrollments created: ${enrollments.length}`);
    console.log("=".repeat(50));

    // Step 7: Create challenge progress for enrollments
    await createChallengeProgress(users, enrollments);
    console.log("=".repeat(50));

    // Step 8: Create other user data
    await createUserSubscriptions(users);
    await createUserQuestionnaires(users, courses);
    await createUserAchievements(users);
    console.log("=".repeat(50));

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
      console.log(`   - ${course.title} (${course.language?.toUpperCase()}) - ${course.estimatedHours}h`);
    });
    
    console.log("\n🎯 Demo Setup:");
    console.log("-".repeat(30));
    console.log(`   👑 Owner: 3 cursos ativos - PRO member`);
    console.log(`   👨‍💼 Admin: 2 cursos ativos - PRO member`);
    console.log(`   👨‍🎓 Student 1: 2 cursos ativos - FREE tier`);
    console.log(`   👩‍🎓 Student 2: 2 cursos ativos - FREE tier`);
    console.log("\n💡 Note: Cada usuário está matriculado em múltiplos cursos!");
    console.log("   Curso ativo é marcado com 'isActive: true' nas matrículas.");
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