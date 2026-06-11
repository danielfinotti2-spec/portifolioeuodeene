(function () {
  const chars = "#!%░▒▓_01ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  let finished = false;
  let introStarted = false;

  function randomChar() {
    return chars[Math.floor(Math.random() * chars.length)];
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function finishIntro() {
    if (finished) return;
    finished = true;

    const intro = document.getElementById("intro");

    if (intro) {
      intro.classList.add("hide");
      intro.setAttribute("aria-hidden", "true");
      intro.style.opacity = "0";
      intro.style.visibility = "hidden";
      intro.style.pointerEvents = "none";

      setTimeout(() => {
        intro.style.display = "none";
      }, 250);
    }

    document.body.classList.remove("intro-running");
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    window.scrollTo(0, 0);
  }

  // função global para funcionar até com onclick no HTML
  window.pularIntroAgora = function () {
    finishIntro();
  };

  // clique forçado no botão pular
  document.addEventListener(
    "click",
    function (event) {
      const button = event.target.closest("#introSkip, .intro-skip");

      if (button) {
        event.preventDefault();
        event.stopPropagation();
        finishIntro();
      }
    },
    true
  );

  // tecla ESC também pula
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      finishIntro();
    }
  });

  function showSlide(slides, index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
    });
  }

  function scramble(element, finalText, duration = 600) {
    if (!element || finished) return Promise.resolve();

    const text = String(finalText || element.dataset.text || element.textContent || "");
    const start = performance.now();
    const len = text.length;

    return new Promise((resolve) => {
      function frame(now) {
        if (finished) {
          resolve();
          return;
        }

        const progress = Math.min((now - start) / duration, 1);
        const reveal = Math.floor(progress * len);
        let output = "";

        for (let i = 0; i < len; i++) {
          if (i < reveal || text[i] === " ") {
            output += text[i];
          } else {
            output += randomChar();
          }
        }

        element.textContent = output;

        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          element.textContent = text;
          resolve();
        }
      }

      requestAnimationFrame(frame);
    });
  }

  async function runIntro() {
    if (introStarted) return;
    introStarted = true;

    const intro = document.getElementById("intro");
    if (!intro) return;

    const skip = document.getElementById("introSkip");
    const slides = $$(".intro-main .slide", intro);

    document.body.classList.add("intro-running");
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    if (skip) {
      skip.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        finishIntro();
      };
    }

    // segurança: se der qualquer bug, a intro some sozinha
    setTimeout(() => {
      finishIntro();
    }, 11000);

    if (!slides.length) {
      finishIntro();
      return;
    }

    $$("p", intro).forEach((p) => {
      const originalText = p.textContent.trim();
      p.dataset.text = originalText;
      p.textContent = "";
    });

    showSlide(slides, 0);

    const firstWords = $$("p", slides[0]);

    for (let i = 0; i < firstWords.length; i++) {
      if (finished) return;
      scramble(firstWords[i], firstWords[i].dataset.text, 500);
      await wait(45);
    }

    await wait(800);
    if (finished) return;

    const center = $(".center", slides[0]);

    if (center) {
      await scramble(center, "euodeene", 500);
      if (finished) return;

      await scramble(center, "loja digital", 600);
      if (finished) return;

      await scramble(center, "sites que vendem", 700);
    }

    await wait(400);
    if (finished) return;

    showSlide(slides, 1);

    const secondWords = $$("p", slides[1]);

    for (let i = 0; i < secondWords.length; i++) {
      if (finished) return;
      scramble(secondWords[i], secondWords[i].dataset.text, 520);
      await wait(45);
    }

    await wait(1000);
    if (finished) return;

    showSlide(slides, 2);

    const finalText = $("p", slides[2]);

    if (finalText) {
      await scramble(finalText, "domínio incluso", 600);
      if (finished) return;

      await scramble(finalText, "euodeene publica seu site", 700);
      if (finished) return;

      await scramble(finalText, "sua loja no ar", 700);
    }

    await wait(600);
    finishIntro();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runIntro);
  } else {
    runIntro();
  }
})();