import { useState, useEffect } from 'react';

interface MedicalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function MedicalDisclaimerModal({ isOpen, onClose, onConfirm }: MedicalDisclaimerModalProps) {
  const [isNonClinicalAccepted, setIsNonClinicalAccepted] = useState(false);
  const [isInSilicoAccepted, setIsInSilicoAccepted] = useState(false);
  const [isNoTreatmentAccepted, setIsNoTreatmentAccepted] = useState(false);

  const isConsented = isNonClinicalAccepted && isInSilicoAccepted && isNoTreatmentAccepted;

  useEffect(() => {
    if (isOpen) {
      setIsNonClinicalAccepted(false);
      setIsInSilicoAccepted(false);
      setIsNoTreatmentAccepted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isConsented) {
      onConfirm();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-lg w-full p-5 sm:p-6 flex flex-col gap-4 sm:gap-5 relative overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              Peringatan Hukum &amp; Batasan Medis (Medical Disclaimer)
            </h3>
            <span className="text-xs text-slate-500 font-medium">Standard ASME V&amp;V 40 Context of Use</span>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs sm:text-sm text-amber-950 leading-relaxed max-h-60 overflow-y-auto">
          <strong className="font-bold block mb-1 uppercase tracking-wide text-amber-900">PENTING (MEDICAL DISCLAIMER):</strong>
          <p>
            HepaTwin merupakan perangkat lunak penunjang keputusan (<em>decision support system</em>) praklinis yang murni bersifat <em>in silico</em> (simulasi komputasional). Hasil prediksi dan visualisasi 3D bertujuan membantu penyusunan hipotesis ilmiah dan triase skrining awal, <strong>bukan merupakan diagnosis klinis, keputusan medis, atau pengganti mutlak bagi pengujian <em>in vitro</em> dan <em>in vivo</em> yang diatur otoritas kesehatan resmi</strong>.
          </p>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-700 font-medium leading-normal cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isNonClinicalAccepted}
              onChange={(e) => setIsNonClinicalAccepted(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer shrink-0"
            />
            Saya memahami HepaTwin bukan alat diagnosis/terapi.
          </label>

          <label className="flex items-start gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-700 font-medium leading-normal cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isInSilicoAccepted}
              onChange={(e) => setIsInSilicoAccepted(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer shrink-0"
            />
            Saya memahami parameter PBPK/AI saat ini masih memerlukan validasi ilmiah lebih lanjut dan tinjauan ahli Farmasi.
          </label>

          <label className="flex items-start gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-700 font-medium leading-normal cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isNoTreatmentAccepted}
              onChange={(e) => setIsNoTreatmentAccepted(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer shrink-0"
            />
            Saya memahami warna 3D adalah prioritas visual in-silico, bukan bukti cedera pasien.
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isConsented}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Jalankan Simulasi
          </button>
        </div>
      </div>
    </div>
  );
}
