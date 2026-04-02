import { useState } from "react";

const EMERGENCY_CONTACTS = [
  {
    name: "SNM District Hospital",
    number: "01982-252012",
    icon: "local_hospital",
    color: "text-red-400",
  },
  {
    name: "Leh Police Station",
    number: "01982-252018",
    icon: "local_police",
    color: "text-blue-400",
  },
  {
    name: "Police Emergency",
    number: "100",
    icon: "emergency",
    color: "text-blue-400",
  },
  {
    name: "Fire Brigade",
    number: "101",
    icon: "local_fire_department",
    color: "text-orange-400",
  },
  {
    name: "Ambulance",
    number: "108",
    icon: "ambulance",
    color: "text-green-400",
  },
  {
    name: "Mountain Rescue (SDRF)",
    number: "01982-253471",
    icon: "rescue",
    color: "text-amber-400",
  },
];

export function EmergencySOS() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating SOS Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-50 bg-red-600 hover:bg-red-500 text-white rounded-full w-14 h-14 flex flex-col items-center justify-center shadow-lg shadow-red-900/50 transition-all active:scale-95"
        data-ocid="sos.button"
      >
        <span className="material-symbols-outlined text-xl">sos</span>
        <span className="text-[9px] font-bold tracking-wider">SOS</span>
      </button>

      {/* SOS Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          role="presentation"
        >
          <div
            className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
            data-ocid="sos.modal"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-400">
                    sos
                  </span>
                </div>
                <div>
                  <h2 className="font-bold text-lg">Emergency Contacts</h2>
                  <p className="text-xs text-muted-foreground">Leh, Ladakh</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                data-ocid="sos.close_button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 mb-4">
              <p className="text-xs text-red-300 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  warning
                </span>
                In a life-threatening emergency, call 100 or 108 immediately
              </p>
            </div>

            <div className="space-y-3">
              {EMERGENCY_CONTACTS.map((contact) => (
                <a
                  key={contact.number}
                  href={`tel:${contact.number}`}
                  className="flex items-center justify-between bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl px-4 py-3 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-xl ${contact.color}`}
                    >
                      {contact.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {contact.number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-green-600 group-hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                    <span className="material-symbols-outlined text-sm">
                      call
                    </span>
                    Call
                  </div>
                </a>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Tap any contact to call directly
            </p>
          </div>
        </div>
      )}
    </>
  );
}
