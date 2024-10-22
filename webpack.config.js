const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: { 
        tinyfoot: './src/js/tinyfoot.js',
        tinyfootDefault: './src/js/tinyfootDefault.js',
        tinyfootNumeric: './src/js/tinyfootNumeric.js',
        tinyfootBottom: './src/js/tinyfootBottom.js',
    },
    output: {
        filename: 'js/[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },


    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
        ],
    },

    plugins: [
        new CopyWebpackPlugin({
            patterns: [
              {
                from: './assets/*', // Copy all files from src/assets
                to: './', // Copy them to dist/assets
                context: path.resolve(__dirname, 'src'), // Set context to src
              },
            ],
        }),
    ],

    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true, // Optional: Remove console logs
                    },
                },
                extractComments: false
            }),
            new MiniCssExtractPlugin({
                filename: 'styles/[name].css',
            }),
        ],
    },

    mode: 'development',
};
