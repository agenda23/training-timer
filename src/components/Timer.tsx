'use client';

import { useState, useEffect, useCallback } from 'react';

interface TimerSettings {
  workTime: number;
  restTime: number;
  setCount: number;
}

type TimerPhase = 'work' | 'rest' | 'complete';

const SettingInput = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  unit = "秒",
  step = 1
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit?: string;
  step?: number;
}) => (
  <div 
    style={{
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: '0.75rem',
      borderRadius: '0.75rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}
  >
    <label 
      style={{
        display: 'block',
        fontSize: '1rem',
        marginBottom: '0.5rem',
        fontWeight: '500',
        color: 'white',
        letterSpacing: '0.025em'
      }}
    >
      {label}
    </label>
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}
    >
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '0.5rem',
          appearance: 'none',
          cursor: 'pointer',
          accentColor: 'rgba(255, 255, 255, 0.9)'
        }}
        min={min}
        max={max}
        step={step}
      />
      <div 
        style={{
          width: '80px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '0.5rem',
          padding: '0.25rem',
          backdropFilter: 'blur(4px)'
        }}
      >
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || min)}
          style={{
            width: '48px',
            padding: '0.25rem',
            borderRadius: '0.25rem',
            backgroundColor: 'transparent',
            color: 'white',
            textAlign: 'center',
            fontWeight: '500',
            border: 'none',
            outline: 'none'
          }}
          min={min}
          max={max}
          step={step}
        />
        <span 
          style={{
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.9)'
          }}
        >
          {unit}
        </span>
      </div>
    </div>
  </div>
);

const ProgressBar = ({ progress }: { progress: number }) => (
  <div 
    style={{
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '9999px',
      height: '0.75rem',
      overflow: 'hidden',
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}
  >
    <div
      style={{
        height: '100%',
        background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)',
        borderRadius: '9999px',
        transition: 'width 0.3s ease-in-out',
        width: `${progress}%`,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
      }}
    />
  </div>
);

export default function Timer() {
  const [settings, setSettings] = useState<TimerSettings>({
    workTime: 45,
    restTime: 15,
    setCount: 8
  });

  const [timeLeft, setTimeLeft] = useState(settings.workTime);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<TimerPhase>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
      setTimeLeft(settings.workTime);
    }
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(settings.workTime);
    setCurrentSet(1);
    setPhase('work');
  };

  const updateTimer = useCallback(() => {
    if (timeLeft > 0) {
      setTimeLeft(timeLeft - 1);
    } else {
      if (phase === 'work') {
        setPhase('rest');
        setTimeLeft(settings.restTime);
      } else {
        setPhase('complete');
        setCurrentSet(currentSet + 1);
        if (currentSet < settings.setCount) {
          setTimeLeft(settings.workTime);
        } else {
          setIsRunning(false);
        }
      }
    }
  }, [timeLeft, currentSet, settings.workTime, settings.restTime, settings.setCount, phase]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isPaused) {
      interval = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, updateTimer]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        if (isRunning) {
          pauseTimer()
        } else {
          startTimer()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isRunning, pauseTimer, startTimer])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / settings.workTime) * 100;

  return (
    <div 
      className={`w-full min-h-screen flex flex-col items-center justify-center p-4 ${
        phase === 'rest' ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-red-400 to-red-600'
      }`}
      style={{
        background: phase === 'rest' 
          ? 'linear-gradient(135deg, #34d399 0%, #059669 100%)' 
          : 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)'
      }}
    >
      <div className="w-full max-w-md space-y-8">
        {/* タイトル */}
        <div className="text-center">
          <h1 
            className="text-3xl font-bold text-white drop-shadow-lg"
            style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', textShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}
          >
            {phase === 'rest' ? '休憩中' : 'トレーニング中'}
          </h1>
        </div>
        
        {/* タイマー表示 */}
        <div className="text-center space-y-4">
          <div 
            className="text-6xl font-mono font-bold text-white drop-shadow-lg"
            style={{ fontSize: '4rem', fontFamily: 'monospace', fontWeight: 'bold', color: 'white', textShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}
          >
            {formatTime(timeLeft)}
          </div>
          <div 
            className="text-xl text-white font-medium"
            style={{ fontSize: '1.25rem', color: 'white', fontWeight: '500' }}
          >
            セット: {currentSet}/{settings.setCount}
          </div>
          <ProgressBar progress={progress} />
        </div>

        {/* 設定項目（タイマー停止時のみ表示） */}
        {!isRunning && (
          <div 
            className="space-y-4 p-4 rounded-2xl"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
              padding: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <SettingInput
              label="ワーク時間"
              value={settings.workTime}
              onChange={(value) => setSettings({ ...settings, workTime: value })}
              min={10}
              max={600}
              step={10}
            />
            <SettingInput
              label="レスト時間"
              value={settings.restTime}
              onChange={(value) => setSettings({ ...settings, restTime: value })}
              min={0}
              max={600}
              step={5}
            />
            <SettingInput
              label="セット数"
              value={settings.setCount}
              onChange={(value) => setSettings({ ...settings, setCount: value })}
              min={1}
              max={20}
              unit="回"
            />
          </div>
        )}

        {/* コントロールボタン */}
        <div 
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '9999px',
              fontWeight: '600',
              fontSize: '1.125rem',
              color: 'white',
              background: isRunning 
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)'
                : 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(22, 163, 74, 0.9) 100%)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease-in-out',
              minWidth: '120px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }}
          >
            {isRunning ? '一時停止' : 'スタート'}
          </button>
          
          <button
            onClick={resetTimer}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '9999px',
              fontWeight: '600',
              fontSize: '1.125rem',
              color: 'white',
              background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.9) 0%, rgba(75, 85, 99, 0.9) 100%)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease-in-out',
              minWidth: '120px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }}
          >
            リセット
          </button>
        </div>
      </div>
    </div>
  );
} 