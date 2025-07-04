'use client';

import { useState, useEffect, useCallback } from 'react';
import { PWAStatus } from './PWAStatus';

interface TimerSettings {
  workTime: number;
  restTime: number;
  setCount: number;
  soundEnabled: boolean;
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
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(10px)'
    }}
  >
    <label 
      style={{
        display: 'block',
        fontSize: '0.875rem',
        marginBottom: '0.5rem',
        fontWeight: '600',
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
        gap: '0.5rem'
      }}
    >
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '0.375rem',
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
          width: '70px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '0.375rem',
          padding: '0.25rem',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || min)}
          style={{
            width: '45px',
            padding: '0.125rem',
            borderRadius: '0.25rem',
            backgroundColor: 'transparent',
            color: 'white',
            textAlign: 'center',
            fontWeight: '600',
            border: 'none',
            outline: 'none',
            fontSize: '0.75rem'
          }}
          min={min}
          max={max}
          step={step}
        />
        <span 
          style={{
            fontSize: '0.7rem',
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: '500'
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
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '9999px',
      height: '0.5rem',
      overflow: 'hidden',
      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(4px)'
    }}
  >
    <div
      style={{
        height: '100%',
        background: 'linear-gradient(90deg, rgba(34, 197, 94, 1) 0%, rgba(59, 130, 246, 1) 50%, rgba(168, 85, 247, 1) 100%)',
        borderRadius: '9999px',
        transition: 'width 0.5s ease-in-out',
        width: `${progress}%`,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
          borderRadius: '9999px'
        }}
      />
    </div>
  </div>
);

