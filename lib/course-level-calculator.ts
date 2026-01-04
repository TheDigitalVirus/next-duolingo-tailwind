// lib/course-level-calculator.ts
export interface CourseLevelResult {
  level: 'beginner' | 'intermediate' | 'advanced';
  intensity: 'casual' | 'regular' | 'intense' | 'hard';
  focus: 'general' | 'academic' | 'travel' | 'business' | 'conversation' | 'fun';
  recommendedUnits: number[];
}

export const calculateCourseLevel = (
  languageLevel: string,
  learningGoal: string,
  dailyGoal: string
): CourseLevelResult => {
  // Mapeamento de nível baseado na autoavaliação
  const levelMap: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
    'Não sei nada de inglês': 'beginner',
    'Conheço algumas palavras comuns': 'beginner',
    'Consigo ter conversas simples': 'intermediate',
    'Consigo falar de assuntos variados': 'advanced',
    'Consigo falar sobre a maioria dos assuntos em detalhes': 'advanced',
  };

  // Mapeamento de intensidade baseado na meta diária
  const intensityMap: Record<string, 'casual' | 'regular' | 'intense' | 'hard'> = {
    '5 min / dia    Casual': 'casual',
    '10 min / dia    Regular': 'regular',
    '15 min / dia    Intensa': 'intense',
    '20 min / dia    Puxada': 'hard',
  };

  // Mapeamento de foco baseado no objetivo
  const focusMap: Record<string, CourseLevelResult['focus']> = {
    'Usar bem o tempo': 'general',
    'Avançar na educação': 'academic',
    'Viajar': 'travel',
    'Outro': 'general',
    'Progredir na carreira': 'business',
    'Interagir com pessoas': 'conversation',
    'Me divertir': 'fun',
  };

  const level = levelMap[languageLevel] || 'beginner';
  const intensity = intensityMap[dailyGoal] || 'regular';
  const focus = focusMap[learningGoal] || 'general';

  // Determinar unidades recomendadas baseadas no nível
  const recommendedUnits = getRecommendedUnits(level, intensity);

  return { level, intensity, focus, recommendedUnits };
};

const getRecommendedUnits = (level: string, intensity: string): number[] => {
  const unitConfig: Record<string, number[]> = {
    'beginner-casual': [1, 2],
    'beginner-regular': [1, 2, 3],
    'beginner-intense': [1, 2, 3, 4],
    'beginner-hard': [1, 2, 3, 4, 5],
    'intermediate-casual': [3, 4],
    'intermediate-regular': [3, 4, 5],
    'intermediate-intense': [3, 4, 5, 6],
    'intermediate-hard': [3, 4, 5, 6, 7],
    'advanced-casual': [5, 6],
    'advanced-regular': [5, 6, 7],
    'advanced-intense': [5, 6, 7, 8],
    'advanced-hard': [5, 6, 7, 8, 9],
  };

  return unitConfig[`${level}-${intensity}`] || [1];
};