import http from 'node:http';
import {publicRequestPath,isPrivateRequestPath} from './private-request-path.mjs';

export default function quoteMailIntegration() {
  return {name:'private-quote-mail',hooks:{'astro:config:setup':({updateConfig})=>{
    updateConfig({vite:{plugins:[{name:'quote-mail-development-endpoint',configureServer(server){
      server.middlewares.use((request,response,next)=>{
        const pathname=publicRequestPath(request.url);
        if(pathname===null){response.writeHead(400,{'Content-Type':'application/json','Cache-Control':'no-store'});response.end('{"ok":false}');return;}
        if(pathname!=='/api/quote.php'&&(isPrivateRequestPath(pathname)||pathname.toLowerCase().startsWith('/api/'))){response.writeHead(404,{'Content-Type':'application/json','Cache-Control':'no-store','X-Robots-Tag':'noindex'});response.end('{"ok":false}');return;}
        if(pathname!=='/api/quote.php')return next();
        if(pathname!=='/api/quote.php'){response.writeHead(404,{'Content-Type':'application/json','X-Robots-Tag':'noindex'});response.end('{"ok":false}');return;}
        const unavailable=()=>{if(!response.headersSent)response.writeHead(503,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex'});response.end(JSON.stringify({ok:false,message:'Your enquiry was not sent. Please email info@cncpioneer.com.'}));};
        const target=process.env.CNCP_QUOTE_DEV_SERVER;
        if(!target)return unavailable();
        let destination;try{destination=new URL('/api/quote.php',target);}catch{return unavailable();}
        if(destination.protocol!=='http:'||!['127.0.0.1','localhost','[::1]'].includes(destination.hostname))return unavailable();
        const proxy=http.request(destination,{method:request.method,headers:{...request.headers,host:destination.host}},upstream=>{
          response.writeHead(upstream.statusCode||503,upstream.headers);upstream.pipe(response);
        });
        proxy.on('error',unavailable);request.on('aborted',()=>proxy.destroy());request.pipe(proxy);
      });
    }}]}});
  }}};
}
