# Luméa — Cloudflare Worker + D1 (corrigido)

**Esta versão é para a hospedagem Cloudflare Workers com assets estáticos que aparece no seu print.**
Inclui `src/worker.js` para atender a API; assim `/api/trpc/leads.capture` responde JSON e pode salvar o cadastro no D1. O design do site e o produto de R$ 1,00 foram mantidos.

## Publicar pelo GitHub

1. Substitua **todos os arquivos na raiz** do seu repositório pelo conteúdo deste ZIP (inclusive `src/`, `functions/`, `public/` e `wrangler.jsonc`).
2. Cloudflare > **Workers & Pages** > seu Worker > **Settings / Build** (Git integration). Confirme que a publicação usa `npx wrangler deploy` a partir da raiz, **não** um deploy apenas de assets. Publique novamente a partir do commit atualizado.
3. O arquivo `wrangler.jsonc` configura `main: src/worker.js`, assets em `public/` e o D1 com binding `DB`. O banco usado é **lumea_d1** e o ID foi lido da URL do console do print enviado; confira se é o seu banco antes de publicar. Caso o ID seja outro, ajuste `database_id`.
4. O segredo `SETUP_TOKEN` (mínimo de 24 caracteres) deve ser configurado em **Settings > Variables and Secrets** do Worker; não envie esse segredo ao GitHub.
5. Se ainda não criou o administrador, abra `/login.html`. Para conferir se a API responde JSON, abra `/api/auth/setup` no site publicado: deve aparecer `{"setupRequired":true}` (ou `false` se já houver administrador).
6. Faça um cadastro no popup; confira no D1: `SELECT email, created_at FROM leads ORDER BY created_at DESC LIMIT 5;`.

**Importante:** se a integração atual do seu Cloudflare foi configurada para subir apenas arquivos estáticos, é preciso ajustar o comando de implantação para `npx wrangler deploy` (ou criar Worker via GitHub com esse comando). Só enviar ZIP não muda uma configuração de build que ignore o `wrangler.jsonc`.

O D1 já tem as tabelas `users`, `sessions`, `login_attempts` e `leads`; não recrie as tabelas. 

O arquivo `LUMEA-SITE-COMPLETO-ABRIR.html` é uma prévia offline, não é o backend.

Documentação: https://developers.cloudflare.com/workers/static-assets/ e https://developers.cloudflare.com/workers/static-assets/binding/
