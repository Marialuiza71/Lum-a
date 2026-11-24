import {json,getUser,fail} from '../../_lib/auth.js';
export async function onRequestGet({request,env}) {
 try {const user=await getUser(request,env);return user?json({authenticated:true,email:user.email}):json({authenticated:false},401);}
 catch{return fail('Falha ao verificar sessão.',500);}
}
