import { useState, useRef, useEffect } from 'react';
import BlackHoleScene from '@/components/BlackHoleScene';
import RomanticQuiz from '@/components/RomanticQuiz';
import ControlsHUD from '@/components/ControlsHUD';

export default function Index() {
  const [mass, setMass] = useState(1);
  const [particleSpeed, setParticleSpeed] = useState(1);
  const [diskRadius, setDiskRadius] = useState(3);
  const [innerDiskTemp, setInnerDiskTemp] = useState(8000);
  const [jetLength, setJetLength] = useState(5);
  const [showGravitationalLensing, setShowGravitationalLensing] = useState(true);
  const [showPhotonSphere, setShowPhotonSphere] = useState(true);
  const [showISCO, setShowISCO] = useState(true);
  const [celebrationMode, setCelebrationMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (celebrationMode && !audioRef.current) {
      // Royalty-free romantic ambient music
      const audio = new Audio('https://cdn.pixabay.com/audio/2024/11/29/audio_d4b082c581.mp3');
      audio.loop = true;
      audio.volume = 0.3;
      audio.play().catch(() => {});
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [celebrationMode]);

  return (
    <div className="relative min-h-screen overflow-hidden font-body">
      <BlackHoleScene
        mass={mass}
        particleSpeed={particleSpeed}
        diskRadius={diskRadius}
        celebrationMode={celebrationMode}
        innerDiskTemp={innerDiskTemp}
        jetLength={jetLength}
        showGravitationalLensing={showGravitationalLensing}
        showPhotonSphere={showPhotonSphere}
        showISCO={showISCO}
      />

      <RomanticQuiz onSuccess={() => setCelebrationMode(true)} />

      <ControlsHUD
        mass={mass} setMass={setMass}
        particleSpeed={particleSpeed} setParticleSpeed={setParticleSpeed}
        diskRadius={diskRadius} setDiskRadius={setDiskRadius}
        innerDiskTemp={innerDiskTemp} setInnerDiskTemp={setInnerDiskTemp}
        jetLength={jetLength} setJetLength={setJetLength}
        showGravitationalLensing={showGravitationalLensing} setShowGravitationalLensing={setShowGravitationalLensing}
        showPhotonSphere={showPhotonSphere} setShowPhotonSphere={setShowPhotonSphere}
        showISCO={showISCO} setShowISCO={setShowISCO}
      />
    </div>
  );
}
