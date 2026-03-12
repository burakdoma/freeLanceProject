import { useState, useEffect, useCallback } from 'react'
import { Play, Pause, RotateCcw, X } from 'lucide-react'

interface Props {
  onClose: () => void
}

const PRESETS = [30, 60, 90, 120, 180]

export default function RestTimer({ onClose }: Props) {
  const [seconds, setSeconds] = useState(90)
  const [remaining, setRemaining] = useState(90)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running || remaining <= 0) return
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false)
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, remaining])

  const reset = useCallback(() => {
    setRunning(false)
    setRemaining(seconds)
  }, [seconds])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const progress = seconds > 0 ? (remaining / seconds) * 100 : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-extrabold">Rest Timer</h3>
          <button onClick={onClose} className="rounded-xl bg-surface-2 p-2 text-muted">
            <X size={20} />
          </button>
        </div>

        <div className="relative mx-auto mb-6 flex h-44 w-44 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 176 176">
            <circle cx="88" cy="88" r="80" fill="none" stroke="var(--color-border)" strokeWidth="8" />
            <circle
              cx="88"
              cy="88"
              r="80"
              fill="none"
              stroke={remaining === 0 ? 'var(--color-success)' : 'var(--color-primary)'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 80}`}
              strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <span className={`text-5xl font-extrabold tabular-nums ${remaining === 0 ? 'text-success' : ''}`}>
            {formatTime(remaining)}
          </span>
        </div>

        <div className="mb-5 flex justify-center gap-4">
          <button
            onClick={() => setRunning(!running)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 active:scale-95 transition-transform"
          >
            {running ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={reset}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-muted active:scale-95 transition-transform"
          >
            <RotateCcw size={22} />
          </button>
        </div>

        <div className="flex justify-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => { setSeconds(p); setRemaining(p); setRunning(false) }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                seconds === p
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'bg-surface-2 text-muted'
              }`}
            >
              {p < 60 ? `${p}s` : p % 60 === 0 ? `${p / 60}m` : `${Math.floor(p / 60)}:${(p % 60).toString().padStart(2, '0')}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
