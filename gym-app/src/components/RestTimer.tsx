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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[var(--color-surface)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Rest Timer</h3>
          <button onClick={onClose} className="text-[var(--color-text-muted)]">
            <X size={22} />
          </button>
        </div>

        <div className="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="var(--color-surface-2)" strokeWidth="8" />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={remaining === 0 ? 'var(--color-success)' : 'var(--color-primary)'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <span className={`text-4xl font-bold ${remaining === 0 ? 'text-[var(--color-success)]' : ''}`}>
            {formatTime(remaining)}
          </span>
        </div>

        <div className="mb-4 flex justify-center gap-3">
          <button
            onClick={() => setRunning(!running)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white"
          >
            {running ? <Pause size={22} /> : <Play size={22} />}
          </button>
          <button
            onClick={reset}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
          >
            <RotateCcw size={22} />
          </button>
        </div>

        <div className="flex justify-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => { setSeconds(p); setRemaining(p); setRunning(false) }}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                seconds === p
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
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
