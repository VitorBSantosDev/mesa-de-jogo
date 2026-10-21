-- Jogadores (character_id: 2 Sauron, 4 Aragorn, 5 Legolas, 6 Gimli, 7 Galadriel)

insert into players (id, name, character_id) values
  (1, 'Vitor', 2),
  (2, 'Bruno', 4),
  (3, 'Carlos', 6),
  (4, 'Matilde', 7),
  (5, 'Diogo', 5);

-- Jogos

insert into games (id, name, category, min_players, max_players, duration) values
  (1, 'Catan', 'Estratégia', 3, 4, 90),
  (2, 'Carcassonne', 'Colocação de peças', 2, 5, 45),
  (3, 'Ticket to Ride', 'Família', 2, 5, 60),
  (4, 'Dixit', 'Party', 3, 6, 30),
  (5, 'Flip 7', 'Abstrato', 2, 4, 40);

-- Partidas

insert into matches (id, game_id, date) values
  (1, 1, '2026-09-05'),
  (2, 4, '2026-09-05'),
  (3, 2, '2026-09-12'),
  (4, 5, '2026-09-12'),
  (5, 3, '2026-09-19'),
  (6, 5, '2026-10-20');

-- Resultados

insert into match_results (match_id, player_id, score) values
  (1, 1, 10), (1, 2, 8), (1, 3, 7),
  (2, 1, 22), (2, 2, 27), (2, 3, 19), (2, 4, 24),
  (3, 2, 88), (3, 4, 95),
  (4, 1, 54), (4, 2, 61), (4, 4, 47),
  (5, 1, 112), (5, 3, 98), (5, 5, 105),
  (6, 2, 100), (6, 3, 200);

-- Acertar os contadores dos ids

select setval(pg_get_serial_sequence('players', 'id'), (select max(id) from players));
select setval(pg_get_serial_sequence('games', 'id'), (select max(id) from games));
select setval(pg_get_serial_sequence('matches', 'id'), (select max(id) from matches));
