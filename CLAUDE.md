# 旅 (tabi) — site pessoal

Site de expressão pessoal, sem objetivo comercial. Meta: nível Awwwards em
tipografia e movimento, sem 3D/WebGL.

## Stack

- Vanilla HTML/CSS/JS com Vite. Sem framework, sem Tailwind.
- GSAP (ScrollTrigger, SplitText) + Lenis para scroll suave.
- Fontes via Google Fonts.
- Integração Lenis + ScrollTrigger (padrão obrigatório):
  ```js
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  ```

## Conceito

O site é um dia inteiro atravessando o céu. O scroll é a passagem do tempo:
começa no amanhecer e termina na noite. Tom contemplativo e nostálgico
(inspiração de tom: Frieren — tempo que passa, valor das pessoas na jornada).
A tensão central da personalidade é **calma × disciplina**: céu e paisagens
bucólicas de um lado, calistenia e cubo mágico do outro.

Não usar imagens, personagens ou nomes de animes (direitos autorais).
Inspiração é só de tom.

## Seções (em ordem — são uma sequência real no tempo)

| Momento     | Kanji            | Conteúdo |
|-------------|------------------|----------|
| Amanhecer   | 空 (sora, céu)    | Abertura. Nome surge entre as nuvens, paisagem bucólica ao fundo. |
| Manhã       | 力 (chikara, força) | Calistenia como progressão de habilidades (barra → muscle-up → parada de mão). Pode brincar com gravidade/inversão. |
| Tarde       | 知 (chi, conhecimento) | Cubo mágico e computação. Cubo em CSS 3D que se resolve com o scroll (não usar WebGL). |
| Pôr do sol  | 家族 (kazoku, família) | Seção mais quente e calma. |
| Noite       | —                | Encerramento: estrelas e uma frase pessoal. |

**Conteúdo pessoal:** nunca invente fatos sobre mim (nome, conquistas,
frases, números). Use placeholders óbvios como `[FRASE FINAL]` e me pergunte.

## Tokens

### Tipografia
- **Shippori Mincho** — títulos, kanji, frases de destaque.
- **Zen Kaku Gothic New** — corpo de texto.
- Kanji em texto vertical: `writing-mode: vertical-rl`.
- Escala tipográfica clara e intencional; linhas com menos de 80 caracteres.
- A tipografia é elemento visual ativo, não só veículo de conteúdo.

### Cores
Céu (fundo interpola entre estes pontos conforme o scroll):

```css
--sky-dawn-1:   #F6D6C9;
--sky-dawn-2:   #B8C6E0;
--sky-morning:  #8EC5FF;
--sky-afternoon:#4A90D9;
--sky-sunset-1: #F28C5B;
--sky-sunset-2: #7A3E6B;
--sky-night:    #0B1026;
```

Fixas:
```css
--washi: #FAF7F0; /* texto sobre céu escuro */
--sumi:  #1B1B1F; /* texto sobre céu claro */
```

Garantir contraste legível em toda transição (trocar washi/sumi no ponto certo).

## Movimentos-assinatura (os únicos três; repetir, não inventar novos)

1. **Céu contínuo** — cor de fundo interpolada com ScrollTrigger `scrub`.
   Sol que vira lua percorre um arco pela tela ao longo do site.
2. **Nuvens em camadas** — 3 planos com parallax em velocidades diferentes,
   com deriva lenta contínua mesmo sem scroll (o site "respira").
3. **Revelação vertical** — o kanji de cada seção aparece de cima para baixo
   como pincelada (máscara animada); depois o texto em português entra
   palavra por palavra (SplitText).

O céu é o elemento ousado do site. Todo o resto fica quieto e disciplinado.

## Regras de movimento

- Lento e suave: easings `sine`, `power2.out`. Nada elástico, bounce ou rápido.
- Animar só `transform` e `opacity` (exceto a cor de fundo do céu).
- Não aplicar fade-and-slide-up genérico em toda seção.
- `prefers-reduced-motion`: desligar parallax e scrub; céu muda por seção
  com transição simples.
- Performance: 60 fps em notebook comum; testar nuvens com cuidado
  (evitar filtros SVG pesados em tela cheia).

## Evitar

- Grade de cards, glassmorphism, gradientes neon, cursor customizado chamativo.
- Labels em CAIXA ALTA espaçada acima de títulos.
- Destacar uma única palavra do título com itálico/cor diferente.
- Seta "→" em links, strings com " · ", fonte monoespaçada decorativa.
- Imagens de terceiros sem licença.

## Qualidade mínima

Responsivo até mobile, foco de teclado visível, contraste acessível,
HTML semântico.

## Processo

- Construir **uma seção por vez**, na ordem acima. Não gerar o site inteiro
  de uma vez.
- Antes de codar cada seção, descrever em poucas linhas o plano (layout,
  animação, qual movimento-assinatura usa) e esperar meu ok.
- Depois de cada seção: rodar `npm run dev`, revisar e sugerir um commit.
- Autocrítica antes de entregar: "isso parece template genérico?" Se sim, refazer.
- Estrutura de arquivos simples: `index.html`, `src/main.js`,
  `src/sections/*.js`, `src/styles/*.css`.
