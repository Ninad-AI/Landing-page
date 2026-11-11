"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { intakeApi } from "../../lib/api";
import type { IntakeResponseItem } from "../../lib/types";

interface IntakeQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  influencerId: string;
  creatorName?: string;
  creatorImage?: string;
  bookingId?: number | string;
  onComplete: () => void;
  onSkip: () => void;
}

const QUESTION_LABELS = {
  AGE: "How old are you?",
  CURRENT_DOING: "What are you doing right now?",
  STATUS_CATEGORY: "Are you currently studying, looking for a job, working, or building something of your own?",
  FIELD_OF_STUDY: "What are you studying or what did you study?",
  TECH_EXPERIENCE: "How much experience do you have in technology?",
  CURRENT_GOAL: "What are you currently trying to achieve?",
  HELP_NEEDED: "What do you need help or guidance with right now?",
  CREATOR_WHY: "Why do you want to start creating content?",
  CREATOR_WHAT: "What kind of content do you want to create?",
  CREATOR_BLOCKER: "What is stopping you from starting?",
} as const;

const STATUS_PILLS = [
  "Studying",
  "Looking for a job",
  "Working",
  "Building something of my own",
];

const EXPERIENCE_PILLS = [
  "Beginner / No experience",
  "Less than 1 year",
  "1 - 2 years",
  "2+ years",
];

