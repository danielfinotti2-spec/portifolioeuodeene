# Deenes Ambientes

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

- `index.html` e `views/index.ejs` divergiram na seção do hero (o `.html` usa uma imagem de fundo estática com layout novo; o `.ejs` ainda usa o vídeo de fundo com o layout antigo). Ainda não foram sincronizados.
- As imagens `ZATTI.png`, `home-theater.jpg`, `cozinha.jpg`, `porque-a-zatti.jpg`, `quarto-infantil.jpg`, `suite-master.jpg` e `loja-de-motos.jpg` estão na pasta mas não são usadas em nenhum lugar do site ainda.
- `kaneki.png` foi removido do uso no hero (era um placeholder de teste); o arquivo continua na pasta `assets/img/` caso seja necessário.

