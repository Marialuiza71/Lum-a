# Luméa — Cloudflare Pages + D1

Projeto preparado a partir do **build público recuperado** do site Luméa, mantendo as páginas e a identidade visual. O código React original não está incluído; `public/assets` contém os arquivos compilados.

## O que funciona
- Páginas públicas `/`, `/ofertas`, `/conteudo`, `/privacidade` e imagens locais.
- Formulário de captura existente, agora servido pela função `POST /api/trpc/leads.capture` e gravado no D1.
- Login próprio em `/login.html` (também `/admin`), sessão por cookie HttpOnly por 7 dias, senhas PBKDF2, limite básico de tentativas.
- Painel em `/painel.html` para consultar leads, com paginação e logout.
- Cadastro inicial de administrador protegido por `SETUP_TOKEN` e desabilitado depois da primeira conta.

## 1. Envie para GitHub
Crie um repositório e envie **o conteúdo desta pasta** para a raiz do repositório (não apenas a pasta `public`). Não envie senhas nem `.dev.vars`.

## 2. Crie o D1 no Cloudflare
Cloudflare > Workers & Pages > D1 SQL database > Create. Dê o nome `lumea-db` (outro nome também serve).
No painel do banco, abra **Console** e execute o conteúdo completo de `schema.sql` (ou use `npx wrangler d1 execute lumea-db --remote --file=./schema.sql` depois de fazer login na CLI).

## 3. Configure Cloudflare Pages
Workers & Pages > Create > **Pages** > Connect to Git > selecione o repositório.
- Framework preset: **None**
- Build command: **deixar vazio**
- Build output directory: **public**
- Root directory: `/` (raiz do repositório)

Depois conecte o D1: no projeto **Pages** > Settings > Bindings > Add > D1 database, **Variable name = DB**, escolha o banco criado; aplique em **Production** (e em **Preview** se quiser prévias funcionais). Faça novo deploy após atualizar os bindings.

## 4. Crie o segredo para o primeiro usuário
Em Pages > Settings > Variables and Secrets (ou Environment variables, dependendo da interface), crie `SETUP_TOKEN` como **Secret**, usando um valor aleatório longo, com pelo menos 24 caracteres. Configure em Production e faça redeploy. Não coloque esse valor no GitHub.

Acesse `https://SEU-PROJETO.pages.dev/login.html`; o campo de primeiro acesso aparece quando o banco não tem usuários. Digite o segredo, e-mail do administrador e senha de 12+ caracteres. Depois entre com e-mail e senha. **Somente o primeiro usuário pode ser criado pela instalação.**

## 5. Teste
1. Abra `/ofertas`; verifique as imagens e as outras páginas.
2. Envie um cadastro no formulário, marcando consentimento.
3. Entre em `/login.html`, abra `/painel.html` e confira o cadastro.
4. Saia, tente acessar o painel e confirme o redirecionamento para login.

## Desenvolvimento local (opcional)
```bash
npm install
cp .dev.vars.example .dev.vars
# mude SETUP_TOKEN para um valor secreto
npx wrangler d1 create lumea-db
# comando abaixo: substitua ID_DO_BANCO pela identificação retornada
npx wrangler pages dev public --d1 DB=ID_DO_BANCO
```
Para desenvolvimento local, inicialize o D1 local com `npx wrangler d1 execute lumea-db --local --file=./schema.sql` após configurar a CLI ou use o painel para o banco remoto.

## Notas importantes
- **Não é necessário preencher um `wrangler.toml`**: as bindings são configuradas no dashboard do Pages, evitando guardar IDs dependentes de conta no projeto.
- O arquivo JS pré-compilado preserva alguns códigos de integração do Manus, mas a única chamada de negócio identificada no formulário é `leads.capture`, agora atendida no Cloudflare. Outros recursos dependentes do backend original, se existirem, não são reproduzidos.
- Os cadastros que já existiam no banco da Manus **não estão** no ZIP e não são migrados.
- O painel é privado via API: a página HTML é pública, mas os dados de cadastros só são entregues com sessão válida.
- Não há recuperação de senha por e-mail nem disparo de e-mails. Guarde as credenciais em segurança.
- Para ter controle de edição sobre o frontend, é necessário obter ou reconstruir o código-fonte React original.

Documentação: https://developers.cloudflare.com/pages/get-started/git-integration/ e https://developers.cloudflare.com/pages/functions/bindings/


## Visualizar corretamente no computador

O site usa rotas SPA (React) e arquivos em `/assets`. Abrir `public/index.html` diretamente como `file:///` não funciona: um servidor web é necessário. Para visualizar sem instalar nada, use o arquivo separado `LUMEA-SITE-COMPLETO-ABRIR.html` distribuído junto deste ZIP (versão independente com estilos, JS e imagens embutidos). Para testar o backend de login e D1, publique no Cloudflare Pages.


## Visualizar corretamente no computador

O site usa rotas SPA (React) e arquivos em `/assets`. Abrir `public/index.html` diretamente como `file:///` não funciona: um servidor web é necessário. Para visualizar sem instalar nada, use o arquivo separado `LUMEA-SITE-COMPLETO-ABRIR.html` distribuído junto deste ZIP (versão independente com estilos, JS e imagens embutidos). Para testar o backend de login e D1, publique no Cloudflare Pages.
