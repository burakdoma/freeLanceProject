import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import DashboardPage from './pages/DashboardPage'
import WorkoutPage from './pages/WorkoutPage'
import ExercisesPage from './pages/ExercisesPage'
import PlansPage from './pages/PlansPage'
import ProgressPage from './pages/ProgressPage'

export default function App() {
  return (
    <div className="mx-auto min-h-screen max-w-lg">
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/workout" element={<WorkoutPage />} />
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/progress" element={<ProgressPage />} />
      </Routes>
      <BottomNav />
    </div>
  )
}
