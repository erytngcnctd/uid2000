rules: [
    {
      test: /\.tsx?$/,
      loader: 'esbuild-loader',
      exclude: /node_modules/,
      options: {
        loader: 'tsx',
        target: 'es2018',
      },
    },
    {
      test: /ethereum-provider\/dist\/index\.es\.js/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    },
    {
      test: /\@walletconnect\/.*\/index\.es\.js/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    },
    {
      test: /ethereum-provider\/dist\/index\.es\.js/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    },
    // {
    //   test: /\@walletconnect\/.*\/index.js/,
    //   use: {
    //     loader: 'babel-loader',
    //     options: {
    //       presets: ['@babel/preset-env'],
    //     },
    //   },
    // },
     {
      test: /\@walletconnect\/modal-ui\/dist\/index\.js/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    },
     {
      test: /\@walletconnect\/modal-core\/dist\/index\.js/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    },
    {
      test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf|ico)$/,
      use: ['file-loader'],
    },
  ]
  ```