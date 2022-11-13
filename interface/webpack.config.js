const path = require('path');

module.exports = {
  entry: './src/js/App.jsx',
  // mode: "production",
  mode: "development",
  output: {
    filename: 'main_min.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  }
};