# Portfólio — Thiago Gama

Site pessoal estático, sem build e sem dependências: HTML, CSS e JavaScript puro.

**Ao vivo:** https://thiagogama1.github.io

## Recursos

- **Bilíngue (PT/EN)** — troca instantânea via dicionário em `assets/js/i18n.js`, sem recarregar a página. A escolha fica salva no `localStorage` e o idioma inicial vem do navegador.
- **Tema escuro (padrão) e claro** — também salvo no `localStorage`, aplicado antes da primeira pintura para não piscar.
- **Animações** — revelação em cascata ao rolar (`IntersectionObserver`), contadores animados, diagrama SVG de *request trace* no hero, holofote que segue o cursor nos cards, barra de progresso de leitura.
- **Acessibilidade** — navegação por teclado, `:focus-visible`, link "pular para o conteúdo", `aria-*` nos controles e suporte a `prefers-reduced-motion`.
- **SEO** — meta description, Open Graph, `lang` dinâmico, canonical e favicon SVG inline.

## Estrutura

```
.
├── index.html                     # conteúdo, com chaves data-i18n
├── assets/
│   ├── css/style.css              # tokens de tema, layout e animações
│   ├── js/i18n.js                 # dicionário PT + EN
│   ├── js/main.js                 # idioma, tema, scroll, contadores, menu
│   └── Thiago_Gama_Moreira_CV.pdf # currículo para download
├── .nojekyll                      # GitHub Pages serve os arquivos como estão
└── README.md
```

## Rodar localmente

Abrir o `index.html` no navegador já funciona. Para servir por HTTP:

```bash
python -m http.server 8000
# depois: http://localhost:8000
```

## Como editar

| O que mudar | Onde |
| --- | --- |
| Textos (PT e EN) | `assets/js/i18n.js` **e** o texto padrão no `index.html` |
| Cores e tipografia | bloco `:root` / `[data-theme="light"]` no topo do `style.css` |
| Novo projeto | duplicar um `<article class="card card--proj">` no `index.html` |
| Currículo | substituir o PDF em `assets/` mantendo o nome do arquivo |

> Ao mudar um texto, altere nos **dois** lugares: o `index.html` é o que aparece antes do JS carregar (e o que os buscadores leem), e o `i18n.js` é o que alimenta o botão PT/EN.

## Deploy (GitHub Pages)

O repositório `ThiagoGama1.github.io` publica automaticamente na raiz do domínio:

```bash
git add -A
git commit -m "atualiza portfólio"
git push
```

Em **Settings → Pages**, a origem deve estar em `Deploy from a branch` → `main` → `/ (root)`.
