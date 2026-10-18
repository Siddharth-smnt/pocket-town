import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mode=process.argv[2]??'debug';
const modes=new Set(['sync','debug','preview','test-ads','bundle']);
if(!modes.has(mode)) throw new Error(`Unknown build mode: ${mode}`);
const ads=mode==='test-ads';
const preview=mode==='preview';
const env={...process.env,VITE_ENABLE_TEST_ADS:String(ads),POCKET_TOWN_TEST_ADS:String(ads),POCKET_TOWN_PREVIEW:String(preview)};
const windows=process.platform==='win32';
function run(command,args,cwd=root) {
  const result=spawnSync(command,args,{cwd,env,stdio:'inherit',shell:windows});
  if(result.error) {console.error(result.error.message);process.exit(1);}
  if(result.status!==0) process.exit(result.status??1);
}
run(windows?'npm.cmd':'npm',['run','build']);
run(windows?'npx.cmd':'npx',['--no-install','cap','sync','android']);
if(mode!=='sync') {
  run(windows?'gradlew.bat':'./gradlew',[mode==='bundle'?'bundleRelease':'assembleDebug','--no-daemon',`-PpocketTownPreview=${preview}`],path.join(root,'android'));
}
