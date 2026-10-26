# Mesa de Jogo

Aplicação web para gerir as sessões de jogos de tabuleiro de um grupo de amigos: os jogos da coleção, os jogadores, as partidas e a classificação geral. O tema visual é inspirado em *O Senhor dos Anéis*: cada jogador escolhe uma personagem e o vencedor de cada partida recebe o Anel.

* [ ] Projeto final da formação de Angular (ServiceNow 2026).

**Site publicado:** https://vitorbsantosdev.github.io/mesa-de-jogo/

## Funcionalidades

**Classificação**

- Resumo com o total de partidas, o jogo mais jogado e a melhor taxa de vitórias (com pelo menos 3 partidas)
- Tabela geral ordenada por vitórias, taxa de vitórias e nome
- "Senhores de cada jogo": quem tem mais vitórias em cada jogo

**Jogos**

- Lista com pesquisa por nome, filtro por categoria e ordenação (nome, mais jogados, mais rápidos)
- Detalhe de cada jogo com vitórias por jogador, recorde de pontos e partidas jogadas
- Adicionar, editar e remover jogos (remover um jogo apaga as partidas dele), com imagem opcional

**Jogadores**

- Até 12 jogadores, cada um com uma personagem diferente
- Adicionar e editar; remover só é possível se o jogador não tiver partidas

**Partidas**

- Lista com filtros por jogo e por jogador
- Registar, editar e remover partidas, com pontuação de cada jogador e pré-visualização do vencedor
- Validações: data não pode ser futura, número de jogadores dentro do permitido pelo jogo, sem empate no 1.º lugar

**Contas**

- Criar conta com confirmação por email
- Entrar e sair
- Sem sessão iniciada, é possível ver tudo; criar, editar e remover pede sessão iniciada

**Outros**

- Adaptado a telemóvel (menu compacto, tabelas ajustadas)
- Campos numéricos que só aceitam algarismos
- Filtros que, ao fazer scroll, passam para um botão flutuante com um funil

## Tecnologias

