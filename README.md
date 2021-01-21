# Welcome to Scapix
Scapix is an electron + react combo that uses waifu2x to upscale and denoise images.
It's meant to make it easy, just drop files, chose your upscale settings and clcik "run all!", that's it, now sit back and wait.

# Installation

Head over to the releases on github to download the latest version of Scapix.
After downloading the ScapixSetup.exe, run it and it will install the program, once done you should be able to find the executable on the desktop.

# Usage

Drag and drop your files or select them in the upper part of the page, then select the select your denoise and upscale options, once you are ready, press the "Run all" button.

Now the images will be in a pending state waiting for the previous one to be processed, there are 3 status colors:
Yellow = pending
Green = finished
Red = error

You can read the output information clicking the "i" icon on the right of the image after it finished processing

You can also view the difference between original and upscaled images by clicking the "eye" icon

# Building

If you want to build the app you must follow those building steps:

After finishing your changes you have to close the dev server and run:
1)
```
npm run deploy-step1
```
This ^ will create the react bundle in ./bundle (time ~= 2min)

2)
```
npm run deploy-step2
```
This ^ will create the electron package (time ~= 10min)

3)
You should now go to
```
./scapix-win32-x64/app/node_modules/
```
And delete the .cache file, reason being that the packaged file exceeds window's max directory length of 260 characters

4)
```
npm run deploy-step3
```
This ^ will run the build.js file which will create the setup of the application that can then be used to install the program. (time ~= 20min)