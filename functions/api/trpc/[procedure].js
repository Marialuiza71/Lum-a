import {db,json} from '../../_lib/auth.js';

// The bundled Luméa frontend uses tRPC httpBatchLink + SuperJSON.
// A batched request contains {"0":{"json":{...}}} and MUST receive
// an array of tRPC responses, even if there is only one operation.
function errorResponse(message, code, status, path) {
  return {error:{message,code:-32600,data:{code,httpStatus:status,path}}};
}
function successResponse(data) {
  return {result:{data:{json:data}}};
}
async function capture(input,env) {
  if (!input || typeof input!=='object' || Array.isArray(input))
    return [errorResponse('Entrada inválida.','BAD_REQUEST',400,'leads.capture'),400];
  const name=String(input.name||'').trim();
  const email=String(input.email||'').trim().toLowerCase();
  const hairType=String(input.hairType||'nao-sei').slice(0,60);
  const source=String(input.source||'landing').slice(0,60);
  if(String(input.website||'').trim())return [successResponse({ok:true}),200];
  if(input.consent!==true || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>254 || name.length>120 || (name.length>0&&name.length<2) || (source==='landing'&&name.length<2))
    return [errorResponse('Confira os dados e aceite o consentimento.','BAD_REQUEST',400,'leads.capture'),400];
  try {
    await db(env).prepare('INSERT INTO leads (id,name,email,hair_type,source,consent) VALUES (?,?,?,?,?,1)')
      .bind(crypto.randomUUID(),name||null,email,hairType,source).run();
    return [successResponse({ok:true}),200];
  } catch(e) {
    console.error('lead insert',e);
    return [errorResponse('Falha ao salvar o cadastro.','INTERNAL_SERVER_ERROR',500,'leads.capture'),500];
  }
}
export async function onRequestPost({request,env,params}) {
  const url=new URL(request.url);
  const batched=url.searchParams.get('batch')==='1';
  const paths=params.procedure.split(',');
  let payload;
  try {payload=await request.json();}
  catch {const result=errorResponse('JSON inválido.','PARSE_ERROR',400,paths[0]);return json(batched?[result]:result,400);}
  if(batched) {
    const results=[];
    let status=200;
    for(let i=0;i<paths.length;i++) {
      let result,code;
      if(paths[i]!=='leads.capture') {result=errorResponse('Procedimento não encontrado.','NOT_FOUND',404,paths[i]);code=404;}
      else [result,code]=await capture(payload?.[String(i)]?.json??payload?.[String(i)],env);
      results.push(result);
      if(code>=400)status=code;
    }
    return json(results,status);
  }
  if(paths.length!==1||paths[0]!=='leads.capture')return json(errorResponse('Procedimento não encontrado.','NOT_FOUND',404,paths[0]),404);
  const [result,status]=await capture(payload?.json??payload,env);
  return json(result,status);
}
export async function onRequestGet({request,params}) {
  const batched=new URL(request.url).searchParams.get('batch')==='1';
  const error=errorResponse('Método não permitido.','METHOD_NOT_SUPPORTED',405,params.procedure);
  return json(batched?[error]:error,405);
}
