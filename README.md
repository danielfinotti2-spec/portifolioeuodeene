# DeeneStore

Projeto organizado por tipo de arquivo.

## Estrutura

- `index.html`: versão estática da página.
- `views/index.ejs`: versão para uso com EJS/Express.
- `assets/css/styles.css`: estilos personalizados.
- `assets/js/tailwind.config.js`: configuração do Tailwind CDN.
- `assets/js/main.js`: interações da página.
- `assets/img/`: imagens usadas no site.
- `assets/video/`: vídeos usados no site (logo animado, preview de portfólio, etc.).

## Como abrir

Para usar como site estático, abra o arquivo `index.html` no navegador.

Para usar com Express/EJS, renderize `views/index.ejs` e sirva a pasta `assets` como arquivos estáticos.

## Observações

- A versão EJS inclui o `index.html`, mantendo as duas formas de uso sempre sincronizadas.
- Os vídeos dos projetos ficam em `assets/video/` e são reproduzidos automaticamente, sem áudio e em loop.

