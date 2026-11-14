# SiNutre — Frontend

Frontend do **SiNutre** (Sistema de Ingestão de Macronutrientes), desenvolvido
como projeto final da **Formação em Desenvolvimento Web Moderno**.

Aplicação React que consome a API do [sinutre-back](../sinutre-backend-main)
para registrar refeições, gerenciar alimentos e acompanhar metas nutricionais.

## 🔗 Produção

| Serviço | Link |
| --- | --- |
| **Frontend (Vercel)** | https://sinutre-fontend-m7kr.vercel.app |
| **Backend (Railway)** | `https://SEU-SERVICO.up.railway.app` |
| Health check da API | `https://SEU-SERVICO.up.railway.app/health` |

> Substitua o link do backend pelo domínio real gerado no Railway.

## Stack

- Vite 6 + React 19 + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`) + daisyUI v5
- React Router 7
- Axios
- @phosphor-icons/react
- ESLint 9 (flat config) + typescript-eslint

## Requisitos implementados

Todos os requisitos obrigatórios e todos os 12 requisitos complementares
descritos no PDF do projeto foram implementados.

### Requisitos obrigatórios (2,5 pontos)

| Item | Situação |
| --- | --- |
| Repositórios públicos de backend e frontend | ✅ |
| README.md do frontend com as funcionalidades | ✅ este arquivo |
| Backend publicado no Railway | ✅ link na seção [Produção](#-produção) |
| Frontend publicado na Vercel | ✅ link na seção [Produção](#-produção) |

### Requisitos complementares (7,5 pontos)

| Ref. | Requisito | Pontos | Como foi implementado |
| --- | --- | --- | --- |
| 01 | Alterar um alimento cadastrado | 0,75 | Botão **Alterar** em cada card da página *Dieta* abre o `FoodFormModal` em modo edição, que envia `PUT /foods/:id` |
| 02 | Excluir um alimento cadastrado | 0,50 | Botão **Excluir** + modal de confirmação, chamando `DELETE /foods/:id` |
| 03 | Validação de dados no cadastro/alteração do alimento | 0,50 | Validação no formulário (obrigatoriedade, tipo numérico e faixas) e no backend (`400` com `fields` por campo). As mensagens aparecem abaixo de cada campo |
| 04 | Cadastrar meta calórica, altura e peso com validação | 1,00 | Página *Configurações* → `PUT /profile` grava `HealthData.targetDietDaily` e `WeightLog` (`height`/`weight`) |
| 05 | Alterar os dados complementares | 0,50 | Mesmo formulário, pré-preenchido com os dados atuais; cada salvamento atualiza a meta e registra uma nova medição de peso |
| 06 | Exibir a meta calórica no dashboard | 0,50 | `GET /profile` alimenta o card “Calorias / Meta Diária” (`consumido / meta`), sem valores fixos no código |
| 07 | Sinalizar quando a meta diária for ultrapassada | 0,50 | O card fica vermelho e um alerta informa a quantidade excedida em kcal |
| 08 | Página de métricas no menu (IMC + média calórica) | 0,50 | Item **Progresso** (`/stats`) com os componentes `BmiCard` e `CalorieAverageCard` |
| 09 | Exibir o IMC e sinalizar a faixa | 0,75 | IMC calculado no backend com classificação da OMS (abaixo do peso, peso normal, sobrepeso, obesidade), badge colorido e escala visual com marcador |
| 10 | Média calórica dos últimos 7 dias e relação com a meta | 1,00 | `GET /metrics` retorna a média diária de 7 dias, percentual da meta, diferença em kcal e situação (abaixo / dentro / acima) |
| 11 | Permitir logout | 0,50 | Botão **Sair** no menu lateral limpa o token e o contexto de autenticação e volta para `/login`; respostas `401` também encerram a sessão |
| 12 | Mudar as cores da interface | 0,50 | Nova paleta (índigo/violeta) em `src/styles/theme.css` e na tela de login |

**Total: 2,5 + 7,5 = 10,0 pontos** *(sujeito à avaliação)*.

### Funcionalidades adicionais

- Tratamento de erro em todas as telas, com mensagens vindas da API e opção de
  tentar novamente.
- Validação também na criação de refeições (data/hora obrigatória, ao menos um
  alimento, sem itens repetidos).
- Rotas inexistentes redirecionam para o dashboard.
- Avatar com fallback para a inicial do usuário quando a imagem falha.
- Perfil exibe um resumo com IMC e meta atuais.

## Estrutura

```
src/
├── components/
│   ├── cards/      # AddMealCard, TotalMealsCard
│   ├── forms/      # FormField
│   ├── layout/     # Header, Sidebar, SidebarBrand, SidebarItem, SimpleHeader
│   ├── macros/     # MacroStat, MacroStatsBar
│   ├── meals/      # MealActionButton, MealFab, MealsList/Table…
│   ├── metrics/    # BmiCard, CalorieAverageCard
│   └── modal/      # AddMealModal, FoodFormModal, ConfirmModal…
├── constants/      # níveis de atividade, categorias de refeição, navegação
├── context/        # AuthContext (usuário, logout)
├── hooks/          # useMealModal
├── layouts/        # AppLayout
├── lib/            # cliente HTTP, mensagens de erro, token
├── pages/          # Dashboard, Dieta, Métricas, Configurações, Login
├── routes/         # rotas e proteção de rota
├── services/       # foodService, mealService, profileService, metricsService
├── styles/         # Tailwind + tema SiNutre
├── types/          # tipos de domínio
└── utils/          # formatação de data e número
```

## Rotas

| Rota | Página |
| --- | --- |
| `/login` | Login com GitHub |
| `/` | Dashboard (macros do dia, meta, refeições) |
| `/foods` | Dieta — cadastro, alteração e exclusão de alimentos |
| `/stats` | Métricas — IMC e média calórica |
| `/settings` | Configurações — meta calórica, altura, peso e nível de atividade |

## Como rodar localmente

```bash
npm install
cp .env.example .env   # aponte VITE_API_URL para o backend
npm run dev
```

O backend precisa estar rodando (`../sinutre-backend-main`) com o
`GITHUB_CALLBACK_URL` apontando para ele.

### Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `VITE_API_URL` | URL base da API (ex.: `http://localhost:3333`) |

## Scripts

```bash
npm run dev      # servidor de desenvolvimento (vite)
npm run build    # build de produção (tsc -b + vite build)
npm run lint     # ESLint em todo o projeto
npm run preview  # preview do build
```

## Deploy na Vercel

1. Importe o repositório na Vercel.
2. Framework preset: **Vite** (build `npm run build`, output `dist`).
3. Em **Settings → Environment Variables**, adicione:

   | Nome | Valor | Ambientes |
   | --- | --- | --- |
   | `VITE_API_URL` | `https://SEU-SERVICO.up.railway.app` | Production, Preview, Development |

   ⚠️ **Variáveis `VITE_*` são embutidas no bundle durante o build.** Depois de
   adicionar ou alterar `VITE_API_URL` é obrigatório fazer um **Redeploy**
   (*Deployments → ⋯ → Redeploy*), senão o site continua apontando para
   `undefined/...` e o login falha silenciosamente.

4. O `vercel.json` já redireciona todas as rotas para `index.html`
   (necessário para o React Router).
5. Confira se o domínio da Vercel está em `FRONTEND_URL` no backend, senão o
   navegador bloqueia as chamadas por CORS.

## Tema

O tema `sinutre` (tonalidades índigo/violeta) está em
`src/styles/theme.css`, usando a sintaxe `@plugin 'daisyui/theme'` do daisyUI v5.
