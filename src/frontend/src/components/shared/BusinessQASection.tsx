import { useState } from "react";
import { generateId } from "../../data/seed";

export interface QAEntry {
  id: string;
  businessId: string;
  questionerId: string;
  questionerUsername: string;
  question: string;
  answer?: string;
  answeredAt?: string;
  timestamp: string;
}

const LS_QA = "lc_business_qa";

function getQA(): QAEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LS_QA) || "[]");
  } catch {
    return [];
  }
}

function saveQA(list: QAEntry[]) {
  localStorage.setItem(LS_QA, JSON.stringify(list));
  window.dispatchEvent(new Event("lc_data_changed"));
}

interface QASectionProps {
  businessId: string;
  currentUserId: string;
  currentUsername: string;
  currentUserRole: string;
  /** If set, this is the owner member's id — they can answer questions */
  ownerMemberId?: string;
}

export function BusinessQASection({
  businessId,
  currentUserId,
  currentUsername,
  currentUserRole,
  ownerMemberId,
}: QASectionProps) {
  const [question, setQuestion] = useState("");
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const entries = getQA().filter((e) => e.businessId === businessId);
  const isOwner =
    ownerMemberId === currentUserId || currentUserRole === "creator";

  function submitQuestion() {
    const q = question.trim();
    if (!q) return;
    const list = getQA();
    list.unshift({
      id: generateId(),
      businessId,
      questionerId: currentUserId,
      questionerUsername: currentUsername,
      question: q,
      timestamp: new Date().toISOString(),
    });
    saveQA(list);
    setQuestion("");
    setTick((t) => t + 1);
  }

  function submitAnswer(entryId: string) {
    const a = (answerText[entryId] || "").trim();
    if (!a) return;
    const list = getQA();
    const idx = list.findIndex((e) => e.id === entryId);
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        answer: a,
        answeredAt: new Date().toISOString(),
      };
      saveQA(list);
    }
    setAnsweringId(null);
    setAnswerText((prev) => ({ ...prev, [entryId]: "" }));
    setTick((t) => t + 1);
  }

  return (
    <div className="border-t border-zinc-800 pt-4 mt-4" data-ocid="qa.section">
      <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-amber-400 text-base">
          forum
        </span>
        Questions & Answers
      </h4>

      {/* Ask a question (non-owner roles) */}
      {!isOwner && currentUserRole !== "" && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Ask a question…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitQuestion()}
            className="flex-1 bg-zinc-900 text-white border border-zinc-700 rounded-xl px-3 py-2.5 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
            data-ocid="qa.input"
          />
          <button
            type="button"
            onClick={submitQuestion}
            disabled={!question.trim()}
            className="px-3 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-sm font-semibold hover:bg-amber-500/30 transition-colors disabled:opacity-40"
            data-ocid="qa.submit_button"
          >
            Ask
          </button>
        </div>
      )}

      {/* Q&A list */}
      {entries.length === 0 ? (
        <p
          className="text-xs text-zinc-600 text-center py-4"
          data-ocid="qa.empty_state"
        >
          No questions yet. Be the first to ask!
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, idx) => (
            <div
              key={entry.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3"
              data-ocid={`qa.item.${idx + 1}`}
            >
              {/* Question */}
              <div className="flex gap-2">
                <span className="material-symbols-outlined text-amber-400 text-base flex-shrink-0 mt-0.5">
                  help
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{entry.question}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    @{entry.questionerUsername} ·{" "}
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Answer */}
              {entry.answer ? (
                <div className="mt-2 pl-6 flex gap-2">
                  <span className="material-symbols-outlined text-green-400 text-base flex-shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200">{entry.answer}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      Owner replied ·{" "}
                      {entry.answeredAt
                        ? new Date(entry.answeredAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-2 pl-6">
                  {isOwner && answeringId !== entry.id ? (
                    <button
                      type="button"
                      onClick={() => setAnsweringId(entry.id)}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      data-ocid="qa.button"
                    >
                      <span className="material-symbols-outlined text-sm">
                        reply
                      </span>
                      Answer this question
                    </button>
                  ) : isOwner && answeringId === entry.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Your answer…"
                        value={answerText[entry.id] || ""}
                        onChange={(e) =>
                          setAnswerText((prev) => ({
                            ...prev,
                            [entry.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && submitAnswer(entry.id)
                        }
                        className="flex-1 bg-zinc-800 text-white border border-zinc-700 rounded-xl px-3 py-2 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 text-sm"
                        data-ocid="qa.textarea"
                      />
                      <button
                        type="button"
                        onClick={() => submitAnswer(entry.id)}
                        className="px-3 py-2 rounded-xl bg-green-600/20 border border-green-500/40 text-green-400 text-sm font-semibold hover:bg-green-600/30 transition-colors"
                        data-ocid="qa.save_button"
                      >
                        Post
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnsweringId(null)}
                        className="px-2 py-2 rounded-xl bg-zinc-800 text-zinc-400 text-sm hover:bg-zinc-700 transition-colors"
                        data-ocid="qa.cancel_button"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-600 italic">
                      Awaiting answer from owner
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Used in MyBusinessTab — returns Q&A entries for a specific business */
export function getBusinessQA(businessId: string): QAEntry[] {
  return getQA().filter((e) => e.businessId === businessId);
}
