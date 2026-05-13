export const burstSameTimeOptions = {
  scenarios: {
    burst_same_time: {
      executor: 'per-vu-iterations',
      vus: 2,
      iterations: 1,
      maxDuration: '10s',
    },
  },
};
