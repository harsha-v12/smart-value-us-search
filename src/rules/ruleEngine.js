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
  '{p15}',
  '{{p15}}',
  '%7b%7bp15%7d%7d',
];

const defaultPrefixes = ['us-hs-bv', 'us-tik-hi-rv', 'nw-rev-hi'];
const envPrefixes = (process.env.REQUIRED_PREFIX || '')
  .split(',')
  .map(p => p.trim().toLowerCase())
  .filter(Boolean);

const REQUIRED_PREFIXES = Array.from(new Set([...defaultPrefixes, ...envPrefixes]));

/**
 * Checks if a string starts with any of the allowed prefixes (e.g. US-hs-Bv, US-TIK-HI-RV).
 */
function hasValidPrefix(str) {
  if (!str || typeof str !== 'string') return false;
  const lower = str.trim().toLowerCase();
  return REQUIRED_PREFIXES.some(prefix => lower.startsWith(prefix));
}

/**
 * Validates a click ID parameter (fbclid or ttclid).
 * Must be present and non-empty.
 * 
 * @param {string|null|undefined} clickId 
 * @param {string} paramName - Name of parameter for error reporting ('fbclid' | 'ttclid')
 * @returns {{ isDenied: boolean, reason: string | null }}
 */
function evaluateClickIdRule(clickId, paramName = 'fbclid') {
  if (!clickId || typeof clickId !== 'string' || clickId.trim() === '') {
    return {
      isDenied: true,
      reason: `${paramName}_empty`,
    };
  }

  const trimmed = clickId.trim();
  if (trimmed.startsWith('{') || UNRESOLVED_CAMPAIGN_MACROS.includes(trimmed.toLowerCase())) {
    return {
      isDenied: true,
      reason: `${paramName}_unresolved_macro`,
    };
  }

  return { isDenied: false, reason: null };
}

/**
 * Validates fbclid parameter.
 * @param {string|null|undefined} fbclid 
 * @returns {{ isDenied: boolean, reason: string | null }}
 */
function evaluateFbclidRule(fbclid) {
  return evaluateClickIdRule(fbclid, 'fbclid');
}

/**
 * Validates ttclid parameter for TikTok traffic.
 * @param {string|null|undefined} ttclid 
 * @returns {{ isDenied: boolean, reason: string | null }}
 */
function evaluateTtclidRule(ttclid) {
  return evaluateClickIdRule(ttclid, 'ttclid');
}

/**
 * Validates nbclid parameter for Newsbreak traffic.
 * @param {string|null|undefined} nbclid 
 * @returns {{ isDenied: boolean, reason: string | null }}
 */
