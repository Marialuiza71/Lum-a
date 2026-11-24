(() => {
  'use strict';
  const form=document.getElementById('checkoutForm');
  const $=id=>document.getElementById(id);
  const fmt=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n);
  let quantity=1;
  const refresh=()=>{$('quantity').textContent=quantity;$('subtotal').textContent=fmt(quantity);$('total').textContent=fmt(quantity);$('minus').disabled=quantity===1;$('plus').disabled=quantity===10;};
  $('minus').addEventListener('click',()=>{quantity=Math.max(1,quantity-1);refresh();});
  $('plus').addEventListener('click',()=>{quantity=Math.min(10,quantity+1);refresh();});
  $('cep').addEventListener('input',e=>{const digits=e.target.value.replace(/\D/g,'').slice(0,8);e.target.value=digits.length>5?digits.slice(0,5)+'-'+digits.slice(5):digits;});
  const error=$('errorMessage');
  form.addEventListener('submit',e=>{
    e.preventDefault();error.hidden=true;
    if(!form.reportValidity()){error.textContent='Confira os campos obrigatórios e preencha os dados corretamente.';error.hidden=false;return;}
    const data=new FormData(form);
    if(!/^\d{5}-\d{3}$/.test(data.get('cep'))){error.textContent='Informe um CEP válido com 8 dígitos.';error.hidden=false;$('cep').focus();return;}
    const phone=String(data.get('telefone')).replace(/\D/g,'');
    if(phone.length<10||phone.length>11){error.textContent='Informe um telefone com DDD (10 ou 11 dígitos).';error.hidden=false;form.elements.telefone.focus();return;}
    // Fictitious reference is generated locally; form contents are never transmitted.
    const rnd=globalThis.crypto?.getRandomValues?Array.from(crypto.getRandomValues(new Uint8Array(4))).map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase():String(Date.now());
    $('orderCode').textContent='SIM-'+rnd;
    $('orderQty').textContent=String(quantity);
    $('orderTotal').textContent=fmt(quantity);
    $('orderPayment').textContent=String(data.get('pagamento'));
    $('orderCity').textContent=`${data.get('cidade')} / ${data.get('uf')}`;
    $('confirmation').hidden=false;
    $('closeModal').focus();
  });
  $('closeModal').addEventListener('click',()=>{$('confirmation').hidden=true;form.reset();quantity=1;refresh();window.scrollTo({top:0,behavior:'smooth'});});
  refresh();
})();
