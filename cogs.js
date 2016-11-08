module.exports = {
  transformers: {
    name: 'babel',
    options: {presets: ['es2015', 'stage-0', 'react']}
  },
  builds: {'pave-react.es6': 'pave-react.js'}
};
