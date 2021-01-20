const electronInstaller = require('electron-winstaller');
async function build(){
    try {
        console.log("Starting setup")
        await electronInstaller.createWindowsInstaller({
          appDirectory: './scapix-win32-x64/',
          outputDirectory: './packaged',
          authors: 'Specy',
          exe: 'Scapix.exe',
          noMsi: true,
          setupExe: "ScapixSetup.exe",
          iconUrl:"https://raw.githubusercontent.com/Specy-wot/Scapix/main/icon.ico",
          setupIcon: "./icon.ico",
          loadingGif: "./loading.gif"
        });
        console.log('Setup worked');
      } catch (e) {
        console.log(`Setup error: ${e.message}`);
      }
}
build()