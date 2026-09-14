// Reproduce the 3D silhouette from the official local PNG (Node built-ins only).
const fs=require('node:fs'),zlib=require('node:zlib');
const png=fs.readFileSync(require('node:path').join(__dirname,'atry-isotipo.png'));
const w=png.readUInt32BE(16),h=png.readUInt32BE(20),stride=w*4,chunks=[];
if(png[24]!==8||png[25]!==6||png[28]!==0)throw Error('Expected non-interlaced RGBA PNG');
for(let p=8;p<png.length;){const n=png.readUInt32BE(p);if(png.toString('ascii',p+4,p+8)==='IDAT')chunks.push(png.subarray(p+8,p+8+n));p+=n+12;}
const raw=zlib.inflateSync(Buffer.concat(chunks)),pixels=Buffer.alloc(h*stride);
const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
for(let y=0;y<h;y++){const filter=raw[y*(stride+1)];for(let x=0;x<stride;x++){const i=y*stride+x,a=x>=4?pixels[i-4]:0,b=y?pixels[i-stride]:0,c=y&&x>=4?pixels[i-stride-4]:0;pixels[i]=(raw[y*(stride+1)+x+1]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;}}
const step=5,cols=Math.ceil(w/step),rows=Math.ceil(h/step);
const filled=(x,y)=>{if(x<0||y<0||x>=cols||y>=rows)return false;const i=(Math.min(h-1,y*step)*w+Math.min(w-1,x*step))*4;return pixels[i+3]>100&&pixels[i+1]>100;};
const edges=new Map(),key=(x,y)=>`${x},${y}`;
function edge(x,y,xx,yy){edges.set(key(x,y),[xx,yy]);}
for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(filled(x,y)){
  if(!filled(x,y-1))edge(x,y,x+1,y);if(!filled(x+1,y))edge(x+1,y,x+1,y+1);
  if(!filled(x,y+1))edge(x+1,y+1,x,y+1);if(!filled(x-1,y))edge(x,y+1,x,y);
}
const contours=[];while(edges.size){const start=edges.keys().next().value;let k=start,points=[];do{points.push(k.split(',').map(Number));const next=edges.get(k);edges.delete(k);if(!next)break;k=key(...next);}while(k!==start);contours.push(points);}
const points=contours.sort((a,b)=>b.length-a.length)[0];
function simplify(p,tolerance){if(p.length<3)return p;const a=p[0],b=p[p.length-1],dx=b[0]-a[0],dy=b[1]-a[1];let max=0,index=0;for(let i=1;i<p.length-1;i++){let t=(dx*(p[i][0]-a[0])+dy*(p[i][1]-a[1]))/(dx*dx+dy*dy||1);t=Math.max(0,Math.min(1,t));const d=Math.hypot(p[i][0]-a[0]-t*dx,p[i][1]-a[1]-t*dy);if(d>max){max=d;index=i;}}return max>tolerance?[...simplify(p.slice(0,index+1),tolerance).slice(0,-1),...simplify(p.slice(index),tolerance)]:[a,b];}
const minX=Math.min(...points.map(p=>p[0])),maxX=Math.max(...points.map(p=>p[0]));
const minY=Math.min(...points.map(p=>p[1])),maxY=Math.max(...points.map(p=>p[1]));
const path=contours.filter(c=>c.length>30).map(c=>simplify([...c,c[0]],1.25).map(([x,y])=>[+((x-(minX+maxX)/2)*2.74/(maxX-minX)).toFixed(4),+(((minY+maxY)/2-y)*2.74/(maxX-minX)).toFixed(4)]));
console.log(JSON.stringify(path));
