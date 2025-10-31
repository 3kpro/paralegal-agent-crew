// performance-tests.js
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate } from 'k6/metrics';

// Define custom metrics
const errorRate = new Rate('errors');

// Default options
export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    'http_req_duration{staticAsset:yes}': ['p(95)<100'], // 95% of static asset requests should be below 100ms
    'http_req_duration{staticAsset:no}': ['p(95)<1000'], // 95% of non-static asset requests should be below 1000ms
    errors: ['rate<0.1'], // Error rate should be less than 10%
  },
};

export default function () {
  const baseUrl = __ENV.URL || 'https://ccai.3kpro.services';
  
  // Main page load
  const mainPage = http.get(baseUrl, {
    tags: { name: 'homepage', staticAsset: 'no' },
  });

  check(mainPage, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage has correct title': (r) => r.body.includes('TrendPulse'),
  }) || errorRate.add(1);

  sleep(1);

  // API health check
  const healthCheck = http.get(`${baseUrl}/api/health`, {
    tags: { name: 'health_check', staticAsset: 'no' },
  });

  check(healthCheck, {
    'health check status is 200': (r) => r.status === 200,
    'health check returns ok': (r) => r.json('status') === 'ok',
  }) || errorRate.add(1);

  sleep(1);

  // Static assets check (CSS, JS)
  const staticAssets = http.batch([
    ['GET', `${baseUrl}/_next/static/css/main.css`, null, { tags: { name: 'css', staticAsset: 'yes' } }],
    ['GET', `${baseUrl}/_next/static/chunks/main.js`, null, { tags: { name: 'js', staticAsset: 'yes' } }],
  ]);

  // Check each static asset response
  for (let i = 0; i < staticAssets.length; i++) {
    check(staticAssets[i], {
      'static asset status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  }

  sleep(2);
}
