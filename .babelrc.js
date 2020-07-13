const path = require('path')

module.exports = (api) => {
  api.cache(true);
  
  const config = {
    plugins: [
      path.join(__dirname, './src/babel.js')
    ],
  };

  return config;
};
