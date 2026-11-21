(() => {
 const safe = v => {try {const u=new URL(v,location.href);return ['https:','mailto:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null;}catch{return null;}};
 const originals = Array.from(document.querySelectorAll('#work figure.work-item'));
 function apply(c) {
  if(!c)return;
  document.querySelectorAll('[data-sarkar-field]').forEach(el=>{const v=c[el.dataset.sarkarField];if(typeof v==='string'&&v.trim()&&el.textContent.trim()!==v)el.textContent=v;});
  if(Array.isArray(c.gallery)){
   const grids=Array.from(document.querySelectorAll('#work .work-grid'));
   grids.forEach(g=>g.replaceChildren());
   c.gallery.filter(x=>x.visible).forEach(p=>{
    const source=p.url.startsWith('original:')?originals[Number(p.url.slice(9))]:null;
    const el=source?source:document.createElement('figure');
    if(!source)el.className='work-item';
    let img=el.querySelector('img');if(!img){img=document.createElement('img');el.append(img);}
    if(!source){const url=safe(p.url);if(!url)return;img.src=url;}
    const unchanged=!!source&&source.querySelector('figcaption')?.textContent===p.title&&img.alt===p.description;
    img.alt=p.description||p.title;img.loading='lazy';
    let caption=el.querySelector('figcaption');if(!caption){caption=document.createElement('figcaption');el.append(caption);}
    if(!unchanged){caption.replaceChildren();const title=document.createElement('span');title.className='placement';title.textContent=p.title;caption.append(title,document.createTextNode(p.description||''));}
    el.tabIndex=0;if(!source)img.addEventListener('touchstart',()=>el.classList.toggle('touched'),{passive:true});
    (grids[p.group]||grids[0])?.append(el);
   });
   document.querySelectorAll('#work .work-group').forEach(g=>{g.hidden=!g.querySelector('.work-item');});
   document.querySelectorAll('#work .work-folder').forEach(f=>{const items=f.querySelectorAll('.work-item');f.hidden=!items.length;const count=f.querySelector('.fc-count');if(count)count.textContent=items.length+' pieces';const img=f.querySelector('.folder-cover img'),first=items[0]?.querySelector('img');if(img&&first){img.src=first.src;img.alt=first.alt;}});
  }
  if(c.seo){if(c.seo.title)document.title=c.seo.title;for(const [name,value,property] of [['description',c.seo.description,false],['og:title',c.seo.title,true],['og:description',c.seo.description,true],['og:image',c.seo.image,true]]){if(!value)continue;let el=document.querySelector('meta['+(property?'property':'name')+'="'+name+'"]');if(!el){el=document.createElement('meta');el.setAttribute(property?'property':'name',name);document.head.append(el);}el.content=value;}}
  if(Array.isArray(c.sections)){const parent=document.querySelector('main');c.sections.forEach(s=>{const el=document.getElementById(s.id);if(!el||!parent||el.parentElement!==parent)return;el.hidden=!s.visible;parent.append(el);const heading=el.querySelector('h2'),desc=el.querySelector('.sec-head > p:not(.sec-kicker)');if(s.title&&heading)heading.textContent=s.title;if(s.description&&desc)desc.textContent=s.description;});}
  if(Array.isArray(c.menu)){const nav=document.querySelector('.nav-links');if(nav){const links=c.menu.filter(x=>x.visible).map(x=>{const a=document.createElement('a');a.textContent=x.label;a.href=x.href.startsWith('#')?x.href:safe(x.href)||'#';if(x.href==='#book'){a.addEventListener('click',e=>{e.preventDefault();document.querySelector('.hero-actions [data-book-btn]')?.click();});}return a;});nav.replaceChildren(...links);}}
  if(c.links){const shop=document.querySelector('.art-shop-cta');if(shop){shop.href=safe(c.links.shop)||shop.href;shop.textContent=c.links.shopLabel;}
   document.querySelectorAll('a[href^="https://www.instagram.com/jphantattoo"]').forEach(a=>a.href=safe(c.links.instagram)||a.href);
   document.querySelectorAll('a[href^="mailto:"]').forEach(a=>a.href=safe(c.links.contact)||a.href);
   document.querySelectorAll('a[href^="https://hanscript.jphantattoo.com"]').forEach(a=>a.href=safe(c.links.hanscript)||a.href);
   document.querySelectorAll('.hero-actions [data-book-btn]').forEach(a=>a.textContent=c.links.bookingLabel);
  }
  if(c.booking){try{const u=new URL(c.booking);if(u.origin==='https://calendly.com'&&!u.search&&!u.hash)document.querySelectorAll('a[data-book-btn][href^="https://calendly.com/"],#bfCalLink').forEach(a=>a.href=u.href);}catch{}}
  if(c.bookingSettings){const b=c.bookingSettings;let open=b.status!=='closed';if(b.status==='scheduled'){const now=Date.now();open=b.quarters.some(q=>q.opens&&q.closes&&now>=Date.parse(q.opens)&&now<Date.parse(q.closes));}
   document.querySelectorAll('[data-book-btn],.nav-links a[href="#book"]').forEach(a=>{a.hidden=!b.visible;a.setAttribute('aria-disabled',String(!open));if(!open)a.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();},true);});
   let message=document.querySelector('[data-sarkar-booking-message]');if(!message){message=document.createElement('p');message.dataset.sarkarBookingMessage='';document.querySelector('#book .wrap')?.prepend(message);}if(message)message.textContent=b.message;
  }
  if(c.notice?.visible&&c.notice.text){const n=document.createElement('aside');n.className='wrap';n.setAttribute('aria-label','Announcement');n.textContent=c.notice.text;document.querySelector('main')?.prepend(n);}
  document.documentElement.dataset.sarkarRevision=c._sarkar?.revision||'legacy';
 }
 if(window.__SARKAR_PREVIEW__)apply(window.__SARKAR_PREVIEW__);
 else fetch('/sarkar-homepage.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(apply).catch(()=>{});
})();