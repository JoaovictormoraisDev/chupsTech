# Backend Chups Tech

API REST em Node.js, Express e Supabase para autenticar usuarios e persistir atividades e projetos.

## Configuracao

1. No SQL Editor do Supabase, execute `database/supabase-schema.sql`.
2. Copie `.env.example` para `.env`.
3. Preencha `SUPABASE_URL`, `SUPABASE_SECRET_KEY` e `JWT_SECRET`.
4. Na raiz do projeto, execute `npm install` e `npm start`.

Nunca envie `SUPABASE_SECRET_KEY` para o frontend ou para o Git. A chave legada
`SUPABASE_SERVICE_ROLE_KEY` tambem e aceita pelo backend.

## Rotas

Rotas publicas:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`

Rotas protegidas por `Authorization: Bearer <token>`:

- `GET /api/auth/me`
- CRUD completo em `/api/activities`
- CRUD completo em `/api/projects`
- CRUD completo em `/api/projetos` como alias em portugues
- `GET /api/projects/favorites` ou `GET /api/projetos/favoritos`
- `POST /api/projects/:id/favorite` ou `POST /api/projetos/:id/favorito`
- `DELETE /api/projects/:id/favorite` ou `DELETE /api/projetos/:id/favorito`
- `GET /api/dashboard`

## Camadas

- `src/routes`: endpoints Express.
- `src/controllers`: entrada e saida HTTP.
- `src/services`: validacoes e regras de negocio.
- `src/repositories`: consultas ao Supabase.
- `src/middlewares`: autenticacao JWT e erros.
- `src/config`: variaveis de ambiente e cliente Supabase.
