module.exports = {
  pipe: {
    name: 'babel',
    options: {
      presets: ['es2015', 'react', 'stage-0']
    }
  },
  builds: {
    'pave-react.es6': 'pave-react.js'
  }
};
