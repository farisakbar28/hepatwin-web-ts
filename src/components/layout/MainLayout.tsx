import React from 'react';
import { ControlPanel } from '../controls/ControlPanel';
import { Canvas3DViewer } from '../canvas3d/Canvas3DViewer';
import { AcademicDashboard } from '../dashboard/AcademicDashboard';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      {/* Top Section (Kiri + Kanan) */}
      <div className="flex flex-1 h-[70vh]">
        {/* Zona Kiri: Control Panel */}
        <div className="w-80 h-full shrink-0">
          <ControlPanel />
        </div>
        
        {/* Zona Kanan: 3D Canvas */}
        <div className="flex-1 h-full relative">
          <Canvas3DViewer />
        </div>
      </div>

      {/* Bottom Section (Dashboard) */}
      <div className="h-[30vh] w-full shrink-0">
        <AcademicDashboard />
      </div>
    </div>
  );
};
