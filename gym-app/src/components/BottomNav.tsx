import { NavLink } from 'react-router-dom'
import { Dumbbell, Library, ClipboardList, BarChart3 } from 'lucide-react'

const navItems = [
  { to: '/', icon: Dumbbell, label: 'Workout' },
  { to: '/exercises', icon: Library, label: 'Exercises' },
  { to: '/plans', icon: ClipboardList, label: 'Plans' },
  { to: '/progress', icon: BarChart3, label: 'Progress' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-1 pb-2 pt-3 text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
                )}
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
