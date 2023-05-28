# point sphere demonstration for BAM.Money front page

### Usage steps:
1. clone repo
2. make sure you have node installed
3. `npm i`
4. `npm run dev` to run dev website (js)
5. `npm run build` to build a distribution version under `/dist`

### Notes for addition to website:
if there are errors with directly adding the distribution version, try checking if there are any conflicting classnames etc
There may be a DOM conflict between Threejs and React or something like that, if that is an issue, just get this hosted elsewhere and use an iframe to bring it into the desired spot.

### TODO:
Add popup (as shown in figma) when the view data is clicked (it currently is just an empty url for the styling)
Reformat the cards to look better
