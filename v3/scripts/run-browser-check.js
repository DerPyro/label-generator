import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
const args=process.argv.slice(2);
const value=(flag,fallback)=>{const index=args.indexOf(flag);return index<0?fallback:args[index+1];};
const url=value('--url','http://localhost:3003/tests/browser.html');
const screenshot=value('--screenshot',null);
const inspectApp=args.includes('--app');
const artifactsDir=value('--artifacts-dir',null);
const profile=await mkdtemp(path.join(tmpdir(),'label-v3-browser-'));
const binary=process.env.CHROME_PATH||(process.platform==='win32'?'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe':'google-chrome');
const chrome=spawn(binary,['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
let socket,sequence=0;const pending=new Map(),exceptions=[];
try{
 const endpoint=await new Promise((resolve,reject)=>{
  let log='';const timer=setTimeout(()=>reject(Error('Chrome startet nicht. CHROME_PATH prüfen.')),15000);
  chrome.on('error',error=>{clearTimeout(timer);reject(error);});
  chrome.stderr.on('data',chunk=>{log+=chunk;const match=log.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match){clearTimeout(timer);resolve(match[1]);}});
  chrome.on('exit',code=>{clearTimeout(timer);reject(Error('Chrome wurde beendet: '+code));});
 });
 socket=new WebSocket(endpoint);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 socket.addEventListener('message',event=>{
  const message=JSON.parse(event.data);
  if(message.method==='Runtime.exceptionThrown')exceptions.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);
  if(message.id){const task=pending.get(message.id);if(task){pending.delete(message.id);clearTimeout(task.timer);message.error?task.reject(Error(message.error.message)):task.resolve(message.result);}}
 });
 const call=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++sequence;const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP-Timeout: '+method));},15000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});
 const {targetId}=await call('Target.createTarget',{url:'about:blank'});
 const {sessionId}=await call('Target.attachToTarget',{targetId,flatten:true});
 await call('Runtime.enable',{},sessionId);await call('Page.enable',{},sessionId);
 await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false},sessionId);
 await call('Page.navigate',{url},sessionId);
 const deadline=Date.now()+90000;let result;
 while(Date.now()<deadline){
  await new Promise(resolve=>setTimeout(resolve,150));
  const expression=inspectApp?'({status:document.querySelector("#export")?.disabled===false&&document.querySelectorAll(".layout-thumb canvas,.layout-thumb img").length===document.querySelectorAll(".layout-card").length?"passed":undefined,results:document.querySelector("#form-error")?.textContent||document.querySelector("#render-status")?.textContent,url:location.href})':'({status:document.body?.dataset.testStatus,results:document.querySelector("#results")?.textContent,url:location.href})';
  const response=await call('Runtime.evaluate',{expression,returnByValue:true},sessionId);
  result=response.result.value;
  if(result?.status)break;
  if(exceptions.length)throw Error(exceptions.join('\n'));
 }
 if(artifactsDir&&result?.status==='passed'){
  const response=await call('Runtime.evaluate',{expression:'window.__packArtifacts||{}',returnByValue:true},sessionId);
  for(const[name,data]of Object.entries(response.result.value)){
   if(path.basename(name)!==name||!name.endsWith('.png')||!data.startsWith('data:image/png;base64,'))throw Error('Ungültiges Vorschau-Artefakt.');
   await writeFile(path.join(artifactsDir,name),Buffer.from(data.slice('data:image/png;base64,'.length),'base64'));console.log('Vorschau gespeichert: '+name);
  }
 }
 if(screenshot){const {cssContentSize}=await call('Page.getLayoutMetrics',{},sessionId);const {data}=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:cssContentSize.width,height:cssContentSize.height,scale:1}},sessionId);await writeFile(screenshot,Buffer.from(data,'base64'));}
 console.log(result?.results||'Kein Testergebnis');
 if(result?.status!=='passed')throw Error('Browserprüfung '+(result?.status||'nicht abgeschlossen')+' unter '+url);
 console.log('Browserprüfung bestanden: '+url);
 await call('Browser.close');
}catch(error){console.error(error.message);process.exitCode=1;}
finally{socket?.close();chrome.kill();for(const task of pending.values()){clearTimeout(task.timer);}pending.clear();}
