import { useState } from 'react';
import BlackHoleScene from '@/components/BlackHoleScene';
import RomanticQuiz from '@/components/RomanticQuiz';
import ControlsHUD from '@/components/ControlsHUD';

export default function Index() {
  const [mass, setMass] = useState(1);
  const [particleSpeed, setParticleSpeed] = useState(1);
  const [diskRadius, setDiskRadius] = useState(3);
  const [celebrationMode, setCelebrationMode] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden font-body">
      <BlackHoleScene
        mass={mass}
        particleSpeed={particleSpeed}
        diskRadius={diskRadius}
        celebrationMode={celebrationMode}
      />

      <RomanticQuiz onSuccess={() => setCelebrationMode(true)} />

      {celebrationMode && (
        <div className="pointer-events-none fixed inset-x-0 top-6 z-40 text-center">
          <h1 className="font-display text-5xl font-bold text-primary drop-shadow-lg">
            You are my universe, utsho 💖
          </h1>
        </div>
      )}

      <ControlsHUD
        mass={mass} setMass={setMass}
        particleSpeed={particleSpeed} setParticleSpeed={setParticleSpeed}
        diskRadius={diskRadius} setDiskRadius={setDiskRadius}
      />
    </div>
  );
}
