import { ControlPanel } from '../controls/ControlPanel';
import { Canvas3DViewer } from '../canvas3d/Canvas3DViewer';
import { AcademicDashboard } from '../dashboard/AcademicDashboard';
import { useAppStore } from '../../state/store';
import { useKeyboardSafeScroll } from '../../hooks/useKeyboardSafeScroll';

export function MainLayout() {
  const { simulationResult } = useAppStore();
  const hasResult = Boolean(simulationResult);
  // Jaga kolom input tetap terlihat di atas keyboard virtual mobile/tablet.
  useKeyboardSafeScroll();

  return (
    <div className="text-slate-800 antialiased min-h-screen flex flex-col font-sans bg-slate-50">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-[1440px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                  <img src="/logo-hepatwin.png" alt="HepaTwin Logo" className="w-8 h-8 object-contain flex-shrink-0" />
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 min-w-0">
                      <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight text-slate-900 truncate">HepaTwin</h1>
                      <span className="text-xs sm:text-sm text-slate-400 font-medium hidden sm:inline-block">Simulasi In-Silico 3D Liver untuk Prediksi Risiko Hepatotoksisitas</span>
                      <span className="text-xs text-slate-400 font-medium sm:hidden">Simulasi In-Silico 3D Liver</span>
                  </div>
              </div>
              <button
                className={`whitespace-nowrap font-semibold text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-colors shadow-sm shrink-0 ${
                  hasResult
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
                disabled={!hasResult}
                title={hasResult ? 'Unduh Laporan Ringkasan Simulasi (PDF)' : 'Jalankan simulasi terlebih dahulu'}
                onClick={() => {
                  if (hasResult) {
                    window.print();
                  }
                }}
              >
                Unduh Laporan PDF
              </button>
          </div>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6 lg:py-8 lg:px-8 flex flex-col gap-6 lg:gap-8 overflow-x-clip">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full">
          {/* Left Sidebar (Controls) */}
          <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-4 sm:gap-5 order-2 lg:order-1">
            <ControlPanel />
          </div>
          
          {/* Right Main (3D Canvas) */}
          <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col relative overflow-hidden min-h-[380px] sm:min-h-[460px] lg:min-h-[550px] order-1 lg:order-2 fade-in">
            <Canvas3DViewer />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="w-full shrink-0">
          <AcademicDashboard />
        </div>
      </main>
    </div>
  );
}
