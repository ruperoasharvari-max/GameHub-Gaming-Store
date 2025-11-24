// main.js - simple robust cart (for GameHub demo)
// Uses localStorage key 'gamehub_cart_v1'.
// Exposes window.gamehubAddToCart(id, qty) and window.gamehubClearCart()

(function(){
  const STORAGE_KEY = 'gamehub_cart_v1';

  const PRODUCTS = {
    1: { id:1, title: "CyberStrike: Neon Wars", price: 2499 },
    2: { id:2, title: "Mystic Quest: Origins", price: 1999 },
    3: { id:3, title: "ProGamers Headset X1", price: 1499 },
    4: { id:4, title: "SpeedPad Controller", price: 999 }
  };

  function readCart(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch(e){ console.error('Cart parse error', e); return []; }
  }
  function writeCart(cart){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function addToCart(id, qty=1){
    id = Number(id);
    if(!id || !PRODUCTS[id]) {
      console.warn('Invalid product id', id);
      return;
    }
    const cart = readCart();
    const found = cart.find(i => i.id === id);
    if(found) found.qty = (found.qty || 0) + qty;
    else cart.push({ id: id, qty: qty });
    writeCart(cart);
    showToast('Added to cart');
  }

  function removeFromCart(id){
    id = Number(id);
    let cart = readCart().filter(i => i.id !== id);
    writeCart(cart);
  }

  function clearCart(){
    localStorage.removeItem(STORAGE_KEY);
    updateCartCount();
    renderCartArea();
  }

  function updateCartCount(){
    const cart = readCart();
    const count = cart.reduce((s,i) => s + (i.qty || 0), 0);
    document.querySelectorAll('#cart-count').forEach(el => el.textContent = count);
  }

  function showToast(text){
    try {
      const t = document.createElement('div');
      t.textContent = text;
      Object.assign(t.style, {
        position:'fixed', right:'16px', bottom:'16px',
        background:'#2f855a', color:'#fff', padding:'10px 14px',
        borderRadius:'8px', zIndex:10000, fontWeight:700
      });
      document.body.appendChild(t);
      setTimeout(()=> t.remove(), 1300);
    } catch(e){ /* ignore */ }
  }

  function renderCartArea(){
    const area = document.getElementById('cart-area');
    if(!area) return;
    const cart = readCart();
    if(!cart.length){
      area.innerHTML = '<p>Your cart is empty. <a href="products.html">Browse store</a></p>';
      return;
    }

    let total = 0;
    const wrapper = document.createElement('div');

    cart.forEach(item => {
      const p = PRODUCTS[item.id] || { title: 'Item', price: 0 };
      const line = (p.price || 0) * item.qty;
      total += line;

      const row = document.createElement('div');
      row.className = 'cart-row';
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.marginBottom = '12px';

      row.innerHTML = `
        <div>
          <strong>${escapeHtml(p.title)}</strong>
          <div class="text-muted">Qty: ${item.qty}</div>
        </div>
        <div style="text-align:right;">
          <div>₹${line}</div>
          <button data-id="${item.id}" class="btn btn-outline btn-remove" style="margin-top:8px">Remove</button>
        </div>
      `;
      wrapper.appendChild(row);
    });

    const totalRow = document.createElement('div');
    totalRow.style.marginTop = '12px';
    totalRow.innerHTML = `<strong>Total: ₹${total}</strong>`;

    area.innerHTML = '';
    area.appendChild(wrapper);
    area.appendChild(totalRow);

    area.querySelectorAll('.btn-remove').forEach(b => {
      b.addEventListener('click', function(){
        const id = Number(this.dataset.id);
        removeFromCart(id);
        renderCartArea();
      });
    });
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  window.gamehubAddToCart = function(id, qty){ addToCart(id, qty||1); };
  window.gamehubClearCart = function(){ clearCart(); };

  document.addEventListener('click', function(e){
    const t = e.target;
    if(!t) return;
    if(t.matches && t.matches('.btn-add')){
      const id = Number(t.dataset.id);
      addToCart(id, 1);
      e.preventDefault();
    }
  });

  window.addEventListener('storage', function(ev){
    if(ev.key === STORAGE_KEY){
      updateCartCount();
      renderCartArea();
    }
  });

  document.addEventListener('DOMContentLoaded', function(){
    updateCartCount();
    renderCartArea();
    console.log('[GameHub] cart script ready');
  });
})();
