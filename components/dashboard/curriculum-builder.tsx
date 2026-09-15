"use client";

import { useState } from "react";
import { ModuleForm } from "@/components/forms/module-form";
import { LessonForm } from "@/components/forms/lesson-form";
import { QuizForm } from "@/components/forms/quiz-form";
import { deleteModule } from "@/app/actions/modules";
import { deleteLesson } from "@/app/actions/lessons";
import { deleteQuiz } from "@/app/actions/quizzes";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CurriculumBuilderProps {
  programmeId: string;
  modules: any[];
  quizzes?: any[];
}

export function CurriculumBuilder({ programmeId, modules, quizzes = [] }: CurriculumBuilderProps) {
  const [activeTab, setActiveTab] = useState<"modules" | "quizzes">("modules");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(modules.map(m => m.id)));
  
  // Modal states
  const [isModuleFormOpen, setIsModuleFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any | null>(null);
  
  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);

  const [isQuizFormOpen, setIsQuizFormOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any | null>(null);
  
  const router = useRouter();

  const toggleModule = (id: string) => {
    const newSet = new Set(expandedModules);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedModules(newSet);
  };

  const handleOpenModuleNew = () => {
    setEditingModule(null);
    setIsModuleFormOpen(true);
  };

  const handleOpenModuleEdit = (mod: any) => {
    setEditingModule(mod);
    setIsModuleFormOpen(true);
  };

  const handleDeleteModule = async (id: string) => {
    if (confirm("Are you sure you want to delete this module and all its lessons?")) {
      await deleteModule(programmeId, id);
      router.refresh();
    }
  };

  const handleOpenLessonNew = (moduleId: string) => {
    setTargetModuleId(moduleId);
    setEditingLesson(null);
    setIsLessonFormOpen(true);
  };

  const handleOpenLessonEdit = (moduleId: string, lesson: any) => {
    setTargetModuleId(moduleId);
    setEditingLesson(lesson);
    setIsLessonFormOpen(true);
  };

  const handleDeleteLesson = async (id: string) => {
    if (confirm("Are you sure you want to delete this lesson?")) {
      await deleteLesson(programmeId, id);
      router.refresh();
    }
  };

  const handleOpenQuizNew = () => {
    setEditingQuiz(null);
    setIsQuizFormOpen(true);
  };

  const handleOpenQuizEdit = (quiz: any) => {
    setEditingQuiz(quiz);
    setIsQuizFormOpen(true);
  };

  const handleDeleteQuiz = async (id: string) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      await deleteQuiz(programmeId, id);
      router.refresh();
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'pdf': return '📄';
      case 'quiz': return '❓';
      case 'assessment': return '📝';
      default: return '📄';
    }
  };

  return (
    <div className="mt-8">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-6">
        <button
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 cursor-pointer ${
            activeTab === "modules"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("modules")}
        >
          Modules & Lessons ({modules.length})
        </button>
        <button
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 cursor-pointer ${
            activeTab === "quizzes"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("quizzes")}
        >
          Quizzes ({quizzes.length})
        </button>
      </div>

      {activeTab === "modules" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Curriculum Modules</h2>
              <p className="text-sm text-gray-500">Manage modules and lessons for this programme</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleOpenModuleNew}>+ Add Module</button>
          </div>

          <div className="space-y-4">
            {modules.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 border rounded-lg text-gray-500">
                No modules created yet. Click "+ Add Module" to start building the curriculum.
              </div>
            ) : (
              modules.map((mod) => (
                <div key={mod.id} className="border rounded-lg bg-white overflow-hidden shadow-sm">
                  <div 
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer border-b"
                    onClick={() => toggleModule(mod.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">{expandedModules.has(mod.id) ? '▼' : '▶'}</span>
                      <div className="font-semibold text-lg">
                        <span className="text-primary-600 mr-2">Module {mod.sequence}:</span>
                        {mod.title}
                      </div>
                      <span className={`badge ${mod.status === 'published' ? 'badge-success' : 'badge-neutral'} ml-2`}>
                        {mod.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-outline btn-sm bg-white" onClick={() => handleOpenLessonNew(mod.id)}>+ Add Lesson</button>
                      <button className="btn btn-ghost btn-sm text-gray-500 hover:text-primary-600" onClick={() => handleOpenModuleEdit(mod)}>Edit</button>
                      <button className="btn btn-ghost btn-sm text-gray-500 hover:text-red-600" onClick={() => handleDeleteModule(mod.id)}>Delete</button>
                    </div>
                  </div>

                  {expandedModules.has(mod.id) && (
                    <div className="p-4 bg-white">
                      {(!mod.lessons || mod.lessons.length === 0) ? (
                        <div className="text-sm text-gray-500 italic p-2">No lessons added to this module yet.</div>
                      ) : (
                        <div className="space-y-2 pl-6 border-l-2 border-gray-100 ml-2">
                          {mod.lessons.map((lesson: any) => (
                            <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <span className="text-xl" title={lesson.content_type}>
                                  {getContentTypeIcon(lesson.content_type)}
                                </span>
                                <div>
                                  <div className="font-medium text-sm">
                                    {lesson.sequence}. {lesson.title}
                                    {!lesson.is_required && <span className="ml-2 text-xs text-gray-400 font-normal">(Optional)</span>}
                                  </div>
                                  <div className="text-xs text-gray-500 flex gap-2 mt-1">
                                    <span className="uppercase">{lesson.content_type}</span>
                                    {lesson.duration_minutes && <span>• {lesson.duration_minutes} mins</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 opacity-60 hover:opacity-100">
                                <button className="btn btn-ghost btn-sm px-2 text-xs" onClick={() => handleOpenLessonEdit(mod.id, lesson)}>Edit</button>
                                <button className="btn btn-ghost btn-sm px-2 text-xs text-red-500" onClick={() => handleDeleteLesson(lesson.id)}>Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === "quizzes" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Programme Quizzes</h2>
              <p className="text-sm text-gray-500">Manage interactive quizzes and testing for this programme</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleOpenQuizNew}>+ Add Quiz</button>
          </div>

          <div className="space-y-3">
            {quizzes.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 border rounded-lg text-gray-500">
                No quizzes created yet. Click "+ Add Quiz" to create your first quiz.
              </div>
            ) : (
              quizzes.map((quiz) => (
                <div key={quiz.id} className="border rounded-lg bg-white p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">{quiz.title}</h3>
                      <span className={`badge ${quiz.status === 'published' ? 'badge-success' : 'badge-neutral'}`}>
                        {quiz.status}
                      </span>
                    </div>
                    {quiz.description && <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>}
                    <div className="flex gap-4 text-xs text-gray-500 mt-2">
                      <span>Pass Mark: <strong>{quiz.pass_mark}%</strong></span>
                      <span>•</span>
                      <span>Max Attempts: <strong>{quiz.max_attempts}</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/quiz/${quiz.id}/take`}
                      className="btn btn-primary btn-sm flex items-center gap-1.5"
                    >
                      <span>▶</span> Test Quiz
                    </Link>
                    <button
                      className="btn btn-outline btn-sm text-gray-700 hover:text-primary-600"
                      onClick={() => handleOpenQuizEdit(quiz)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost btn-sm text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Module Modal */}
      {isModuleFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">{editingModule ? "Edit Module" : "Add Module"}</h2>
            <ModuleForm 
              programmeId={programmeId}
              initialData={editingModule}
              onSuccess={() => setIsModuleFormOpen(false)} 
              onCancel={() => setIsModuleFormOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {isLessonFormOpen && targetModuleId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">{editingLesson ? "Edit Lesson" : "Add Lesson"}</h2>
            <LessonForm 
              programmeId={programmeId}
              moduleId={targetModuleId}
              initialData={editingLesson}
              onSuccess={() => setIsLessonFormOpen(false)} 
              onCancel={() => setIsLessonFormOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {isQuizFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">{editingQuiz ? "Edit Quiz" : "Add Quiz"}</h2>
            <QuizForm 
              programmeId={programmeId}
              initialData={editingQuiz}
              onSuccess={() => setIsQuizFormOpen(false)} 
              onCancel={() => setIsQuizFormOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
