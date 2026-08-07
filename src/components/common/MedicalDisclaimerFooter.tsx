export function MedicalDisclaimerFooter() {
  return (
    <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-start gap-4 shadow-sm shrink-0 mt-6 fade-in">
      <svg className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
      </svg>
      <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
        <strong className="font-bold uppercase tracking-wide">PENTING (MEDICAL DISCLAIMER):</strong>
        <p className="mt-1">
          HepaTwin adalah perangkat lunak penunjang keputusan praklinis yang murni bersifat <em>in-silico</em> untuk riset/edukasi. Hasil AI, SHAP, PBPK, dan visualisasi 3D bertujuan membantu penyusunan hipotesis dan triase awal, <strong>bukan diagnosis klinis, bukan rekomendasi terapi/dosis, dan bukan pengganti uji in-vitro, in-vivo, uji klinis, atau penilaian regulator</strong>. PBPK Fase 1 linear tanpa absorpsi oral, protein binding, Km/Vmax, NAPQI/glutathione, dan parameter IVIVE compound-specific penuh. Warna segmen Couinaud adalah heuristik visual pedagogis, bukan lokalisasi histologis klinis. Ambang AI/exposure bersifat distribusional internal dan pending validasi K2/K3/K6.
        </p>
      </div>
    </div>
  );
}
