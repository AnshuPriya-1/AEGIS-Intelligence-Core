import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, ArrowRight } from 'lucide-react';
import { Button } from '../components/atoms/Button';

export function StartupLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('System Initialization');

  useEffect(() => {
    const steps = [
      { pct: 15, msg: 'System Initialization' },
      { pct: 35, msg: 'Checking Intelligence Nodes' },
      { pct: 55, msg: 'Connecting Data Sources' },
      { pct: 75, msg: 'Initializing Globe Digital Twin' },
      { pct: 92, msg: 'Preparing Dashboard Command Center' },
      { pct: 100, msg: 'AEGIS System Ready' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].pct);
        setStatusMessage(steps[currentStep].msg);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0E14] text-[#E7ECF2] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Radar Grid Animation */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#20283415_1px,transparent_1px),linear-gradient(to_bottom,#20283415_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute w-[600px] h-[600px] rounded-full border border-[#00D9C0]/10 radar-sweep pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full text-center space-y-6 glass-panel p-8 rounded-2xl border border-[#202834]"
      >
        {/* Logo Reveal */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D9C0] to-emerald-600 flex items-center justify-center shadow-[0_0_30px_rgba(0,217,192,0.4)] animate-pulse">
            <ShieldCheck className="w-10 h-10 text-[#0A0E14]" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-wider text-white">AEGIS</h1>
          <p className="text-xs font-mono text-[#8B95A5] uppercase tracking-widest mt-1">
            Autonomous Energy Governance & Intelligence System
          </p>
        </div>

        {/* Progress Bar & Telemetry Messages */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#00D9C0] flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 animate-spin-slow" /> {statusMessage}
            </span>
            <span className="text-white font-bold">{progress}%</span>
          </div>

          <div className="w-full bg-[#12181F] rounded-full h-2 p-0.5 border border-[#202834] overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#00D9C0] to-emerald-400 rounded-full shadow-[0_0_10px_#00D9C0]"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Enter Command Center CTA */}
        {progress === 100 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              variant="primary"
              size="lg"
              onClick={onComplete}
              icon={ArrowRight}
              className="w-full py-3 text-sm tracking-wider uppercase"
            >
              Enter Command Center
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
