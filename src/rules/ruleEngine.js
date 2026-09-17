/**
 * Advanced Targeting Rule Engine
 * Evaluates traffic parameters according to configured deny/allow rules.
 */

const UNRESOLVED_CAMPAIGN_MACROS = [
  '%7b%7bcampaign.id%7d%7d',
  '{campaign.id}',
  '{{campaing.id}}',
  '{{campaign.id}}',
  '{campaign_id}',
  '{{campaign_id}}',
  '%7b%7bcampaign_id%7d%7d',
  '{sub7}',
  '{{sub7}}',
  '%7b%7bsub7%7d%7d',
];

const REQUIRED_PREFIX = 'HI-Lead-Rvs';

/**
 * Validates fbclid parameter.
 * Must be present and non-empty.
 * 
 * @param {string|null|undefined} fbclid 
 * @returns {{ isDenied: boolean, reason: string | null }}
 */
function evaluateFbclidRule(fbclid) {
  if (!fbclid || typeof fbclid !== 'string' || fbclid.trim() === '') {
    return {
      isDenied: true,
      reason: 'fbclid_empty',
    };
  }

  const trimmed = fbclid.trim();
  if (trimmed.startsWith('{') || UNRESOLVED_CAMPAIGN_MACROS.includes(trimmed.toLowerCase())) {
    return {
      isDenied: true,
      reason: 'fbclid_unresolved_macro',
    };
  }

  return { isDenied: false, reason: null };
}

/**
 * Evaluates P2 parameter.
 * Rule 'p2 - targeting-allow': ALLOW only if STARTS_WITH 'HI-Lead-Rvs'
 * 
 * @param {string|null|undefined} p2 - The p2 parameter value
 * @returns {{ isDenied: boolean, reason: string | null }} Rule evaluation result
 */
function evaluateP2Rule(p2) {
  if (!p2 || typeof p2 !== 'string' || p2.trim() === '') {
    return {
      isDenied: true,
      reason: 'p2_empty',
    };
  }

  const trimmedP2 = p2.trim();

  // Deny unresolved template macros or braces
  if (trimmedP2.startsWith('{') || UNRESOLVED_CAMPAIGN_MACROS.includes(trimmedP2.toLowerCase())) {
    return {
      isDenied: true,
      reason: 'p2_unresolved_macro',
    };
  }

  // Must START WITH 'HI-Lead-Rvs' (case-insensitive for safety)
  if (!trimmedP2.toLowerCase().startsWith(REQUIRED_PREFIX.toLowerCase())) {
    return {
      isDenied: true,
      reason: 'p2_prefix_mismatch',
    };
  }

  return {
    isDenied: false,
    reason: null,
  };
}

/**
 * Evaluates SUB7 parameter.
 * Rule 'sub7 - targeting - allow': ALLOW only if STARTS_WITH 'HI-Lead-Rvs'
 * 
 * @param {string|null|undefined} sub7 - The sub7 / SUB7 parameter value
 * @returns {{ isDenied: boolean, reason: string | null }} Rule evaluation result
 */
function evaluateSub7Rule(sub7) {
  if (!sub7 || typeof sub7 !== 'string' || sub7.trim() === '') {
    return {
      isDenied: true,
      reason: 'sub7_empty',
    };
  }

  const trimmedSub7 = sub7.trim();

  // Deny unresolved template macros or braces
  if (trimmedSub7.startsWith('{') || UNRESOLVED_CAMPAIGN_MACROS.includes(trimmedSub7.toLowerCase())) {
    return {
      isDenied: true,
      reason: 'sub7_unresolved_macro',
    };
  }

  // Must START WITH 'HI-Lead-Rvs' (case-insensitive for safety)
  if (!trimmedSub7.toLowerCase().startsWith(REQUIRED_PREFIX.toLowerCase())) {
    return {
      isDenied: true,
      reason: 'sub7_prefix_mismatch',
    };
  }

  return {
    isDenied: false,
    reason: null,
  };
}

/**
 * Validates request tracking parameters.
 * ALL 3 CONDITIONS MUST BE SATISFIED TO ALLOW:
 * 1. fbclid must be present & valid.
 * 2. p2 must start with 'HI-Lead-Rvs'.
 * 3. sub7 must start with 'HI-Lead-Rvs'.
 * 
 * @param {Object} query - Incoming query parameters
 * @returns {{ isValid: boolean, isDenied: boolean, denyReason: string | null }}
 */
function validateTrackingParams(query = {}) {
  const fbclid = query.fbclid;
  const p2 = query.p2 || query.P2;
  const sub7 = query.sub7 || query.SUB7 || query.p7 || query.P7;

  // Condition 1: fbclid check
  const fbclidEval = evaluateFbclidRule(fbclid);
  if (fbclidEval.isDenied) {
    return {
      isValid: false,
      isDenied: true,
      denyReason: fbclidEval.reason,
    };
  }

  // Condition 2: p2 starts with 'HI-Lead-Rvs'
  const p2Eval = evaluateP2Rule(p2);
  if (p2Eval.isDenied) {
    return {
      isValid: false,
      isDenied: true,
      denyReason: p2Eval.reason,
    };
  }

  // Condition 3: sub7 starts with 'HI-Lead-Rvs'
  const sub7Eval = evaluateSub7Rule(sub7);
  if (sub7Eval.isDenied) {
    return {
      isValid: false,
      isDenied: true,
      denyReason: sub7Eval.reason,
    };
  }

  // All 3 conditions satisfied!
  return {
    isValid: true,
    isDenied: false,
    denyReason: null,
  };
}

module.exports = {
  REQUIRED_PREFIX,
  evaluateFbclidRule,
  evaluateP2Rule,
  evaluateSub7Rule,
  validateTrackingParams,
  UNRESOLVED_CAMPAIGN_MACROS,
};
