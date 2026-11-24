import {db,json,fail,bodyJson,randomHex,hashPassword,sha256,safeEqual} from '../../_lib/auth.js';
export async function onRequestPost({request,env}) {
 try {
  if(!env.SETUP_TOKEN || env.SETUP_TOKEN.length < 24) return fail('Configure o segredo SETUP_TOKEN (24+ caracteres) no Cloudflare.',503);
  const data=await bodyJson(request);
  if(!data)return fail('JSON inválido.');
  const count=await db(env).prepare('SELECT COUNT(*) AS n FROM users').first();
  if(count.n!==0)return fail('A conta administrativa já foi criada. Cadastro encerrado.',403);
  if(!safeEqual(await sha256(String(data.setupToken||'')),await sha256(env.SETUP_TOKEN)))return fail('Código de instalação inválido.',403);
  const email=String(data.email||'').trim().toLowerCase(),password=String(data.password||'');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return fail('E-mail inválido.');
  if(password.length<12||password.length>128)return fail('A senha deve ter de 12 a 128 caracteres.');
  const salt=randomHex(16),iterations=210000,hash=await hashPassword(password,salt,iterations);
  await db(env).prepare('INSERT INTO users (id,email,password_hash,salt,iterations) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),email,hash,salt,iterations).run();
  return json({ok:true});
 }catch(e){console.error('setup',e);return fail('Erro de configuração ou de banco de dados.',500);}
}
export async function onRequestGet({env}) {
 try {const r=await db(env).prepare('SELECT COUNT(*) AS n FROM users').first();return json({setupRequired:r.n===0});}
 catch{return fail('Banco D1 indisponível ou tabelas não criadas.',503);}
}
