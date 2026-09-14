import { createMorph } from 'morphicons/dom';

const NS='http://www.w3.org/2000/svg';
const paths={
  pause:'M9 5v14M15 5v14',
  play:'M8 5v14l11-7Z',
  plus:'M12 5v14M5 12h14',
  pencil:'M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4ZM14 6l4 4',
  chevronDown:'M6 9l6 6 6-6',
  chevronUp:'M6 15l6-6 6 6',
  ruler:'M4 17 17 4l3 3L7 20l-3-3ZM12 9l3 3M9 12l2 2M6 15l3 3',
  rulerAlt:'M3 16 16 3l5 5L8 21l-5-5ZM12 8l4 4M9 11l2 2M6 14l4 4',
  clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  clockAlt:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l-4 2',
  truck:'M3 6h11v10H3V6ZM14 10h4l3 3v3h-7v-6ZM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  truckAlt:'M2 7h11v9H2V7ZM13 10h5l3 4v2h-8v-6ZM6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  card:'M3 6h18v12H3V6ZM3 10h18M7 15h4',
  cardAlt:'M4 5h16v14H4V5ZM4 9h16M15 15h2M7 15h4',
  upRight:'M7 17 17 7M8 7h9v9',
  arrowRight:'M5 12h14M13 6l6 6-6 6'
};
const controls=new WeakMap();

function enhance(button,name,initial){
  if(controls.has(button))return controls.get(button);
  const previous=button.querySelector('.ph');
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.classList.add('morph-icon');
  const path=document.createElementNS(NS,'path');path.setAttribute('d',paths[initial]);svg.append(path);
  if(previous)previous.replaceWith(svg);else button.append(svg);
  const morph=createMorph(path,paths[initial],{reducedMotion:'user'});
  const controller={name,current:initial,set(next){if(!paths[next]||next===this.current)return;morph.morphTo(paths[next],'smooth');this.current=next;}};
  controls.set(button,controller);return controller;
}

function scan(root=document){
  root.querySelectorAll?.('[data-morph="pause"]').forEach(button=>enhance(button,'pause',button.getAttribute('aria-label')?.startsWith('Reproducir')?'play':'pause'));
  document.querySelectorAll('[data-morph="create"]').forEach(button=>enhance(button,'create',button.classList.contains('active')?'pencil':'plus').set(button.classList.contains('active')?'pencil':'plus'));
  root.querySelectorAll?.('.faq details').forEach(detail=>{
    let button=detail.querySelector('summary');
    if(!button.querySelector('.morph-icon')){const holder=document.createElement('i');holder.className='faq-morph';button.append(holder);enhance(holder,'faq',detail.open?'chevronUp':'chevronDown');}
    const controller=controls.get(button.querySelector('.faq-morph'));
    if(!detail.dataset.morphBound){detail.dataset.morphBound='true';detail.addEventListener('toggle',()=>controller?.set(detail.open?'chevronUp':'chevronDown'));}
  });
  const hoverPairs={
    'trust-ruler':['ruler','rulerAlt'],
    'trust-clock':['clock','clockAlt'],
    'trust-truck':['truck','truckAlt'],
    'trust-card':['card','cardAlt'],
    outbound:['upRight','arrowRight']
  };
  Object.entries(hoverPairs).forEach(([name,[rest,active]])=>root.querySelectorAll?.(`[data-morph="${name}"]`).forEach(holder=>{
    const controller=enhance(holder,name,rest);const hit=holder.closest('article,a,button')||holder;
    if(holder.dataset.morphBound)return;holder.dataset.morphBound='true';
    hit.addEventListener('pointerenter',()=>controller.set(active));hit.addEventListener('pointerleave',()=>controller.set(rest));
    hit.addEventListener('focusin',()=>controller.set(active));hit.addEventListener('focusout',()=>controller.set(rest));
  }));
}

function set(button,state){const controller=controls.get(button)||enhance(button,button.dataset.morph||'icon',state);controller?.set(state);return Boolean(controller);}
window.atryMorphIcons={scan,set};
scan(document);
