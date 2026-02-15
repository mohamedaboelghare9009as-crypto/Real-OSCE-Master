
'use client'; // Client Component for State

import Image from 'next/image';
import { useState } from 'react';
import { NurseDialog } from '@/components/vibe/NurseDialog';
import { VitalsMonitor } from '@/components/vibe/VitalsMonitor';


export default function Home() {
  const [showNurse, setShowNurse] = useState(false);
  const [nurseThinking, setNurseThinking] = useState(false);

  const handleVibeCheck = () => {
    setShowNurse(true);
    setNurseThinking(true);
    // Simulate thinking delay
    setTimeout(() => {
      setNurseThinking(false);
    }, 2000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-slate-50 dark:bg-slate-900">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          OSCE Master V3 - Clinical Vibe
        </p>
      </div>

      <div className="relative flex flex-col items-center place-items-center mb-12">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500 mb-8">
          The Simulation
        </h1>

        {/* Vibe Check: Live Vitals */}
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-top-4 duration-1000">
          <VitalsMonitor />
        </div>
      </div>


      <div className="grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left gap-4">
        <div
          onClick={handleVibeCheck}
          className="clay-card group border border-transparent transition-all cursor-pointer hover:border-gray-300 hover:bg-slate-800"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Nurse{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Click to Test Vibe.
          </p>
          <div className="mt-4 variant-monitor">
            HR: 80 bpm
          </div>
        </div>

        <div className="clay-card group border border-transparent transition-colors hover:border-gray-300 hover:bg-slate-800">
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Patient{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Gemini Live Native Audio. Affective Dialog.
          </p>
          <div className="mt-4 w-full h-8 bg-blue-100 dark:bg-blue-900/20 rounded animate-pulse"></div>
        </div>

        <div className="clay-card group border border-transparent transition-colors hover:border-gray-300 hover:bg-slate-800">
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Judge{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Clinical Reasoning Engine (FastAPI).
          </p>
        </div>
      </div>

      <NurseDialog
        message="System connection established. Case loaded. Ready for triage."
        isThinking={nurseThinking}
        isVisible={showNurse}
      />
    </main>
  )
}
