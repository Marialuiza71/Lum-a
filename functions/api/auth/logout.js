import {json,sha256,sessionCookie,db} from '../../_lib/auth.js';
export async function onRequestPost({request,env}) {
 const match=(request.headers.get('cookie')||'').match(/(?:^|;\s*)lumea_session=([a-f0-9]{64})(?:;|$)/);
 try {if(match)await db(env).prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha256(match[1])).run();}catch(e){console.error('logout',e);}
 return json({ok:true},200,{'set-cookie':sessionCookie(request,'',0)});
}
