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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-surface-2)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-lg">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                isActive
                  ? 'text-[var(--color-primary-light)]'
                  : 'text-[var(--color-text-muted)]'
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
