let container = document.createElement("div");
container.classList.add("product");

let cart = JSON.parse(localStorage.getItem("cartItems")) || [];

// -------------------- TOTAL COUNT FUNCTION --------------------
function updateTotalCount() {
  let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
  let total = cart.reduce((sum, item) => sum + item.qty, 0);

  localStorage.setItem("tc", total);

  let net = document.querySelector(".tco");
  if (total === 0) {
    net.style.display = "none";
  } else {
    net.style.display = "block";
    net.innerText = total;
  }
}

updateTotalCount(); // On page load

// --------------------------------------------------------------
async function getBooks() {
  const res = await fetch("https://book-it-mnxw.onrender.com/books");
  const books = await res.json();
  return books;
}
let wishlistArray = JSON.parse(localStorage.getItem("wishList")) || [];

async function main() {
  const books = await getBooks();
  console.log(books); // works!

  let random = books.sort(() => Math.random() - 0.5);
  function cards(arr) {
    container.innerHTML = "";
    arr.forEach((val) => {
      let card = document.createElement("div");
      card.classList.add("child");
      // 👉 Add listener here
      card.addEventListener("click", () => {
        // Store ONE product object
        localStorage.setItem("prod", JSON.stringify(val));

        // Go to product page
        window.location.href = "product.html";
      });
      let img = document.createElement("img");
      let h3 = document.createElement("h3");
      let p = document.createElement("p");
      img.src = val.image;
      h3.innerText = val.name;
      p.innerText = `₹${val.price}`;

      // TODO: Wishlist
      // Load existing wishlist from localStorage
      // let wishlistArray = JSON.parse(localStorage.getItem("wishList")) || [];

      // Create wish icon
      let w = document.createElement("div");
      w.classList.add("wish");

      // Check if this product is already wished
      let isInWish = wishlistArray.includes(val.id);

      // Initial heart state based on localStorage
      w.innerHTML = isInWish
        ? `<i class="fa-solid fa-heart"></i>`
        : `<i class="fa-regular fa-heart"></i>`;

      // Click behavior
      w.addEventListener("click", (e) => {
        e.stopPropagation();

        let icon = e.currentTarget.querySelector("i");

        // Toggle heart UI
        icon.classList.toggle("fa-regular");
        icon.classList.toggle("fa-solid");

        // Check new state
        let isWished = icon.classList.contains("fa-solid");

        if (isWished) {
          // Add id to wishlist if not present
          if (!wishlistArray.includes(val.id)) {
            wishlistArray.push(val.id);
          }
        } else {
          // Remove id
          wishlistArray = wishlistArray.filter((id) => id !== val.id);
        }

        // Save updated list
        localStorage.setItem("wishList", JSON.stringify(wishlistArray));

        console.log("Updated wishlist:", wishlistArray);
      });






      // Check if product already in cart
      let existing = cart.find((item) => item.name === val.name);
      let count = existing ? existing.qty : 0;

      let btnBox = document.createElement("div");
      btnBox.classList.add("btnBox");

      renderUI();

      function renderUI() {
        btnBox.innerHTML = ""; // Reset buttons

        if (count === 0) {
          let addBtn = document.createElement("button");
          addBtn.innerText = "Add to Cart";
          addBtn.onclick = (e) => {
            e.stopPropagation();
            count = 1;

            let existing = cart.find((i) => i.name === val.name);
            if (!existing) cart.push({ ...val, qty: 1 });
            else existing.qty = 1;

            localStorage.setItem("cartItems", JSON.stringify(cart));
            updateTotalCount();
            renderUI();
          };

          btnBox.append(addBtn);
          return;
        }

        // ---------------- Quantity Mode ----------------
        let minusBtn = document.createElement("button");
        minusBtn.innerText = "-";
        minusBtn.onclick = (e) => {
          e.stopPropagation();
          count--;

          if (count <= 0) {
            cart = cart.filter((i) => i.name !== val.name);
            localStorage.setItem("cartItems", JSON.stringify(cart));
            updateTotalCount();
            count = 0;
            renderUI();
            return;
          }

          let item = cart.find((i) => i.name === val.name);
          item.qty = count;

          localStorage.setItem("cartItems", JSON.stringify(cart));
          updateTotalCount();
          renderUI();
        };

        let qtyBox = document.createElement("div");
        qtyBox.classList.add("sup");
        qtyBox.innerText = count;

        let plusBtn = document.createElement("button");
        plusBtn.innerText = "+";
        plusBtn.onclick = (e) => {
          e.stopPropagation();
          count++;

          let item = cart.find((i) => i.name === val.name);
          item.qty = count;

          localStorage.setItem("cartItems", JSON.stringify(cart));
          updateTotalCount();
          renderUI();
        };

        // Wrap inside qantup
        let qantup = document.createElement("div");
        qantup.classList.add("qantup");
        qantup.append(minusBtn, qtyBox, plusBtn);

        btnBox.append(qantup);
      }

      // Append card items (fixed location)
      card.append(img, w, h3, p, btnBox);
      container.append(card);
    });
  }
  cards(random);
  // Append container ONCE
  document.querySelector(".products").append(container);
  // ---------------------------------------------
  // 🔥 SORTING SYSTEM
  // ---------------------------------------------
  let sortType = document.getElementById("sortType");
  let priceSort = document.getElementById("priceSort");
  let genreSort = document.getElementById("genreSort");

  // 1️⃣ Show corresponding sort dropdown
  sortType.onchange = function () {
    if (sortType.value === "price") {
      priceSort.style.display = "inline-block";
      genreSort.style.display = "none";

      priceSort.selectedIndex = 0;

      return;
    } else if (sortType.value === "genre") {
      genreSort.style.display = "inline-block";
      priceSort.style.display = "none";

      genreSort.selectedIndex = 0;

      return;
    } else {
      priceSort.style.display = "none";
      genreSort.style.display = "none";
      cards(random);
    }
  };

  // 2️⃣ Price sort
  priceSort.addEventListener("change", () => {
    // Always create a fresh array
    let sortedBooks = [...random];
    let sortedArr;

    if (priceSort.value === "lh") {
      sortedArr = sortedBooks.sort((a, b) => a.price - b.price);
    } else if (priceSort.value === "hl") {
      sortedArr = sortedBooks.sort((a, b) => b.price - a.price);
    } else {
      sortedArr = random;
    }

    cards(sortedArr);
  });

  // 3️⃣ Genre sort
  genreSort.onchange = function () {
    let filteredBooks = random.filter((book) => book.genre === genreSort.value);

    cards(filteredBooks);
  };
}
main();

