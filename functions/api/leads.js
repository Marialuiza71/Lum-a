import {db,json,fail,getUser} from '../_lib/auth.js';
export async function onRequestGet({request,env}) {
 try {
  if(!await getUser(request,env))return fail('Acesso não autorizado.',401);
  const url=new URL(request.url),page=Math.max(1,Math.min(10000,Number(url.searchParams.get('page'))||1)),limit=50;
  const result=await db(env).prepare('SELECT id,name,email,hair_type,source,created_at FROM leads ORDER BY created_at DESC LIMIT ? OFFSET ?').bind(limit,(page-1)*limit).all();
  const total=await db(env).prepare('SELECT COUNT(*) AS n FROM leads').first();
  return json({leads:result.results,total:total.n,page,pages:Math.ceil(total.n/limit)});
 }catch(e){console.error('leads',e);return fail('Falha ao buscar cadastros.',500);}
}
