export interface WhoopRecovery {
  date: string
  recovery_score: number
  hrv_rmssd_milli: number
  resting_heart_rate: number
  user_calibrating: boolean
}

export interface WhoopSleep {
  date: string
  total_in_bed_time_milli: number
  total_sleep_time_milli: number
  sleep_performance_percentage: number
  sleep_efficiency_percentage: number
  sleep_consistency_percentage: number
  disturbances: number
  latency_milli: number
  light_sleep_time_milli: number
  slow_wave_sleep_time_milli: number
  rem_sleep_time_milli: number
}

export interface WhoopWorkout {
  id: number
  sport_name: string
  strain: number
  average_heart_rate: number
  max_heart_rate: number
  kilojoule: number
  duration_milli: number
  start: string
}

export interface WhoopDashboard {
  recovery: WhoopRecovery | null
  sleep: WhoopSleep | null
  workouts: WhoopWorkout[]
  strain: number | null
  connected: boolean
}
