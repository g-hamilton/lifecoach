const { exec, execSync, spawnSync } = require("child_process");

const prompt = require('./deployhelper')();

let options = {
    isProd:false,
    projectID:'',
    isWin: process.platform.includes('win'),
}

const firebaseUse = () => {
    return new Promise((resolve, reject) => {
        console.log('Selecting project...');
        exec(`firebase use ${options.projectID}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                reject()
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                reject()
                return;
            }
            console.log(`stdout: ${stdout}`);
        resolve();
        });
    })
}

const gitUse = () =>{
    return new Promise((resolve, reject) => {
        exec(`git checkout ${options.isProd ? 'master' : 'development'}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                reject()
                return;
            }
            if (stderr) {
                stderr.includes('Already on') ? resolve():reject();
                return;
            }
            console.log(`stdout: ${stdout}`);
            resolve();
        });
    })
}
const deletingDist = () =>{
    return new Promise((resolve, reject) => {
        exec(`${options.isWin? 'rmdir /s /q dist':'rm -rf dist/'}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                resolve()
                // reject()
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                // reject()
                return;
            }
            console.log(`stdout: ${stdout}`);
            resolve();
        });
    })
}


const yarnBuild = () =>{
    return new Promise((resolve, reject) => {
        exec(`${options.isProd? 'yarn build:ssr':'yarn build:dev-ssr'}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                reject()
                return;
            }
            if (stderr && !stderr.includes('WARNING in budgets, maximum exceeded for initial')) {
                console.log(`stderr: ${stderr}`);
                reject()
                return;
            }
            console.log(`stdout: ${stdout}`);
            resolve();
        });
    })
}

const npmRunBuild = () =>{
    return new Promise((resolve, reject) => {
        exec(`cd functions && npm run build`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                reject()
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                reject()
                return;
            }
            console.log(`stdout: ${stdout}`);
            resolve();
        });
    })
}

const deployFunc = () =>{

    return new Promise((resolve, reject) => {
        let finished = false;
        let functionsToDeploy = ''
        while (!finished) {
            console.log('Started deploying functions....');
            if (functionsToDeploy) {
                console.log('Deploying except functions: ', functionsToDeploy);
            }
            let sync;
            if(options.isWin){
                console.log('сюда зашёл');
                const command = "firebase.cmd";
                sync = spawnSync(command, functionsToDeploy ?
                    ["deploy","--only", functionsToDeploy.replace('firebase deploy --only ', '')]
                    :["deploy","--only","functions"]);
            } else {
             sync = spawnSync(`${functionsToDeploy ? functionsToDeploy : 'firebase '}`, {stdio:'pipe'});
            }
            const result = sync.stdout.toString();

            if( result.match(/firebase deploy --only "[\s\S]+?"+/gi) === null){
                finished = true;
            } else {
                functionsToDeploy = result.match(/firebase deploy --only "[\s\S]+?"+/gi).join('');
                functionsToDeploy = functionsToDeploy.substring(0,functionsToDeploy.length-1);
                console.log('FUNCTIONS, THAT SHOULD BE DEPLOYED', functionsToDeploy);
            }
            console.log('Iteration of deployment is over');
        }
        console.log("FUNCTIONS DEPLOYED")
        resolve();
    })
}

const deployHost = () =>{
    return new Promise((resolve, reject) => {
        exec(`cd ./dist/browser && ${options.isWin? 'del /q index.html':'rm index.html'}`,
            (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                reject()
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                reject()
                return;
            }
            console.log(`stdout: ${stdout}`);
        }).on('exit', ()=>{
            exec(`firebase deploy --only hosting`,
                (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        reject()
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        reject()
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                    resolve();
                })
        });
    })
}
const main = async () =>{
    let ans = prompt('Would you like to deploy prod? If prod - type [p/P], default value - dev >');
    console.log(ans);
    if (ans.trim().toLowerCase() === 'p'){
        options = {...options, isProd: true, projectID: 'lifecoach-6ab28'}

    } else {
        options = {...options, isProd: false, projectID: 'livecoach-dev'}
    }
    console.log(options);
    try{
        // await firebaseUse();
        // console.log('Project selected');
        // await gitUse();
        // console.log('Git checkouted');
        // await deletingDist();
        // console.log('dist/ deleted');
        // await yarnBuild();
        // console.log('Project built');
        // await npmRunBuild();
        // console.log('Functions built');
        // await deployFunc();
        // console.log('Functions deployed');
        await deployHost();
        console.log('Hosting deployed');
    } catch (e) {
        console.log('ERROR OCCURRED', e)
    }
}
main();