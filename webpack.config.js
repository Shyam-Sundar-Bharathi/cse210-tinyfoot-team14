const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
<<<<<<< HEAD
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


=======
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
    entry: './src/js/tinyfoot.js', // your main JS file
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },

>>>>>>> 9080177 (Use Webpack to minify, bundle the JS and CSS files.)
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
<<<<<<< HEAD
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
=======
                use: ['style-loader', 'css-loader'],
>>>>>>> 9080177 (Use Webpack to minify, bundle the JS and CSS files.)
            },
        ],
    },

    plugins: [
<<<<<<< HEAD
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

=======
        new HtmlWebpackPlugin({
            template: './src/index.html', // Source HTML file
            filename: 'index.html', // Output HTML file
        }),
    ],

    // change to 'production' for minified output
>>>>>>> 9080177 (Use Webpack to minify, bundle the JS and CSS files.)
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true, // Optional: Remove console logs
                    },
                },
<<<<<<< HEAD
                extractComments: false
            }),
            new MiniCssExtractPlugin({
                filename: 'styles/[name].css',
            }),
=======
            }),
            new CssMinimizerPlugin(),
>>>>>>> 9080177 (Use Webpack to minify, bundle the JS and CSS files.)
        ],
    },

    mode: 'development',
<<<<<<< HEAD
};
=======
};
>>>>>>> 9080177 (Use Webpack to minify, bundle the JS and CSS files.)
