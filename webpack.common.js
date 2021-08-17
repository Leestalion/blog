const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: './src/index.js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Production',
            meta: {
                'viewport': { name: 'viewport', content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, target-densitydpi=device-dpi" },
            },
        }),
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(glb|gltf)$/,
                loader: 'file-loader'
            }
        ]
    }
};