import {db,json} from '../../_lib/auth.js';
function trpcError(message,code,status) {return json({error:{message,code:-32600,data:{code,httpStatus:status,path:'leads.capture'}}},status);}
export async function onRequestPost({request,env,params}) {
 if(params.procedure!=='leads.capture')return trpcError('Procedimento não encontrado.','NOT_FOUND',404);
 let data;try {data=await request.json();}catch{return trpcError('JSON inválido.','BAD_REQUEST',400);}
 const input=data?.json??data;
 if(!input||typeof input!=='object')return trpcError('Entrada inválida.','BAD_REQUEST',400);
 const name=String(input.name||'').trim(),email=String(input.email||'').trim().toLowerCase(),hairType=String(input.hairType||'nao-sei').slice(0,60),source=String(input.source||'landing').slice(0,60);
 if(String(input.website||'').trim())return json({result:{data:{json:{ok:true}}}});
 if(input.consent!==true || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||name.length>120|| (source==='landing'&&name.length<2))
  return trpcError('Confira os dados e aceite o consentimento.','BAD_REQUEST',400);
 try {
  await db(env).prepare('INSERT INTO leads (id,name,email,hair_type,source,consent) VALUES (?,?,?,?,?,1)')
   .bind(crypto.randomUUID(),name||null,email,hairType,source).run();
  return json({result:{data:{json:{ok:true}}}});
 }catch(e){console.error('lead insert',e);return trpcError('Falha ao salvar o cadastro.','INTERNAL_SERVER_ERROR',500);}
}
export async function onRequestGet(){return trpcError('Método não permitido.','METHOD_NOT_SUPPORTED',405);}
