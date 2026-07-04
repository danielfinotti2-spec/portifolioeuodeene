// 1. Menu Mobile Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const iconMenu = document.getElementById('icon-menu');
    const iconClose = document.getElementById('icon-close');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMenu() {
      mobileMenu.classList.toggle('hidden');
      iconMenu.classList.toggle('hidden');
      iconClose.classList.toggle('hidden');
    }

    mobileMenuBtn.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (!mobileMenu.classList.contains('hidden')) toggleMenu();
      });
    });

    // 2. Efeito Reveal on Scroll (Fade Up)
    document.addEventListener('DOMContentLoaded', () => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Opcional: Descomente a linha abaixo para animar apenas uma vez
            // observer.unobserve(entry.target); 
          }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

      document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    });

    // 3. Sistema de Filtro do Portfólio
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filterValue = btn.getAttribute('data-filter');

        // Atualiza botões ativos
        filterBtns.forEach(b => {
          b.classList.remove('bg-stone-900', 'text-white');
          b.classList.add('bg-white', 'text-stone-600', 'border', 'border-stone-200');
        });
        btn.classList.remove('bg-white', 'text-stone-600', 'border', 'border-stone-200');
        btn.classList.add('bg-stone-900', 'text-white');

        // Filtra os itens
        portfolioItems.forEach(item => {
          if (filterValue === 'Todos' || item.getAttribute('data-category') === filterValue) {
            item.style.display = 'block';
            setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 50);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';
            setTimeout(() => { item.style.display = 'none'; }, 300); // Aguarda transição CSS
          }
        });
      });
    });

    // 4. Lógica do Carrossel de Depoimentos (Passa um por vez)
    const track = document.getElementById('carousel-track');
    let isMoving = false;

    function moveCarousel() {
      if (isMoving || !track || track.children.length === 0) return;
      isMoving = true;

      // Pega o primeiro cartão e a distância que precisamos mover
      const firstCard = track.children[0];
      const gap = 24; // O equivalente a gap-6 do Tailwind (1.5rem = 24px)
      const moveDistance = firstCard.offsetWidth + gap;

      // Aplica a transição e move a trilha para a esquerda
      track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      track.style.transform = `translateX(-${moveDistance}px)`;

      // Quando a transição terminar, reorganiza os elementos silenciosamente
      setTimeout(() => {
        // Remove a transição momentaneamente para voltar ao eixo original sem piscar
        track.style.transition = 'none';
        
        // Joga o primeiro cartão lá para o final da fila (cria o loop infinito)
        track.appendChild(firstCard); 
        
        // Reseta a posição da trilha
        track.style.transform = 'translateX(0)';
        
        // Libera para o próximo movimento
        isMoving = false;
      }, 600); // 600ms igual ao tempo da transição no CSS
    }

    // Passa para o próximo cartão a cada 4 segundos
    setInterval(moveCarousel, 4000);

    // 5. Lógica da Tela de Entrada (Splash Screen)
    window.addEventListener('load', () => {
      const splashScreen = document.getElementById('splash-screen');
      
      // Deixa a animação rolar por 2.2 segundos
      setTimeout(() => {
        // Remove a opacidade para sumir suavemente (fade out)
        splashScreen.style.opacity = '0';
        
        // Remove o elemento do caminho depois que a transição de opacidade terminar
        setTimeout(() => {
          splashScreen.style.display = 'none';
        }, 500); // 1000ms = 1 segundo de transição suave
      }, 2000); 
    });

