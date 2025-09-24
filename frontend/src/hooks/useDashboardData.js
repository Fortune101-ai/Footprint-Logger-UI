import { useState, useEffect, useRef, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL

export default function useDashboardData() {
  const [activities, setActivities] = useState([])
  const [username, setUsername] = useState('')
  const [leaderboard, setLeaderboard] = useState([])
  const [summary, setSummary] = useState({ daily: 0, weekly: 0, monthly: 0 })
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 })
  const [averageEmissions, setAverageEmissions] = useState(0)
  const [personalizedAnalysis, setPersonalizedAnalysis] = useState({ highestCategory: null, tip: '', categoryEmissions: 0 })
  const [weeklyProgress, setWeeklyProgress] = useState({ currentEmissions: 0, targetReduction: 0, actualReduction: 0, progressPercentage: 0, tip: '' })
  const [formData, setFormData] = useState({ category: '', activity: '', quantity: '', targetReduction: '' })
  const [filter, setFilter] = useState('all')

  const [activityOptions, setActivityOptions] = useState({
    transport: [],
    food: [],
    energy: [],
    waste: [],
  })

  const socketHandlersRef = useRef({})
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

  const fetchUserProfile = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to fetch profile')
      const user = await res.json()
      setUsername(user.username)
    } catch (err) {
      console.error(err)
    }
  }, [token])

  const fetchActivities = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/activities`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to fetch logs')
      const data = await res.json()
      setActivities(
        data.map((act) => ({
          _id: act._id,
          category: act.category || 'unknown',
          activity: act.activity,
          quantity: act.quantity || 1,
          unit: act.unit || 'unit',
          co2Emissions: act.co2Emissions,
          timestamp: act.timestamp,
        }))
      )
    } catch (err) {
      console.error(err)
    }
  }, [token])

  const fetchSummary = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/activities/summary`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to fetch summary')
      const data = await res.json()
      setSummary(data)
    } catch (err) {
      console.error(err)
    }
  }, [token])

  const fetchLeaderboard = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/activities/leaderboard`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to fetch leaderboard')
      const data = await res.json()
      setLeaderboard(data.leaderboard || [])
      setAverageEmissions(data.averageEmissions || 0)
    } catch (err) {
      console.error(err)
    }
  }, [token])

  const fetchStreak = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/activities/streak`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to fetch streak')
      const data = await res.json()
      setStreak(data)
    } catch (err) {
      console.error(err)
    }
  }, [token])

  const fetchPersonalizedAnalysis = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/activities/analysis`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to fetch personalized analysis')
      const data = await res.json()
      setPersonalizedAnalysis(data)
    } catch (err) {
      console.error(err)
    }
  }, [token])

  const fetchWeeklyProgress = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/activities/weekly-progress`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to fetch weekly progress')
      const data = await res.json()
      setWeeklyProgress(data)
    } catch (err) {
      console.error(err)
    }
  }, [token])

  const fetchActivityOptions = useCallback(async () => {
    if (!token) return
    try {
      const categories = ['transport', 'food', 'energy', 'waste']
      const newOptions = {}

      for (const cat of categories) {
        const res = await fetch(`${API_BASE}/api/activities/options?category=${cat}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          newOptions[cat] = data.options || []
        }
      }

      setActivityOptions(newOptions)
    } catch (err) {
      console.error('Error fetching activity options:', err)
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    ;(async () => {
      await fetchUserProfile()
      await fetchActivities()
      await fetchSummary()
      await fetchLeaderboard()
      await fetchStreak()
      await fetchPersonalizedAnalysis()
      await fetchWeeklyProgress()
      await fetchActivityOptions()
    })()
  }, [fetchActivities, fetchActivityOptions, fetchLeaderboard, fetchPersonalizedAnalysis, fetchStreak, fetchSummary, fetchUserProfile, fetchWeeklyProgress, token])

  const getTodayActivities = () => {
    const today = new Date().toDateString()
    return activities.filter((act) => new Date(act.timestamp).toDateString() === today)
  }

  const getTotalEmissions = () => getTodayActivities().reduce((sum, act) => sum + act.co2Emissions, 0)

  const getCategoryTotals = () => {
    const totals = { transport: 0, food: 0, energy: 0, waste: 0 }
    getTodayActivities().forEach((act) => {
      totals[act.category] = (totals[act.category] || 0) + (act.co2Emissions || 0)
    })
    return totals
  }

  const addActivity = async (payload) => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Error adding activity')
      }
      await fetchActivities()
      await fetchSummary()
      await fetchLeaderboard()
      await fetchPersonalizedAnalysis()
      await fetchWeeklyProgress()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const deleteActivity = async (id) => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/activities/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Failed to delete activity')
      setActivities((prev) => prev.filter((a) => a._id !== id))
      await fetchSummary()
      await fetchLeaderboard()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const setWeeklyGoal = async (targetReduction) => {
    if (!token) return false
    try {
      const res = await fetch(`${API_BASE}/api/activities/weekly-goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetReduction }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Error setting weekly goal')
      }
      await fetchWeeklyProgress()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    window.location.href = '/'
  }

  const socketHandlers = {
    onConnect: () => {
      if (userId) {
        // join-user will be emitted
      }
    },
    onActivityAdded: async (data) => {
      const ev = new CustomEvent('realtime-tip', { detail: { message: `Activity logged: ${data.message}` } })
      window.dispatchEvent(ev)
      await fetchSummary()
      await fetchWeeklyProgress()
      await fetchActivities()
    },
    onGoalUpdated: async (data) => {
      const ev = new CustomEvent('realtime-tip', { detail: { message: `Weekly goal updated: ${data.targetReduction}kg CO2 reduction target` } })
      window.dispatchEvent(ev)
      await fetchWeeklyProgress()
    },
    onProgressUpdated: (data) => {
      setWeeklyProgress(data)
      const ev = new CustomEvent('realtime-tip', { detail: { message: data.tip || 'Progress updated' } })
      window.dispatchEvent(ev)
    },
  }

  socketHandlersRef.current = socketHandlers

  return {
    activities,
    username,
    leaderboard,
    summary,
    streak,
    averageEmissions,
    personalizedAnalysis,
    weeklyProgress,
    formData,
    setFormData,
    activityOptions,
    addActivity: async (e) => {
      if (e && e.preventDefault) {
        e.preventDefault()
        const { category, activity, quantity } = formData
        if (!category || !activity || !quantity) {
          alert('Please fill all fields')
          return
        }
        const selectedActivity = activityOptions[category]?.find((act) => act.name === activity)
        if (!selectedActivity) {
          alert('Invalid activity selected')
          return
        }
        const co2Emissions = Number.parseFloat(quantity) * selectedActivity.factor
        await addActivity({ category, activity, quantity: Number.parseFloat(quantity), unit: selectedActivity.unit, co2Emissions })
        setFormData({ category: '', activity: '', quantity: '', targetReduction: '' })
        return
      }
      return addActivity(e)
    },
    deleteActivity,
    setWeeklyGoal: async (e) => {
      if (e && e.preventDefault) {
        e.preventDefault()
        const targetReduction = Number.parseFloat(formData.targetReduction)
        if (!targetReduction || targetReduction <= 0) {
          alert('Please enter a valid reduction target')
          return
        }
        const ok = await setWeeklyGoal(targetReduction)
        if (ok) {
          setFormData((prev) => ({ ...prev, targetReduction: '' }))
          const ev = new CustomEvent('realtime-tip', { detail: { message: `Weekly goal set: ${targetReduction}kg CO2 reduction target` } })
          window.dispatchEvent(ev)
        }
        return
      }
      return setWeeklyGoal(e)
    },
    getTodayActivities,
    getTotalEmissions,
    getCategoryTotals,
    handleLogout,
    filter,
    setFilterState: setFilter,
    socketHandlers: socketHandlersRef,
  }
}
