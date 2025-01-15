const path = require('path');

module.exports = {
  entry: './server.js', 
  output: {
    filename: 'bundle.js', 
    path: path.resolve(__dirname, 'dist')
  },
  target: 'node', // Indicates that the bundle will be used in a Node.js environment
};
