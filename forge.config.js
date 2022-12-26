const path = require('path');

module.exports = {
  packagerConfig: {
    name: "Scapix",
    icon: path.resolve(__dirname, "/electron/static/icons")  //TODO change this when not using windows
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        //TODO change this when deploying
        iconUrl: 'https://raw.githubusercontent.com/Specy/Scapix/rewrite/electron/static/icons/icon.ico',
        setupIcon: path.resolve(__dirname, "icon.ico") ,
        loadingGif: path.resolve(__dirname, '/electron/static/loading.gif'),
        skipUpdateIcon: true,
        setupExe: 'ScapixSetup.exe',
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon:  path.resolve(__dirname,  '/electron/static/icons/512x512.png'),
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
