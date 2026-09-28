const $ = (s, p=document) => p.querySelector(s);
const $$ = (s,p=document) => [...p.querySelectorAll(s)];
const clamp = (n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const range = (n,a,b)=>clamp((n-a)/(b-a));
const mix = (a,b,p)=>a+(b-a)*p;
const smooth = n => n*n*(3-2*n);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero=$('.hero-story'), flight=$('.flight-story'), globalStory=$('.global-story'), voices=$('.voices-story');
const expItems=$$('.experience-item'),expSection=$('#experience');let expIndex=0;
const els={window:$('.window-scene'),cloud:$('.cloud-scene'),left:$('.hero-left'),right:$('.hero-right'),caption:$('.hero-caption'),cue:$('.scroll-cue'),philosophy:$('.philosophy'),veil:$('.hero-veil'),intro:$('.flight-intro'),aircraft:$('.aircraft'),jet:$('.jet'),plan:$('.cabin-plan'),fleetCopy:$('.fleet-copy'),specs:$('.fleet-specs'),cabinCopy:$('.cabin-copy'),labels:$('.cabin-labels'),progress:$('.flight-progress'),progressFill:$('.flight-progress i'),ticket:$('.boarding-pass')};
$$('.reveal-words').forEach(text=>{text.innerHTML=text.innerHTML.split('<br>').map(line=>[...line].map(c=>`<span>${c}</span>`).join('')).join('<br>')});
const letters=$$('.reveal-words span'),cards=$$('.voice-card');
// A cabin diagram stays aligned with the aircraft as its exterior dissolves.
const seats=Array.from({length:7},(_,i)=>{let y=190+i*78;return [130,210].map(x=>`<g transform="translate(${x} ${y})"><rect x="0" y="0" width="48" height="52" rx="9" fill="#b6a68b"/><rect x="5" y="4" width="38" height="31" rx="6" fill="#dccfb7"/><path d="M3 40h42" stroke="#78684f"/><rect x="-4" y="12" width="6" height="33" rx="3" fill="#89765b"/><rect x="46" y="12" width="6" height="33" rx="3" fill="#89765b"/></g>`).join('');}).join('');
els.plan.innerHTML=`<svg viewBox="0 0 390 920" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="14席の客室配置図"><defs><linearGradient id="cabinMetal"><stop stop-color="#3e3c32"/><stop offset=".5" stop-color="#c7b48b"/><stop offset="1" stop-color="#3e3c32"/></linearGradient></defs><path d="M195 16C133 75 108 115 108 205V750Q110 840 195 902Q280 840 282 750V205C282 115 257 75 195 16Z" fill="#151715" stroke="url(#cabinMetal)" stroke-width="4"/><path d="M126 197V760Q138 823 195 867Q252 823 264 760V197Q249 107 195 70Q141 107 126 197Z" fill="#292b25" stroke="#aa9771" stroke-width="1"/><path d="M159 104 178 78 192 125 154 145ZM231 104 212 78 198 125 236 145Z" fill="#53605e"/><path d="M120 168H270M120 752H270" stroke="#9f9275" stroke-width="2"/>${seats}<path d="M132 801H258M146 827H244" stroke="#7b735d" stroke-width="2"/><path d="M195 177V745" stroke="#c2b79c" stroke-opacity=".12" stroke-dasharray="3 7"/></svg>`;
let metrics={};
function measure(){const vh=innerHeight;metrics={hero:{top:hero.offsetTop,len:hero.offsetHeight-vh},flight:{top:flight.offsetTop,len:flight.offsetHeight-vh},global:{top:globalStory.offsetTop,len:globalStory.offsetHeight-vh},voices:{top:voices.offsetTop,len:voices.offsetHeight-vh},exp:{top:expSection.offsetTop,len:expSection.offsetHeight-vh}};requestTick();}
function progress(key){const r=metrics[key];return clamp((scrollY-r.top)/r.len)}
let ticking=false,activeCard=0;
function requestTick(){if(!ticking){ticking=true;requestAnimationFrame(update)}}
function update(){ticking=false;const h=progress('hero'),f=progress('flight'),g=progress('global'),v=progress('voices'),mobile=innerWidth<=600;
  const zoom=smooth(range(h,.015,.36)),exit=range(h,.26,.4),copy=1-range(h,0,.16);
  // Keep the scene viewport-sized: scaling the whole layer can leave stale
  // compositor tiles when a long return-to-top scroll reveals it again.
  els.window.style.setProperty('--window-zoom',mix(1,5.7,zoom));els.window.style.opacity=1-exit;
  els.cloud.style.transform='none';
  els.left.style.opacity=copy;els.right.style.opacity=copy;els.left.style.transform=`translateX(${-110*zoom}px)`;els.right.style.transform=`translateX(${110*zoom}px)`;
  els.caption.style.opacity=copy;els.cue.style.opacity=copy;
  const pIn=range(h,.31,.42),pOut=1-range(h,.68,.78);els.philosophy.style.opacity=pIn*pOut;els.philosophy.style.transform=`translateY(${mix(35,-35,range(h,.35,.78))}px)`;
  const reveal=range(h,.4,.64);letters.forEach((l,i)=>l.style.color=i/letters.length<reveal?'#f7efe4':'rgba(234,224,211,.23)');els.veil.style.opacity=range(h,.74,.82);
  els.intro.style.opacity=1-range(f,.27,.39);els.intro.style.transform=`translateY(${-90*range(f,0,.4)}px)`;
  const rise=smooth(range(f,0,.35)),interior=smooth(range(f,.62,.78));
  els.aircraft.style.transform=`translate(-50%,${mix(116,0,rise)}%) scale(${mix(mobile?1.4:1.7,mobile?.9:.88,range(f,.2,.43))})`;
  els.jet.style.opacity=1-interior;els.plan.style.opacity=interior;
  const specs=range(f,.33,.43)*(1-range(f,.59,.69));els.fleetCopy.style.opacity=specs;els.specs.style.opacity=specs;
  els.cabinCopy.style.opacity=range(f,.67,.8);els.labels.style.opacity=range(f,.73,.86);els.progress.style.opacity=range(f,.34,.42);els.progressFill.style.width=`${interior*100}%`;
  $('.global-footer').style.opacity=range(g,.61,.81)*.6;$('.global-heading').style.opacity=1-range(g,.12,.38);$('.global-word').style.opacity=range(g,.2,.4);canvas.style.opacity=1;if(reduced&&globeVisible)drawGlobe(0);const ticketIn=smooth(range(g,.02,.28)),ticketOut=smooth(range(g,.52,.85));els.ticket.style.transform=`translateY(${mix(innerHeight*.95,0,ticketIn)-ticketOut*innerHeight*.9}px) rotate(${mix(-17,-9,ticketIn)+ticketOut*14}deg)`;els.ticket.style.opacity=1-range(g,.78,.92);
  const e=progress('exp'),eStep=clamp(e*4,0,3.999),eIdx=Math.floor(eStep);setExperience(eIdx);expItems.forEach((b,k)=>b.style.setProperty('--fill',k<eIdx?1:k===eIdx?eStep-eIdx:0));$$('.experience-bars i').forEach((b,k)=>b.style.setProperty('--fill',k<eIdx?1:k===eIdx?eStep-eIdx:0));
  const footerWin=$('.footer-window');if(footerWin){const fr=$('#contact').getBoundingClientRect(),fp=smooth(range(1-fr.top/innerHeight,.25,.8));footerWin.style.setProperty('--open',reduced?1:fp)}
  const steps=v*3.9;activeCard=Math.min(3,Math.floor(steps+0.0001));
  cards.forEach((card,i)=>{const last=i===cards.length-1,local=clamp(steps-i),straight=smooth(range(local,0,.34)),fly=last?0:smooth(range(local,.35,1));const depth=Math.max(0,i-steps);const angle=(16+depth*2.4)*(1-straight);card.style.transform=`translate(${depth*5}px,${depth*9-fly*(innerHeight*.95)}px) rotate(${angle+fly*(i%2===0?-7:7)}deg)`;card.style.zIndex=4-i;card.style.visibility=local>=1&&!last?'hidden':'visible';card.setAttribute('aria-hidden',i===activeCard?'false':'true')});
  $('#card-index').textContent=`0${activeCard+1} / 04`;$('#prev-card').disabled=activeCard===0;$('#next-card').disabled=activeCard===3;
  document.documentElement.style.setProperty('--page-progress',`${scrollY/(document.documentElement.scrollHeight-innerHeight)*100}%`);
}
addEventListener('scroll',requestTick,{passive:true});addEventListener('resize',measure);addEventListener('load',measure);measure();
function setExperience(i){if(i===expIndex)return;expIndex=i;expItems.forEach((b,k)=>{b.classList.toggle('active',k===i);b.setAttribute('aria-expanded',k===i?'true':'false');$('.item-symbol',b).textContent=k===i?'−':'+'});const button=expItems[i],visual=$('.experience-visual'),img=$('#experience-image');visual.classList.add('changing');setTimeout(()=>{img.src=`assets/${button.dataset.image}`;img.alt=button.dataset.alt;$('.image-counter').textContent=`0${i+1} / 04`;$('.visual-num').textContent=`0${i+1}`;$('.visual-title').textContent=$('strong',button).textContent;const done=()=>visual.classList.remove('changing');img.onload=done;if(img.complete)done()},reduced?0:260)}
expItems.forEach((button,i)=>button.addEventListener('click',()=>{const r=metrics.exp;scrollTo({top:r.top+r.len*((i+.35)/4),behavior:reduced?'instant':'smooth'})}));
const cities=[['TOKYO','JAPAN / GMT +9','Asia/Tokyo'],['NEW YORK','UNITED STATES','America/New_York'],['LONDON','UNITED KINGDOM','Europe/London'],['DUBAI','UNITED ARAB EMIRATES / GMT +4','Asia/Dubai']];let cityIndex=0,cityManuallyChosen=false;
function updateClock(){const city=cities[cityIndex],time=new Intl.DateTimeFormat('en-GB',{timeZone:city[2],hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()).split(':');$('#clock-hours').textContent=time[0];$('#clock-minutes').textContent=time[1];$('#clock-city').textContent=city[0];$('#clock-zone').textContent=city[1];$$('.city-selector button').forEach((b,i)=>{b.classList.toggle('active',i===cityIndex);b.setAttribute('aria-pressed',i===cityIndex?'true':'false')})}updateClock();setInterval(updateClock,15000);if(!reduced)setInterval(()=>{if(!cityManuallyChosen&&!document.hidden){cityIndex=(cityIndex+1)%cities.length;updateClock()}},6500);
$$('.city-selector button').forEach(b=>b.addEventListener('click',()=>{cityIndex=Number(b.dataset.city);cityManuallyChosen=true;updateClock()}));
function goCard(index){const p=Math.min(1,(clamp(index,0,3)+(index>=3?.4:.002))/3.9);scrollTo({top:metrics.voices.top+metrics.voices.len*p,behavior:'instant'});requestTick()}$('#prev-card').addEventListener('click',()=>goCard(activeCard-1));$('#next-card').addEventListener('click',()=>goCard(activeCard+1));
const dialog=$('#inquiry-dialog');$$('[data-inquiry]').forEach(b=>b.addEventListener('click',()=>{dialog.showModal()}));$('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});$('#inquiry-form').addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.currentTarget);$('#inquiry-result').hidden=false;$('#inquiry-result').textContent=`${data.get('from')} → ${data.get('to')} ／ ${data.get('date')} ／ ${data.get('passengers')}。旅のイメージを承りました。こちらはデモのため、予約・送信は行われません。`});
$('.scroll-cue').addEventListener('click',e=>{e.preventDefault();scrollTo({top:metrics.hero.top+metrics.hero.len*.47,behavior:reduced?'instant':'smooth'})});
// Geographic globe. Land points are sampled from Natural Earth public-domain data.
const canvas=$('#globe'),ctx=canvas.getContext('2d');let globeVisible=false,globeFrame=0,lastDraw=0,globeSize={w:0,h:0,dpr:1};
const rad=Math.PI/180;
const globeLand=(window.ARCHER_LAND||[]).map(([lon,lat])=>({x:Math.cos(lat*rad)*Math.sin(lon*rad),y:Math.sin(lat*rad),z:Math.cos(lat*rad)*Math.cos(lon*rad)}));
const ports=[[139.69,35.68],[-74.01,40.71],[-.12,51.51],[55.27,25.2],[103.82,1.35],[2.35,48.86],[151.21,-33.87],[18.42,-33.92],[-43.2,-22.9],[-118.24,34.05],[72.88,19.08],[28.98,41.01]];
const vector=([lon,lat])=>[Math.cos(lat*rad)*Math.sin(lon*rad),Math.sin(lat*rad),Math.cos(lat*rad)*Math.cos(lon*rad)];
const portVectors=ports.map(vector);
const routePairs=[[0,4],[0,1],[0,6],[3,2],[3,4],[2,5],[2,1],[1,9],[1,8],[7,3],[7,8],[10,3],[4,6],[11,10],[5,11],[9,0]];
const routes=routePairs.map(([a,b],index)=>{const A=portVectors[a],B=portVectors[b],angle=Math.acos(clamp(A.reduce((s,n,i)=>s+n*B[i],0),-1,1));const sin=Math.sin(angle);return Array.from({length:61},(_,i)=>{const t=i/60,aa=Math.sin((1-t)*angle)/sin,bb=Math.sin(t*angle)/sin,r=1+Math.sin(Math.PI*t)*(.12+angle*.08);return {x:(A[0]*aa+B[0]*bb)*r,y:(A[1]*aa+B[1]*bb)*r,z:(A[2]*aa+B[2]*bb)*r}})});
function sizeGlobe(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);globeSize={w:r.width,h:r.height,dpr};canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(!globeVisible)drawGlobe(0)}
function drawGlobe(now){const {w,h}=globeSize;if(!w||!h)return;ctx.clearRect(0,0,w,h);const mobile=w<=600,settle=smooth(range(progress('global'),.12,.38)),r=mix(Math.min(w*(mobile?.29:.23),h*.32),Math.min(w*(mobile?.43:.275),h*.38),settle),cx=w*mix(mobile?.5:.70,.5,settle),cy=h*mix(mobile?.74:.56,mobile?.59:.62,settle),rotation=(reduced?.8:now*.000065)+.7,tilt=-.17,cr=Math.cos(rotation),sr=Math.sin(rotation),ct=Math.cos(tilt),st=Math.sin(tilt);
 const project=p=>{const x=p.x*cr+p.z*sr,z=-p.x*sr+p.z*cr,y=p.y*ct-z*st,zz=p.y*st+z*ct;return {x:cx+x*r,y:cy-y*r,z:zz}};
 const glow=ctx.createRadialGradient(cx,cy,r*.9,cx,cy,r*1.16);glow.addColorStop(0,'rgba(179,151,95,.12)');glow.addColorStop(.5,'rgba(160,137,90,.035)');glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(cx-r*1.2,cy-r*1.2,r*2.4,r*2.4);
 const sphere=ctx.createRadialGradient(cx-r*.4,cy-r*.35,r*.08,cx,cy,r);sphere.addColorStop(0,'#33372e');sphere.addColorStop(.55,'#20251f');sphere.addColorStop(1,'#090e0d');ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle=sphere;ctx.fill();ctx.strokeStyle='#c4ad772b';ctx.lineWidth=1;ctx.stroke();
 function segment(points,color,width){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();let started=false;points.forEach(p=>{const q=project(p);if(q.z>=0){if(!started){ctx.moveTo(q.x,q.y);started=true}else ctx.lineTo(q.x,q.y)}else started=false});ctx.stroke()}
 for(let lat=-60;lat<=60;lat+=30){const a=Array.from({length:121},(_,i)=>{const lon=i*3*rad;return{x:Math.cos(lat*rad)*Math.sin(lon),y:Math.sin(lat*rad),z:Math.cos(lat*rad)*Math.cos(lon)}});segment(a,'rgba(174,157,117,.085)',.6)}
 for(let lon=0;lon<360;lon+=30){const a=Array.from({length:91},(_,i)=>{const lat=(-90+i*2)*rad;return{x:Math.cos(lat)*Math.sin(lon*rad),y:Math.sin(lat),z:Math.cos(lat)*Math.cos(lon*rad)}});segment(a,'rgba(174,157,117,.07)',.6)}
 for(const p of globeLand){const q=project(p);if(q.z<0)continue;const size=(mobile?1.05:1.65)*(.6+q.z*.4);ctx.fillStyle=`rgba(191,180,147,${.35+.6*q.z})`;ctx.fillRect(q.x-size/2,q.y-size/2,size,size)}
 routes.forEach((points,i)=>{segment(points,'rgba(199,167,105,.44)',.85);const t=((now*.00011+i*.163)%1),index=Math.floor(t*60),q=project(points[index]);const q2=project(points[Math.min(60,index+1)]);if(q.z>.02){ctx.shadowBlur=10;ctx.shadowColor='#e8c786';ctx.fillStyle='#e8d1a5';ctx.beginPath();ctx.arc(q.x,q.y,1.8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;const start=Math.max(0,index-8);segment(points.slice(start,index+1),'rgba(229,203,149,.7)',1)}});
 portVectors.forEach(v=>{const q=project({x:v[0]*1.002,y:v[1]*1.002,z:v[2]*1.002});if(q.z<0)return;ctx.fillStyle='#d9c398';ctx.beginPath();ctx.arc(q.x,q.y,2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d9c39840';ctx.beginPath();ctx.arc(q.x,q.y,5,0,Math.PI*2);ctx.stroke()});
}
function animateGlobe(now){if(!globeVisible)return;if(now-lastDraw>32){drawGlobe(now);lastDraw=now}if(!reduced)globeFrame=requestAnimationFrame(animateGlobe)}
new IntersectionObserver(entries=>{globeVisible=entries[0].isIntersecting;cancelAnimationFrame(globeFrame);if(globeVisible)globeFrame=requestAnimationFrame(animateGlobe)},{rootMargin:'100px'}).observe(canvas);addEventListener('resize',sizeGlobe);sizeGlobe();
