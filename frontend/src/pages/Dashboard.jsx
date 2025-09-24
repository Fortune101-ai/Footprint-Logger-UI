import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import RealTimeTip from '../components/ui/RealTimeTip'
import ActivityForm from '../components/activities/ActivityForm'
import ActivitiesList from '../components/activities/ActivitiesList'
import FilterButtons from '../components/activities/FilterButtons'
import WeeklyGoals from '../components/goals/WeeklyGoals'
import StreakSection from '../components/stats/StreakSection'
import SummaryStats from '../components/stats/SummaryStats'
import PersonalizedTips from '../components/stats/PersonalizedTips'
import TodayEmissions from '../components/stats/TodayEmissions'
import ActivityChart from '../components/visualization/ActivityChart'
import Leaderboard from '../components/leaderboard/Leaderboard'

import useDashboardData from '../hooks/useDashboardData'
import useWebSocket from '../hooks/useWebSocket'

const Dashboard = () => {
  const data = useDashboardData()
  useWebSocket(data.socketHandlers)

  return (
    <>
      <Header username={data.username} onLogout={data.handleLogout} />
      <div id="real-time-tip">
        <RealTimeTip refId="real-time-tip" />
      </div>

      <main className="container">
        <section className="input-section">
          <ActivityForm
            formData={data.formData}
            setFormData={data.setFormData}
            activityOptions={data.activityOptions}
            addActivity={data.addActivity}
          />
        </section>

        <section className="weekly-goals-section">
          <WeeklyGoals
            formData={data.formData}
            setFormData={data.setFormData}
            setWeeklyGoal={data.setWeeklyGoal}
            weeklyProgress={data.weeklyProgress}
          />
        </section>

        <StreakSection streak={data.streak} />

        <TodayEmissions getTotalEmissions={data.getTotalEmissions} />

        <SummaryStats summary={data.summary} averageEmissions={data.averageEmissions} />

        <PersonalizedTips personalizedAnalysis={data.personalizedAnalysis} />

        <section className="activities-section">
          <h2>
            <i className="fa-solid fa-list-check" style={{ color: '#d97706', marginRight: '0.5rem' }}></i>
            Today's Activities
          </h2>

          <FilterButtons currentFilter={data.filter} setFilter={data.setFilterState} />

          <ActivitiesList
            activities={data.activities}
            filter={data.filter}
            deleteActivity={data.deleteActivity}
          />
        </section>

        <section className="chart-section">
          <ActivityChart activities={data.activities} />
        </section>

        <section className="leaderboard-section">
          <Leaderboard leaderboard={data.leaderboard} averageEmissions={data.averageEmissions} />
        </section>
      </main>

      <Footer />
    </>
  )
}

export default Dashboard