export default function Timer() {
  const [settings, setSettings] = useState<TimerSettings>({
    workTime: 45,
    restTime: 15,
    setCount: 8,
    soundEnabled: true
  });

  const [timeLeft, setTimeLeft] = useState(settings.workTime);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<TimerPhase>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showPWAStatus, setShowPWAStatus] = useState(false);

  // URLパラメータからアクションを処理
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action) {
      // URLパラメータをクリア
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // アクションを実行
      switch (action) {
        case 'update':
          handlePWAUpdate();
          break;
        case 'start':
          handleQuickStart();
          break;
        case 'settings':
          // 設定パネルは停止中のみ表示されるので、停止状態にする
          if (isRunning) {
            setIsRunning(false);
            setIsPaused(false);
          }
          break;
        case 'status':
          setShowPWAStatus(true);
          break;
      }
    }
  }, []);

  // PWA更新処理
  const handlePWAUpdate = async () => {
    try {
      // Service Workerの更新を強制
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          
          // 新しいService Workerがある場合は強制的にアクティベート
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      }

      // キャッシュをクリア
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // 少し待ってからリロード
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('PWA update failed:', error);
      // エラーが発生した場合でも通常のリロードを実行
      window.location.reload();
    }
  };

  // クイックスタート処理
  const handleQuickStart = () => {
    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
      setTimeLeft(settings.workTime);
      setCurrentSet(1);
      setPhase('work');
      playStartSound();
    }
  };

  // 音声機能
  const playSound = useCallback((frequency: number, duration: number = 200) => {
    if (!settings.soundEnabled) return;
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.log('音声再生に失敗しました:', error);
    }
  }, [settings.soundEnabled]);

  const playStartSound = useCallback(() => playSound(800, 300), [playSound]);
  const playEndSound = useCallback(() => playSound(400, 500), [playSound]);
  const playCompleteSound = useCallback(() => {
    // 完了時は3回ビープ音
    playSound(600, 200);
    setTimeout(() => playSound(600, 200), 300);
    setTimeout(() => playSound(600, 200), 600);
  }, [playSound]);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
      setTimeLeft(settings.workTime);
      playStartSound();
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
        playEndSound();
      } else {
        setCurrentSet(currentSet + 1);
        if (currentSet < settings.setCount) {
          setPhase('work');
          setTimeLeft(settings.workTime);
          playStartSound();
        } else {
          setIsRunning(false);
          setPhase('complete');
          playCompleteSound();
        }
      }
    }
  }, [timeLeft, currentSet, settings.workTime, settings.restTime, settings.setCount, phase, playStartSound, playEndSound, playCompleteSound]);

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

  const progress = phase === 'rest' 
    ? ((settings.restTime - timeLeft) / settings.restTime) * 100
    : ((settings.workTime - timeLeft) / settings.workTime) * 100;

  return (
    <div 
      style={{
        width: '100%',
        height: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: phase === 'rest' 
          ? 'linear-gradient(135deg, #34d399 0%, #059669 100%)' 
          : 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
        position: 'relative'
      }}
    >
      {/* PWAステータス */}
      <div 
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          opacity: 0.3,
          transition: 'opacity 0.3s ease',
          transform: 'scale(0.8)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.8';
          e.currentTarget.style.transform = 'scale(0.9)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.3';
          e.currentTarget.style.transform = 'scale(0.8)';
        }}
      >
        <PWAStatus 
          forceShow={showPWAStatus} 
          onClose={() => setShowPWAStatus(false)} 
        />
      </div>

      {/* メインコンテンツ */}
      <div 
        style={{
          width: '100%',
          height: '80dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 0.5rem',
          overflowY: 'auto',
          maxWidth: '400px'
        }}
      >
        {/* 上部コンテンツ */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            flex: '1',
            justifyContent: 'center',
            maxWidth: '100%'
          }}
        >
          {/* タイトル */}
          <h1 
            style={{ 
              fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', 
              fontWeight: 'bold', 
              color: 'white', 
              textShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              margin: '0',
              letterSpacing: '0.05em',
              textAlign: 'center'
            }}
          >
            {phase === 'rest' ? '休憩中' : 'トレーニング中'}
          </h1>

          {/* タイマー表示 */}
          <div 
            style={{
              textAlign: 'center'
            }}
          >
            <div 
              style={{ 
                fontSize: 'clamp(2.5rem, 10vw, 3.5rem)', 
                fontFamily: 'monospace', 
                fontWeight: 'bold', 
                color: 'white', 
                textShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                margin: '0 0 0.5rem 0',
                lineHeight: '1'
              }}
            >
              {formatTime(timeLeft)}
            </div>
            <div 
              style={{ 
                fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontWeight: '500',
                margin: '0'
              }}
            >
              セット: {currentSet}/{settings.setCount}
            </div>
          </div>

          {/* プログレスバー */}
          <div 
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '0 1rem'
            }}
          >
            <ProgressBar progress={progress} />
          </div>
        </div>

        {/* 設定 (停止中のみ表示) */}
        {!isRunning && (
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              width: '100%',
              maxWidth: '350px',
              padding: '0 1rem',
              flex: '0 0 auto'
            }}
          >
            <SettingInput
              label="ワーク時間"
              value={settings.workTime}
              onChange={(value) => setSettings(prev => ({ ...prev, workTime: value }))}
              min={10}
              max={300}
              unit="秒"
              step={5}
            />
            <SettingInput
              label="レスト時間"
              value={settings.restTime}
              onChange={(value) => setSettings(prev => ({ ...prev, restTime: value }))}
              min={5}
              max={180}
              unit="秒"
              step={5}
            />
            <SettingInput
              label="セット数"
              value={settings.setCount}
              onChange={(value) => setSettings(prev => ({ ...prev, setCount: value }))}
              min={1}
              max={20}
              unit="セット"
              step={1}
            />
            
            {/* 音声設定 */}
            <div 
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <label 
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: 'white',
                  letterSpacing: '0.025em'
                }}
              >
                音声設定
              </label>
              <button
                onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                style={{
                  width: '100%',
                  padding: '0.375rem',
                  borderRadius: '0.375rem',
                  backgroundColor: settings.soundEnabled 
                    ? 'rgba(34, 197, 94, 0.3)' 
                    : 'rgba(239, 68, 68, 0.3)',
                  border: `2px solid ${settings.soundEnabled 
                    ? 'rgba(34, 197, 94, 0.6)' 
                    : 'rgba(239, 68, 68, 0.6)'}`,
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {settings.soundEnabled ? '🔊 音声ON' : '🔇 音声OFF'}
              </button>
            </div>
          </div>
        )}

        {/* コントロールボタン */}
        <div 
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            padding: '0 1rem',
            flex: '0 0 auto',
            marginTop: '1rem'
          }}
        >
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            style={{
              padding: '0.625rem 1.5rem',
              borderRadius: '50px',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: 'white',
              background: isRunning 
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)'
                : 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(22, 163, 74, 0.9) 100%)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease-in-out',
              minWidth: '100px',
              letterSpacing: '0.025em'
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
              padding: '0.625rem 1.5rem',
              borderRadius: '50px',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: 'white',
              background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.9) 0%, rgba(75, 85, 99, 0.9) 100%)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease-in-out',
              minWidth: '100px',
              letterSpacing: '0.025em'
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