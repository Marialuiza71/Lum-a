const enc = new TextEncoder();
export const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers }
});
export const fail = (message, status = 400) => json({ error: message }, status);
export function db(env) { if (!env.DB) throw new Error('Configure o binding D1 com o nome DB.'); return env.DB; }
function bytesHex(bytes) { return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join(''); }
function hexBytes(hex) { return new Uint8Array(hex.match(/.{2}/g).map(x => parseInt(x, 16))); }
export function randomHex(n=32) { const b=new Uint8Array(n); crypto.getRandomValues(b); return bytesHex(b); }
export async function sha256(str) { return bytesHex(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(str)))); }
export async function hashPassword(password, salt, iterations = 210000) {
  const key=await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash=await crypto.subtle.deriveBits({name:'PBKDF2',salt:hexBytes(salt),iterations,hash:'SHA-256'},key,256);
  return bytesHex(new Uint8Array(hash));
}
export function safeEqual(a,b) {
  if(typeof a!=='string'||typeof b!=='string')return false;
  let x=a.length^b.length;
  for(let i=0;i<Math.max(a.length,b.length);i++) x|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);
  return x===0;
}
export function sessionCookie(request, token, maxAge) {
  const secure = new URL(request.url).protocol==='https:' ? '; Secure' : '';
  return `lumea_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}
export async function getUser(request, env) {
  const match=(request.headers.get('cookie')||'').match(/(?:^|;\s*)lumea_session=([a-f0-9]{64})(?:;|$)/);
  if(!match)return null;
  const tokenHash=await sha256(match[1]);
  return await db(env).prepare('SELECT users.id, users.email FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token_hash=? AND sessions.expires_at>?')
    .bind(tokenHash,Math.floor(Date.now()/1000)).first();
}
export async function requireUser(request,env) {const user=await getUser(request,env);return user;}
export async function bodyJson(request) { try {const data=await request.json();return data&&typeof data==='object'&&!Array.isArray(data)?data:null;}catch{return null;} }
