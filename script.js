const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarning = document.getElementById("address-warning");

let cart = [];

cartBtn.addEventListener("click", function () {
  updateCartmodal();
  cartModal.style.display = "flex";
});

cartModal.addEventListener("click", function (event) {
  if (event.target === cartModal || event.target === closeModalBtn) {
    cartModal.style.display = "none";
  }
});

menu.addEventListener("click", function (event) {
  let parentButton = event.target.closest(".add-to-cart-btn");

  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    const price = parseFloat(parentButton.getAttribute("data-price"));

    addToCart(name, price);
  }
});

//função para adicionar produtos ao carrinho
function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    //existindo o item no carrinho, atualiza apenas a quantidade
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price,
      quantity: 1,
    });
  }
  updateCartmodal();
}

//função para mostrar produtos do carrinho
function updateCartmodal() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add(
      "flex",
      "justify-between",
      "mb-4",
      "flex-col"
    );

    cartItemElement.innerHTML = `
      <div class="flex items-center justify-between"> 
        <div> 
          <p class="font-medium"> ${item.name}</p>
          <p>Qtd: ${item.quantity}</p>
          <p class="font-medium mt=2">R$ ${item.price.toFixed(2)}</p>
        </div>

          <button class = "remove-from-cart-btn" data-name="${item.name}">
            Remover
          </button>

      </div>`;

    total += item.price * item.quantity;

    cartItemsContainer.appendChild(cartItemElement);
  });

  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  cartCounter.innerHTML = cart.length;
}

//function para remover items do carrinho
cartItemsContainer.addEventListener("click", function (event) {
  if (event.target.classList.contains("remove-from-cart-btn")) {
    const name = event.target.getAttribute("data-name");

    removeItemCart(name);
  }
});

function removeItemCart(name) {
  const index = cart.findIndex((item) => item.name === name);

  if (index !== -1) {
    const item = cart[index];

    if (item.quantity > 1) {
      item.quantity -= 1;
      updateCartmodal();
      return;
    }

    cart.splice(index, 1);
    updateCartmodal();
  }
}

addressInput.addEventListener("input", function (event) {
  let inputValue = event.target.value;

  if (inputValue !== "") {
    addressInput.classList.remove("border-red-500");
    addressWarning.classList.add("hidden");
  }
});

//finalizar pedido
checkoutBtn.addEventListener("click", function () {
  const isOpen = checkRestaurantOpen();
  if (!isOpen) {
    Toastify({
      text: "RESTAURANTE FECHADO NO MOMENTO",
      duration: 3000,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "right", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      closeOnClick: true,
      style: {
        background: "#ef4444",
      },
      onClick: function () {}, // Callback after click
    }).showToast();

    return;
  }
  if (cart.length === 0) return;
  if (addressInput.value === "") {
    addressWarning.classList.remove("hidden");
    addressInput.classList.add("border-red-500");
    return;
  }

  //enviar pedido para api whats
  const cartItems = cart
    .map((item) => {
      return `
      ${item.name} Quantidade: (${item.quantity}) Preço: R$${item.price} | `;
    })
    .join("");

  const message = encodeURIComponent(cartItems);
  const phone = "981304034";

  window.open(
    `https://wa.me/${phone}?text=${message} Endereço: ${addressInput.value}`,
    "_blank"
  );

  cart = [];
  updateCartmodal();
  addressInput.value = "";
});

//função para verificar a hora e data e alterar o card de horario
function checkRestaurantOpen() {
  const data = new Date();
  const hora = data.getHours();
  return hora >= 18 && hora < 22;
}

const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen();

if (isOpen) {
  spanItem.classList.remove("bg-red-500");
  spanItem.classList.add("bg-green-600");
} else {
  spanItem.classList.remove("bg-green-600");
  spanItem.classList.add("bg-red-500");
}
