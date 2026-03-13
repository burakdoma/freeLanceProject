import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Dumbbell, BarChart3, Library, Timer } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/workout', icon: Dumbbell, label: 'Workouts' },
  // center button is handled separately
  { to: '/progress', icon: BarChart3, label: 'Progress' },
  { to: '/exercises', icon: Library, label: 'Exercises' },
]

export default function BottomNav() {
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-end justify-around px-2">
        {/* Left items */}
        {navItems.slice(0, 2).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-0.5 pb-2 pt-3 text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted'
              }`
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Center raised button */}
        <div className="flex flex-1 justify-center pb-1">
          <button
            onClick={() => navigate('/workout')}
            className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-black shadow-lg shadow-primary/30 active:scale-95 transition-transform"
          >
            <Timer size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Right items */}
        {navItems.slice(2).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-0.5 pb-2 pt-3 text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted'
              }`
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
