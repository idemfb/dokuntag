const counters: Record<string, number> = {
  claim_attempt_total: 0,
  claim_success_total: 0,
  claim_duplicate_total: 0,
  claim_replay_total: 0,
  claim_conflict_total: 0,
  claim_retry_total: 0,
  claim_fatal_total: 0,
};

export function increment(metric: string) {
  if (counters[metric] !== undefined) {
    counters[metric]++;
  }
}

export function getMetrics() {
  return { ...counters };
}
