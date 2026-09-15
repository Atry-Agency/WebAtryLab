/* ATRY LAB — procedural fabrication film. Three.js r160 (MIT), bundled locally.
   No models, fonts, textures or services are requested at runtime. */
(() => {
  'use strict';
  let cleanup = () => {};
  window.atryPrinter = { mount, dispose() { cleanup(); cleanup = () => {}; } };

  function mount(host) {
    if (!host) return;
    if (!window.THREE) {
      host.querySelector('[data-print-status]').textContent='Diseño y fabricación 3D';
      host.querySelector('[data-print-pause]').hidden=true;
      return;
    }
    const T = window.THREE;
    const viewport = host.querySelector('[data-printer-viewport]');
    const status = host.querySelector('[data-print-status]');
    const progress = host.querySelector('[data-print-progress]');
    const pause = host.querySelector('[data-print-pause]');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = matchMedia('(max-width: 767px)').matches;
    const cores = navigator.hardwareConcurrency || 8;
    const memory = navigator.deviceMemory || 8;
    // Hardware hints control animation cadence, never the visual definition.
    // Safari commonly reports four logical cores on perfectly capable iPhones;
    // treating that signal as "low quality" produced a visibly pixelated canvas.
    const constrained = cores <= 4 || memory <= 4;
    const quality = mobile ? 'medium' : 'high';
    const shadows = true;
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: constrained ? 'low-power' : 'high-performance' });
    } catch (_) {
      status.textContent = 'Diseño y fabricación 3D';
      pause.hidden = true;
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = shadows;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    viewport.append(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(34, 1, .1, 60);
    const model = new T.Group();
    scene.add(model);
    const resources = new Set();
    const keep = resource => { resources.add(resource); return resource; };
    const material = params => keep(new T.MeshStandardMaterial(params));
    const graphite = material({color:0x253139, metalness:.78, roughness:.29});
    const dark = material({color:0x0b1218, metalness:.48, roughness:.38});
    const silver = material({color:0xa1b0b8, metalness:.93, roughness:.19});
    const rubber = material({color:0x070b0f, metalness:.08, roughness:.7});
    const bedMaterial = material({color:0x465054, metalness:.7, roughness:.57});
    const brass = material({color:0xc99a51, metalness:.82, roughness:.23});
    const cyan = material({color:0x009ac9, metalness:.12, roughness:.34, envMapIntensity:.45});
    const led = material({color:0x9befff, emissive:0x47cfe7, emissiveIntensity:3, roughness:.3});
    const whiteLed = material({color:0xeeffff, emissive:0xa2d6e5, emissiveIntensity:2});
    function mesh(geometry, mat, x=0, y=0, z=0, parent=model) {
      const object = new T.Mesh(keep(geometry), mat);
      object.position.set(x,y,z); object.castShadow=shadows; object.receiveShadow=shadows;
      parent.add(object); return object;
    }
    function box(w,h,d,mat,x=0,y=0,z=0,parent=model) {
      return mesh(new T.BoxGeometry(w,h,d),mat,x,y,z,parent);
    }
    function cylinder(radius,length,mat,x,y,z,parent=model,axis='y') {
      const object=mesh(new T.CylinderGeometry(radius,radius,length,24),mat,x,y,z,parent);
      if(axis==='x')object.rotation.z=Math.PI/2;
      if(axis==='z')object.rotation.x=Math.PI/2;
      return object;
    }
    function rounded(w,h,d,r,mat,x,y,z,parent=model) {
      const s=new T.Shape();
      s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
      s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);
      s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
      const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.015,bevelThickness:.015,curveSegments:8});
      g.translate(0,0,-d/2);return mesh(g,mat,x,y,z,parent);
    }
    function label(text,w,h,x,y,z,parent=model,color='#b7c9d0',background=null) {
      const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
      const ctx=canvas.getContext('2d');
      if(background){ctx.fillStyle=background;ctx.fillRect(0,0,512,128);}
      ctx.font='500 48px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,256,64);
      const texture=keep(new T.CanvasTexture(canvas));texture.colorSpace=T.SRGBColorSpace;
      const mat=keep(new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));
      return mesh(new T.PlaneGeometry(w,h),mat,x,y,z,parent);
    }
    // Photographic softboxes: environment reflections are generated once, locally.
    const environment=new T.Scene();environment.background=new T.Color(0x465560);
    const envResources=[];
    function softbox(w,h,x,y,z,color,intensity) {
      const g=new T.PlaneGeometry(w,h);const m=new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(intensity),side:T.DoubleSide});
      envResources.push(g,m);const plane=new T.Mesh(g,m);plane.position.set(x,y,z);plane.lookAt(0,2,0);environment.add(plane);
    }
    softbox(3,8,-6,5,4,0xffffff,5);softbox(5,2,3,7,-4,0x7bddff,4);softbox(2,6,6,3,3,0xffffff,3);
    let envMap=null;
    const pmrem=new T.PMREMGenerator(renderer);
    envMap=pmrem.fromScene(environment,.04);scene.environment=envMap.texture;pmrem.dispose();
    envResources.forEach(r=>r.dispose());
    scene.add(new T.HemisphereLight(0xc3edff,0x152735,2));
    const key=new T.DirectionalLight(0xf3f7ff,4.5);key.position.set(-3,7,6);key.castShadow=shadows;
    const shadowSize=quality==='medium'?1024:1536;
    key.shadow.mapSize.set(shadowSize,shadowSize);Object.assign(key.shadow.camera,{left:-4,right:4,top:7,bottom:-3,near:.1,far:20});
    key.shadow.normalBias=.025;key.shadow.bias=-.0003;scene.add(key);
    const rim=new T.DirectionalLight(0x29caff,3);rim.position.set(4,4,-4);scene.add(rim);
    const front=new T.DirectionalLight(0xffffff,1.2);front.position.set(4,2,6);scene.add(front);
    const floor=mesh(new T.PlaneGeometry(200,200),keep(new T.ShadowMaterial({opacity:.36})),0,-.06,0,scene);
    floor.rotation.x=-Math.PI/2;floor.castShadow=false;

    // Four-post, open-front CoreXY enclosure. All hardware has actual depth.
    rounded(4.5,.43,3.6,.12,graphite,0,.3,0);
    rounded(4.35,.09,3.48,.045,silver,0,.53,0);
    rounded(4.1,.24,.045,.055,dark,0,.31,1.84);
    label('A T R Y   /   L A B',1.38,.21,-.96,.32,1.876);
    rounded(.71,.2,.025,.035,dark,1.3,.32,1.875);
    label('STUDIO 01',.53,.12,1.3,.32,1.896,model,'#87dfea','#102a33');
    for(const x of [-1.85,1.85])for(const z of [-1.35,1.35])cylinder(.18,.14,rubber,x,.05,z);
    for(const x of [-2.05,2.05])for(const z of [-1.55,1.55]) {
      box(.19,3.85,.2,graphite,x,2.48,z);
      box(.035,3.7,.022,silver,x-.055,2.48,z+.105);
      box(.018,3.7,.025,rubber,x+.036,2.48,z+.106);
      for(const y of [.75,4.2])cylinder(.042,.014,silver,x,y,z+.113,model,'z');
    }
    box(4.28,.23,.24,graphite,0,4.42,-1.55);
    box(4.28,.23,.24,graphite,0,4.42,1.55);
    for(const x of [-2.05,2.05])box(.24,.23,3.1,graphite,x,4.42,0);
    box(3.83,.035,.03,whiteLed,0,4.27,-1.49);
    box(.035,.03,2.85,whiteLed,-1.89,4.26,0);
    label('A T R Y',.7,.17,0,4.43,1.685);
    // Back panel, lead screws and toothed belts.
    box(3.84,3.56,.055,dark,0,2.44,-1.61);
    for(const x of [-1.64,1.64]) {
      cylinder(.043,3.48,silver,x,2.43,-1.4);
      for(let i=0;i<57;i++)cylinder(.052,.012,graphite,x,.73+i*.057,-1.4);
      box(.12,3.5,.027,rubber,x,2.43,-1.31);
    }
    // Tinted side window: restrained reflections, no expensive transmission pass.
    const glass=keep(new T.MeshPhysicalMaterial({color:0x86b8ce,metalness:.12,roughness:.15,transparent:true,opacity:.07,side:T.DoubleSide,depthWrite:false}));
    box(.018,3.56,2.88,glass,2.05,2.44,0).castShadow=false;
    for(let i=0;i<10;i++)box(.31,.022,.018,graphite,.87+i*.057,1.05,-1.568);
    // Machined platform, calibration grid and spring mounts.
    for(const x of [-1.32,1.32])for(const z of [-1.04,1.04])cylinder(.09,.25,silver,x,.74,z);
    box(3.37,.15,2.75,graphite,0,.88,0);
    box(3.31,.045,2.69,bedMaterial,0,.978,0);
    const lines=[];
    for(let n=-7;n<=7;n++){const p=n*.2;lines.push(p,1.004,-1.2,p,1.004,1.2);}
    for(let n=-6;n<=6;n++){const p=n*.2;lines.push(-1.5,1.004,p,1.5,1.004,p);}
    const gridGeo=keep(new T.BufferGeometry());gridGeo.setAttribute('position',new T.Float32BufferAttribute(lines,3));
    model.add(new T.LineSegments(gridGeo,keep(new T.LineBasicMaterial({color:0xbdd7df,transparent:true,opacity:.14}))));
    box(3.1,.013,.022,led,0,.987,1.38);
    for(const x of [-1.43,1.43])for(const z of [-1.13,1.13])cylinder(.032,.007,silver,x,1.006,z);

    // Contours traced from recursos/atry-isotipo.png by recursos/trazar-isotipo.cjs.
    // Preserve the central negative space, not just the outer silhouette.
    const outline=new T.Shape();
    const contours=[[[-.1874,.767],[.1874,.3923],[.1991,.3571],[.3747,.4976],[.5738,.5679],[.7728,.5562],[.9133,.4976],[1.0304,.4157],[1.2178,.2283],[1.3349,.0644],[1.37,-.0293],[1.1124,-.1815],[1.007,.0176],[.8314,.1932],[.726,.24],[.6557,.24],[.5738,.2049],[.4918,.1229],[.5035,.041],[.8665,-.3454],[.1874,-.767],[-.1991,-.3688],[-.3864,-.5094],[-.5503,-.5679],[-.7377,-.5679],[-.9368,-.4859],[-1.2295,-.2166],[-1.3349,-.0644],[-1.37,.0293],[-1.1124,.1815],[-1.0773,.0878],[-.9719,-.0644],[-.8197,-.2049],[-.7377,-.24],[-.644,-.24],[-.5621,-.2049],[-.4918,-.1229],[-.5035,-.041],[-.6791,.1229],[-.6791,.1464],[-.8665,.3454],[-.2342,.7201],[-.1874,.767]],[[-.1991,.404],[-.4215,.2752],[-.4215,.2518],[.1874,-.3923],[.2225,-.3923],[.4098,-.2752],[.4215,-.2518],[.3747,-.1932],[-.1991,.404]]];
    contours.forEach((points,index)=>{const path=index?new T.Path():outline;path.moveTo(...points[0]);points.slice(1).forEach(p=>path.lineTo(...p));path.closePath();if(index)outline.holes.push(path);});
    const printHeight=.29;
    const logoGeo=keep(new T.ExtrudeGeometry(outline,{depth:printHeight,steps:1,bevelEnabled:true,bevelSegments:3,bevelSize:.012,bevelThickness:.009,curveSegments:28}));
    logoGeo.rotateX(-Math.PI/2);
    // Fine printed-layer highlights remain physical, not a blinking scan effect.
    cyan.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vPrintPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\nvPrintPosition = position;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vPrintPosition;').replace('#include <color_fragment>','#include <color_fragment>\nfloat layer = smoothstep(0.15,0.55,fract(vPrintPosition.y * 65.0));\ndiffuseColor.rgb *= 0.89 + 0.11 * layer;');
    };
    const printMaterial=keep(cyan.clone());printMaterial.onBeforeCompile=cyan.onBeforeCompile;printMaterial.transparent=true;
    const print=mesh(logoGeo,printMaterial,0,1.035,0);print.scale.y=.3;
    const toolPath=outline.getSpacedPoints(220);
    // Moving XY bridge, carriage and brass nozzle: tip tracks the printed contour.
    const gantry=new T.Group();model.add(gantry);
    for(const x of [-1.85,1.85]) {
      box(.22,.24,2.9,dark,x,0,0,gantry);
      cylinder(.036,2.92,silver,x,.13,0,gantry,'z');
    }
    const bridge=new T.Group();gantry.add(bridge);
    for(const z of [-.19,.19])cylinder(.046,3.8,silver,0,.24,z,bridge,'x');
    box(3.78,.18,.17,graphite,0,.38,-.02,bridge);
    box(3.7,.034,.04,rubber,0,.40,.08,bridge);
    for(const x of [-1.85,1.85])box(.24,.37,.56,graphite,x,.18,0,bridge);
    const head=new T.Group();bridge.add(head);
    rounded(.64,.61,.49,.075,graphite,0,.12,0,head);
    rounded(.51,.48,.035,.06,dark,0,.14,.268,head);
    const fan=cylinder(.18,.021,rubber,0,.17,.294,head,'z');
    cylinder(.063,.027,silver,0,.17,.312,head,'z');
    for(let i=0;i<8;i++) {
      const angle=i*Math.PI/4;const blade=box(.042,.135,.018,graphite,Math.sin(angle)*.105,.17+Math.cos(angle)*.105,.319,head);blade.rotation.z=-angle;
    }
    const ring=mesh(new T.TorusGeometry(.19,.013,8,48),silver,0,.17,.31,head);
    ring.castShadow=false;
    for(const x of [-.23,.23])for(const y of [-.045,.33])cylinder(.019,.012,silver,x,y,.302,head,'z');
    box(.20,.025,.015,led,0,-.115,.296,head);
    for(let i=0;i<5;i++)box(.33,.022,.27,silver,0,-.23-i*.045,0,head);
    box(.25,.15,.23,graphite,0,-.45,0,head);
    mesh(new T.CylinderGeometry(.072,.018,.16,6),brass,0,-.60,0,head);
    // The nozzle tip sits at -0.68 relative to its moving group.
    const nozzleLight=new T.PointLight(0x83e6ff,.75,1.35,2);nozzleLight.position.set(0,-.50,.13);head.add(nozzleLight);
    cylinder(.035,.16,rubber,0,.51,0,head);
    const tubeGeometry=keep(new T.BufferGeometry());
    const tubeArray=new Float32Array(33*3);tubeGeometry.setAttribute('position',new T.BufferAttribute(tubeArray,3));
    const tube=new T.Line(tubeGeometry,keep(new T.LineBasicMaterial({color:0xd9e6eb,transparent:true,opacity:.78})));model.add(tube);
    // Rear spool with turquoise filament and dark flanges.
    const spool=new T.Group();spool.position.set(.77,4.81,-1.25);model.add(spool);
    cylinder(.43,.42,cyan,0,0,0,spool,'x');
    for(const x of [-.23,.23]) {
      cylinder(.51,.045,graphite,x,0,0,spool,'x');
      cylinder(.12,.054,silver,x,0,0,spool,'x');
    }
    box(.13,.32,.21,graphite,.77,4.52,-1.25);
    // A fixed PTFE guide keeps the filament visibly supported before the moving loop.
    cylinder(.055,.34,silver,.54,4.48,-1.43,model,'x');
    cylinder(.032,.37,cyan,.54,4.48,-1.43,model,'x');

    let disposed=false, frame=0, elapsed=9, last=0, lastRender=0;
    let visible=true, paused=reduced.matches, pointerX=0, pointerY=0, lastStatus='';
    const smooth=t=>t*t*(3-2*t);
    const smoother=t=>t*t*t*(t*(t*6-15)+10);
    function resize(){
      if(disposed)return;const rect=viewport.getBoundingClientRect();
      // Preserve Retina sharpness on mobile while bounding total GPU pixels.
      const dprCap=mobile?2.5:2;
      const pixelBudget=mobile?2600000:3200000;
      const adaptiveDpr=Math.sqrt(pixelBudget/Math.max(1,rect.width*rect.height));
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,dprCap,adaptiveDpr));
      renderer.setSize(Math.max(1,rect.width),Math.max(1,rect.height),false);
      camera.aspect=rect.width/Math.max(1,rect.height);camera.updateProjectionMatrix();
      if(paused)draw();
    }
    function draw(){
      const cycle=elapsed%46;
      const printing=cycle<35;
      const printT=Math.min(cycle/35,1);
      const amount=printing?Math.max(.015,smoother(printT)):1;
      const fade=cycle>=43?1-smoother((cycle-43)/3):Math.min(1,smoother(Math.min(cycle/2.5,1)));
      print.scale.y=Math.max(.002,amount);
      printMaterial.opacity=fade;print.visible=fade>.006;
      const index=((printT*7.5)%1)*(toolPath.length-1);
      const p0=toolPath[Math.floor(index)],p1=toolPath[Math.min(toolPath.length-1,Math.floor(index)+1)];
      const fraction=index%1;
      let x=T.MathUtils.lerp(p0.x,p1.x,fraction),z=-T.MathUtils.lerp(p0.y,p1.y,fraction);
      const park=printing?0:smoother(Math.min((cycle-35)/3.2,1));
      x=T.MathUtils.lerp(x,1.52,park);z=T.MathUtils.lerp(z,-1.12,park);
      gantry.position.y=1.035+printHeight*amount+.70+park*.63;
      bridge.position.z=z;head.position.x=x;
      nozzleLight.intensity=printing?.6:0;
      const start=new T.Vector3(.70,4.49,-1.43);
      const end=new T.Vector3(x,gantry.position.y+.59,z);
      const cable=new T.CatmullRomCurve3([start,new T.Vector3(.42,4.58,-1.2),new T.Vector3(.12,4.54,-.72),new T.Vector3(x*.32,gantry.position.y+1.02,z*.36),end],false,'centripetal',.18);
      for(let i=0;i<33;i++){const p=cable.getPoint(i/32);tubeArray[i*3]=p.x;tubeArray[i*3+1]=p.y;tubeArray[i*3+2]=p.z;}
      tubeGeometry.attributes.position.needsUpdate=true;tubeGeometry.computeBoundingSphere();
      const orbit=.08*Math.sin(elapsed*.075)+pointerX*.075;
      camera.position.set(7.8*Math.sin(.49+orbit),5.75+pointerY*.24,7.8*Math.cos(.49+orbit));
      // Keep a safe frame around the feet and the complete filament spool.
      const frameCenter=new T.Vector3(0,2.58,0);
      const distance=camera.aspect<.78?1.66:camera.aspect<1.05?1.52:1.39;
      camera.position.sub(frameCenter).multiplyScalar(distance).add(frameCenter);
      camera.lookAt(0,2.48,0);
      model.rotation.y=-.06;
      renderer.render(scene,camera);
      progress.style.transform=`scaleX(${amount*fade})`;
      const next=paused?'Animación en pausa':printing?'Imprimiendo pieza':cycle<43?'Pieza terminada':'Preparando nueva impresión';
      if(next!==lastStatus){status.textContent=next;lastStatus=next;}
    }
    function tick(now){
      frame=0;if(disposed||paused||!visible||document.hidden)return;
      const delta=last?Math.min((now-last)/1000,.08):0;last=now;elapsed+=delta;
      // Constrained devices save work through cadence, not degraded rendering.
      const targetFps=constrained?24:quality==='medium'?30:45;
      if(now-lastRender>1000/targetFps){draw();lastRender=now;}
      frame=requestAnimationFrame(tick);
    }
    function resume(){if(!disposed&&!paused&&visible&&!document.hidden&&!frame){last=0;frame=requestAnimationFrame(tick);}}
    function suspend(){cancelAnimationFrame(frame);frame=0;last=0;}
    function updateButton(){pause.setAttribute('aria-label',paused?'Reproducir animación':'Pausar animación');pause.title=paused?'Reproducir animación':'Pausar animación';if(!window.atryMorphIcons?.set(pause,paused?'play':'pause'))pause.innerHTML=`<i class="ph ${paused?'ph-play':'ph-pause'}" aria-hidden="true"></i>`;}
    function onPause(){paused=!paused;updateButton();if(paused){suspend();draw();}else resume();}
    function onVisibility(){if(document.hidden)suspend();else resume();}
    function onMotion(){paused=reduced.matches;updateButton();if(paused){suspend();elapsed=39;draw();}else resume();}
    function onPointer(event){if(event.pointerType==='touch')return;const rect=host.getBoundingClientRect();pointerX=(event.clientX-rect.left)/rect.width-.5;pointerY=(event.clientY-rect.top)/rect.height-.5;}
    function onLeave(){pointerX=0;pointerY=0;}
    function onContextLost(event){event.preventDefault();suspend();host.classList.remove('studio-ready');status.textContent='Diseño y fabricación 3D';pause.hidden=true;}
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)resume();else suspend();},{threshold:.03});observer.observe(host);
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(viewport);
    pause.addEventListener('click',onPause);document.addEventListener('visibilitychange',onVisibility);reduced.addEventListener('change',onMotion);
    host.addEventListener('pointermove',onPointer);host.addEventListener('pointerleave',onLeave);renderer.domElement.addEventListener('webglcontextlost',onContextLost);
    if(paused)elapsed=39;resize();draw();updateButton();host.classList.add('studio-ready');window.atryMorphIcons?.scan(host);resume();
    cleanup=()=>{
      disposed=true;suspend();observer.disconnect();resizeObserver.disconnect();
      pause.removeEventListener('click',onPause);document.removeEventListener('visibilitychange',onVisibility);reduced.removeEventListener('change',onMotion);
      host.removeEventListener('pointermove',onPointer);host.removeEventListener('pointerleave',onLeave);renderer.domElement.removeEventListener('webglcontextlost',onContextLost);
      resources.forEach(r=>r.dispose());if(shadows)key.shadow.dispose();envMap?.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
    };
  }
})();
