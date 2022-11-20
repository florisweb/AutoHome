import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

function getCurDir() {
    return dirname(fileURLToPath(import.meta.url));
}

export default {
  entry: './src/js/App.jsx',
  // mode: "production",
  mode: "development",
  output: {
    filename: 'main_min.js',
    path: path.resolve(getCurDir(), 'dist'),
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