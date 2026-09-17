try {
  require('dotenv').config();
} catch {
  // dotenv not installed yet or using built-in --env-file
}

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  routeclk: {
    baseUrl: process.env.ROUTECLK_BASE_URL || 'https://track.gotrackhub.io/t/NDkwNV82Mzcw/',
  
  },

  fallback: {
    baseUrl: process.env.FALLBACK_BASE_URL || 'https://trueworth.live/',
    efdg: process.env.FALLBACK_EFDG || process.env.FALLBACK_VCLK || '7567887',
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
