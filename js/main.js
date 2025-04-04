document.addEventListener("DOMContentLoaded", function () {
  const menuContainer = document.getElementById("menu-container");
  const loader = document.getElementById("loader");
  const messaggioFiltri = document.getElementById("messaggio-filtri");
  const menuSwitchButtons = document.querySelectorAll(".menu-switch");
  const menuSezioni = document.getElementById("menuSezioni");
  const filtriCibo = document.getElementById("filtri-cibo");
  const filtriBevande = document.getElementById("filtri-bevande");
  const navButtons = document.querySelectorAll(".bottom-nav .nav-btn");


  let datiCaricatiMenu = false;
  let sezionePrincipale = null;
  let activeMenu = "Antipasti";
  let lang = localStorage.getItem("lang") || "it";
  let langData = {};
  let menuData = {};

  // Filtri attivi per categorie
  let filters = {
    vegetariano: false,
    vegano: false,
    glutenfree: false,
    piccante: false,
    lattosiofree: false,
    alcolico: false,
    analcolico: false
  };

  // URL per recuperare i dati dal foglio Google Sheets
  const sheetUrls = {
    menu: 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjPKOa_J9Zdohvg0pwZc-nDRnmyWy_isYn9Bd0TQfxzOLlu6_jfCuq5UV36vrCamiLIlIMNPXCXPdfZ1Ch0mIsRNaMwc1HFOuuNVyNeQdSu4slv-VfFCIw_AWaQqrCFkW2pOiFHn2eMIoKCPRuhTYCu1oHOCnyFvjhSQLPLpGZDpXmhqifTLY1Wjq-1JTLfbpOAb2oZfPpHjlAXLO-omURcWSFNFCbCpAmqJVnNOvf7j_Xmm5KKnQ3UYoHroVDOGTOAW_TZfxgFI2vDEP0lXy_vPNGj6Q&lib=MPqJJs0z37qA-qGw-bJBepz3FZZAEnAtP'
  };


  document.querySelectorAll(".menu-card").forEach(card => {
    card.addEventListener("click", () => {
      const tipo = card.dataset.menu;
      document.querySelector(`[data-menu="${tipo}"]`).click(); // simula il click
    });
  });
  
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active")); // rimuove dagli altri
      btn.classList.add("active"); // aggiunge solo al cliccato
    });
  });

  // 🗣️ Carica il file delle traduzioni e imposta lingua attiva
  fetch("lang.json")
    .then(res => res.json())
    .then(data => {
      langData = data;
      translateUI();
      enableButtons();
    });

  // 🔓 Sblocca i pulsanti di menu dopo che la lingua è caricata
  function enableButtons() {
    menuSwitchButtons.forEach(btn => btn.disabled = false);
  }

  // 🌐 Cambia lingua e aggiorna UI
  document.querySelectorAll("#lingua-selector button").forEach(btn => {
    btn.addEventListener("click", () => {
      lang = btn.dataset.lang;
      localStorage.setItem("lang", lang);
      translateUI();
      renderMenu();
    });
  });

  // 🔄 Traduce tutti i testi visibili
  function translateUI() {
    document.querySelector('[data-menu="cibo"]').textContent = langData[lang].menu;
    document.querySelector('[data-menu="Bevande"]').textContent = langData[lang].bevande;
    document.querySelector('[data-menu="Antipasti"]').textContent = langData[lang].antipasti;
    document.querySelector('[data-menu="Primi"]').textContent = langData[lang].primi;
    document.querySelector('[data-menu="Secondi"]').textContent = langData[lang].secondi;
    document.querySelector('[data-menu="Dolci"]').textContent = langData[lang].dolci;


    // 🥗 Traduzione dei filtri CIBO
    const ciboFilters = {
      glutenfree: "🌾 " + langData[lang].glutenfree,
      lattosiofree: "🥛 " + langData[lang].lattosiofree,
      vegetariano: "🥦 " + langData[lang].vegetariano,
      vegano: "🥕 " + langData[lang].vegano,
      piccante: "🌶️ " + langData[lang].piccante,
      reset: "🔁 " + langData[lang].reset
    };

    Object.entries(ciboFilters).forEach(([key, label]) => {
      const btn = document.querySelector(`#filtri-cibo button[data-filter="${key}"]`);
      if (btn) btn.textContent = label;
    });

    // 🍷 Traduzione dei filtri BEVANDE
    const bevandeFilters = {
      alcolico: "🍷 " + langData[lang].alcolico,
      analcolico: "🥤 " + langData[lang].analcolico,
      reset: "🔁 " + langData[lang].reset
    };

    Object.entries(bevandeFilters).forEach(([key, label]) => {
      const btn = document.querySelector(`#filtri-bevande button[data-filter="${key}"]`);
      if (btn) btn.textContent = label;
    });
  }

  // 🔘 Gestione del click su pulsanti menù principali e sottosezioni
  menuSwitchButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tipo = btn.dataset.menu;

      filtriCibo.style.display = "none";
      filtriBevande.style.display = "none";

      if (tipo === "cibo") {
        sezionePrincipale = "cibo";
        menuSezioni.style.display = "flex";
        activeMenu = "Antipasti";
      } else if (tipo === "Bevande") {
        sezionePrincipale = "bevande";
        menuSezioni.style.display = "none";
        filtriBevande.style.display = "flex";
        activeMenu = "Bevande";
      } else {
        activeMenu = tipo;
        if (sezionePrincipale === "cibo") {
          filtriCibo.style.display = "flex";
        }
      }

      if (!datiCaricatiMenu) {
        datiCaricatiMenu = true;
        showLoader();         
        fetchMenu();
      } else {
        showLoader();         
        renderMenu();
      }
      
    });
  });

  // 🎯 Attiva/disattiva i filtri
  function attachFilterListeners() {
    const allFilterButtons = document.querySelectorAll("#filtri-cibo button, #filtri-bevande button");
    allFilterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.filter;
        if (type === "reset") {
          for (let key in filters) filters[key] = false;
        } else {
          filters[type] = !filters[type];
        }
        renderMenu();
      });
    });
  }

  // 📥 Recupera il menu dal Google Sheet
  function fetchMenu() {
    const url = sheetUrls["menu"];
    showLoader();

    fetch(url)
      .then(res => res.json())
      .then(data => {
        menuData = data;
        attachFilterListeners();
        renderMenu();
      })
      .catch(err => {
        console.error(err);
        menuContainer.innerHTML ="<p>Errore nel caricamento del menu.</p>";
        hideLoader();
      });
  }

  // 🖼️ Visualizza i piatti/elementi filtrati e tradotti
  function renderMenu() {
    menuContainer.innerHTML = "";
    messaggioFiltri.style.display = "none";

    if (!menuData[activeMenu]) {
      menuContainer.innerHTML = `<p class="infoNoDati">${langData[lang].noDati}</p>`;
      hideLoader();
      return;
    }

    const filtered = menuData[activeMenu].filter(item => {
      let ok = true;

      if (sezionePrincipale === "cibo") {
        ["vegetariano", "vegano", "glutenfree", "piccante", "lattosiofree"].forEach(key => {
          if (filters[key] && (!item["Categoria"] || !item["Categoria"].toLowerCase().includes(key))) {
            ok = false;
          }
        });
      }

      if (sezionePrincipale === "bevande") {
        if (filters.alcolico && (!item["Categoria"] || item["Categoria"].toLowerCase() !== "alcolico")) ok = false;
        if (filters.analcolico && (!item["Categoria"] || item["Categoria"].toLowerCase() !== "analcolico")) ok = false;
      }

      return ok;
    });

    if (filtered.length === 0) {
      messaggioFiltri.textContent = langData[lang].noMatch;
      messaggioFiltri.style.display = "block";
      hideLoader();
      return;
    }

    filtered.forEach(item => {
      const div = document.createElement("div");
      div.className = "menu-item col-md-4 mb-4";
    
      // Badge dinamici
      const categorie = (item["Categoria"] || "").toLowerCase().split(",").map(c => c.trim());
      const badgeMap = {
        vegetariano: { label: langData[lang].vegetariano || "Vegetariano", class: "bg-warning" },
        vegano: { label: langData[lang].vegano || "Vegano", class: "bg-success" },
        glutenfree: { label: langData[lang].glutenfree || "Senza Glutine", class: "glutenfree" },
        lattosiofree: { label: langData[lang].lattosiofree || "Senza Lattosio", class: "bg-primary" },
        piccante: { label: langData[lang].piccante || "Piccante", class: "bg-danger" },
        alcolico: { label: langData[lang].alcolico || "Alcolico", class: "bg-danger" },
        analcolico: { label: langData[lang].analcolico || "Analcolico", class: "bg-primary" }
      };
    
      let badgeHTML = "";
    
      Object.keys(badgeMap).forEach(key => {
        if (categorie.includes(key)) {
          badgeHTML += `<span class="badge ${badgeMap[key].class} me-1">${badgeMap[key].label}</span>`;
        }
      });
      

      div.innerHTML = `
        <div class="card h-100 flex-row">
          ${item["Immagine"] ? `<img src="img/${item["Immagine"]}" class="card-img-top w-50" alt="${item["Nome piatto"]}">` : ""}
            <div class="card-body">
              <h5 class="card-title" style="font-weight:bold">${item[`Nome piatto (${lang})`] || item["Nome piatto"]}</h5>
              <div class="mb-2">${badgeHTML}</div>
              <p class="card-text"><strong>${langData[lang].ingredienti}:</strong> ${item[`Ingredienti (${lang})`] || item["Ingredienti"]}</p>
              <p class="card-text"><strong>${langData[lang].prezzo}:</strong> €${item["Prezzo"]}</p>
          </div>

        </div>
      `;
      menuContainer.appendChild(div);
    });

    hideLoader();
  }

  // ✅ Nasconde contenuto e mostra loader

  function showLoader() {
    loader.style.display = "flex";
    document.getElementById("home-screen").style.display = "none";
    menuContainer.style.display = "none";
  }
  

  // ✅ Nasconde loader e mostra contenuto
  function hideLoader() {
    loader.style.display = "none";
    menuContainer.style.display = "flex";
  }  
});
