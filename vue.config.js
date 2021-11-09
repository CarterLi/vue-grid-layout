// https://medium.com/js-dojo/how-to-reduce-your-vue-js-bundle-size-with-webpack-3145bf5019b7
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack');
const { defineConfig } = require('@vue/cli-service')
const PACKAGE = require('./package.json');

const banner = PACKAGE.name + ' - ' + PACKAGE.version + ' | ' +
    '(c) 2015, ' + new Date().getFullYear() + '  ' + PACKAGE.author + ' | ' +
    PACKAGE.homepage;

module.exports = defineConfig({
    configureWebpack: {
        output: {
            library: "VueGridLayout",
            libraryExport: 'default'
        },
        plugins: [
            // new BundleAnalyzerPlugin(),
            new webpack.BannerPlugin(banner)
        ],
    },
    css: {
        extract: false
    },
});
