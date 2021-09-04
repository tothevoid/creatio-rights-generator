const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	entry: { 
		popup: './popup/popup.js', 
		background: './background.js',
		formatter: '../../formatter/formatter.js'
    },
	resolve: {
		extensions: ['.js'],
  	},
	module: {
		rules: [
			{
			test: /\.css$/i,
			use: [MiniCssExtractPlugin.loader, "css-loader"],
			},
		],
	},
  	plugins: [
		new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
		new HtmlWebpackPlugin({ 
			template: './popup/popup.html',
			filename: 'popup.html',
		}),
		new MiniCssExtractPlugin(),
		new CopyWebpackPlugin({
		patterns: [
			{ from: './manifest.json' },
			{ from: './images/icon_16.png' },
			{ from: './images/icon_32.png' },
			{ from: './images/icon_48.png' },
			{ from: './images/icon_128.png' },
		],
		}),
	],
	output: { filename: '[name].js', path: path.resolve("../../../build", 'chrome-formatter') }
};