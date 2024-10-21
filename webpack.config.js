const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: './src/js/tinyfoot.js',
    output: {
        filename: 'tinyfoot.js',
        path: path.resolve(__dirname, 'dist'),
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
        new HtmlWebpackPlugin({
            template: './src/index.html', // Source HTML file
            filename: 'index.html', // Output HTML file
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
            }),
            new MiniCssExtractPlugin({
                filename: '[name].css',
            }),
        ],
    },

    mode: 'development',
};