interface Props {
  open: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export function CameraPermissionModal({ open, onAllow, onDeny }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onDeny}
      onKeyDown={(e) => e.key === "Escape" && onDeny()}
      aria-label="Close permission modal"
      data-ocid="camera_permission.modal"
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-xs w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-400 text-3xl">
              photo_camera
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-center text-lg font-bold text-white mb-2">
          📷 Photo Access Required
        </h3>

        {/* Description */}
        <p className="text-center text-sm text-zinc-400 mb-6 leading-relaxed">
          Ladakh Connect needs access to your photos to update your profile
          picture.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onDeny}
            className="flex-1 py-3 rounded-xl border border-zinc-600 text-zinc-300 text-sm font-semibold hover:bg-zinc-800 transition-colors"
            data-ocid="camera_permission.cancel_button"
          >
            Not Now
          </button>
          <button
            type="button"
            onClick={onAllow}
            className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
            data-ocid="camera_permission.confirm_button"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}
