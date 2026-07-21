document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menu = document.querySelector('.menu-toggle'), nav = document.querySelector('#site-nav');
  menu?.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') === 'true'; menu.setAttribute('aria-expanded', String(!open)); nav?.classList.toggle('open', !open); });
  const glow = document.querySelector('.cursor-glow');
  window.addEventListener('pointermove', e => { if (glow) glow.style.transform = `translate3d(${e.clientX-180}px,${e.clientY-180}px,0)`; document.documentElement.style.setProperty('--mx', `${e.clientX/window.innerWidth-.5}`); document.documentElement.style.setProperty('--my', `${e.clientY/window.innerHeight-.5}`); }, {passive:true});
  if (!window.gsap || reduceMotion) return; gsap.registerPlugin(ScrollTrigger);
  gsap.from('.hero-copy > *',{y:36,opacity:0,duration:1,stagger:.1,ease:'power3.out'}); gsap.from('.orion-visual',{x:60,opacity:0,scale:1.04,duration:1.5,ease:'power3.out'});
  gsap.to('.orion-visual',{yPercent:5,scale:1.035,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
  gsap.utils.toArray('.reveal').forEach(el=>gsap.from(el,{y:50,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 84%'}}));
  const flow=document.querySelector('.ticker-flow'); if(flow){const distance=Math.max(0,flow.scrollWidth-innerWidth+80);gsap.to(flow,{x:-distance,ease:'none',scrollTrigger:{trigger:'.ticker-section',start:'top top',end:`+=${distance}`,scrub:1,pin:'.ticker-pin',invalidateOnRefresh:true}})}
  const line=document.querySelector('.journey-line path'); if(line){const length=line.getTotalLength();gsap.set(line,{strokeDasharray:length,strokeDashoffset:length});gsap.to(line,{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:'.journey',start:'top 70%',end:'bottom 75%',scrub:1}})}
  gsap.from('.node-core',{scale:.55,scrollTrigger:{trigger:'.network-section',start:'top 65%',end:'center center',scrub:1}});gsap.from('.network-lines path',{strokeDasharray:450,strokeDashoffset:450,scrollTrigger:{trigger:'.network-section',start:'top 55%',end:'center center',scrub:1}});gsap.from('.network-node:not(.node-core)',{scale:0,opacity:0,stagger:.08,ease:'back.out(1.7)',scrollTrigger:{trigger:'.network-section',start:'top 48%'}});
  const cards=[...document.querySelectorAll('.swap-card')],items=[...document.querySelectorAll('.cap-item')];let order=cards.map((_,i)=>i),timer;
  const place=(animate=false)=>order.forEach((idx,slot)=>gsap[animate?'to':'set'](cards[idx],{x:slot*28,y:slot*-22,z:slot*-70,rotateZ:slot*1.4,zIndex:cards.length-slot,duration:.75,ease:'power3.inOut'}));
  const activate=index=>{const slot=order.indexOf(index);if(slot<0)return;order=[...order.slice(slot),...order.slice(0,slot)];place(true);items.forEach((item,i)=>item.classList.toggle('active',i===index));};place();
  items.forEach((item,i)=>item.addEventListener('mouseenter',()=>{clearInterval(timer);activate(i)}));const stage=document.querySelector('.card-stage');timer=setInterval(()=>activate(order[1]),4200);stage?.addEventListener('mouseenter',()=>clearInterval(timer));stage?.addEventListener('mouseleave',()=>timer=setInterval(()=>activate(order[1]),4200));
});
