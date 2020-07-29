/*
Copies the Angular App to the Function Environment for Universal SSR.
The cloud function needs access to the Angular build in order to render it on the server. 
This script copies the most recent Angular app to the functions dir on build.
*/
const fs = require('fs-extra');

(async() => {

    const src = '../dist';
    const copy = './dist';

    await fs.remove(copy);
    await fs.copy(src, copy);

})();