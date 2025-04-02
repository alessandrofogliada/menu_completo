document.addEventListener("DOMContentLoaded", function () {
  const menuContainer = document.getElementById("menu-container");
  const filterButtons = document.querySelectorAll("#filtri button");
  const menuSwitchButtons = document.querySelectorAll(".menu-switch");

  let menuData = {}; // sarà un oggetto con sezioni
  let activeMenu = "Antipasti"; // default visibile all'avvio
  let filters = {
    vegetariano: false,
    vegano: false,
    glutenfree: false,
    piccante: false
  };

  // Cambia sezione (es. clic su "Bevande")
  menuSwitchButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      activeMenu = btn.dataset.menu;
      renderMenu();
    });
  });

  // Applica/rimuove filtri
  filterButtons.forEach(btn => {
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

  // Fetch completo del menu (tutte le sezioni)
  function fetchMenu() {
    const url = sheetUrls["menu"]; // usa un solo URL, che restituisce tutte le sezioni
    fetch(url)
      .then(res => res.json())
      .then(data => {
        menuData = data;
        renderMenu();
      })
      .catch(err => {
        console.error(err);
        menuContainer.innerHTML = "<p>Errore nel caricamento del menu.</p>";
      });
  }

  // Rendering dinamico della sezione attiva
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
      div.className = "menu-item";
      div.innerHTML = `
        <h3>${item["Nome piatto"]}</h3>
        ${item["Immagine"] ? `<img src="img/piatti/${item["Immagine"]}" alt="${item["Nome piatto"]}" />` : ""}
        <p>${item["Ingredienti"] || ""}</p>
        <p><strong>Prezzo:</strong> €${item["Prezzo"]}</p>
      `;
      menuContainer.appendChild(div);
    });
  }

  fetchMenu(); // carica tutto all'avvio
});
