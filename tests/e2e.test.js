const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const config = require('../src/config/config');
const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

// Helper for making HTTP requests without following redirects
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    }).on('error', reject);
  });
}

describe('End-to-End Test Suite: 3-Condition Rule Engine & SmartValue Endpoints', () => {

  describe('Condition 1: fbclid check', () => {
    it('should redirect to fallback if fbclid is missing', async () => {
      const res = await makeRequest('/us/search/?p2=US-hs-Bv-1&sub7=US-hs-Bv-2');
      assert.strictEqual(res.statusCode, 302);
      assert.ok(res.headers.location.startsWith(config.fallback.baseUrl));
    });

    it('should redirect to fallback if fbclid is empty', async () => {
      const res = await makeRequest('/us/search/?fbclid=&p2=US-hs-Bv-1&sub7=US-hs-Bv-2');
      assert.strictEqual(res.statusCode, 302);
      assert.ok(res.headers.location.startsWith(config.fallback.baseUrl));
    });
  });

  describe('Condition 2: p2 STARTS_WITH US-hs-Bv', () => {
    it('should redirect to fallback if p2 does NOT start with US-hs-Bv', async () => {
      const res = await makeRequest('/us/search/?fbclid=12345&p2=other_campaign&sub7=US-hs-Bv-2');
      assert.strictEqual(res.statusCode, 302);
      assert.ok(res.headers.location.startsWith(config.fallback.baseUrl));
    });

    it('should redirect to fallback if p2 is empty', async () => {
      const res = await makeRequest('/us/search/?fbclid=12345&p2=&sub7=US-hs-Bv-2');
      assert.strictEqual(res.statusCode, 302);
      assert.ok(res.headers.location.startsWith(config.fallback.baseUrl));
    });
  });

  describe('Condition 3: sub7 STARTS_WITH US-hs-Bv', () => {
    it('should redirect to fallback if sub7 does NOT start with US-hs-Bv', async () => {
      const res = await makeRequest('/us/search/?fbclid=12345&p2=US-hs-Bv-1&sub7=wrong_sub');
      assert.strictEqual(res.statusCode, 302);
      assert.ok(res.headers.location.startsWith(config.fallback.baseUrl));
    });

    it('should redirect to fallback if sub7 is missing', async () => {
      const res = await makeRequest('/us/search/?fbclid=12345&p2=US-hs-Bv-1');
      assert.strictEqual(res.statusCode, 302);
      assert.ok(res.headers.location.startsWith(config.fallback.baseUrl));
    });
  });

  describe('Positive Case: ALL 3 Conditions Satisfied (ALLOW -> Stay on Landing Page)', () => {
    it('should return 200 HTML with age buttons pointing to Routeclk for SmartValue', async () => {
      const res = await makeRequest('/us/search/?fbclid=12345&p2=US-hs-Bv-camp1&sub7=US-hs-Bv-sub1&p3=geo_us&p4=feed_ad');
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /text\/html/);

      const expectedTrackingUrl = new URL(config.routeclk.baseUrl);
      expectedTrackingUrl.searchParams.set('fbclid', '12345');
      expectedTrackingUrl.searchParams.set('p2', 'US-hs-Bv-camp1');
      expectedTrackingUrl.searchParams.set('sub7', 'US-hs-Bv-sub1');
      expectedTrackingUrl.searchParams.set('p3', 'geo_us');
      expectedTrackingUrl.searchParams.set('p4', 'feed_ad');

      assert.ok(res.body.includes(`href="${expectedTrackingUrl.toString()}"`));
      assert.ok(res.body.includes('18-24'));
      assert.ok(res.body.includes('25-34'));
      assert.ok(res.body.includes('35-44'));
      assert.ok(res.body.includes('45-54'));
      assert.ok(res.body.includes('55-64'));
      assert.ok(res.body.includes('65+'));
    });

    it('should return 404 for removed /info/home route', async () => {
      const res = await makeRequest('/info/home/?fbclid=12345&p2=US-hs-Bv-camp1&sub7=US-hs-Bv-sub1');
      assert.strictEqual(res.statusCode, 404);
    });

    it('should return JSON API response when requested via API', async () => {
      const res = await makeRequest('/api/v1/tracking/resolve?fbclid=12345&p2=US-hs-Bv-camp1&sub7=US-hs-Bv-sub1');
      assert.strictEqual(res.statusCode, 200);
      const json = JSON.parse(res.body);
      assert.strictEqual(json.status, 'success');
      assert.strictEqual(json.isFallback, false);
      assert.strictEqual(json.targetPlatform, 'routeclk');
      assert.strictEqual(json.denyReason, null);
    });
  });

  describe('Health Check Endpoint', () => {
    it('GET /health should return 200 and ok status', async () => {
      const res = await makeRequest('/health');
      assert.strictEqual(res.statusCode, 200);
      const json = JSON.parse(res.body);
      assert.strictEqual(json.status, 'ok');
      assert.ok(json.uptime >= 0);
      assert.ok(json.timestamp);
    });
  });
});
