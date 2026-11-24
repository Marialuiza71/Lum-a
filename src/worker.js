// Luméa: Worker + static assets + D1. All /api routes return JSON.
import {onRequestPost as capturePost, onRequestGet as captureGet} from '../functions/api/trpc/[procedure].js';
import {onRequestGet as leadsGet} from '../functions/api/leads.js';
import {onRequestGet as setupGet, onRequestPost as setupPost} from '../functions/api/auth/setup.js';
import {onRequestPost as loginPost} from '../functions/api/auth/login.js';
import {onRequestPost as logoutPost} from '../functions/api/auth/logout.js';
import {onRequestGet as meGet} from '../functions/api/auth/me.js';
import {json} from '../functions/_lib/auth.js';

const routes = {
 '/api/leads': {GET:leadsGet},
 '/api/auth/setup': {GET:setupGet,POST:setupPost},
 '/api/auth/login': {POST:loginPost},
 '/api/auth/logout': {POST:logoutPost},
 '/api/auth/me': {GET:meGet},
};
export default {
 async fetch(request,env,ctx) {
  const url=new URL(request.url),path=url.pathname;
  if(path.startsWith('/api/')) {
   const trpc=path.match(/^\/api\/trpc\/([^/]+)\/?$/);
   const methods=trpc ? {POST:capturePost,GET:captureGet} : routes[path];
   if(!methods)return json({error:'Rota da API não encontrada.'},404);
   const handler=methods[request.method];
   if(!handler)return json({error:'Método não permitido.'},405);
   try {return await handler({request,env,ctx,params:trpc?{procedure:decodeURIComponent(trpc[1])}:{}});}
   catch(error){console.error('Luméa API',path,error);return json({error:'Erro interno na API. Verifique o binding DB e as tabelas no D1.'},500);}
  }
  if(path==='/admin'||path==='/login'||path==='/painel') {
   const target=path==='/admin'||path==='/login'?'/login.html':'/painel.html';
   return Response.redirect(new URL(target,url),302);
  }
  // SPA routes are served from index.html; missing actual files stay 404.
  const response=await env.ASSETS.fetch(request);
  if(response.status!==404)return response;
  if(request.method==='GET' && !path.includes('.') && !path.startsWith('/api/')) {
   return env.ASSETS.fetch(new Request(new URL('/index.html',url),request));
  }
  return response;
 }
};
