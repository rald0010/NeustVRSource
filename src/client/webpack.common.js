const path = require('path')

module.exports = {
    entry: {
        
        planting: './src/client/planting.ts',
        harvesting: './src/client/harvesting.ts',
        roasting: './src/client/roasting.ts',
        drying: './src/client/drying.ts',
        barista: './src/client/barista.ts',
        
    },
    //entry: './src/client/client.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'pages/[name]/[name].bundle.js',
        path: path.resolve(__dirname, '../../dist/client'),
        publicPath: '/',
    },
}



// module.exports = {
//     entry: './src/client/planting.ts',
//     module: {
//         rules: [
//             {
//                 test: /\.tsx?$/,
//                 use: 'ts-loader',
//                 exclude: /node_modules/,
//             },
//         ],
//     },
//     resolve: {
//         extensions: ['.tsx', '.ts', '.js'],
//     },
//     output: {
//         filename: 'bundle1.js',
//         path: path.resolve(__dirname, '../../dist/client/pages/planting'),
//         publicPath: '/',
//     },
// }

