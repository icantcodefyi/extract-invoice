const path = require('path');

module.exports = {
  webpack: (config, { isServer }) => {
    // Ensure WASM files are correctly handled
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/wasm/[hash][ext][query]',
      },
    });

    // Resolve the path for the tesseract-core-simd.wasm file
    config.resolve.alias['tesseract-core-simd'] = path.resolve(__dirname, 'node_modules/tesseract.js-core/tesseract-core-simd.wasm');

    return config;
  },
};
