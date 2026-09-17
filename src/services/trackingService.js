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
      // Build Fallback (Trueworth) URL: https://trueworth.live/?sas=...&efdg=7567887&weg=...
      const fallbackUrl = new URL(config.fallback.baseUrl);
      
      // Generate a random number if sas or weg is empty
      const randomNum = Math.floor(100000 + Math.random() * 900000).toString();

      const sas = (query.sas !== undefined && query.sas !== '') 
        ? query.sas.toString() 
        : (fbclid || randomNum);

      const efdg = query.efdg !== undefined ? query.efdg.toString() : config.fallback.efdg;

      const weg = (query.weg !== undefined && query.weg !== '') 
        ? query.weg.toString() 
        : (fbclid || randomNum);

      fallbackUrl.searchParams.set('sas', sas);
      fallbackUrl.searchParams.set('efdg', efdg);
      fallbackUrl.searchParams.set('weg', weg);

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
