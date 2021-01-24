# Welcome to Scapix
Scapix is an image,gif and video upscaling and denoiser app which uses waifu2x, a machine learning library. <br>
It's able to upscale and denoise many different image formats and can also upscale GIFs and videos.

<img src="https://cdn.discordapp.com/attachments/466748625138089994/801768795349581864/photo1.PNG" width=400>
<img src="https://cdn.discordapp.com/attachments/466748625138089994/801768799451873281/photo2.PNG" width=400>

# Installation

Head over to the releases on github to download the latest version of Scapix.
After downloading the ScapixSetup.exe, run it and it will install the program, once done you should be able to find the executable on the desktop.

# Usage

Drag and drop your files or select them in the upper part of the page, then chose your denoise and upscale options, once you are ready, press the "Run all" button.

Now the images will be in a pending state waiting for the previous one to be processed, there are 4 status colors: <br>
White/Black (dark mode) = idle <br>
Yellow = pending <br>
Green = finished <br>
Red = error <br>

You can read the output information clicking the "i" icon on the right of the image after it finished processing

You can also view the difference between original and upscaled images by clicking the "eye" icon

# Building from source

If you want to build the app you have to follow those building steps:

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
