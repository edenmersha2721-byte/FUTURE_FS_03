import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Upload, Link2, X, Loader2, Move, ZoomIn, RotateCcw } from 'lucide-react';
import { api, assetUrl } from '../../api/client.js';

/**
 * Image picker supporting local upload + URL, plus an optional
 * "focal point" adjuster (drag up/down + zoom) like setting a profile photo.
 *
 * Reposition controls appear only when `onPosYChange` is provided.
 */
export default function ImageInput({
  value,
  onChange,
  label = 'Image',
  posY,
  onPosYChange,
  zoom,
  onZoomChange,
}) {
  const fileRef = useRef(null);
  const frameRef = useRef(null);
  const drag = useRef(null);
  const [uploading, setUploading] = useState(false);

  const repositionable = typeof onPosYChange === 'function';
  const y = posY ?? 50;
  const z = zoom ?? 1;

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload', fd);
      onChange(data.url);
      toast.success('Image uploaded');
    } catch (e) {
      toast.error(e.friendlyMessage || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // --- drag to reposition (adjusts vertical focal point) ---
  const onPointerDown = (e) => {
    if (!repositionable) return;
    e.preventDefault();
    drag.current = { startY: e.clientY, startPos: y, h: frameRef.current?.offsetHeight || 200 };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const { startY, startPos, h } = drag.current;
    const deltaPct = ((e.clientY - startY) / h) * 100;
    // dragging down reveals the top of the image -> lower objectPosition Y
    const next = Math.max(0, Math.min(100, Math.round(startPos - deltaPct)));
    onPosYChange(next);
  };
  const onPointerUp = () => {
    drag.current = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  };

  return (
    <div>
      <label className="label">{label}</label>

      {value ? (
        <>
          <div
            ref={frameRef}
            onPointerDown={onPointerDown}
            className={`relative mb-2 aspect-[4/3] w-full select-none overflow-hidden rounded-xl border border-sand ${
              repositionable ? 'cursor-grab active:cursor-grabbing' : ''
            }`}
          >
            <img
              src={assetUrl(value)}
              alt="preview"
              draggable={false}
              className="h-full w-full object-cover transition-[object-position] duration-75"
              style={{ objectPosition: `50% ${y}%`, transform: `scale(${z})` }}
            />
            {repositionable && (
              <span className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-charcoal/70 px-3 py-1 text-xs text-cream">
                <Move size={12} /> Drag to reposition
              </span>
            )}
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-rose-500 shadow hover:bg-white"
              title="Remove"
            >
              <X size={14} />
            </button>
          </div>

          {repositionable && (
            <div className="mb-3 space-y-2 rounded-xl bg-beige/40 p-3">
              <div className="flex items-center gap-3">
                <Move size={15} className="shrink-0 text-muted" />
                <input
                  type="range" min="0" max="100" value={y}
                  onChange={(e) => onPosYChange(Number(e.target.value))}
                  className="h-1.5 w-full accent-[#C9A15A]"
                  title="Vertical position"
                />
              </div>
              <div className="flex items-center gap-3">
                <ZoomIn size={15} className="shrink-0 text-muted" />
                <input
                  type="range" min="1" max="2.5" step="0.05" value={z}
                  onChange={(e) => onZoomChange(Number(e.target.value))}
                  className="h-1.5 w-full accent-[#C9A15A]"
                  title="Zoom"
                />
                <button
                  type="button"
                  onClick={() => { onPosYChange(50); onZoomChange(1); }}
                  className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted hover:bg-white"
                  title="Reset"
                >
                  <RotateCcw size={13} /> Reset
                </button>
              </div>
            </div>
          )}
        </>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-sand px-4 py-2.5 text-sm text-muted transition hover:border-gold"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? 'Uploading…' : 'Upload from device'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      <div className="relative mt-2">
        <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          className="input pl-9"
          placeholder="…or paste an image URL"
          value={value?.startsWith('/uploads') ? '' : value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
