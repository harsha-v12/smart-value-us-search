try {
  require('dotenv').config();
} catch {
  // dotenv not installed yet or using built-in --env-file
}

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  routeclk: {
    baseUrl: process.env.ROUTECLK_BASE_URL || 'https://nav.rutorbit.com/t/NDkwNV82NDA1/',
  },

  fallback: {
    baseUrl: process.env.FALLBACK_BASE_URL || 'https://openvista.live/',
    param1: process.env.FALLBACK_PARAM1 || 'clk',
    param2: process.env.FALLBACK_PARAM2 || 'zid',
    param3: process.env.FALLBACK_PARAM3 || 'src',
    param2Value: process.env.FALLBACK_PARAM2_VAL || process.env.FALLBACK_EFDG || '9482163',
  },
  // Backward compatibility alias
  get valuerise() {
    return this.fallback;
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};

module.exports = config;
