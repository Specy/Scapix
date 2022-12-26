const path = require('path');

module.exports = {
  packagerConfig: {
    name: "Scapix",
    icon: path.join(__dirname, "/electron/static/icons/icon"),
    ignore: [
      /^\/out\//g,
      /^\/results\//g,
      /^\/logs\//g,
      /^\/docs\//g 
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        //TODO change this when deploying
        iconUrl: 'https://raw.githubusercontent.com/Specy/Scapix/main/electron/static/icons/icon.ico',
        setupIcon: path.join(__dirname, "/electron/static/icons/icon.ico") ,
        loadingGif: path.join(__dirname, '/electron/static/loading.gif'),
        skipUpdateIcon: true,
        setupExe: 'ScapixSetup.exe',
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon:  path.join(__dirname, '/electron/static/icons/icon@2x.png'),
        },
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        icon: './electron/static/icons/icon.icns',
      },
    }
  ],
};
