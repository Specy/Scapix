[![Downloads](https://img.shields.io/github/downloads/Specy-wot/Scapix/total.svg?style=for-the-badge)](https://github.com/Specy-wot/Scapix/releases)
## ⚠️ Warning, the app is being rewritten, you can look at the progress in the `rewrite` branch
# Welcome to Scapix
Scapix is an image,gif and video upscaling and denoiser app developed with electron, react, waifu2x and ffmpeg.<br>
**Warning**, the code for this is pretty bad, i'd have to rewrite it from scratch to make it a bit better

<img src="https://cdn.discordapp.com/attachments/466748625138089994/805395009120632863/1.PNG" width=400>
<img src="https://cdn.discordapp.com/attachments/466748625138089994/805395008144277544/2.PNG" width=400>

# Installation (Windows)

Head over to the releases on github to download the latest version of Scapix.
After downloading the ScapixSetup.exe, run it and it will install the program, once done you should be able to find the executable on the desktop.
The Setup takes 5/10 seconds to open, wait untill it opens, if you run it again it will error out. 

# Other OS

I do not own other OS to test things out so i'm not 100% sure how things are going to work but to make it work for other OS you should be able to just clone the repo, replace the ffmpeg bin to the one for your OS and then go to node_modules/waifu2x/waifu2x and download or build the correct files for your OS from [here](https://github.com/DeadSix27/waifu2x-converter-cpp) and replace the windows one.
Then follow the building steps to create the executable
# Usage

Drag and drop your files or select them in the upper part of the page, then chose your denoise and upscale options, once you are ready, press the "Run all" button.

Now the images will be in a pending state waiting for the previous one to be processed, there are 4 status colors: <br> <br>
White/Black (dark mode) = idle <br>
Yellow = pending <br>
Green = finished <br>
Red = error <br>

You can read the output information clicking the "i" icon on the right of the image after it finished processing

You can also view the difference between original and upscaled images by clicking the "eye" icon

# Building from source

If you want to build the app you have to follow those building steps:
Firstly clone the repo and install all modules with `npm i`, then continue with the steps below.
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
./scapix-win32-x64/resources/app/node_modules/
```
And delete the .cache file, reason being that the packaged file exceeds window's max directory length of 260 characters

4)
```
npm run deploy-step3
```
This ^ will run the build.js file which will create the setup of the application that can then be used to install the program. (time ~= 20min)


# Credits 

[Waifu2x module](https://github.com/Tenpi/waifu2x) <br>
[Waifu2x Models](https://github.com/nagadomi/waifu2x) <br>
[ffmpeg](https://github.com/FFmpeg/FFmpeg) <br> 
