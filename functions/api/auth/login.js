import {db,json,fail,bodyJson,hashPassword,randomHex,sha256,safeEqual,sessionCookie} from '../../_lib/auth.js';
export async function onRequestPost({request,env}) {
 try {
  const data=await bodyJson(request);if(!data)return fail('JSON inválido.');
  const email=String(data.email||'').trim().toLowerCase(),password=String(data.password||'');
  if(email.length>254||password.length>128)return fail('Credenciais inválidas.',401);
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';const ipHash=await sha256(ip);
  const now=Math.floor(Date.now()/1000),cutoff=now-900;
  const recent=await db(env).prepare('SELECT COUNT(*) AS n FROM login_attempts WHERE ip_hash=? AND attempted_at>?').bind(ipHash,cutoff).first();
  if(recent.n>=8)return fail('Muitas tentativas. Tente novamente em 15 minutos.',429);
  const user=await db(env).prepare('SELECT id,email,password_hash,salt,iterations FROM users WHERE email=?').bind(email).first();
  const computed=await hashPassword(password,user?.salt||'00000000000000000000000000000000',user?.iterations||210000);
  if(!user||!safeEqual(computed,user.password_hash)) {
   await db(env).prepare('INSERT INTO login_attempts(ip_hash,attempted_at) VALUES(?,?)').bind(ipHash,now).run();
   return fail('E-mail ou senha incorretos.',401);
  }
  await db(env).prepare('DELETE FROM login_attempts WHERE ip_hash=?').bind(ipHash).run();
  const token=randomHex(),expires=now+60*60*24*7;
  await db(env).prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').bind(await sha256(token),user.id,expires).run();
  return json({ok:true,email:user.email},200,{'set-cookie':sessionCookie(request,token,60*60*24*7)});
 }catch(e){console.error('login',e);return fail('Erro no login. Verifique o banco D1.',500);}
}
