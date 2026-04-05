import { useState } from "react";
import { toast } from "sonner";
import { generateId } from "../../data/seed";
import type { FeedbackEntry } from "../../types";

const LS_FEEDBACKS = "lc_feedbacks";

function getFeedbacks(): FeedbackEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LS_FEEDBACKS) || "[]");
  } catch {
    return [];
  }
}

function saveFeedback(entry: FeedbackEntry) {
  const list = getFeedbacks();
  list.unshift(entry);
  localStorage.setItem(LS_FEEDBACKS, JSON.stringify(list));
  window.dispatchEvent(new Event("lc_data_changed"));
}

interface Props {
  currentUserId: string;
  currentUsername: string;
  currentRole: string;
}

export function FeedbackButton({
  currentUserId,
  currentUsername,
  currentRole,
}: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!message.trim()) {
      toast.error("Please write a message before submitting.");
      return;
    }
    const entry: FeedbackEntry = {
      id: generateId(),
      fromUserId: currentUserId,
      fromUsername: currentUsername,
      fromRole: currentRole,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    saveFeedback(entry);
    setSubmitted(true);
    setMessage("");
    toast.success("Thank you for your feedback!");
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
    }, 1500);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 text-sm transition-colors flex items-center justify-center gap-2"
        data-ocid="feedback.open_modal_button"
      >
        <span className="material-symbols-outlined text-base">feedback</span>
        Send Feedback / Suggestion
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-lg">
                  feedback
                </span>
                Share Feedback
              </h3>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setMessage("");
                  setSubmitted(false);
                }}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400"
                data-ocid="feedback.close_button"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-green-400 text-4xl block mb-2">
                  check_circle
                </span>
                <p className="text-white font-semibold">Thank you!</p>
                <p className="text-sm text-zinc-400 mt-1">
                  Your feedback has been sent to the Creator.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-zinc-500 mb-3">
                  Your suggestion or feedback goes directly to the Creator. Be
                  clear and constructive.
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Share your feedback or suggestion..."
                  className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-xl px-4 py-3 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  data-ocid="feedback.textarea"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm py-2.5 rounded-xl transition-colors"
                    data-ocid="feedback.submit_button"
                  >
                    Send Feedback
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setMessage("");
                    }}
                    className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-sm transition-colors"
                    data-ocid="feedback.cancel_button"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export { getFeedbacks };
