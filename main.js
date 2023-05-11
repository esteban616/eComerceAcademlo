function actualizarLocalStorage(key, valor) {
  localStorage.setItem(key, JSON.stringify(valor));
}
async function getProductos() {
  try {
    const datos = await fetch(
      "https://ecommercebackend.fundamentos-29.repl.co/"
    );
    const respuesta = await datos.json();
    localStorage.setItem("productos", JSON.stringify(respuesta));
    return respuesta;
  } catch (error) {
    console.error(error);
  }
}

function pintarProductos(db) {
  let html = "";
  db.productos.forEach((producto) => {
    html += `
        <div class="producto ${producto.category}">
            <div class="imgProducto">
                <img src="${producto.image}" alt="${producto.name}">
            </div>
            <div class="productoBody">
            <p><b>$${producto.price}.00</b>  
            <small class="${producto.quantity ? "" : "sinStock"}">
            ${producto.quantity ? `Stock: ${producto.quantity}` : "Sold out"}
            
            </small>
            </p>    
            <p>${producto.name}</p>
            ${
              producto.quantity
                ? `<i class='bx bx-plus' id="${producto.id}"></i>`
                : "<div></div>"
            } 
            
            </div>
        </div>
        
        `;
  });
  document.querySelector(".productos").innerHTML = html;
}

function mostrarCompras() {
  const iconoCompraHTML = document.querySelector("#iconoCompras");
  const compraHTML = document.querySelector(".compras");

  iconoCompraHTML.addEventListener("click", function () {
    compraHTML.classList.toggle("comprasVisible");
  });
}

function pintarCompras(db) {
  let html = "";

  Object.values(db.compras).forEach((item) => {
    html += `
        <div class="compraItem">
        <div class="compraItemImg">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="compraItemBody">
          <h4><b>${item.name}</b></h4>
          <p>Stock: ${item.quantity} | <span>$${item.price}.00</span></p>
          <h4>Subtotal: $${item.cantidad * item.price}.00</h4>
          
          <div class="compraOpciones" >
          <i class='bx bx-minus' id="${item.id}"></i>
          <span>${item.cantidad}</span>
          <i class='bx bx-plus' id="${item.id}"></i>
          <i class='bx bx-trash-alt' id="${item.id}"></i>
          </div>
        
          </div>
          
      </div>
        `;
  });
  document.querySelector(".productosCompra").innerHTML = html;
  pintarTotal(db);
}

function llenarCompras(db) {
  const productosHTML = document.querySelector(".productos");
  productosHTML.addEventListener("click", function (e) {
    if (e.target.classList.contains("bx-plus")) {
      const productoId = Number(e.target.id);

      const productoEncontrado = db.productos.find(function (producto) {
        return producto.id === productoId;
      });
      if (db.compras[productoId]) {
        if (
          db.compras[productoId].cantidad === db.compras[productoId].quantity
        ) {
          return alert("sin disponibilidad");
        }
        db.compras[productoId].cantidad += 1;
      } else {
        db.compras[productoId] = structuredClone(productoEncontrado);
        db.compras[productoId].cantidad = 1;
      }

      actualizarLocalStorage("compras", db.compras);
      pintarCompras(db);
    }
  });
}

function manejadorCompras(db) {
  const compraOpcionesHTML = document.querySelector(".productosCompra");
  compraOpcionesHTML.addEventListener("click", function (e) {
    if (e.target.classList.contains("bx-minus")) {
      const productoId = Number(e.target.id);
      if (db.compras[productoId].cantidad > 1) {
        db.compras[productoId].cantidad--;
      } else {
        const respuesta = confirm("eliminar el producto?");
        if (!respuesta) return;
        delete db.compras[productoId];
      }
      actualizarLocalStorage("compras", db.compras);
      pintarCompras(db);
      pintarTotal(db);
    }
    if (e.target.classList.contains("bx-plus")) {
      const productoId = Number(e.target.id);
      if (db.compras[productoId].cantidad < db.compras[productoId].quantity) {
        db.compras[productoId].cantidad++;
      } else {
        alert("no mas en stock");
      }
      actualizarLocalStorage("compras", db.compras);
      pintarCompras(db);
      pintarTotal(db);
    }
    if (e.target.classList.contains("bx-trash-alt")) {
      const productoId = Number(e.target.id);
      const respuesta = confirm("eliminar el producto?");
      if (!respuesta) return;
      delete db.compras[productoId];
      pintarCompras(db);
      pintarTotal(db);
      actualizarLocalStorage("compras", db.compras);
    }
  });
}
function pintarTotal(db) {
  const totaItemHTML = document.querySelector(".totalItem");
  const totalInfoHTML = document.querySelector(".totalInfo");
  let cantidadTotal = 0;
  let precioTotal = 0;

  Object.values(db.compras).forEach((item) => {
    cantidadTotal += item.cantidad;
    precioTotal += item.cantidad * item.price;
  });
  let html = `
      <p>${cantidadTotal} items</p>
        <p> <b>$${precioTotal}.00</b></p>
  `;
  totaItemHTML.textContent = cantidadTotal;
  totalInfoHTML.innerHTML = html;
}

function comprar(db) {
  document.querySelector(".btnComprar").addEventListener("click", function () {
    if (Object.values(db.compras).length === 0) {
      return alert("carrito de compras vacio!");
    }
    const nuevosProductos = [];
    for (const producto of db.productos) {
      let compra = db.compras[producto.id];
      if (producto.id === compra?.id) {
        nuevosProductos.push({
          ...producto,
          quantity: producto.quantity - compra.cantidad,
        });
      } else {
        nuevosProductos.push(producto);
      }
    }
    db.productos = nuevosProductos;
    db.compras = {};
    actualizarLocalStorage("productos", db.productos);
    actualizarLocalStorage("compras", db.compras);
    pintarProductos(db);
    pintarCompras(db);
    pintarTotal(db);
  });
}

async function main() {
  const db = {
    productos:
      JSON.parse(localStorage.getItem("productos")) || (await getProductos()),
    compras: JSON.parse(localStorage.getItem("compras")) || {},
  };

  pintarProductos(db);
  mostrarCompras();
  pintarCompras(db);
  llenarCompras(db);
  manejadorCompras(db);
  pintarTotal(db);
  comprar(db);

  mixitup(".productos", {
    selectors: {
      target: ".producto",
    },
    animation: {
      duration: 300,
    },
  });

  window.addEventListener("scroll", function() {
    let header = document.querySelector(".header");
    header.classList.toggle("headerScroll", window.scrollY > 80);
  });
 
  // Esperar 2 segundos antes de ocultar la pantalla de carga
setTimeout(function(){
  // Ocultar la pantalla de carga
  document.getElementById("pantalla-carga").style.display = "none";
}, 1500);

}

main();
