document.addEventListener("DOMContentLoaded", function () {
  const menuContainer = document.getElementById("menu-container");
  const menuSwitchButtons = document.querySelectorAll(".menu-switch");
  const menuSezioni = document.getElementById("menuSezioni");
  const filtriCibo = document.getElementById("filtri-cibo");
  const filtriBevande = document.getElementById("filtri-bevande");

  let datiCaricatiMenu = false;
  let sezionePrincipale = null;
  let activeMenu = "Antipasti";

  let filters = {
    vegetariano: false,
    vegano: false,
    glutenfree: false,
    piccante: false,
    lattosiofree: false,
    alcolico: false,
    analcolico: false
  };

  const sheetUrls = {
   menu: 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjPKOa_J9Zdohvg0pwZc-nDRnmyWy_isYn9Bd0TQfxzOLlu6_jfCuq5UV36vrCamiLIlIMNPXCXPdfZ1Ch0mIsRNaMwc1HFOuuNVyNeQdSu4slv-VfFCIw_AWaQqrCFkW2pOiFHn2eMIoKCPRuhTYCu1oHOCnyFvjhSQLPLpGZDpXmhqifTLY1Wjq-1JTLfbpOAb2oZfPpHjlAXLO-omURcWSFNFCbCpAmqJVnNOvf7j_Xmm5KKnQ3UYoHroVDOGTOAW_TZfxgFI2vDEP0lXy_vPNGj6Q&lib=MPqJJs0z37qA-qGw-bJBepz3FZZAEnAtP'
  };

  let menuData = {};

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
        fetchMenu();
        datiCaricatiMenu = true;
      } else {
        renderMenu();
      }
    });
  });

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

  function fetchMenu() {
    const url = sheetUrls["menu"];
    fetch(url)
      .then(res => res.json())
      .then(data => {
        menuData = data;
        attachFilterListeners();
        renderMenu();
      })
      .catch(err => {
        console.error(err);
        menuContainer.innerHTML = "<p>Errore nel caricamento del menu.</p>";
      });
  }

  function renderMenu() {
    menuContainer.innerHTML = "";

    if (!menuData[activeMenu]) {
      menuContainer.innerHTML = "<p>Nessun dato disponibile per questa sezione.</p>";
      return;
    }

    const filtered = menuData[activeMenu].filter(item => {
      let ok = true;
      for (let key in filters) {
        if (filters[key] && (!item["Categoria"] || !item["Categoria"].toLowerCase().includes(key))) {
          ok = false;
        }
      }
      return ok;
    });

    if (filtered.length === 0) {
      menuContainer.innerHTML = "<p>Nessun piatto corrispondente ai filtri selezionati.</p>";
      return;
    }

    filtered.forEach(item => {
      const div = document.createElement("div");
      div.className = "menu-item col-md-4 mb-4";
      div.innerHTML = `
        <div class="card h-100">
          ${item["Immagine"] ? `<img src="img/${item["Immagine"]}" class="card-img-top" alt="${item["Nome piatto"]}">` : ""}
          <div class="card-body">
            <h5 class="card-title">${item["Nome piatto"]}</h5>
            <p class="card-text">${item["Ingredienti"] || ""}</p>
            <p class="card-text"><strong>Prezzo:</strong> €${item["Prezzo"]}</p>
          </div>
        </div>
      `;
      menuContainer.appendChild(div);
    });
  }
});