function evaluateNbclidRule(nbclid) {
  return evaluateClickIdRule(nbclid, 'nbclid');
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

  // Must START WITH allowed prefix (US-hs-Bv for SmartValue, HI-Lead-Rvs for SecureSavings)
  if (!hasValidPrefix(trimmedP2)) {
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
 * Evaluates P15 parameter.
 * Rule: ALLOW only if STARTS_WITH allowed prefix (e.g. US-hs-Bv, US-TIK-HI-RV, Nw-Rev-Hi)
 * 
 * @param {string|null|undefined} p15 - The p15 / P15 parameter value
 * @returns {{ isDenied: boolean, reason: string | null }} Rule evaluation result
 */
function evaluateP15Rule(p15) {
  if (!p15 || typeof p15 !== 'string' || p15.trim() === '') {
    return {
      isDenied: true,
      reason: 'p15_empty',
    };
  }

  const trimmedP15 = p15.trim();

  // Deny unresolved template macros or braces
  if (trimmedP15.startsWith('{') || UNRESOLVED_CAMPAIGN_MACROS.includes(trimmedP15.toLowerCase())) {
    return {
      isDenied: true,
      reason: 'p15_unresolved_macro',
    };
  }

  // Must START WITH allowed prefix (US-hs-Bv for SmartValue, US-TIK-HI-RV for TikTok, Nw-Rev-Hi for Newsbreak)
  if (!hasValidPrefix(trimmedP15)) {
    return {
      isDenied: true,
      reason: 'p15_prefix_mismatch',
    };
  }

  return {
    isDenied: false,
    reason: null,
  };
}

/**
 * Validates request tracking parameters.
 * ALL 4 CONDITIONS MUST BE SATISFIED TO ALLOW:
 * 1. Click ID (fbclid, ttclid, or nbclid) must be present & valid.
 * 2. p2 must start with allowed prefix.
 * 3. p15 must start with allowed prefix.
 * 4. Channel flag (fb=1, tk=1, or nb=1) must be set.
 * 
 * @param {Object} query - Incoming query parameters
 * @returns {{ isValid: boolean, isDenied: boolean, denyReason: string | null }}
 */
function validateTrackingParams(query = {}) {
  const fbclid = query.fbclid;
  const ttclid = query.ttclid;
  const nbclid = query.nbclid;
  const p2 = query.p2 || query.P2;
  const p15 = query.p15 || query.P15;

  // Determine traffic channel
  const isNewsbreak = (nbclid !== undefined && nbclid !== '') ||
    (typeof p2 === 'string' && p2.trim().toLowerCase().startsWith('nw-rev-hi')) ||
    (typeof p15 === 'string' && p15.trim().toLowerCase().startsWith('nw-rev-hi')) ||
    (query.nb !== undefined);

  const isTikTok = !isNewsbreak && (
    (ttclid !== undefined && ttclid !== '') ||
    (typeof p2 === 'string' && p2.trim().toLowerCase().startsWith('us-tik-hi-rv')) ||
    (typeof p15 === 'string' && p15.trim().toLowerCase().startsWith('us-tik-hi-rv')) ||
    (query.tk !== undefined)
  );

  // Condition 1: Click ID check (nbclid, ttclid, or fbclid)
  let clickIdEval;
  if (isNewsbreak) {
    clickIdEval = evaluateNbclidRule(nbclid);
  } else if (isTikTok) {
    clickIdEval = evaluateTtclidRule(ttclid);
  } else {
    clickIdEval = evaluateFbclidRule(fbclid);
  }

  if (clickIdEval.isDenied) {
    return {
      isValid: false,
      isDenied: true,
      denyReason: clickIdEval.reason,
    };
  }

  // Condition 2: p2 starts with allowed prefix (US-hs-Bv, US-TIK-HI-RV, or Nw-Rev-Hi)
  const p2Eval = evaluateP2Rule(p2);
  if (p2Eval.isDenied) {
    return {
      isValid: false,
      isDenied: true,
      denyReason: p2Eval.reason,
    };
  }

  // Condition 3: p15 starts with allowed prefix (US-hs-Bv, US-TIK-HI-RV, or Nw-Rev-Hi)
  const p15Eval = evaluateP15Rule(p15);
  if (p15Eval.isDenied) {
    return {
      isValid: false,
      isDenied: true,
      denyReason: p15Eval.reason,
    };
  }

  // Condition 4: Mandatory channel flag validation (Newsbreak requires nb=1, TikTok requires tk=1, Facebook requires fb=1)
  if (isNewsbreak) {
    const isNbOne = query.nb !== undefined && query.nb.toString().trim() === '1';
    if (!isNbOne) {
      return {
        isValid: false,
        isDenied: true,
        denyReason: 'newsbreak_missing_nb',
      };
    }
  } else if (isTikTok) {
    const isTkOne = query.tk !== undefined && query.tk.toString().trim() === '1';
    if (!isTkOne) {
      return {
        isValid: false,
        isDenied: true,
        denyReason: 'tiktok_missing_tk',
      };
    }
  } else {
    const isFbOne = query.fb !== undefined && query.fb.toString().trim() === '1';
    if (!isFbOne) {
      return {
        isValid: false,
        isDenied: true,
        denyReason: 'facebook_missing_fb',
      };
    }
  }

  // All conditions satisfied!
  return {
    isValid: true,
    isDenied: false,
    denyReason: null,
  };
}

module.exports = {
  REQUIRED_PREFIXES,
  REQUIRED_PREFIX: REQUIRED_PREFIXES[0],
  hasValidPrefix,
  evaluateClickIdRule,
  evaluateFbclidRule,
  evaluateTtclidRule,
  evaluateNbclidRule,
  evaluateP2Rule,
  evaluateP15Rule,
  validateTrackingParams,
  UNRESOLVED_CAMPAIGN_MACROS,
};
