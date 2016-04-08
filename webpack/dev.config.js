import {extend} from 'lodash';
import baseConfig from './base.config';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';


baseConfig.plugins.push( 
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('development')
    }
  }) 
);
baseConfig.plugins.push( new webpack.HotModuleReplacementPlugin() );
baseConfig.plugins.push( new webpack.NoErrorsPlugin() );

export default extend({}, baseConfig, {
	devtool: 'source-map',
	entry: {
    main: [
      'webpack-hot-middleware/client',
      './src/index'
    ],
    vendor: ['react', 'react-dom']
  }
})