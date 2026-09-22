const { describe, it } = require('node:test');
const assert = require('node:assert');
const config = require('../src/config/config');
const {
  evaluateFbclidRule,
  evaluateP2Rule,
  evaluateSub7Rule,
  validateTrackingParams,
  REQUIRED_PREFIX,
} = require('../src/rules/ruleEngine');
const TrackingService = require('../src/services/trackingService');

describe('Rule Engine - 3 Conditions Validation', () => {

  describe('Condition 1: fbclid Validation', () => {
    it('should DENY when fbclid is empty or missing', () => {
      const emptyCases = ['', '   ', null, undefined];
      for (const val of emptyCases) {
        const res = evaluateFbclidRule(val);
        assert.strictEqual(res.isDenied, true);
        assert.strictEqual(res.reason, 'fbclid_empty');
      }
    });

    it('should ALLOW when fbclid is a valid string', () => {
      const res = evaluateFbclidRule('fb_valid_click_12345');
      assert.strictEqual(res.isDenied, false);
      assert.strictEqual(res.reason, null);
    });
  });

  describe('Condition 2: P2 STARTS_WITH US-hs-Bv', () => {
    it('should DENY when p2 is empty or undefined', () => {
      const emptyCases = ['', '   ', null, undefined];
      for (const val of emptyCases) {
        const res = evaluateP2Rule(val);
        assert.strictEqual(res.isDenied, true);
      }
    });

    it('should DENY when p2 does NOT start with US-hs-Bv', () => {
      const invalidPrefixCases = ['camp_100', 'HI-Lead-Rvs', 'lead_rvs', 'wrong_prefix', '{campaign.id}'];
      for (const val of invalidPrefixCases) {
        const res = evaluateP2Rule(val);
        assert.strictEqual(res.isDenied, true);
      }
    });

    it('should ALLOW when p2 starts with US-hs-Bv', () => {
      const validCases = [
        'US-hs-Bv', 'US-hs-Bv-100', 'US-hs-Bv_promo_2026',
        'US-hs-Bv-camp1', 'us-hs-bv-2026',
      ];
      for (const val of validCases) {
        const res = evaluateP2Rule(val);
        assert.strictEqual(res.isDenied, false);
        assert.strictEqual(res.reason, null);
      }
    });
  });

  describe('Condition 3: SUB7 STARTS_WITH US-hs-Bv', () => {
    it('should DENY when sub7 is empty or undefined', () => {
      const emptyCases = ['', '   ', null, undefined];
      for (const val of emptyCases) {
        const res = evaluateSub7Rule(val);
        assert.strictEqual(res.isDenied, true);
      }
    });

    it('should DENY when sub7 does NOT start with US-hs-Bv', () => {
      const invalidPrefixCases = ['sub_abc', 'HI-Lead-Rvs', '12345', 'lead_rvs', '{sub7}'];
      for (const val of invalidPrefixCases) {
        const res = evaluateSub7Rule(val);
        assert.strictEqual(res.isDenied, true);
      }
    });

    it('should ALLOW when sub7 starts with US-hs-Bv', () => {
      const validCases = [
        'US-hs-Bv', 'US-hs-Bv-test', 'US-hs-Bv_subgroup',
        'US-hs-Bv-sub1', 'us-hs-bv_group',
      ];
      for (const val of validCases) {
        const res = evaluateSub7Rule(val);
        assert.strictEqual(res.isDenied, false);
        assert.strictEqual(res.reason, null);
      }
    });
  });

  describe('Combined 3-Condition Evaluation (validateTrackingParams)', () => {
    it('should DENY if fbclid is missing even if p2 & sub7 are valid', () => {
      const res = validateTrackingParams({
        p2: 'US-hs-Bv-1',
        sub7: 'US-hs-Bv-2',
      });
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.isDenied, true);
    });

    it('should DENY if p2 does not start with valid prefix even if fbclid & sub7 are valid', () => {
      const res = validateTrackingParams({
        fbclid: '12345',
        p2: 'other_campaign',
        sub7: 'US-hs-Bv-2',
      });
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.isDenied, true);
    });

    it('should DENY if sub7 does not start with valid prefix even if fbclid & p2 are valid', () => {
      const res = validateTrackingParams({
        fbclid: '12345',
        p2: 'US-hs-Bv-1',
        sub7: 'other_sub',
      });
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.isDenied, true);
    });

    it('should ALLOW when ALL 3 conditions are satisfied (US-hs-Bv for SmartValue)', () => {
      const res = validateTrackingParams({
        fbclid: '12345',
        p2: 'US-hs-Bv-campaign-100',
        sub7: 'US-hs-Bv-adset-200',
      });
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(res.isDenied, false);
      assert.strictEqual(res.denyReason, null);
    });
  });
});

describe('Tracking Service - Destination URL Generation', () => {
  it('should route to Fallback destination when any condition fails', () => {
    const result = TrackingService.resolveDestination({
      fbclid: 'test_fbclid_123',
      p2: 'wrong_prefix',
      sub7: 'US-hs-Bv-1',
    });

    assert.strictEqual(result.isFallback, true);
    assert.strictEqual(result.targetPlatform, 'fallback');
    assert.ok(result.destinationUrl.startsWith(config.fallback.baseUrl));
    assert.match(result.destinationUrl, /clk=test_fbclid_123/);
    assert.ok(result.destinationUrl.includes(`zid=${config.fallback.param2Value || '9482163'}`));
    assert.match(result.destinationUrl, /src=test_fbclid_123/);
  });

  it('should route to Routeclk when ALL 3 conditions are satisfied', () => {
    const result = TrackingService.resolveDestination({
      fbclid: 'fb_click_999',
      p2: 'US-hs-Bv-camp',
      sub7: 'US-hs-Bv-sub',
      p3: 'test_p3',
      p4: 'test_p4',
      p5: 'test_p5',
      p6: 'test_p6',
      p10: 'test_p10',
    });

    assert.strictEqual(result.isFallback, false);
    assert.strictEqual(result.targetPlatform, 'routeclk');
    assert.ok(result.destinationUrl.startsWith(config.routeclk.baseUrl));
    assert.match(result.destinationUrl, /fbclid=fb_click_999/);
    assert.match(result.destinationUrl, /p2=US-hs-Bv-camp/);
    assert.match(result.destinationUrl, /sub7=US-hs-Bv-sub/);
    assert.match(result.destinationUrl, /p3=test_p3/);
    assert.match(result.destinationUrl, /p4=test_p4/);
    assert.match(result.destinationUrl, /p5=test_p5/);
    assert.match(result.destinationUrl, /p6=test_p6/);
    assert.match(result.destinationUrl, /p10=test_p10/);
  });
});