export default function IntakeQuestionnaireModal({
  isOpen,
  influencerId,
  creatorName = "Swaroop",
  creatorImage = "/assets/creators/swaroop.jpg",
  bookingId,
  onComplete,
  onSkip,
}: IntakeQuestionnaireModalProps) {
  // Form fields
  const [age, setAge] = useState("");
  const [currentDoing, setCurrentDoing] = useState("");
  const [statusCategory, setStatusCategory] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [techExperience, setTechExperience] = useState("");
  const [currentGoal, setCurrentGoal] = useState("");
  const [helpNeeded, setHelpNeeded] = useState("");

  // Optional content creation fields
  const [showCreatorSection, setShowCreatorSection] = useState(false);
  const [creatorWhy, setCreatorWhy] = useState("");
  const [creatorWhat, setCreatorWhat] = useState("");
  const [creatorBlocker, setCreatorBlocker] = useState("");

  // UI state
  const [isPreFilling, setIsPreFilling] = useState(false);
  const [isPreFilled, setIsPreFilled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pre-fill answers from previous session if available
  useEffect(() => {
    if (!isOpen || !influencerId) return;

    let cancelled = false;
    const fetchPreviousIntake = async () => {
      setIsPreFilling(true);
      try {
        const data = await intakeApi.get(influencerId, bookingId);
        if (cancelled) return;

        if (data?.found && Array.isArray(data.responses) && data.responses.length > 0) {
          let hasCreatorData = false;

          for (const item of data.responses) {
            const q = item.question?.trim().toLowerCase();
            const a = item.answer || "";
            if (!q || !a) continue;

            if (q.includes("old") || q.includes("age")) {
              setAge(a);
            } else if (q.includes("doing right now")) {
              setCurrentDoing(a);
            } else if (q.includes("currently studying, looking for a job") || q.includes("working, or building")) {
              setStatusCategory(a);
            } else if (q.includes("studying or what did you study") || q.includes("degree") || q.includes("branch")) {
              setFieldOfStudy(a);
            } else if (q.includes("experience do you have in technology") || q.includes("tech experience")) {
              setTechExperience(a);
            } else if (q.includes("trying to achieve") || q.includes("goal")) {
              setCurrentGoal(a);
            } else if (q.includes("help or guidance") || q.includes("need help")) {
              setHelpNeeded(a);
            } else if (q.includes("start creating content")) {
              setCreatorWhy(a);
              hasCreatorData = true;
            } else if (q.includes("kind of content")) {
              setCreatorWhat(a);
              hasCreatorData = true;
            } else if (q.includes("stopping you from starting")) {
              setCreatorBlocker(a);
              hasCreatorData = true;
            }
          }

          if (hasCreatorData) {
            setShowCreatorSection(true);
          }
          setIsPreFilled(true);
        }
      } catch {
        // Silently continue if previous answers cannot be fetched
      } finally {
        if (!cancelled) {
          setIsPreFilling(false);
        }
      }
    };

    void fetchPreviousIntake();

    return () => {
      cancelled = true;
    };
  }, [isOpen, influencerId, bookingId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const responses: IntakeResponseItem[] = [];

    const addIfPresent = (question: string, answer: string) => {
      const trimmed = answer.trim();
      if (trimmed) {
        responses.push({ question, answer: trimmed });
      }
    };

    addIfPresent(QUESTION_LABELS.AGE, age);
    addIfPresent(QUESTION_LABELS.CURRENT_DOING, currentDoing);
    addIfPresent(QUESTION_LABELS.STATUS_CATEGORY, statusCategory);
    addIfPresent(QUESTION_LABELS.FIELD_OF_STUDY, fieldOfStudy);
    addIfPresent(QUESTION_LABELS.TECH_EXPERIENCE, techExperience);
    addIfPresent(QUESTION_LABELS.CURRENT_GOAL, currentGoal);
    addIfPresent(QUESTION_LABELS.HELP_NEEDED, helpNeeded);

    if (showCreatorSection) {
      addIfPresent(QUESTION_LABELS.CREATOR_WHY, creatorWhy);
      addIfPresent(QUESTION_LABELS.CREATOR_WHAT, creatorWhat);
      addIfPresent(QUESTION_LABELS.CREATOR_BLOCKER, creatorBlocker);
    }

    if (responses.length === 0) {
      // Nothing was filled, proceed to call directly
      onComplete();
      return;
    }

    try {
      const parsedBookingId =
        bookingId != null && !Number.isNaN(Number(bookingId))
          ? Number(bookingId)
          : bookingId;

      await intakeApi.submit({
        influencer_id: influencerId,
        booking_id: parsedBookingId,
        responses,
      });

      toast.success("Profile saved! Connecting to Swaroop...");
      onComplete();
    } catch (err) {
      const apiError = err as { response?: { data?: { detail?: string; message?: string } } };
      const msg =
        apiError.response?.data?.detail ||
        apiError.response?.data?.message ||
        "Could not save profile details.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl transition-opacity" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl my-auto bg-[#0E0C15] border border-white/15 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-36 bg-purple-600/25 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute top-10 left-10 w-64 h-36 bg-blue-600/20 blur-[80px] rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 p-5 sm:p-7 border-b border-white/10 flex items-start justify-between gap-4 shrink-0 bg-[#0E0C15]/80 backdrop-blur-md">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-white/20 shrink-0 shadow-lg">
              <Image
                src={creatorImage}
                alt={creatorName}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 48px, 56px"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary-light border border-primary/30">
                  Quick Intake
                </span>
                {isPreFilled && (
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Pre-filled
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-1">
                Help {creatorName} prepare for your call
              </h2>
              <p className="text-xs text-white/60 leading-relaxed max-w-md mt-0.5">
                Answers are shared with {creatorName} before you dial in, so you can skip introductions and dive straight into guidance.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSkip}
            disabled={isSubmitting}
            className="text-xs font-semibold text-white/50 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all shrink-0 cursor-pointer"
          >
            Skip
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between gap-3">
              <span>{submitError}</span>
              <button
                type="button"
                onClick={onSkip}
                className="underline text-white font-semibold cursor-pointer shrink-0"
              >
                Skip to call
              </button>
            </div>
          )}

          {isPreFilling && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
              Checking for previous answers...
            </div>
          )}

          {/* Section 1: Background & Education */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">
              1. Background & Status
            </h3>

            {/* Q1: Age */}
            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1.5">
                {QUESTION_LABELS.AGE}
              </label>
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 21"
                className="w-full sm:w-48 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Q2: What are you doing right now? */}
            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1.5">
                {QUESTION_LABELS.CURRENT_DOING}
              </label>
              <input
                type="text"
                value={currentDoing}
                onChange={(e) => setCurrentDoing(e.target.value)}
                placeholder="e.g. Final year B.Tech, preparing for campus placements"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Q3: Status Category */}
            <div>
              <label className="block text-xs font-semibold text-white/90 mb-2">
                {QUESTION_LABELS.STATUS_CATEGORY}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {STATUS_PILLS.map((pill) => {
                  const isSelected = statusCategory === pill;
                  return (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => setStatusCategory(pill)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white/5 text-white/70 border-white/10 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {pill}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={statusCategory}
                onChange={(e) => setStatusCategory(e.target.value)}
                placeholder="Or type custom status (e.g. Studying and looking for jobs)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/25 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Q4: Field of study */}
            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1.5">
                {QUESTION_LABELS.FIELD_OF_STUDY}
              </label>
              <input
                type="text"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder="e.g. ECE at a tier-3 college in AP"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Section 2: Tech & Goals */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">
              2. Goals & Guidance
            </h3>

            {/* Q5: Tech Experience */}
            <div>
              <label className="block text-xs font-semibold text-white/90 mb-2">
                {QUESTION_LABELS.TECH_EXPERIENCE}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {EXPERIENCE_PILLS.map((pill) => {
                  const isSelected = techExperience === pill;
                  return (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => setTechExperience(pill)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white/5 text-white/70 border-white/10 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {pill}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={techExperience}
                onChange={(e) => setTechExperience(e.target.value)}
                placeholder="Or describe briefly (e.g. 1 year Python and basic web dev)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/25 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Q6: Current Goal */}
            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1.5">
                {QUESTION_LABELS.CURRENT_GOAL}
              </label>
              <input
                type="text"
                value={currentGoal}
                onChange={(e) => setCurrentGoal(e.target.value)}
                placeholder="e.g. Crack a 10+ LPA developer job in the next 6 months"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Q7: Guidance needed */}
            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1.5">
                {QUESTION_LABELS.HELP_NEEDED}
              </label>
              <textarea
                rows={3}
                value={helpNeeded}
                onChange={(e) => setHelpNeeded(e.target.value)}
                placeholder="e.g. Preparation roadmap, resume review, and interview confidence"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Section 3: Content Creation Questions (Expandable/Optional) */}
          <div>
            <div
              onClick={() => setShowCreatorSection(!showCreatorSection)}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={showCreatorSection}
                  onChange={(e) => setShowCreatorSection(e.target.checked)}
                  className="rounded border-white/20 text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs font-medium text-white/90">
                  I&apos;m also interested in creating content & personal branding (Optional)
                </span>
              </div>
              <span className="text-xs text-white/40">
                {showCreatorSection ? "Hide" : "+ Show 3 questions"}
              </span>
            </div>

            {showCreatorSection && (
              <div className="mt-4 space-y-4 pl-3 sm:pl-4 border-l-2 border-primary/40 animate-fade-in-up">
                {/* Q8: Creator Why */}
                <div>
                  <label className="block text-xs font-semibold text-white/90 mb-1.5">
                    {QUESTION_LABELS.CREATOR_WHY}
                  </label>
                  <input
                    type="text"
                    value={creatorWhy}
                    onChange={(e) => setCreatorWhy(e.target.value)}
                    placeholder="e.g. Want to teach coding in Telugu and share tech insights"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                {/* Q9: Creator What */}
                <div>
                  <label className="block text-xs font-semibold text-white/90 mb-1.5">
                    {QUESTION_LABELS.CREATOR_WHAT}
                  </label>
                  <input
                    type="text"
                    value={creatorWhat}
                    onChange={(e) => setCreatorWhat(e.target.value)}
                    placeholder="e.g. Tech tutorials, project breakdowns, career tips"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                {/* Q10: Creator Blocker */}
                <div>
                  <label className="block text-xs font-semibold text-white/90 mb-1.5">
                    {QUESTION_LABELS.CREATOR_BLOCKER}
                  </label>
                  <input
                    type="text"
                    value={creatorBlocker}
                    onChange={(e) => setCreatorBlocker(e.target.value)}
                    placeholder="e.g. Camera shyness, time management, finding initial topics"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onSkip}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/25 text-xs font-semibold transition-all cursor-pointer"
            >
              Skip for now
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/10"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Saving & Connecting...</span>
                </>
              ) : (
                <span>Save & Start Call</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
