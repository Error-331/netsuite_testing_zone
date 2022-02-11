const presets = [
    [
        '@babel/env',
        {
            targets: process.env.PLATFORM === 'desktop' ?
                {
                    electron: '12.0.11',
                }
                :
                [
                    'chrome >= 90 '
                ],
            useBuiltIns: 'entry',
            corejs: '3.9.0',
        },
    ],
    '@babel/react',
    '@babel/preset-typescript'
];

const plugins = [
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-class-properties'
];

module.exports = { presets, plugins };
