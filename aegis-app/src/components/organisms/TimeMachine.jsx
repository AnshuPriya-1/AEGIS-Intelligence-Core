import React, { useState, useEffect } from 'react';
import { GlassPanel } from '../atoms/GlassPanel';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Play, Pause, FastForward, RotateCcw, Clock, Calendar, ShieldAlert } from 'lucide-react';
import timelineData from '../../data/timeline.json';

export function TimeMachine({ onTimeChange }) {
  const [currentIndex, setCurrentIndex] = useState(4); // Default to current time 14:30
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const eventMarkers = [
    { index: 0, time: '00:00', label: 'Normal Conditions' },
    { index: 2, time: '08:00', label: 'First Signal Detected' },
    { index: 4, time: '14:30', label: 'Hormuz Alert' },
  ];

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = prev + 1;
          if (next >= timelineData.length) {
            setIsPlaying(false);
            return prev;
          }
          if (onTimeChange) onTimeChange(timelineData[next]);
          return next;
        });
      }, 2000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, onTimeChange]);

  const currentFrame = timelineData[currentIndex] || timelineData[0];

  const handleSliderChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    setCurrentIndex(idx);
    if (onTimeChange) onTimeChange(timelineData[idx]);
  };

  const cycleSpeed = () => {
    if (speed === 1) setSpeed(2);
    else if (speed === 2) setSpeed(5);
    else setSpeed(1);
  };

  return (
    <GlassPanel className="p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)]/40 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[var(--signal)]" />
          <h3 className="text-xs font-bold font-display tracking-wider uppercase text-[var(--text)]">
            Replay Recent History
          </h3>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-[var(--muted)]">Selected Timestamp:</span>
          <span className="font-bold text-[var(--signal)]">{currentFrame.time}</span>
          <Badge variant={currentFrame.riskScore > 40 ? 'danger' : 'signal'}>
            Risk: {currentFrame.riskScore}
          </Badge>
        </div>
      </div>

      {/* Playback Controls & Speed Toggle */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-1.5">
          <Button
            variant={isPlaying ? 'danger' : 'signal'}
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            icon={isPlaying ? Pause : Play}
          >
            {isPlaying ? 'Pause' : 'Playback'}
          </Button>

          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsPlaying(false);
            }}
            className="p-1.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
            title="Reset Timeline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={cycleSpeed}
            className="px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] text-[11px] font-mono text-[var(--signal)] font-bold flex items-center gap-1"
          >
            <FastForward className="w-3 h-3" /> {speed}x
          </button>
        </div>

        {/* Quick Event Jump Markers */}
        <div className="hidden sm:flex items-center space-x-2 text-[10px] font-mono">
          <span className="text-[var(--muted)]">Jump to:</span>
          {eventMarkers.map((marker) => (
            <button
              key={marker.index}
              onClick={() => {
                setCurrentIndex(marker.index);
                if (onTimeChange) onTimeChange(timelineData[marker.index]);
              }}
              className={`px-2 py-0.5 rounded border transition-colors ${
                currentIndex === marker.index
                  ? 'bg-[var(--signal)]/20 border-[var(--signal)] text-[var(--signal)] font-bold'
                  : 'bg-[var(--bg)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {marker.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="space-y-1">
        <input
          type="range"
          min="0"
          max={timelineData.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
          className="w-full accent-[var(--signal)] bg-[var(--border)] rounded-lg h-2 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-mono text-[var(--muted)]">
          <span>00:00 UTC</span>
          <span>12:00 UTC</span>
          <span>22:00 UTC (Est)</span>
        </div>
      </div>
    </GlassPanel>
  );
}
