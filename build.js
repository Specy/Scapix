const electronInstaller = require('electron-winstaller');
async function build(){
    try {
        console.log("Starting packaging")
        await electronInstaller.createWindowsInstaller({
          appDirectory: './scapix-win32-x64/',
          outputDirectory: './packaged',
          authors: 'Specy',
          exe: 'Scapix.exe',
          noMsi: true,
          setupExe: "ScapixSetup.exe",
          iconUrl:"https://raw.githubusercontent.com/Specy-wot/Scapix/main/icon.ico",
          setupIcon: "./icon.ico"
        });
        console.log('Packaging worked');
      } catch (e) {
        console.log(`Packaging error: ${e.message}`);
      }
}
build()