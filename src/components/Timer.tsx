'use client';

import { useState, useEffect, useCallback } from 'react';
import screenfull from 'screenfull';
import useSound from 'use-sound';
import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/solid';

interface TimerSettings {
  setTime: number;
  intervalTime: number;
  setCount: number;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: TimerSettings = {
  setTime: 30,
  intervalTime: 15,
  setCount: 3,
  soundEnabled: true,
};

const SettingInput = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  unit = "秒"
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit?: string;
}) => (
  <div className="bg-white/10 p-3 rounded-xl shadow-lg border border-white/20">
    <label className="block text-sm sm:text-base mb-2 font-medium text-white tracking-wide">
      {label}
    </label>
    <div className="flex items-center gap-3">
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white/90"
        min={min}
        max={max}
      />
      <div className="w-20 flex items-center gap-1 bg-white/10 rounded-lg p-1 backdrop-blur-sm">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || min)}
          className="w-12 p-1 rounded bg-transparent text-white text-center font-medium"
          min={min}
          max={max}
        />
        <span className="text-sm text-white/90">{unit}</span>
      </div>
    </div>
  </div>
);

export default function Timer() {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [playStart] = useSound('/sounds/start.mp3', { 
    volume: 0.5,
    soundEnabled: settings.soundEnabled 
  });
  const [playEnd] = useSound('/sounds/end.mp3', { 
    volume: 0.5,
    soundEnabled: settings.soundEnabled 
  });

  const toggleFullscreen = () => {
    if (screenfull.isEnabled) {
      screenfull.toggle();
      setIsFullscreen(!isFullscreen);
    }
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
      setCurrentTime(settings.setTime);
      if (settings.soundEnabled) playStart();
    }
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentTime(0);
    setCurrentSet(1);
    setIsResting(false);
  };

  const updateTimer = useCallback(() => {
    if (currentTime > 0) {
      setCurrentTime(currentTime - 1);
    } else {
      if (isResting) {
        setIsResting(false);
        setCurrentSet(currentSet + 1);
        if (currentSet < settings.setCount) {
          setCurrentTime(settings.setTime);
          if (settings.soundEnabled) playStart();
        } else {
          setIsRunning(false);
          if (settings.soundEnabled) playEnd();
        }
      } else {
        if (currentSet < settings.setCount) {
          setIsResting(true);
          setCurrentTime(settings.intervalTime);
          if (settings.soundEnabled) playEnd();
        } else {
          setIsRunning(false);
          if (settings.soundEnabled) playEnd();
        }
      }
    }
  }, [currentTime, currentSet, isResting, settings, playStart, playEnd]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isPaused) {
      interval = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, updateTimer]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) {
          pauseTimer();
        } else {
          startTimer();
        }
      } else if (e.code === 'Escape') {
        resetTimer();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / (isResting ? settings.intervalTime : settings.setTime)) * 100;

  return (
    <div className={`w-full min-h-[100dvh] flex items-center justify-center ${
      isResting ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-red-400 to-red-600'
    } ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl relative py-4 px-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="text-center text-white">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight drop-shadow-lg">
              {isResting ? '休憩中' : 'トレーニング中'}
            </h1>
          </div>
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <div className="text-5xl sm:text-6xl lg:text-7xl font-mono text-white font-bold tracking-wider drop-shadow-lg">
              {formatTime(currentTime)}
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl text-white font-medium tracking-wide drop-shadow-lg">
              セット: {currentSet}/{settings.setCount}
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5 sm:h-3 lg:h-4 backdrop-blur-sm shadow-lg">
              <div
                className="bg-white/90 h-full rounded-full transition-all duration-1000 shadow-inner"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {!isRunning ? (
            <div className="mt-3 sm:mt-4">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md shadow-xl space-y-3 border border-white/20">
                <SettingInput
                  label="セット時間"
                  value={settings.setTime}
                  onChange={(value) => setSettings({ ...settings, setTime: value })}
                  min={1}
                  max={600}
                />
                <SettingInput
                  label="インターバル時間"
                  value={settings.intervalTime}
                  onChange={(value) => setSettings({ ...settings, intervalTime: value })}
                  min={0}
                  max={600}
                />
                <SettingInput
                  label="セット数"
                  value={settings.setCount}
                  onChange={(value) => setSettings({ ...settings, setCount: value })}
                  min={1}
                  max={20}
                  unit="回"
                />
                <button
                  onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                  className="w-full bg-white/10 p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-all duration-300 text-white border border-white/20 shadow-lg"
                >
                  {settings.soundEnabled ? (
                    <>
                      <SpeakerWaveIcon className="h-5 w-5" />
                      <span className="text-sm sm:text-base font-medium">サウンドON</span>
                    </>
                  ) : (
                    <>
                      <SpeakerXMarkIcon className="h-5 w-5" />
                      <span className="text-sm sm:text-base font-medium">サウンドOFF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}
          <div className="flex justify-center space-x-4 mt-3 sm:mt-4">
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className="bg-white/90 text-gray-800 rounded-full p-3 hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-sm"
            >
              {isRunning && !isPaused ? (
                <PauseIcon className="h-8 w-8" />
              ) : (
                <PlayIcon className="h-8 w-8" />
              )}
            </button>
            <button
              onClick={resetTimer}
              className="bg-white/90 text-gray-800 rounded-full p-3 hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-sm"
            >
              <ArrowPathIcon className="h-8 w-8" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="bg-white/90 text-gray-800 rounded-full p-3 hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-sm"
            >
              <ArrowsPointingOutIcon className="h-8 w-8" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 