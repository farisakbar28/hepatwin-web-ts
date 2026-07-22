import { ControlPanel } from '../controls/ControlPanel';
import { Canvas3DViewer } from '../canvas3d/Canvas3DViewer';
import { AcademicDashboard } from '../dashboard/AcademicDashboard';

export function MainLayout() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      {/* Top Section (Kiri + Kanan) */}
      <div className="flex flex-col md:flex-row flex-1 h-[70vh] md:h-[70vh] overflow-y-auto md:overflow-hidden">
        {/* Zona Kiri: Control Panel */}
        <div className="w-full md:w-80 lg:w-96 h-auto md:h-full shrink-0 flex-none border-b md:border-b-0 md:border-r border-slate-700">
          <ControlPanel />
        </div>
        
        {/* Zona Kanan: 3D Canvas */}
        <div className="flex-1 h-[50vh] md:h-full relative min-h-[300px]">
          <Canvas3DViewer />
        </div>
      </div>

      {/* Bottom Section (Dashboard) */}
      <div className="h-auto md:h-[30vh] min-h-[250px] w-full shrink-0 border-t border-slate-700">
        <AcademicDashboard />
      </div>
    </div>
  );
}