async function getReviews() {
  const res = await fetch("https://book-it-mnxw.onrender.com/reviews");
  const reviews = await res.json();
  return reviews;
}

async function rev() {
  const reviews = await getReviews();
  console.log(reviews); // works!

  // ------------------ RANDOM REVIEWS ---------------------
  let randomReviews = reviews.sort(() => Math.random() - 0.5);

  randomReviews.slice(0, 3).forEach((val) => {
    let rev = document.createElement("div");
    rev.classList.add("rev");
    c = val.rating;
    function star(c) {
      let st = "";
      for (let i = 1; i <= 5; i++) {
        if (i <= c) {
          st += `<i class="fa-solid fa-star"></i>`;
        } else {
          st += `<i class="fa-regular fa-star"></i>`;
        }
      }
      return st;
    }

    rev.innerHTML = `
    <h3>${val.username}</h3>
    <p>${val.review}</p>
    <p>Rating: ${star(c)}</p>
  `;

    document.querySelector(".rw .con").append(rev);
  });
}
rev();

function toggleMenu() {
  document.querySelector("header nav").classList.toggle("show");
}

// const bot = document.querySelector(".bot");
// const chat = document.getElementById("chatBox");
// const messages = document.getElementById("messages");

// // Toggle chat
// bot.addEventListener("click", () => {
//   chat.style.display = chat.style.display === "flex" ? "none" : "flex";
// });
// // Send message
// function sendMsg() {
//   const input = document.getElementById("userInput");
//   const text = input.value.trim();

//   if (text === "") return;

//   // Show user message
//   messages.innerHTML += `<div class="userMsg">${text}</div>`;

//   input.value = "";

//   // Bot reply
//   setTimeout(() => {
//     messages.innerHTML += `<div class="botMsg">Have a nice day, I will talk to you later....</div>`;
//     messages.scrollTop = messages.scrollHeight;
//   }, 400);
// }

window.addEventListener("load", () => {
  document.getElementById("loader-wrapper").style.display = "none";
  document.getElementById("content").style.display = "block";
});