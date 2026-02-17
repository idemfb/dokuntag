type MetricsMap = Record<string, number>

const counters: MetricsMap = {
  claim_attempt_total: 0,
  claim_success_total: 0,
  claim_duplicate_total: 0,
  claim_replay_total: 0,
  claim_conflict_total: 0,
  claim_retry_total: 0,
  claim_fatal_total: 0,
}

export function increment(metricName: string) {
  if (!counters[metricName]) {
    counters[metricName] = 0
  }
  counters[metricName]++
}

export function getMetrics() {
  return { ...counters }
}