- [Angular 22](https://angular.dev) (componentes standalone, signals, Reactive Forms, Router)
- [Supabase](https://supabase.com) como backend: base de dados PostgreSQL, Row Level Security e autenticação
- GitHub Actions e GitHub Pages para a publicação

## Origem dos dados

Os dados estão numa base de dados PostgreSQL no **Supabase**. A aplicação comunica com ela através da biblioteca `@supabase/supabase-js`, que usa a API REST do Supabase.

| Tabela            | Conteúdo                                   |
| ----------------- | ------------------------------------------- |
| `characters`    | As 12 personagens disponíveis              |
| `players`       | Jogadores e a personagem de cada um         |
| `games`         | Jogos da coleção                          |
| `matches`       | Partidas (jogo e data)                      |
| `match_results` | Pontuação de cada jogador em cada partida |

As permissões são controladas por **Row Level Security**: qualquer visitante pode ler; só utilizadores autenticados podem criar, editar e remover. A estrutura e as políticas estão em [`supabase/schema.sql`](supabase/schema.sql) e os dados de exemplo em [`supabase/seed.sql`](supabase/seed.sql).

## Como instalar e correr

### Pré-requisitos

- [Node.js](https://nodejs.org) 24 ou superior
- Um projeto no [Supabase](https://supabase.com) (gratuito) com a base de dados criada a partir de `supabase/schema.sql` e `supabase/seed.sql`

> Para **usar** a aplicação não é preciso conta no Supabase: basta abrir o [site publicado](https://vitorbsantosdev.github.io/mesa-de-jogo/) e, para alterar dados, criar uma conta na própria aplicação. O Supabase só é necessário para correr uma cópia local do projeto.

### 1. Clonar e instalar

```bash
git clone https://github.com/VitorBSantosDev/mesa-de-jogo.git
cd mesa-de-jogo
npm install
```

### 2. Criar a base de dados no Supabase

1. Crie um projeto novo no Supabase.
2. Em **SQL Editor**, corra o conteúdo de `supabase/schema.sql` (tabelas, políticas e personagens).
3. Corra depois `supabase/seed.sql` (jogadores, jogos e partidas de exemplo).
4. Em **Authentication → URL Configuration**, acrescente `http://localhost:4200/**` às **Redirect URLs**.

Para a confirmação de conta por email funcionar com qualquer endereço, configure um SMTP próprio em **Authentication → Emails → SMTP Settings**. O serviço de email incluído no Supabase só envia para os membros da organização.

### 3. Configurar as variáveis de ambiente

Os ficheiros de ambiente não estão no repositório, para não publicar a chave. Crie a pasta `src/environments` com dois ficheiros iguais, `environment.ts` e `environment.development.ts`:

```ts
export const environment = {
  supabaseUrl: 'https://<o-seu-projeto>.supabase.co',
  supabaseKey: '<chave publicável>',
};
```

Os valores estão em **Project Settings → API Keys** do Supabase. Use a chave **publicável** (`sb_publishable_…`), nunca a chave secreta.

### 4. Correr

```bash
npm start
```

Abra http://localhost:4200/.

## Publicação

Cada `push` para o `main` corre o workflow [`.github/workflows/main.yml`](.github/workflows/main.yml), que:

1. instala as dependências;
2. cria o `environment.ts` a partir dos secrets do repositório `SUPABASE_URL` e `SUPABASE_KEY`;
3. compila em modo de produção com `--base-href "/mesa-de-jogo/"`;
4. publica no GitHub Pages.

## Estrutura do projeto

```
src/app/
├── components/   componentes reutilizáveis (cabeçalho, cartões, ícones, anel do vencedor)
├── database/     tipos gerados a partir da base de dados do Supabase
├── directives/   diretiva que só deixa escrever algarismos
├── guards/       authGuard, que protege as páginas de criar e editar
├── models/       interfaces (jogo, jogador, partida, personagens)
├── pages/        uma pasta por página (rota)
├── services/     acesso aos dados e autenticação
└── utils/        funções auxiliares (datas, ordenação, pesquisa, imagens)
supabase/         schema.sql e seed.sql
```

## Conceitos de Angular usados

| Conceito                                          | Onde                                                                                                                                                                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Componentes, `input()` e `output()`           | `GameCardComponent`, `MatchCardComponent`, `CharacterIconComponent`, `FilterPanelComponent`                                                                                                                                  |
| Services e injeção de dependências             | `GameService`, `PlayerService`, `MatchService`, `AuthService`, `SupabaseService`                                                                                                                         |
| Interfaces                                        | `src/app/models` e os tipos `*Row` dos services                                                                                                                                                                |
| Observables e `subscribe`                       | Todos os pedidos aos services, com estados de carregamento e erro                                                                                                                                                  |
| Interpolação, property, event e two-way binding | Em todas as páginas (`[(ngModel)]` nos filtros)                                                                                                                                                                 |
| `@if`, `@for`, `@switch`, `@let`          | Páginas, `MatchCardComponent` (`@let`) e `CharacterIconComponent` (`@switch`)                                                                                                                             |
| Pipes                                             | `DatePipe` nos cartões das partidas, no recorde do jogo e na pré-visualização da nova partida                                                                                                                |
| Router                                            | 11 rotas, `RouterLink`, parâmetros (`jogos/:id`), query params (`?jogador=`) e `authGuard`                                                                                                                |
| Reactive Forms                                    | Jogos, jogadores, partidas (`FormArray`), login e criar conta                                                                                                                                                    |
| Validators                                        | `required`, `email`, `minLength`, `maxLength`, `min`, `max`, `pattern` e validators próprios (data não futura, número de jogadores, sem empate no 1.º lugar, nome único, palavras-passe iguais) |
| `OnInit`, `AfterViewInit` e `OnDestroy` | Carregamento de dados nas páginas; `FilterPanelComponent` cria um `IntersectionObserver` no `ngAfterViewInit` e desliga-o no `ngOnDestroy` |
| Projeção de conteúdo (`<ng-content />`) | `FilterPanelComponent` recebe os filtros de Jogos e Partidas |
| Signals                                           | Estado das páginas (`signal`, `computed`)                                                                                                                                                                     |
