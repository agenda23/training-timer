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
    <div className="bg-white/10 p-4 rounded-xl shadow-lg border border-white/20">
      <label className="block text-sm sm:text-base lg:text-lg mb-2 font-medium text-white tracking-wide">
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
        <div className="w-24 flex items-center gap-1 bg-white/10 rounded-lg p-1 backdrop-blur-sm">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || min)}
            className="w-14 p-1 rounded bg-transparent text-white text-center font-medium"
            min={min}
            max={max}
          />
          <span className="text-sm text-white/90">{unit}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`w-full min-h-[100dvh] flex items-center justify-center p-4 ${
      isResting ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-red-400 to-red-600'
    } ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="w-full max-w-7xl aspect-[3/4] sm:aspect-[4/3] relative">
        <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
          <div className="flex-none text-center text-white">
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold tracking-tight drop-shadow-lg">
              {isResting ? '休憩中' : 'トレーニング中'}
            </h1>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center gap-4 sm:gap-6 lg:gap-8 my-2 sm:my-4">
            <div className="text-4xl sm:text-6xl lg:text-8xl font-mono text-white font-bold tracking-wider drop-shadow-lg">
              {formatTime(currentTime)}
            </div>
            <div className="text-xl sm:text-2xl lg:text-4xl text-white font-medium tracking-wide drop-shadow-lg">
              セット: {currentSet}/{settings.setCount}
            </div>
            <div className="w-full max-w-4xl bg-white/20 rounded-full h-3 sm:h-4 lg:h-6 backdrop-blur-sm shadow-lg">
              <div
                className="bg-white/90 h-full rounded-full transition-all duration-1000 shadow-inner"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {!isRunning ? (
            <div className="flex-none w-full max-w-2xl mx-auto">
              <div className="bg-white/10 p-4 sm:p-6 rounded-2xl backdrop-blur-md shadow-xl space-y-3 sm:space-y-4 border border-white/20">
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
          <div className="flex-none flex justify-center space-x-4 mt-4">
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className="bg-white/90 text-gray-800 rounded-full p-3 sm:p-4 hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-sm"
            >
              {isRunning && !isPaused ? (
                <PauseIcon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
              ) : (
                <PlayIcon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
              )}
            </button>
            <button
              onClick={resetTimer}
              className="bg-white/90 text-gray-800 rounded-full p-3 sm:p-4 hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-sm"
            >
              <ArrowPathIcon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="bg-white/90 text-gray-800 rounded-full p-3 sm:p-4 hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-sm"
            >
              <ArrowsPointingOutIcon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 