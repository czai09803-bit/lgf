/* 每日练功房 · 离线缓存。页面本身“先用缓存、后台更新”，所以没网也能打开；AI、新闻、同步请求一律直连网络。 */
const CACHE="lgf-v2026.11.16";
const CORE=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("lgf-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
  const same=u.origin===location.origin,font=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(!same&&!font)return;                                   /* API、新闻、GitHub：不缓存 */
  if(same&&r.mode==="navigate"){                            /* 页面：先给缓存，同时去网上拿新版 */
    e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match("./index.html")||await c.match("./");
      const net=fetch(r).then(res=>{if(res.ok)c.put("./index.html",res.clone());return res}).catch(()=>null);
      if(hit){e.waitUntil(net);return hit}return (await net)||new Response("没有网络，且还没缓存过练功房。请联网后再打开一次。",{headers:{"content-type":"text/plain;charset=utf-8"}})}));return}
  e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(r);
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque"))c.put(r,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}return (await net)||Response.error()}))});
