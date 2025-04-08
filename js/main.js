document.addEventListener("DOMContentLoaded", function () {
  const menuContainer = document.getElementById("menu-container");
  const loader = document.getElementById("loader");
  // const messaggioFiltri = document.getElementById("messaggio-filtri");
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

  updateLangLabel();


  // URL per recuperare i dati dal foglio Google Sheets
  const sheetUrls = {
    menu: 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjPKOa_J9Zdohvg0pwZc-nDRnmyWy_isYn9Bd0TQfxzOLlu6_jfCuq5UV36vrCamiLIlIMNPXCXPdfZ1Ch0mIsRNaMwc1HFOuuNVyNeQdSu4slv-VfFCIw_AWaQqrCFkW2pOiFHn2eMIoKCPRuhTYCu1oHOCnyFvjhSQLPLpGZDpXmhqifTLY1Wjq-1JTLfbpOAb2oZfPpHjlAXLO-omURcWSFNFCbCpAmqJVnNOvf7j_Xmm5KKnQ3UYoHroVDOGTOAW_TZfxgFI2vDEP0lXy_vPNGj6Q&lib=MPqJJs0z37qA-qGw-bJBepz3FZZAEnAtP',
    eventi: 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLiUbPWgIifD__FgyqLTlPSLA3igB0SrtiDE5X_J4ylJzWxog3XQlvx-hhia8O-RPXJv-dP9Iw5Y025QvPIJTdOl0F5uS_X-G8UJAyZJ2O1-tGXpcqqVwMEKkGSLJ_LqyYOOY6f9mt1WT36Q-wJn7Ka5zLUPLB8f1ECqVR-KDdfMvsuLtU_SFX2iQk7EFj8T5whYtFXTRjQBv-6IbZhvr7IT1qZi2XIWjq3GYEX7wYgzno44sRmlDRLH55-a3mtIbehB5FfGZlUIMgSPWOqYXCnDeGHzqw&lib=MCSu3KQchPQyOTU_rZHtkkT3FZZAEnAtP'
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
      fetchEventi();
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
      updateLangLabel();
      fetchEventi();
    });
  });

  // 🔄 Traduce tutti i testi visibili
  function translateUI() {

    document.querySelectorAll('[data-menu="Bevande"]').forEach(el => {
      el.textContent = langData[lang].bevande;
    });

    document.querySelectorAll('[data-menu="cibo"]').forEach(el => {
      el.textContent = langData[lang].menu;
    });    

    document.querySelectorAll('[data-menu="lingua"]').forEach(el => {
      el.textContent = langData[lang].lingua;
    });
  
    [
      ["[data-menu='Antipasti']", langData[lang].antipasti],
      ["[data-menu='Primi']", langData[lang].primi],
      ["[data-menu='Secondi']", langData[lang].secondi],
      ["[data-menu='Dolci']", langData[lang].dolci],
      ["[data-menu='benvenuto']", langData[lang].benvenuto],
      ["[data-menu='scopriMenu']", langData[lang].scopriMenu],
      ["[data-menu='eventi']", langData[lang].eventi],
    ].forEach(([selector, text]) => {
      const el = document.querySelector(selector);
      if (el) el.textContent = text;
    });
    


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

  function updateLangLabel() {
    const currentLang = localStorage.getItem("lang") || "it";
    const labelMap = {
      it: "🇮🇹 Italiano",
      en: "🇬🇧 English",
      de: "🇩🇪 Deutsch"
    };
    document.querySelector('.dropdown-toggle').textContent = ` ${labelMap[currentLang]}`;
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
        renderConsigliChef();        
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
  
        // Aspetta che DOM sia visibile prima di popolare i consigli
        setTimeout(() => {
          renderConsigliChef();
        }, 100); // leggero delay per sicurezza
      })
      .catch(err => {
        console.error(err);
        menuContainer.innerHTML = "<p>Errore nel caricamento del menu.</p>";
        hideLoader();
      });
  }
  

  // 🖼️ Visualizza i piatti/elementi filtrati e tradotti
  function renderMenu() {
    menuContainer.innerHTML = "";

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
      // messaggioFiltri.textContent = langData[lang].noMatch;
      // messaggioFiltri.style.display = "block";
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

  // 🧑‍🍳 Rende visibili i piatti consigliati
  function renderConsigliChef() {
    const container = document.getElementById("chef-items");
    const section = document.getElementById("consigli-chef");
  
    if (!container || !section) {
      console.warn("⚠️ Elementi DOM per consigli dello chef non trovati!");
      return;
    }
  
    container.innerHTML = "";
    const consigliati = [];
  
    Object.values(menuData).forEach(categoria => {
      const piatti = categoria.filter(item => {
        console.log("🔍 Voce:", item["Nome piatto"], "consigliato:", item["Consigliato"]);
        return item["Consigliato"] && item["Consigliato"].toLowerCase().trim() === "si";
      });
      consigliati.push(...piatti);
    });
    
  
    console.log("👉 Piatti consigliati trovati:", consigliati);
  
    if (consigliati.length === 0) {
      section.style.display = "none";
      return;
    }
  
    section.style.display = "block";
  
    consigliati.forEach(item => {
      const div = document.createElement("div");
      div.className = "menu-item col-md-4";
  
      div.innerHTML = `
        <div class="card h-100 flex-column">
          <div class="card-body">
            ${item["Immagine"] ? `<img src="img/${item["Immagine"]}" class="card-img-top" alt="${item["Nome piatto"]}">` : ""}
            <h5 class="card-title">${item[`Nome piatto (${lang})`] || item["Nome piatto"]}</h5>
            <p class="card-text">Ingredienti: ${item["Ingredienti"]}</p>
            <p class="card-text">€${item["Prezzo"]}</p>

          </div>
        </div>
      `;
  
      container.appendChild(div);
    });
  }
  
  menuSwitchButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      menuSwitchButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });

  });

  function fetchEventi() {
    const eventiURL = sheetUrls["eventi"];
    const container = document.getElementById("eventi-container");
    if (!container) return;
  
    fetch(eventiURL)
      .then(res => res.json())
      .then(data => {
        container.innerHTML = ""; // pulizia
        
        if (!data || data.length === 0) {
          container.innerHTML = "<p>Nessun evento in programma.</p>";
          return;
        }
  
        data.forEach(evento => {
          const div = document.createElement("div");
          const dataObj = new Date(evento.Data);
          const dataFormattata = dataObj.toLocaleDateString("it-IT");
          
          
          div.innerHTML = `
            <div class="card shadow h-100 text-center">
              ${evento.Immagine ? `<img src="img/${evento.Immagine}" class="card-img-top" alt="${evento.Titolo || "Evento"}">` : ""}
              <div class="card-body">
                <h5 class="card-title">${evento.Titolo || "Evento"}</h5>
                <p class="card-text mb-1"><strong> ${langData[lang].data}:</strong> ${dataFormattata}</p>
              </div>
            </div>
          `;
          
  
          container.appendChild(div);
        });
      })
      .catch(err => {
        console.error("Errore nel caricamento eventi:", err);
      });
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
