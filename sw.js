// PR Host – service worker: la app abre sin conexión con la última copia de datos.
const V='prhost-v3';
const SHELL=['./','index.html','manifest.webmanifest','logo.png','favicon.png','icon-192.png','icon-512.png','L/cuerpo.webp','L/balcon.webp','L/baranda.webp','L/pergola.webp'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET') return;
  const isData=/\/(data\.enc|ping\.json)$/.test(u.pathname);
  const isPage=e.request.mode==='navigate'||/\/(index\.html)?$/.test(u.pathname);
  if(isData||isPage){ // red primero, caché si no hay conexión
    e.respondWith(fetch(e.request).then(r=>{ const c=r.clone(); caches.open(V).then(ca=>ca.put(isData?u.pathname:e.request,c)); return r; })
      .catch(()=>caches.match(isData?u.pathname:e.request).then(r=>r||caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{ if(res.ok&&(u.origin===location.origin||u.host.includes('fonts.g'))){const c=res.clone(); caches.open(V).then(ca=>ca.put(e.request,c));} return res; })));
});
