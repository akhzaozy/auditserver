(()=>{var a={};a.id=836,a.ids=[836],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},3033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3167:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>z,patchFetch:()=>y,routeModule:()=>u,serverHooks:()=>x,workAsyncStorage:()=>v,workUnitAsyncStorage:()=>w});var d=c(9225),e=c(4006),f=c(8317),g=c(9373),h=c(4775),i=c(4235),j=c(261),k=c(4365),l=c(771),m=c(3461),n=c(7798),o=c(2280),p=c(2018),q=c(5696),r=c(7929),s=c(6439),t=c(7527);let u=new d.AppRouteRouteModule({definition:{kind:e.RouteKind.APP_ROUTE,page:"/api/agent/install.sh/route",pathname:"/api/agent/install.sh",filename:"route",bundlePath:"app/api/agent/install.sh/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/akhzafachrozy/antigravity/audit system/src/app/api/agent/install.sh/route.ts",nextConfigOutput:"",userland:()=>c(7424),...{}}),{workAsyncStorage:v,workUnitAsyncStorage:w,serverHooks:x}=u;function y(){return(0,f.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:w})}async function z(a,b,c){c.requestMeta&&(0,g.setRequestMeta)(a,c.requestMeta),u.isDev&&(0,g.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/agent/install.sh/route";"/index"===d&&(d="/");let f=await u.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!f)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:v,deploymentId:w,params:x,nextConfig:y,parsedUrl:z,isDraftMode:A,prerenderManifest:B,routerServerContext:C,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,resolvedPathname:F,clientReferenceManifest:G,serverActionsManifest:H}=f,I=(0,j.normalizeAppPath)(d),J=!!(B.dynamicRoutes[I]||B.routes[F]),K=async()=>((null==C?void 0:C.render404)?await C.render404(a,b,z,!1):b.end("This page could not be found"),null);if(J&&!A){let a=!!B.routes[F],b=B.dynamicRoutes[I];if(b&&!1===b.fallback&&!a){if(y.adapterPath)return await K();throw new s.NoFallbackError}}let L=null;!J||u.isDev||A||(L="/index"===(L=F)?"/":L);let M=!0===u.isDev||!J,N=J&&!M;H&&G&&(0,i.setManifestsSingleton)({page:d,clientReferenceManifest:G,serverActionsManifest:H});let O=a.method||"GET",P=(0,h.getTracer)(),Q=P.getActiveScopeSpan(),R=!!(null==C?void 0:C.isWrappedByNextServer),S=!!(0,g.getRequestMeta)(a,"minimalMode"),T=(0,g.getRequestMeta)(a,"incrementalCache")||await u.getIncrementalCache(a,y,B,S);null==T||T.resetRequestCache(),globalThis.__incrementalCache=T;let U={params:x,previewProps:B.preview,renderOpts:{experimental:{authInterrupts:!!y.experimental.authInterrupts,useCacheTimeout:y.experimental.useCacheTimeout},cacheComponents:!!y.cacheComponents,validationLevel:y.experimental.instantInsights.validationLevel,supportsDynamicResponse:M,incrementalCache:T,hmrRefreshHash:(0,g.getRequestMeta)(a,"hmrRefreshHash"),cacheLifeProfiles:y.cacheLife,staticPageGenerationTimeout:y.staticPageGenerationTimeout,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d,e)=>u.onRequestError(a,b,d,e,C)},sharedContext:{buildId:v,deploymentId:w}},V=new k.NodeNextRequest(a),W=new k.NodeNextResponse(b),X=l.NextRequestAdapter.fromNodeNextRequest(V,(0,l.signalFromNodeResponse)(b)),Y=async({previousCacheEntry:e})=>{try{if(!S&&D&&E&&!e)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await u.handle(X,U);a.fetchMetrics=U.renderOpts.fetchMetrics;let f=U.renderOpts.pendingWaitUntil;f&&c.waitUntil&&(c.waitUntil(f),f=void 0);let g=U.renderOpts.collectedTags;if(!J)return await (0,o.I)(V,W,d,f),null;{let a=await d.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(d.headers);g&&(b[r.NEXT_CACHE_TAGS_HEADER]=g),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==U.renderOpts.collectedRevalidate&&!(U.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&U.renderOpts.collectedRevalidate,e=void 0===U.renderOpts.collectedExpire||U.renderOpts.collectedExpire>=r.INFINITE_CACHE?!1!==c&&c>0?y.expireTime:void 0:U.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==e?void 0:e.isStale)&&await u.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,n.getRevalidateReason)({isStaticGeneration:N,isOnDemandRevalidate:D})},!1,C),b}},Z=async(d,f)=>{try{var g,i;let d=await u.handleResponse({req:a,nextConfig:y,cacheKey:L,routeKind:e.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:B,isRoutePPREnabled:!1,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,responseGenerator:Y,waitUntil:c.waitUntil,isMinimalMode:S});if(!J)return;if((null==d||null==(g=d.value)?void 0:g.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(i=d.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});S||b.setHeader("x-nextjs-cache",D?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),A&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let f=(0,p.fromNodeOutgoingHttpHeaders)(d.value.headers);S&&J||f.delete(r.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||b.getHeader("Cache-Control")||f.get("Cache-Control")||f.set("Cache-Control",(0,q.getCacheControlHeader)(d.cacheControl)),await (0,o.I)(V,W,new Response(d.value.body,{headers:f,status:d.value.status||200}));return}catch(b){if(b instanceof s.NoFallbackError||await u.onRequestError(a,b,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,n.getRevalidateReason)({isStaticGeneration:N,isOnDemandRevalidate:D})},!1,C),J)throw b;await (0,o.I)(V,W,new Response(null,{status:500}));return}finally{(()=>{if(!d)return;let a=b.statusCode;d.setAttributes({"http.status_code":a,"next.rsc":!1}),a&&a>=500&&(d.setStatus({code:h.SpanStatusCode.ERROR}),d.setAttribute("error.type",a.toString()));let c=P.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==m.BaseServerSpan.handleRequest)return console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route")||I,g=`${O} ${e}`;d.setAttributes({"next.route":e,"http.route":e,"next.span_name":g}),d.updateName(g),f&&f!==d&&(f.setAttribute("http.route",e),f.updateName(g))})()}};if(R&&Q)await Z(Q,void 0);else{let b=P.getActiveScopeSpan();await P.withPropagatedContext(a.headers,()=>P.trace(m.BaseServerSpan.handleRequest,{spanName:`${O} ${d}`,kind:h.SpanKind.SERVER,attributes:{"http.method":O,"http.target":a.url}},a=>Z(a,b)),void 0,!R)}}},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},6487:()=>{},7424:(a,b,c)=>{"use strict";c.r(b),c.d(b,{GET:()=>e});var d=c(3211);async function e(a){let b=a.headers.get("host")||"auditsentinel.akhzafachrozy.my.id",c=b.includes("localhost")?"http":"https",e=`${c}://${b}`,f=`#!/usr/bin/env bash
# ==============================================================================
# Sentinel Linux Security Audit Agent Installer
# Auto-generated by Sentinel Dashboard (${e})
# ==============================================================================

set -eo pipefail

echo -e "\\033[1;33m"
cat << 'EOF'
  ___ ___ _  _ _____ ___ _  _ ___ _    
 / __| __| \\| |_   _|_ _| \\| | __| |   
 \\__ \\ _|| .  | | |  | || .  | _|| |__ 
 |___/___|_|\\_| |_| |___|_|\\_|___|____|
 Linux Security Audit & Hardening Agent
EOF
echo -e "\\033[0m"

if [ "$EUID" -ne 0 ]; then
  echo -e "\\033[0;31m[ERROR] Please run installer as root or with sudo.\\033[0m"
  exit 1
fi

INSTALL_DIR="/usr/local/bin"
CONFIG_DIR="/etc/sentinel"
BIN_TARGET="$INSTALL_DIR/sentinel"

mkdir -p "$CONFIG_DIR" "$INSTALL_DIR" /var/lib/sentinel /var/backups/sentinel

echo "[1/3] Downloading latest Sentinel Agent script..."
curl -fsSL "${e}/sentinel-agent.sh" -o "$BIN_TARGET" || \\
curl -fsSL "https://raw.githubusercontent.com/sentinel-sec/agent/main/sentinel-agent.sh" -o "$BIN_TARGET" 2>/dev/null || true

if [ ! -s "$BIN_TARGET" ]; then
  echo "[1/3] Fallback: Writing embedded agent executable..."
  cat << 'AGENT_EOF' > "$BIN_TARGET"
#!/usr/bin/env bash
echo "Sentinel Linux Audit Agent v1.4.2"
# Download complete agent script
curl -fsSL "${e}/api/agent/agent.sh" -o /usr/local/bin/sentinel
chmod +x /usr/local/bin/sentinel
exec /usr/local/bin/sentinel "$@"
AGENT_EOF
fi

chmod +x "$BIN_TARGET"
echo -e "\\033[0;32m[2/3] Sentinel binary installed to $BIN_TARGET\\033[0m"

echo "[3/3] Setting up configuration template..."
cat << EOF > "$CONFIG_DIR/config.json"
{
  "server": "${e}",
  "token": "sentinel_auto_$(date +%s)",
  "server_id": "$(hostname)",
  "registered_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
chmod 600 "$CONFIG_DIR/config.json"

echo -e "\\033[1;32m"
echo "=========================================================="
echo " Sentinel Agent Installed Successfully! "
echo "=========================================================="
echo -e "\\033[0m"
echo "To connect to your dashboard, run:"
echo -e "  \\033[1;36msentinel register --token <YOUR_AGENT_TOKEN> --server ${e}\\033[0m"
echo ""
echo "To execute your first security audit:"
echo -e "  \\033[1;36msentinel audit\\033[0m"
echo ""
`;return new d.NextResponse(f,{headers:{"Content-Type":"text/plain; charset=utf-8"}})}},8128:a=>{"use strict";a.exports=require("next/dist/server/runtime-reacts.external.js")},8335:()=>{},9121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},9294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[445,813],()=>b(b.s=3167));module.exports=c})();