# Mesa de Jogo

Aplicação web para gerir as sessões de jogos de tabuleiro de um grupo de amigos: os jogos da coleção, os jogadores, as partidas e a classificação geral. O tema visual é inspirado em *O Senhor dos Anéis*: cada jogador escolhe uma personagem e o vencedor de cada partida recebe o Anel.

Projeto final da formação de Angular (ServiceNow 2026).

**Site publicado:** https://vitorbsantosdev.github.io/mesa-de-jogo/

## Funcionalidades

**Classificação**

- Resumo com o total de partidas, o jogo mais jogado e a melhor taxa de vitórias (com pelo menos 3 partidas)
- Tabela geral ordenada por vitórias, taxa de vitórias e nome
- "Senhores de cada jogo": quem tem mais vitórias em cada jogo
- O jogador com a melhor taxa de vitórias aparece em pixel art, de braços erguidos, com o Anel a flutuar

**Jogos**

- Lista com pesquisa por nome, filtro por categoria e ordenação (nome, mais jogados, mais rápidos)
- Detalhe de cada jogo com vitórias por jogador, recorde de pontos e partidas jogadas
- Adicionar, editar e remover jogos (remover um jogo apaga as partidas dele), com imagem opcional

**Jogadores**

- Até 12 jogadores, cada um com uma personagem diferente
- Adicionar e editar; remover só é possível se o jogador não tiver partidas
- Cena de batalha animada em pixel art: os heróis de um lado e, se alguém escolher o Sauron, o exército dele do outro (orcs, Nazgûl, Balrog)
- Perfil de cada jogador: resumo, forma recente, vitórias por jogo, frente a frente com cada adversário e lista de partidas

**Partidas**

- Lista com filtros por jogo e por jogador
- Registar, editar e remover partidas, com pontuação de cada jogador e pré-visualização do vencedor
- Validações: data não pode ser futura, número de jogadores dentro do permitido pelo jogo, sem empate no 1.º lugar

**Contas**

- Criar conta com confirmação por email
- Entrar e sair
- Sem sessão iniciada, é possível ver tudo; criar, editar e remover pede sessão iniciada

**Outros**

- Atualização em tempo real: as páginas mostram as alterações feitas noutro dispositivo sem recarregar
- Mensagens de confirmação depois de guardar e remover
- Aviso de alterações por guardar ao sair de um formulário ou fechar o separador
- Adaptado a telemóvel e tablet (menu compacto, tabelas ajustadas, botões maiores nos ecrãs tácteis)
- Campos numéricos que só aceitam algarismos
- Filtros que, ao fazer scroll, passam para um botão flutuante com um funil

## Tecnologias

- [Angular 22](https://angular.dev) (componentes standalone, signals, Reactive Forms, Router)
- [Supabase](https://supabase.com) como backend: base de dados PostgreSQL, Row Level Security, autenticação e Realtime
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

As tabelas estão publicadas no **Supabase Realtime** (`alter publication supabase_realtime …`, no fim do `schema.sql`). Assim, a aplicação recebe um aviso sempre que os dados mudam e atualiza as páginas abertas.

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
├── guards/       authGuard (páginas de criar e editar) e unsavedChangesGuard (alterações por guardar)
├── models/       interfaces (jogo, jogador, partida, personagens)
├── pages/        uma pasta por página (rota)
├── services/     acesso aos dados, autenticação, tempo real, mensagens e janela de confirmação
└── utils/        funções auxiliares (datas, ordenação, pesquisa, imagens)
supabase/         schema.sql e seed.sql
```

## Conceitos de Angular usados

| Conceito                                          | Onde                                                                                                                                                                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Componentes, `input()` e `output()`           | `GameCardComponent`, `MatchCardComponent`, `CharacterIconComponent`, `FilterPanelComponent`, `BattleSceneComponent`, `ChampionComponent`, `ToastsComponent`, `ConfirmDialogComponent`                                            |
| Services e injeção de dependências             | `GameService`, `PlayerService`, `MatchService`, `AuthService`, `SupabaseService`, `RealtimeService`, `ToastService`, `ConfirmDialogService`                                                                                      |
| Interfaces                                        | `src/app/models` e os tipos `*Row` dos services                                                                                                                                                                                              |
| Observables e `subscribe`                       | Todos os pedidos aos services, com estados de carregamento e erro                                                                                                                                                                                |
| Interpolação, property, event e two-way binding | Em todas as páginas (`[(ngModel)]` nos filtros)                                                                                                                                                                                               |
| `@if`, `@for`, `@switch`, `@let`          | Páginas, `MatchCardComponent` (`@let`) e `CharacterIconComponent` (`@switch`)                                                                                                                                                           |
| Pipes                                             | `DatePipe` nos cartões das partidas, no recorde do jogo e na pré-visualização da nova partida; `UpperCasePipe` na categoria do cartão de jogo                                                                                              |
| Router                                            | 12 rotas, `RouterLink`, parâmetros (`jogos/:id`, `jogadores/:id`), `paramMap` observado no perfil, query params (`?jogador=`), `authGuard` (`CanActivate`) e `unsavedChangesGuard` (`CanDeactivate`)                          |
| Reactive Forms                                    | Jogos, jogadores, partidas (`FormArray`), login e criar conta; `dirty`, `pristine` e `markAsDirty()` para o aviso de alterações                                                                                                        |
| Validators                                        | `required`, `email`, `minLength`, `maxLength`, `min`, `max`, `pattern` e validators próprios (data não futura, número de jogadores, sem empate no 1.º lugar, nome único, palavras-passe iguais)                               |
| `OnInit`, `AfterViewInit` e `OnDestroy`     | Carregamento de dados nas páginas; no `ngAfterViewInit`, `BattleSceneComponent` e `ChampionComponent` ligam a animação e `FilterPanelComponent` liga os ouvintes de `scroll` e `resize`; os três desligam-nos no `ngOnDestroy` |
| Projeção de conteúdo (`<ng-content />`)      | `FilterPanelComponent` recebe os filtros de Jogos e Partidas                                                                                                                                                                                   |
| `viewChild()` e `afterRenderEffect()`         | `BattleSceneComponent` e `ChampionComponent` acedem ao `<canvas>` e voltam a desenhar quando os dados mudam                                                                                                                                |
| `effect()`                                      | `ConfirmDialogComponent` abre e fecha o `<dialog>` quando o pedido de confirmação muda                                                                                                                                                     |
| Limpeza de subscrições                          | `takeUntilDestroyed` com `DestroyRef` nas subscrições do tempo real e no `paramMap` do perfil                                                                                                                                            |
| RxJS                                              | `forkJoin`, `switchMap`, `debounceTime` (tempo real), `Subject` e `take(1)` (janela de confirmação)                                                                                                                                  |
| Signals                                           | Estado das páginas (`signal`, `computed`)                                                                                                                                                                                                   |

## Autor

**Vitor Santos**, projeto final da formação de Angular (ServiceNow 2026).

- GitHub: [@VitorBSantosDev](https://github.com/VitorBSantosDev)
