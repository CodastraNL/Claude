const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
(async()=>{
  const dir=__dirname;
  let svg=fs.readFileSync(path.join(dir,'../../svg/medalmc-icon.svg'),'utf8').replace(/^<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
  const html=fs.readFileSync(path.join(dir,'banner.html'),'utf8').replace('ICON',svg);
  fs.writeFileSync(path.join(dir,'_out.html'),html);
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:2000,height:667}});
  await p.goto('file://'+path.join(dir,'_out.html'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
  await p.screenshot({path:path.join(dir,'../medalmc-server-banner.png')});await b.close();
})();
