const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const [,,dir,out]=process.argv; fs.mkdirSync(out,{recursive:true});
const jobs=[['medalnames-logo.svg','medalnames-logo.png',1],['medalnames-logo.svg','medalnames-logo@2x.png',2],
['medalnames-logo-horizontal.svg','medalnames-logo-horizontal.png',1],['medalnames-logo-horizontal.svg','medalnames-logo-horizontal@2x.png',2],
['medalnames-icon.svg','medalnames-icon-512.png',1],['medalnames-icon-dark.svg','medalnames-icon-dark-512.png',1]];
(async()=>{const b=await chromium.launch();
for(const [src,dst,scale] of jobs){const svg=fs.readFileSync(path.join(dir,src),'utf8');const m=svg.match(/width="(\d+)" height="(\d+)"/);
const p=await b.newPage({viewport:{width:+m[1],height:+m[2]},deviceScaleFactor:scale});
await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
await p.screenshot({path:path.join(out,dst),omitBackground:true,clip:{x:0,y:0,width:+m[1],height:+m[2]}});await p.close();console.log(dst,m[1]*scale+'x'+m[2]*scale);}
await b.close();})();
