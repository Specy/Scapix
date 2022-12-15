module.exports = {
  packagerConfig: {
    icon: "./electron/static/icons"
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        //TODO change this when deploying
        iconUrl: 'https://raw.githubusercontent.com/Specy/Scapix/rewrite/electron/static/favicon.ico',
        setupIcon: './electron/static/icons/icon.ico',
        loadingGif: './electron/static/loading.gif',
        setupExe: 'ScapixSetup.exe',
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: './electron/static/icons/512x512.png',
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
