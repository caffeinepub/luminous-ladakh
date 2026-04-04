import { useState } from "react";
import { toast } from "sonner";
import { generateId } from "../../data/seed";

export interface InquiryEntry {
  id: string;
  businessId: string;
  businessName: string;
  memberUsername: string;
  fromUserId: string;
  fromUsername: string;
  message: string;
  date?: string;
  timestamp: string;
  status: "new" | "replied";
}

const LS_INQUIRIES = "lc_inquiries";

export function getInquiries(): InquiryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LS_INQUIRIES) || "[]");
  } catch {
    return [];
  }
}

export function saveInquiry(entry: InquiryEntry) {
  const list = getInquiries();
  list.unshift(entry);
  localStorage.setItem(LS_INQUIRIES, JSON.stringify(list));
  window.dispatchEvent(new Event("lc_data_changed"));
}

export function markInquiryReplied(id: string) {
  const list = getInquiries();
  const idx = list.findIndex((e) => e.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], status: "replied" };
    localStorage.setItem(LS_INQUIRIES, JSON.stringify(list));
    window.dispatchEvent(new Event("lc_data_changed"));
  }
}

interface InquiryModalProps {
  businessId: string;
  businessName: string;
  memberUsername: string;
  businessType?: string;
  fromUserId: string;
  fromUsername: string;
  onClose: () => void;
}

export function InquiryModal({
  businessId,
  businessName,
  memberUsername,
  businessType,
  fromUserId,
  fromUsername,
  onClose,
}: InquiryModalProps) {
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");

  const showDate = businessType === "hotel" || businessType === "rental";

  function handleSubmit() {
    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }
    const entry: InquiryEntry = {
      id: generateId(),
      businessId,
      businessName,
      memberUsername,
      fromUserId,
      fromUsername,
      message: message.trim(),
      date: date || undefined,
      timestamp: new Date().toISOString(),
      status: "new",
    };
    saveInquiry(entry);
    toast.success("Enquiry sent! The business will be notified.");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
      data-ocid="inquiry.modal"
    >
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Send Enquiry</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{businessName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400"
            data-ocid="inquiry.close_button"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="space-y-3">
          {/* From (read-only) */}
          <div>
            <p className="text-xs text-zinc-500 mb-1">From</p>
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-300">
              @{fromUsername}
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-xs text-zinc-500 mb-1">Message *</p>
            <textarea
              rows={3}
              placeholder={`e.g. "Do you have rooms available for 2 guests?"`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-xl px-3 py-2.5 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 text-sm resize-none"
              data-ocid="inquiry.textarea"
            />
          </div>

          {/* Date (optional, hotel/rental) */}
          {showDate && (
            <div>
              <p className="text-xs text-zinc-500 mb-1">
                Preferred Date (optional)
              </p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 text-sm"
                data-ocid="inquiry.input"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm transition-colors"
            data-ocid="inquiry.cancel_button"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
            data-ocid="inquiry.submit_button"
          >
            Send Enquiry
          </button>
        </div>
      </div>
    </div>
  );
}
