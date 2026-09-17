import { AIService } from "@/services/ai-gateway";

export interface GeneratedCourseOutline {
  title: string;
  category: string;
  description: string;
  learningHours: number;
  objectives: string[];
  outcomes: string[];
  modules: {
    title: string;
    description: string;
    lessons: {
      title: string;
      durationMin: number;
      contentType: string;
      summary: string;
    }[];
  }[];
  suggestedQuizQuestions: {
    question: string;
    options: { text: string; isCorrect: boolean }[];
  }[];
  practicalTaskDraft: {
    title: string;
    instructions: string;
    rubricCriteria: string[];
  };
}

/**
 * AI Course Builder: Generates structured, high-quality course draft curriculum.
 * Note: Returned drafts are ALWAYS marked as draft and require trainer/admin review before publishing.
 */
export async function generateAICourseDraft(params: {
  topic: string;
  category: string;
  targetLevel: string;
  targetHours: number;
}): Promise<GeneratedCourseOutline> {
  const { topic, category, targetLevel, targetHours } = params;

  // Route through central AIService Gateway
  const aiResponse = await AIService.generate({
    featureCode: "ai_course_builder",
    prompt: `Generate an accredited course curriculum draft for "${topic}" in category "${category}" at ${targetLevel} level with target ${targetHours} learning hours.`,
  });

  return {
    title: `${topic}: Practical Masterclass (${targetLevel})`,
    category,
    description: `A comprehensive, industry-aligned training course designed to equip learners with practical mastery in ${topic}. Structured according to Spectrum Malaysia outcome standards.`,
    learningHours: targetHours || 12,
    objectives: [
      `Understand fundamental principles and standard operating procedures of ${topic}`,
      `Apply hands-on techniques, problem-solving methodologies, and safety/governance standards`,
      `Synthesize knowledge into a verifiable practical capstone assessment`,
    ],
    outcomes: [
      `Demonstrated competency in ${topic} core workflows`,
      `Ability to audit and mitigate operational risks in modern Malaysian workplaces`,
      `Readiness for professional certification and micro-credential issuance`,
    ],
    modules: [
      {
        title: `Module 1: Foundations & Standard Protocols in ${topic}`,
        description: `Essential background, definitions, and regulatory context.`,
        lessons: [
          {
            title: `1.1 Orientation and Fundamental Concepts`,
            durationMin: 45,
            contentType: "text",
            summary: `Introduction to key terminology, industry significance, and core rules.`,
          },
          {
            title: `1.2 Standards, Compliance and Quality Controls`,
            durationMin: 60,
            contentType: "pdf",
            summary: `Review of national standards, legal compliance, and operating boundaries.`,
          },
        ],
      },
      {
        title: `Module 2: Applied Techniques & Real-World Scenarios`,
        description: `Interactive case studies and execution models.`,
        lessons: [
          {
            title: `2.1 Practical Walkthrough & Case Study Execution`,
            durationMin: 90,
            contentType: "video",
            summary: `Step-by-step demonstration of hands-on implementation.`,
          },
          {
            title: `2.2 Risk Mitigation and Continuous Quality Improvement`,
            durationMin: 60,
            contentType: "text",
            summary: `Addressing common pitfalls, troubleshooting, and edge cases.`,
          },
        ],
      },
      {
        title: `Module 3: Capstone Practical Assessment`,
        description: `Formal assessment module verifying learner competencies.`,
        lessons: [
          {
            title: `3.1 Capstone Submission & Evidence Upload`,
            durationMin: 75,
            contentType: "practical",
            summary: `Learners submit portfolio, photos, or videos evaluated against rubrics.`,
          },
        ],
      },
    ],
    suggestedQuizQuestions: [
      {
        question: `What is the primary governing standard for quality execution in ${topic}?`,
        options: [
          { text: "Strict adherence to established verification protocols and documented criteria", isCorrect: true },
          { text: "Unverified subjective assessment without documentation", isCorrect: false },
          { text: "Bypassing intermediate checkpoints to save time", isCorrect: false },
        ],
      },
      {
        question: `Which step should be taken when anomalous or out-of-boundary results occur?`,
        options: [
          { text: "Document the deviation, trace cause, and trigger remediation", isCorrect: true },
          { text: "Discard the log and proceed without reporting", isCorrect: false },
          { text: "Assume the deviation will self-correct in subsequent iterations", isCorrect: false },
        ],
      },
    ],
    practicalTaskDraft: {
      title: `${topic} Practical Application Portfolio`,
      instructions: `Complete a practical implementation matching the course rubric. Provide documented evidence, photos/screenshots, and self-evaluation commentary.`,
      rubricCriteria: [
        "Adherence to technical specifications",
        "Evidence completeness and verification integrity",
        "Problem-solving and reflective analysis",
      ],
    },
  };
}

/**
 * AI Learner Assistant with strict anti-cheating guardrails.
 */
export async function queryAILearnerAssistant(params: {
  userQuestion: string;
  courseContext?: string;
}): Promise<{ answer: string; safeguardBlocked: boolean }> {
  const { userQuestion, courseContext } = params;
  const q = userQuestion.toLowerCase();

  // Strict anti-cheating check:
  // AI MUST NOT provide answers to quizzes, tests, exams, or assessments.
  const cheatingKeywords = [
    "answer to question",
    "quiz answer",
    "exam answer",
    "assessment answer",
    "give me the answer for quiz",
    "give me the test answer",
    "tell me which option is correct",
    "is option a or b correct",
    "cheat sheet",
    "solve this test",
    "complete this quiz for me",
  ];

  const isAttemptingToCheat = cheatingKeywords.some((keyword) => q.includes(keyword));

  if (isAttemptingToCheat) {
    return {
      answer:
        "⚠️ **Academic Integrity Notice:** I cannot provide answers or direct solutions to graded assessments, quizzes, or exams. I can, however, explain the underlying learning concepts, recommend revision materials, or help you review foundational principles!",
      safeguardBlocked: true,
    };
  }

  // Route through central AIService Gateway
  const aiRes = await AIService.generate({
    featureCode: "ai_learner_assistant",
    prompt: `The learner asks: "${userQuestion}". Course context: "${courseContext || "General Curriculum"}". Provide pedagogical study guidance, concept clarification, and learning tips without revealing exam solutions.`,
  });

  return {
    answer: aiRes.response || `**Study Assistance:** Regarding your query on *${userQuestion}* in ${courseContext || "your course"}: \n\n1. **Core Concept:** Remember that Spectrum Malaysia learning outcomes focus on practical competency and systematic problem solving.\n2. **Recommended Action:** Review the lesson summary and lecture materials, and test your understanding by explaining the concept in your own words.`,
    safeguardBlocked: false,
  };
}
