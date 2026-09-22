const config = require('../config/config');
const { validateTrackingParams } = require('../rules/ruleEngine');

/**
 * Service to resolve tracking redirects and generate dynamic destination URLs.
 */
class TrackingService {
  /**
   * Resolves destination URL based on incoming query parameters and targeting rules.
   * 
   * @param {Object} query - Incoming query parameters (fbclid, p2, p3, p4, p5, p6, etc.)
   * @returns {{ destinationUrl: string, isFallback: boolean, denyReason: string | null, targetPlatform: 'routeclk' | 'valuerise' }}
   */
  static resolveDestination(query = {}) {
    const fbclid = (query.fbclid || '').toString();
    const p2 = (query.p2 || '').toString();
    const p3 = (query.p3 || '').toString();
    const p4 = (query.p4 || '').toString();
    const p5 = (query.p5 || '').toString();
    const p6 = (query.p6 || '').toString();
    const campaignId = query.campaign_id || config.routeclk.campaignId;
    const pubId = query.pub_id || config.routeclk.pubId;

    const evaluation = validateTrackingParams(query);

    if (evaluation.isDenied) {
      // Build Fallback URL: e.g. https://openvista.live/?clk=...&zid=9482163&src=...
      const fallbackUrl = new URL(config.fallback.baseUrl);
      
      const p1Name = config.fallback.param1 || 'clk';
      const p2Name = config.fallback.param2 || 'zid';
      const p3Name = config.fallback.param3 || 'src';

      const randomNum1 = Math.floor(100000 + Math.random() * 900000).toString();
      const randomNum2 = Math.floor(100000 + Math.random() * 900000).toString();

      const p1Val = (query[p1Name] !== undefined && query[p1Name] !== '')
        ? query[p1Name].toString()
        : (fbclid || randomNum1);

      const p2Val = (query[p2Name] !== undefined && query[p2Name] !== '')
        ? query[p2Name].toString()
        : (config.fallback.param2Value || '9482163');

      const p3Val = (query[p3Name] !== undefined && query[p3Name] !== '')
        ? query[p3Name].toString()
        : (fbclid || randomNum2);

      fallbackUrl.searchParams.set(p1Name, p1Val);
      fallbackUrl.searchParams.set(p2Name, p2Val);
      fallbackUrl.searchParams.set(p3Name, p3Val);

      return {
        destinationUrl: fallbackUrl.toString(),
        isFallback: true,
        denyReason: evaluation.denyReason,
        targetPlatform: 'fallback',
      };
    }

    // Build Primary Tracking URL
    const targetUrl = new URL(config.routeclk.baseUrl);

    // Only attach campaign_id / pub_id if explicitly passed or configured (not undefined / empty)
    if (query.campaign_id) {
      targetUrl.searchParams.set('campaign_id', query.campaign_id.toString());
    } else if (config.routeclk.campaignId) {
      targetUrl.searchParams.set('campaign_id', config.routeclk.campaignId.toString());
    }

    if (query.pub_id) {
      targetUrl.searchParams.set('pub_id', query.pub_id.toString());
    } else if (config.routeclk.pubId) {
      targetUrl.searchParams.set('pub_id', config.routeclk.pubId.toString());
    }

    // Attach required valid parameters (fbclid, p2, sub7)
    if (fbclid) targetUrl.searchParams.set('fbclid', fbclid);
    if (p2) targetUrl.searchParams.set('p2', p2);

    const sub7 = query.sub7 || query.SUB7 || query.p7 || query.P7;
    if (sub7) {
      targetUrl.searchParams.set('sub7', sub7.toString());
    }

    // Only attach p3–p6 / p10 if they are actually present and non-empty in query
    if (query.p3) targetUrl.searchParams.set('p3', query.p3.toString());
    if (query.p4) targetUrl.searchParams.set('p4', query.p4.toString());
    if (query.p5) targetUrl.searchParams.set('p5', query.p5.toString());
    if (query.p6) targetUrl.searchParams.set('p6', query.p6.toString());
    if (query.p10) targetUrl.searchParams.set('p10', query.p10.toString());

    return {
      destinationUrl: targetUrl.toString(),
      isFallback: false,
      denyReason: null,
      targetPlatform: 'routeclk',
    };
  }
}

module.exports = TrackingService;
