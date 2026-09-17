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

  describe('Condition 2: P2 STARTS_WITH HI-Lead-Rvs (Rule: p2 - targeting-allow)', () => {
    it('should DENY when p2 is empty or undefined', () => {
      const emptyCases = ['', '   ', null, undefined];
      for (const val of emptyCases) {
        const res = evaluateP2Rule(val);
        assert.strictEqual(res.isDenied, true);
      }
    });

    it('should DENY when p2 does NOT start with HI-Lead-Rvs', () => {
      const invalidPrefixCases = ['camp_100', 'lead_rvs', 'wrong_prefix', '{campaign.id}'];
      for (const val of invalidPrefixCases) {
        const res = evaluateP2Rule(val);
        assert.strictEqual(res.isDenied, true);
      }
    });

    it('should ALLOW when p2 starts with HI-Lead-Rvs', () => {
      const validCases = ['HI-Lead-Rvs', 'HI-Lead-Rvs-100', 'HI-Lead-Rvs_promo_2026'];
      for (const val of validCases) {
        const res = evaluateP2Rule(val);
        assert.strictEqual(res.isDenied, false);
        assert.strictEqual(res.reason, null);
      }
    });
  });

  describe('Condition 3: SUB7 STARTS_WITH HI-Lead-Rvs (Rule: sub7 - targeting - allow)', () => {
    it('should DENY when sub7 is empty or undefined', () => {
      const emptyCases = ['', '   ', null, undefined];
      for (const val of emptyCases) {
        const res = evaluateSub7Rule(val);
        assert.strictEqual(res.isDenied, true);
      }
    });

    it('should DENY when sub7 does NOT start with HI-Lead-Rvs', () => {
      const invalidPrefixCases = ['sub_abc', '12345', 'lead_rvs', '{sub7}'];
      for (const val of invalidPrefixCases) {
        const res = evaluateSub7Rule(val);
        assert.strictEqual(res.isDenied, true);
      }
    });

    it('should ALLOW when sub7 starts with HI-Lead-Rvs', () => {
      const validCases = ['HI-Lead-Rvs', 'HI-Lead-Rvs-test', 'HI-Lead-Rvs_subgroup'];
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
        p2: 'HI-Lead-Rvs-1',
        sub7: 'HI-Lead-Rvs-2',
      });
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.isDenied, true);
    });

    it('should DENY if p2 does not start with HI-Lead-Rvs even if fbclid & sub7 are valid', () => {
      const res = validateTrackingParams({
        fbclid: '12345',
        p2: 'other_campaign',
        sub7: 'HI-Lead-Rvs-2',
      });
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.isDenied, true);
    });

    it('should DENY if sub7 does not start with HI-Lead-Rvs even if fbclid & p2 are valid', () => {
      const res = validateTrackingParams({
        fbclid: '12345',
        p2: 'HI-Lead-Rvs-1',
        sub7: 'other_sub',
      });
      assert.strictEqual(res.isValid, false);
      assert.strictEqual(res.isDenied, true);
    });

    it('should ALLOW when ALL 3 conditions are satisfied', () => {
      const res = validateTrackingParams({
        fbclid: '12345',
        p2: 'HI-Lead-Rvs-campaign-100',
        sub7: 'HI-Lead-Rvs-adset-200',
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
      sub7: 'HI-Lead-Rvs-1',
    });

    assert.strictEqual(result.isFallback, true);
    assert.strictEqual(result.targetPlatform, 'fallback');
    assert.ok(result.destinationUrl.startsWith(config.fallback.baseUrl));
    assert.match(result.destinationUrl, /sas=test_fbclid_123/);
    assert.ok(result.destinationUrl.includes(`efdg=${config.fallback.efdg}`));
    assert.match(result.destinationUrl, /weg=test_fbclid_123/);
  });

  it('should route to Routeclk when ALL 3 conditions are satisfied', () => {
    const result = TrackingService.resolveDestination({
      fbclid: 'fb_click_999',
      p2: 'HI-Lead-Rvs-camp',
      sub7: 'HI-Lead-Rvs-sub',
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
    assert.match(result.destinationUrl, /p2=HI-Lead-Rvs-camp/);
    assert.match(result.destinationUrl, /sub7=HI-Lead-Rvs-sub/);
    assert.match(result.destinationUrl, /p3=test_p3/);
    assert.match(result.destinationUrl, /p4=test_p4/);
    assert.match(result.destinationUrl, /p5=test_p5/);
    assert.match(result.destinationUrl, /p6=test_p6/);
    assert.match(result.destinationUrl, /p10=test_p10/);
  });
});
