import { postJson, getBaseUrl } from '../shared/http.js';

// export const options = burstSameTimeOptions;
export const options = {
  scenarios: {
    payments: {
      executor: 'shared-iterations',
      vus: 10,
      iterations: 1000,
      maxDuration: '2m',
    },
  },
};
export default function () {
  const url = `${getBaseUrl()}/file-processing/jobs`;

  const res = postJson(url, {
    fileName: `sales-${__ITER}.csv`,
  });

  const body = res.json();
  const jobId = body.jobId;

  const processUrl = `${url}/${jobId}/process`;

  postJson(processUrl, {});
}
