import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { generateId } from "../data/seed";
import type { Account, PharmacyEntry } from "../types";

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

const DEFAULT_PHARMACIES: PharmacyEntry[] = [
  {
    id: "ph1",
    name: "New Medical Hall",
    address: "Main Bazaar, Leh",
    phone: "01982-252156",
  },
  {
    id: "ph2",
    name: "Ladakh Medical Store",
    address: "Fort Road, Leh",
    phone: "01982-253089",
  },
  {
    id: "ph3",
    name: "SNM Hospital Pharmacy",
    address: "SNM Hospital Campus, Leh",
    phone: "01982-252012",
  },
  {
    id: "ph4",
    name: "Leh City Pharmacy",
    address: "Old Town Road, Leh",
    phone: "01982-253510",
  },
];

const PHARMACIES_KEY = "lc_pharmacies";

function loadPharmacies(): PharmacyEntry[] {
  try {
    const saved = localStorage.getItem(PHARMACIES_KEY);
    if (!saved) return DEFAULT_PHARMACIES;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : DEFAULT_PHARMACIES;
  } catch {
    return DEFAULT_PHARMACIES;
  }
}

function savePharmacies(pharmacies: PharmacyEntry[]) {
  try {
    localStorage.setItem(PHARMACIES_KEY, JSON.stringify(pharmacies));
    window.dispatchEvent(new Event("lc_data_changed"));
  } catch {
    // silently fail
  }
}

interface Props {
  currentUser?: Account | null;
}

export function EmergencySOS({ currentUser }: Props) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [pharmacies, setPharmacies] = useState<PharmacyEntry[]>(loadPharmacies);
  const [managing, setManaging] = useState(false);
  const [editPharmacy, setEditPharmacy] = useState<PharmacyEntry | null>(null);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const isCreator = currentUser?.role === "creator";

  function handleOpen() {
    setPharmacies(loadPharmacies());
    setOpen(true);
  }

  function handleAddPharmacy() {
    if (!newName.trim() || !newPhone.trim()) return;
    const entry: PharmacyEntry = {
      id: generateId(),
      name: newName.trim(),
      address: newAddress.trim(),
      phone: newPhone.trim(),
    };
    const updated = [...pharmacies, entry];
    setPharmacies(updated);
    savePharmacies(updated);
    setNewName("");
    setNewAddress("");
    setNewPhone("");
  }

  function handleDeletePharmacy(id: string) {
    const updated = pharmacies.filter((p) => p.id !== id);
    setPharmacies(updated);
    savePharmacies(updated);
  }

  function handleEditSave() {
    if (!editPharmacy) return;
    const updated = pharmacies.map((p) =>
      p.id === editPharmacy.id ? editPharmacy : p,
    );
    setPharmacies(updated);
    savePharmacies(updated);
    setEditPharmacy(null);
  }

  const inputCls =
    "w-full bg-zinc-900 text-white border border-zinc-700 rounded-lg px-3 py-2 placeholder:text-zinc-500 focus:outline-none focus:border-green-500 transition-colors text-xs";

  return (
    <>
      {/* Floating SOS Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-24 right-4 z-50 bg-red-600 hover:bg-red-500 text-white rounded-full w-14 h-14 flex flex-col items-center justify-center shadow-lg shadow-red-900/50 transition-all active:scale-95"
        data-ocid="sos.button"
      >
        <span className="material-symbols-outlined text-xl">sos</span>
        <span className="text-[9px] font-bold tracking-wider">
          {t("sosButton", "SOS")}
        </span>
      </button>

      {/* SOS Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => {
            setOpen(false);
            setManaging(false);
            setEditPharmacy(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setManaging(false);
              setEditPharmacy(null);
            }
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
                  <h2 className="font-bold text-lg">
                    {t("sosTitle", "Emergency SOS")}
                  </h2>
                  <p className="text-xs text-muted-foreground">Leh, Ladakh</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setManaging(false);
                  setEditPharmacy(null);
                }}
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

            {/* Emergency Contacts */}
            <div className="space-y-3 mb-6">
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
                    {t("callEmergency", "Call")}
                  </div>
                </a>
              ))}
            </div>

            {/* Pharmacies Section */}
            <div className="border-t border-zinc-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-green-600/20 border border-green-500/40 flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-400 text-sm">
                      local_pharmacy
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-white">
                    {t("nearbyPharmacy", "Nearby Pharmacies")}
                  </h3>
                </div>
                {isCreator && (
                  <button
                    type="button"
                    onClick={() => {
                      setManaging(!managing);
                      setEditPharmacy(null);
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                    data-ocid="sos.toggle"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {managing ? "close" : "manage_accounts"}
                    </span>
                    {managing ? t("done", "Done") : "Manage"}
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {pharmacies.map((pharmacy) => (
                  <div key={pharmacy.id}>
                    {editPharmacy?.id === pharmacy.id ? (
                      // Inline edit form
                      <div className="bg-zinc-800 border border-green-500/30 rounded-xl p-3 space-y-2">
                        <input
                          className={inputCls}
                          placeholder="Name"
                          value={editPharmacy.name}
                          onChange={(e) =>
                            setEditPharmacy((prev) =>
                              prev ? { ...prev, name: e.target.value } : prev,
                            )
                          }
                        />
                        <input
                          className={inputCls}
                          placeholder="Address"
                          value={editPharmacy.address}
                          onChange={(e) =>
                            setEditPharmacy((prev) =>
                              prev
                                ? { ...prev, address: e.target.value }
                                : prev,
                            )
                          }
                        />
                        <input
                          className={inputCls}
                          placeholder="Phone"
                          value={editPharmacy.phone}
                          onChange={(e) =>
                            setEditPharmacy((prev) =>
                              prev ? { ...prev, phone: e.target.value } : prev,
                            )
                          }
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleEditSave}
                            className="flex-1 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition-colors"
                          >
                            {t("save", "Save")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditPharmacy(null)}
                            className="flex-1 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-xs transition-colors"
                          >
                            {t("cancel", "Cancel")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-xl px-3 py-2.5 transition-colors group">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <span className="material-symbols-outlined text-green-400 text-base mt-0.5 shrink-0">
                            medication
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {pharmacy.name}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">
                              {pharmacy.address}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {pharmacy.phone}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 ml-2">
                          {managing && (
                            <>
                              <button
                                type="button"
                                onClick={() => setEditPharmacy({ ...pharmacy })}
                                className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  edit
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeletePharmacy(pharmacy.id)
                                }
                                className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  delete
                                </span>
                              </button>
                            </>
                          )}
                          <a
                            href={`tel:${pharmacy.phone}`}
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">
                              call
                            </span>
                            {t("callEmergency", "Call")}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add new pharmacy (creator only) */}
              {managing && (
                <div className="mt-3 bg-zinc-800/60 border border-dashed border-zinc-600 rounded-xl p-3 space-y-2">
                  <p className="text-xs text-zinc-400 font-semibold">
                    {t("addPharmacy", "Add New Pharmacy")}
                  </p>
                  <input
                    className={inputCls}
                    placeholder="Pharmacy name *"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <input
                    className={inputCls}
                    placeholder="Address"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                  />
                  <input
                    className={inputCls}
                    placeholder="Phone number *"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddPharmacy}
                    disabled={!newName.trim() || !newPhone.trim()}
                    className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    + {t("addPharmacy", "Add Pharmacy")}
                  </button>
                </div>
              )}
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
