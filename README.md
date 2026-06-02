# Chups Tech

Planejador de rotina com consciencia digital para programadores.

## Problema / desafio abordado

Programadores passam muitas horas em telas, alternando entre codigo, bugs, reunioes, documentacao e notificacoes. Essa rotina pode prejudicar produtividade, saude mental e uso consciente da tecnologia.

O desafio da Chups Tech e promover equilibrio entre produtividade, saude mental e tecnologia, ajudando o usuario a planejar o dia antes que o excesso de tela vire sobrecarga.

## Solucao

A Chups Tech permite montar uma rotina ideal arrastando blocos de atividades:

- Foco / deep work
- Implementacao de feature
- Debug
- Code review
- Pausa sem tela
- Refeicao consciente
- Exercicio curto
- Tela livre

O sistema calcula em tempo real:

- Tempo total em telas
- Tempo de vida real / recuperacao
- Numero de pausas
- Score de equilibrio

No fim, o usuario pode exportar a rotina em um arquivo `.txt`.

## Publico-alvo

Programadores, estudantes de tecnologia, equipes de desenvolvimento, escolas tecnicas e empresas que querem melhorar produtividade sem ignorar bem-estar digital.

## Diferencial

A Chups Tech nao organiza apenas tarefas. Ela mostra se a rotina esta saudavel, comparando foco produtivo em tela com pausas e atividades fora dela.

## Integrantes da equipe

- Integrante 1: preencher nome
- Integrante 2: preencher nome
- Integrante 3: preencher nome
- Integrante 4: preencher nome
- Integrante 5: preencher nome, se houver

## Tecnologias utilizadas

- HTML5
- CSS3 com design tokens
- JavaScript
- Node.js
- Express
- Supabase Postgres
- `bcryptjs` para criptografia de senhas
- `jsonwebtoken` para autenticacao JWT
- jQuery 3.5.1
- Webflow JS runtime com fallback local
- GSAP com ScrollTrigger e SplitText
- Swiper 11
- Lenis smooth scroll
- Google Fonts - Golos Text

## Funcionalidades implementadas no front-end

- Landing page responsiva em dark mode.
- Planner com blocos arrastaveis.
- Criacao de cards personalizados para o planner.
- Animacao ao segurar ou arrastar cards com o mouse.
- Adicao de blocos por clique para facilitar uso mobile.
- Calculo em tempo real de telas vs vida real.
- Score de equilibrio.
- Exportacao da rotina.
- Area de projetos com nome do projeto e lista do que falta.
- Introducao "O que somos" na tela de visao.
- Login e cadastro conectados a API com JWT.
- Cards de problema, solucao, funcionalidades e monetizacao.
- Carrossel de depoimentos.
- Animacao inicial de entrada do site.
- Background particles customizado.
- Hover glow nos cards.
- Gradient text com `background-clip: text`.

## Estrutura de dados planejada

### Rotina

- `id`: identificador do bloco.
- `label`: nome do bloco.
- `type`: `screen` ou `life`.
- `minutes`: duracao em minutos.

### Projeto

- `id`: identificador do projeto.
- `name`: nome do projeto em desenvolvimento.
- `tasks`: lista do que falta fazer.

## Modelo de monetizacao

Modelo freemium:

- Plano gratuito para programadores individuais.
- Plano premium com historico, metas, exportacoes avancadas e relatorios.
- Plano B2B para escolas, squads e empresas acompanharem bem-estar digital de equipes.

## Como executar localmente

1. Execute `backend/database/supabase-schema.sql` no SQL Editor do Supabase.
2. Configure `backend/.env` usando `backend/.env.example` como base.
3. Instale as dependencias e inicie o servidor:

```bash
npm install
npm start
```

Acesse:

```text
http://localhost:3000
```

## Link do deploy

Preencher se houver deploy.
