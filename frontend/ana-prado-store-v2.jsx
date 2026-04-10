import { useState } from "react";

// ─── Cambia esta URL por la de tu servidor Django ───
const API = import.meta.env.VITE_API_URL;

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Montserrat:wght@300;400;500;600&display=swap');

  :root {
    --white: #FFFFFF;
    --off-white: #F9F9F7;
    --light-gray: #EDEDED;
    --mid-gray: #AAAAAA;
    --dark-gray: #444444;
    --black: #0A0A0A;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Montserrat', sans-serif; background: var(--white); color: var(--black); overflow-x: hidden; }

  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: grid; grid-template-columns: 1fr auto 1fr;
    align-items: center; padding: 1.4rem 3rem;
    background: rgba(255,255,255,0.97);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--light-gray);
  }
  .nav-links-left, .nav-links-right { display: flex; gap: 2.5rem; list-style: none; }
  .nav-links-right { justify-content: flex-end; align-items: center; }
  .nav-links-left a, .nav-links-right a {
    font-size: 0.7rem; font-weight: 500; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--black);
    text-decoration: none; cursor: pointer; transition: color 0.2s;
    position: relative;
  }
  .nav-links-left a::after, .nav-links-right a::after {
    content:''; position:absolute; bottom:-3px; left:0; right:0;
    height:1px; background:var(--black); transform:scaleX(0);
    transition:transform 0.3s; transform-origin:left;
  }
  .nav-links-left a:hover::after, .nav-links-right a:hover::after { transform:scaleX(1); }
  .nav-logo { text-align: center; cursor: pointer; }
  .nav-logo-monogram { font-family:'Cormorant Garamond',serif; font-size:2rem; font-weight:600; line-height:1; display:block; }
  .nav-logo-name { font-size:0.6rem; letter-spacing:0.3em; text-transform:uppercase; font-weight:500; color:var(--dark-gray); display:block; margin-top:2px; }
  .cart-btn { background:none; border:none; cursor:pointer; color:var(--black); display:flex; align-items:center; gap:0.5rem; transition:opacity 0.2s; }
  .cart-btn:hover { opacity:0.6; }
  .cart-count { background:var(--black); color:white; border-radius:50%; width:16px; height:16px; font-size:0.6rem; font-weight:600; display:flex; align-items:center; justify-content:center; }

  .hero { min-height:100vh; display:grid; grid-template-columns:1fr 1fr; padding-top:80px; }
  .hero-left { background:var(--black); display:flex; flex-direction:column; justify-content:center; align-items:flex-start; padding:6rem 4rem; position:relative; overflow:hidden; }
  .hero-left-bg-text { position:absolute; bottom:-2rem; left:-1rem; font-family:'Cormorant Garamond',serif; font-size:18rem; font-weight:700; font-style:italic; color:rgba(255,255,255,0.03); line-height:1; pointer-events:none; user-select:none; }
  .hero-eyebrow { font-size:0.65rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--mid-gray); margin-bottom:2rem; font-weight:400; }
  .hero-title { font-family:'Cormorant Garamond',serif; font-size:clamp(3rem,5vw,5.5rem); font-weight:300; line-height:1.08; color:var(--white); margin-bottom:2.5rem; letter-spacing:-0.01em; }
  .hero-title em { font-style:italic; font-weight:600; }
  .hero-divider { width:40px; height:1px; background:var(--mid-gray); margin-bottom:2rem; }
  .hero-desc { font-size:0.82rem; color:var(--mid-gray); line-height:1.9; max-width:340px; margin-bottom:3rem; font-weight:300; letter-spacing:0.04em; }
  .hero-cta-group { display:flex; gap:1rem; flex-wrap:wrap; }
  .btn-primary { background:var(--white); color:var(--black); border:none; padding:0.9rem 2.5rem; font-family:'Montserrat',sans-serif; font-size:0.68rem; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; cursor:pointer; transition:all 0.3s; }
  .btn-primary:hover { background:var(--light-gray); }
  .btn-outline { background:transparent; color:var(--white); border:1px solid rgba(255,255,255,0.3); padding:0.9rem 2.5rem; font-family:'Montserrat',sans-serif; font-size:0.68rem; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; cursor:pointer; transition:all 0.3s; }
  .btn-outline:hover { border-color:var(--white); }
  .hero-right { background:var(--off-white); display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
  .hero-monogram-large { font-family:'Cormorant Garamond',serif; font-size:14rem; font-weight:600; line-height:1; color:var(--black); opacity:0.07; user-select:none; }
  .hero-tag-float { position:absolute; bottom:3rem; right:3rem; border:1px solid var(--black); padding:1.2rem 1.5rem; text-align:center; background:var(--white); }
  .hero-tag-float .num { font-family:'Cormorant Garamond',serif; font-size:2.2rem; font-weight:600; display:block; line-height:1; }
  .hero-tag-float .lbl { font-size:0.6rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--dark-gray); display:block; margin-top:0.3rem; }
  .hero-line-v { position:absolute; left:3rem; top:30%; bottom:30%; width:1px; background:var(--light-gray); }

  .section { padding:7rem 3rem; }
  .section-label { font-size:0.65rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--mid-gray); margin-bottom:1rem; font-weight:500; }
  .section-title { font-family:'Cormorant Garamond',serif; font-size:clamp(2.5rem,4vw,4rem); font-weight:300; line-height:1.1; margin-bottom:1rem; }
  .section-title em { font-style:italic; font-weight:600; }
  .section-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:4rem; border-bottom:1px solid var(--light-gray); padding-bottom:2rem; }
  .see-all { font-size:0.65rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--black); background:none; border:none; padding-bottom:2px; border-bottom:1px solid var(--black); cursor:pointer; font-family:'Montserrat',sans-serif; font-weight:500; transition:opacity 0.2s; }
  .see-all:hover { opacity:0.5; }

  .products-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:2.5rem 2rem; }
  .product-card { cursor:pointer; }
  .product-image { aspect-ratio:3/4; background:var(--off-white); position:relative; overflow:hidden; margin-bottom:1.2rem; display:flex; align-items:center; justify-content:center; }
  .product-img-inner { font-size:5rem; transition:transform 0.6s cubic-bezier(0.4,0,0.2,1); opacity:0.5; }
  .product-card:hover .product-img-inner { transform:scale(1.06); }
  .product-overlay { position:absolute; inset:0; background:rgba(0,0,0,0); display:flex; align-items:flex-end; justify-content:center; padding-bottom:1.5rem; transition:background 0.4s; }
  .product-card:hover .product-overlay { background:rgba(0,0,0,0.12); }
  .product-add { background:var(--black); color:var(--white); border:none; padding:0.8rem 1.8rem; font-family:'Montserrat',sans-serif; font-size:0.65rem; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; cursor:pointer; transform:translateY(10px); opacity:0; transition:all 0.3s; }
  .product-card:hover .product-add { transform:translateY(0); opacity:1; }
  .product-tag { position:absolute; top:1.2rem; left:1.2rem; font-size:0.6rem; letter-spacing:0.15em; text-transform:uppercase; font-weight:600; padding:0.3rem 0.7rem; background:var(--black); color:var(--white); }
  .product-tag.sale { background:var(--white); color:var(--black); border:1px solid var(--black); }
  .product-brand { font-size:0.62rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--mid-gray); margin-bottom:0.3rem; font-weight:500; }
  .product-name { font-family:'Cormorant Garamond',serif; font-size:1.1rem; font-weight:400; margin-bottom:0.5rem; }
  .product-price { font-size:0.82rem; font-weight:500; display:flex; gap:0.8rem; align-items:center; }
  .price-old { text-decoration:line-through; color:var(--mid-gray); font-size:0.75rem; }

  .filter-bar { display:flex; gap:0; margin-bottom:3rem; border:1px solid var(--light-gray); width:fit-content; }
  .filter-btn { padding:0.6rem 1.5rem; border:none; background:none; font-family:'Montserrat',sans-serif; font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; cursor:pointer; transition:all 0.2s; font-weight:500; border-right:1px solid var(--light-gray); color:var(--dark-gray); }
  .filter-btn:last-child { border-right:none; }
  .filter-btn.active { background:var(--black); color:var(--white); }
  .filter-btn:hover:not(.active) { background:var(--off-white); color:var(--black); }

  .about-section { background:var(--off-white); display:grid; grid-template-columns:1fr 1fr; min-height:85vh; }
  .about-left { background:var(--black); display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
  .about-bg-monogram { font-family:'Cormorant Garamond',serif; font-size:20rem; font-weight:700; font-style:italic; color:rgba(255,255,255,0.04); user-select:none; line-height:1; position:absolute; }
  .about-logo-centered { position:relative; z-index:1; text-align:center; }
  .about-logo-ap { font-family:'Cormorant Garamond',serif; font-size:8rem; font-weight:600; color:var(--white); line-height:1; letter-spacing:-0.04em; }
  .about-logo-sub { font-size:0.65rem; letter-spacing:0.35em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-top:0.5rem; font-weight:300; }
  .about-logo-tagline { font-family:'Cormorant Garamond',serif; font-size:0.9rem; font-style:italic; color:rgba(255,255,255,0.35); letter-spacing:0.1em; margin-top:0.8rem; }
  .about-right { display:flex; flex-direction:column; justify-content:center; padding:6rem 5rem; }
  .about-text { font-size:0.88rem; color:var(--dark-gray); line-height:1.9; font-weight:300; margin-bottom:1.5rem; letter-spacing:0.02em; }
  .about-stats { display:grid; grid-template-columns:1fr 1fr; gap:2rem; margin-top:3rem; padding-top:3rem; border-top:1px solid var(--light-gray); }
  .stat-num { font-family:'Cormorant Garamond',serif; font-size:2.8rem; font-weight:600; line-height:1; }
  .stat-label { font-size:0.65rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--mid-gray); margin-top:0.4rem; font-weight:500; }

  .contact-section { padding:8rem 3rem; display:grid; grid-template-columns:1fr 1fr; gap:8rem; max-width:1200px; margin:0 auto; align-items:start; }
  .contact-title { font-family:'Cormorant Garamond',serif; font-size:clamp(2.5rem,4vw,4rem); font-weight:300; line-height:1.1; margin-bottom:1.5rem; }
  .contact-title em { font-style:italic; font-weight:600; }
  .contact-text { font-size:0.85rem; color:var(--dark-gray); line-height:1.9; font-weight:300; margin-bottom:2.5rem; }
  .contact-info { display:flex; flex-direction:column; gap:1rem; }
  .contact-info-item { display:flex; gap:1rem; align-items:flex-start; }
  .contact-info-label { font-size:0.62rem; letter-spacing:0.18em; text-transform:uppercase; font-weight:600; min-width:80px; padding-top:0.1rem; }
  .contact-info-val { font-size:0.85rem; color:var(--dark-gray); font-weight:300; }
  .contact-form { display:flex; flex-direction:column; gap:1.2rem; }
  .form-group { display:flex; flex-direction:column; gap:0.5rem; }
  .form-group label { font-size:0.62rem; letter-spacing:0.18em; text-transform:uppercase; font-weight:600; color:var(--black); }
  .form-group input, .form-group textarea { background:var(--off-white); border:1px solid var(--light-gray); border-bottom:1px solid var(--black); padding:0.9rem 1rem; font-family:'Montserrat',sans-serif; font-size:0.85rem; color:var(--black); outline:none; transition:border-color 0.2s; font-weight:300; }
  .form-group input:focus, .form-group textarea:focus { border-color:var(--black); background:var(--white); }
  .form-group textarea { resize:vertical; min-height:100px; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .submit-btn { background:var(--black); color:var(--white); border:none; padding:1rem 3rem; font-family:'Montserrat',sans-serif; font-size:0.68rem; font-weight:600; letter-spacing:0.22em; text-transform:uppercase; cursor:pointer; transition:all 0.3s; align-self:flex-start; margin-top:0.5rem; }
  .submit-btn:hover:not(:disabled) { background:var(--dark-gray); }
  .submit-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .form-error { font-size:0.72rem; color:#c0392b; margin-top:-0.5rem; }
  .form-success { font-size:0.8rem; color:#27ae60; padding:1rem; border:1px solid #27ae60; background:#f0fff4; font-weight:500; }

  .cart-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:200; opacity:0; pointer-events:none; transition:opacity 0.4s; }
  .cart-overlay.open { opacity:1; pointer-events:all; }
  .cart-sidebar { position:fixed; top:0; right:-480px; width:440px; height:100vh; background:var(--white); z-index:201; display:flex; flex-direction:column; transition:right 0.5s cubic-bezier(0.4,0,0.2,1); border-left:1px solid var(--light-gray); }
  .cart-sidebar.open { right:0; }
  .cart-header { padding:2rem 2.5rem; border-bottom:1px solid var(--light-gray); display:flex; justify-content:space-between; align-items:center; }
  .cart-header-title { font-family:'Cormorant Garamond',serif; font-size:1.6rem; font-weight:400; }
  .cart-header-sub { font-size:0.65rem; letter-spacing:0.15em; color:var(--mid-gray); text-transform:uppercase; }
  .close-cart { background:none; border:none; cursor:pointer; color:var(--black); font-family:'Montserrat',sans-serif; font-weight:500; font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; transition:opacity 0.2s; }
  .close-cart:hover { opacity:0.5; }
  .cart-items { flex:1; overflow-y:auto; padding:0 2.5rem; }
  .cart-item { display:grid; grid-template-columns:80px 1fr auto; gap:1.2rem; padding:1.5rem 0; border-bottom:1px solid var(--light-gray); align-items:center; }
  .cart-item-img { width:80px; height:100px; background:var(--off-white); display:flex; align-items:center; justify-content:center; font-size:2.5rem; }
  .cart-item-brand { font-size:0.6rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--mid-gray); }
  .cart-item-name { font-family:'Cormorant Garamond',serif; font-size:1rem; font-weight:400; margin:0.2rem 0; }
  .cart-item-price { font-size:0.82rem; font-weight:500; }
  .remove-item { background:none; border:none; cursor:pointer; color:var(--mid-gray); font-size:0.7rem; letter-spacing:0.1em; font-family:'Montserrat',sans-serif; text-transform:uppercase; transition:color 0.2s; }
  .remove-item:hover { color:var(--black); }
  .cart-footer { padding:2rem 2.5rem; border-top:1px solid var(--light-gray); }
  .cart-total { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:1.5rem; padding-bottom:1.5rem; border-bottom:1px solid var(--light-gray); }
  .cart-total-label { font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; font-weight:600; }
  .cart-total-amount { font-family:'Cormorant Garamond',serif; font-size:1.8rem; font-weight:400; }

  /* CHECKOUT FORM */
  .checkout-form { display:flex; flex-direction:column; gap:0.8rem; margin-bottom:1.2rem; }
  .checkout-form .form-group { gap:0.3rem; }
  .checkout-form label { font-size:0.58rem; letter-spacing:0.15em; text-transform:uppercase; font-weight:600; }
  .checkout-form input { padding:0.6rem 0.8rem; font-size:0.8rem; background:var(--off-white); border:1px solid var(--light-gray); border-bottom:1px solid var(--black); font-family:'Montserrat',sans-serif; outline:none; font-weight:300; }
  .checkout-form input:focus { background:var(--white); }
  .checkout-row { display:grid; grid-template-columns:1fr 1fr; gap:0.6rem; }
  .checkout-section-label { font-size:0.62rem; letter-spacing:0.2em; text-transform:uppercase; font-weight:600; color:var(--mid-gray); padding:0.5rem 0 0.3rem; border-top:1px solid var(--light-gray); margin-top:0.3rem; }
  .checkout-btn { width:100%; background:var(--black); color:var(--white); border:none; padding:1.1rem; font-family:'Montserrat',sans-serif; font-size:0.68rem; font-weight:600; letter-spacing:0.22em; text-transform:uppercase; cursor:pointer; transition:background 0.3s; }
  .checkout-btn:hover:not(:disabled) { background:var(--dark-gray); }
  .checkout-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .checkout-result { padding:1rem; font-size:0.78rem; font-weight:500; text-align:center; }
  .checkout-result.aprobada { background:#f0fff4; color:#27ae60; border:1px solid #27ae60; }
  .checkout-result.rechazada { background:#fff5f5; color:#c0392b; border:1px solid #c0392b; }
  .checkout-result.error { background:#fff5f5; color:#c0392b; border:1px solid #c0392b; }
  .checkout-result.pendiente { background:#fffbf0; color:#b7791f; border:1px solid #d4a017; }

  .empty-cart { text-align:center; padding:4rem 0; }
  .empty-cart-title { font-family:'Cormorant Garamond',serif; font-size:1.5rem; font-weight:300; color:var(--mid-gray); font-style:italic; }

  footer { background:var(--black); color:var(--white); padding:5rem 3rem 2.5rem; }
  .footer-top { display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr; gap:4rem; padding-bottom:4rem; border-bottom:1px solid rgba(255,255,255,0.08); margin-bottom:2.5rem; }
  .footer-logo-block .logo-main { font-family:'Cormorant Garamond',serif; font-size:1.5rem; font-weight:600; letter-spacing:0.08em; display:block; margin-bottom:0.3rem; }
  .footer-logo-block .logo-tag { font-size:0.55rem; letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.35); font-weight:400; }
  .footer-tagline { font-size:0.8rem; color:rgba(255,255,255,0.4); line-height:1.8; margin-top:1.5rem; font-weight:300; }
  .footer-col h4 { font-size:0.6rem; letter-spacing:0.22em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-bottom:1.5rem; font-weight:600; }
  .footer-col ul { list-style:none; display:flex; flex-direction:column; gap:0.8rem; }
  .footer-col ul li { font-size:0.82rem; color:rgba(255,255,255,0.6); cursor:pointer; transition:color 0.2s; font-weight:300; }
  .footer-col ul li:hover { color:var(--white); }
  .footer-bottom { display:flex; justify-content:space-between; align-items:center; font-size:0.65rem; color:rgba(255,255,255,0.25); letter-spacing:0.08em; }

  .toast { position:fixed; bottom:2.5rem; left:50%; transform:translateX(-50%) translateY(80px); background:var(--black); color:var(--white); padding:0.9rem 2rem; font-size:0.72rem; letter-spacing:0.1em; border:1px solid rgba(255,255,255,0.15); transition:transform 0.4s cubic-bezier(0.4,0,0.2,1); z-index:300; white-space:nowrap; font-family:'Montserrat',sans-serif; }
  .toast.show { transform:translateX(-50%) translateY(0); }

  @media (max-width:960px) {
    .hero { grid-template-columns:1fr; } .hero-right { display:none; }
    .about-section { grid-template-columns:1fr; } .about-left { min-height:300px; }
    nav { padding:1rem 1.5rem; } .nav-links-left { display:none; }
    .section { padding:4rem 1.5rem; }
    .contact-section { grid-template-columns:1fr; gap:3rem; padding:4rem 1.5rem; }
    .footer-top { grid-template-columns:1fr 1fr; gap:2rem; }
    .cart-sidebar { width:100%; right:-100%; }
    .form-row { grid-template-columns:1fr; }
    .checkout-row { grid-template-columns:1fr; }
  }
`;

const PRODUCTS = [
  { id:1, name:"Camisa Lino Oversize",   brand:"ZARA",      price:89000,  tag:"Nuevo",  emoji:"👔", category:"Camisas"    },
  { id:2, name:"Vestido Midi Floral",     brand:"H&M",       price:145000, originalPrice:180000, tag:"Oferta", emoji:"👗", category:"Vestidos"  },
  { id:3, name:"Blazer Estructurado",     brand:"MANGO",     price:220000, emoji:"🧥",            category:"Chaquetas"  },
  { id:4, name:"Jean Straight Leg",       brand:"LEVI'S",    price:175000, emoji:"👖",            category:"Pantalones" },
  { id:5, name:"Crop Top Algodón",        brand:"PULL&BEAR", price:55000,  tag:"Nuevo",  emoji:"👚", category:"Camisas"    },
  { id:6, name:"Falda Plisada Mini",      brand:"ZARA",      price:98000,  originalPrice:130000, tag:"Oferta", emoji:"👗", category:"Vestidos"  },
  { id:7, name:"Chaqueta Denim",          brand:"BERSHKA",   price:160000, emoji:"🧥",            category:"Chaquetas"  },
  { id:8, name:"Pantalón Palazzo",        brand:"MANGO",     price:135000, tag:"Nuevo",  emoji:"👖", category:"Pantalones" },
];
const CATEGORIES = ["Todos","Camisas","Vestidos","Chaquetas","Pantalones"];
const fmt = n => `$${n.toLocaleString("es-CO")}`;

// ── API helpers ─────────────────────────────────────────────
async function apiPost(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, data };
  return data;
}

export default function AnaPradoStore() {
  const [cart, setCart]           = useState([]);
  const [cartOpen, setCartOpen]   = useState(false);
  const [filter, setFilter]       = useState("Todos");
  const [toast, setToast]         = useState("");
  const [checkoutStep, setCheckoutStep] = useState("bolsa"); // bolsa | pago | resultado
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Formulario checkout
  const [buyer, setBuyer] = useState({ nombre:"", email:"", telefono:"", direccion:"", ciudad:"" });
  const [card, setCard]   = useState({ numero:"", nombre:"", expiracion:"", cvv:"" });

  // Formulario contacto
  const [contactForm, setContactForm]       = useState({ nombre:"", email:"", telefono:"", mensaje:"" });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactStatus, setContactStatus]   = useState(null); // null | "ok" | "error"
  const [contactErrors, setContactErrors]   = useState({});

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""), 2800); };

  const addToCart = p => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id===p.id ? {...i, qty:i.qty+1} : i);
      return [...prev, {...p, qty:1}];
    });
    showToast(`Agregado — ${p.name}`);
  };
  const removeFromCart = id => setCart(prev => prev.filter(i => i.id!==id));
  const total     = cart.reduce((a,i) => a + i.price*i.qty, 0);
  const cartCount = cart.reduce((a,i) => a + i.qty, 0);
  const filtered  = filter==="Todos" ? PRODUCTS : PRODUCTS.filter(p=>p.category===filter);
  const scrollTo  = id => document.getElementById(id)?.scrollIntoView({behavior:"smooth"});

  // ── CONTACTO ─────────────────────────────
  const handleContactSubmit = async e => {
    e.preventDefault();
    setContactLoading(true);
    setContactStatus(null);
    setContactErrors({});
    try {
      await apiPost("/api/contacto/", contactForm);
      setContactStatus("ok");
      setContactForm({ nombre:"", email:"", telefono:"", mensaje:"" });
    } catch(err) {
      if (err.data?.errores) setContactErrors(err.data.errores);
      setContactStatus("error");
    } finally {
      setContactLoading(false);
    }
  };

  // ── CHECKOUT ─────────────────────────────
  const handleCheckout = async e => {
    e.preventDefault();
    setCheckoutLoading(true);
    try {
      // Nota: en producción, la tarjeta se tokeniza con PayU.js en el frontend
      // y se envía el token, nunca los datos en texto plano.
      const payload = {
        ...buyer,
        items: cart.map(i => ({
          producto_id: i.id,
          nombre:      i.name,
          marca:       i.brand,
          cantidad:    i.qty,
          precio:      i.price,
        })),
        metodo_pago: "CARD",
        credit_card: {
          number:          card.numero.replace(/\s/g,""),
          name:            card.nombre,
          expirationDate:  card.expiracion,
          securityCode:    card.cvv,
          processWithoutCvv2: false,
        },
        session_id: document.cookie,
        user_agent: navigator.userAgent,
      };
      const result = await apiPost("/api/tienda/checkout/", payload);
      setCheckoutResult(result);
      setCheckoutStep("resultado");
      if (result.ok) setCart([]);
    } catch(err) {
      setCheckoutResult({
        ok: false,
        estado: "error",
        mensaje: err.data?.error || "Error al procesar el pago. Intenta de nuevo.",
      });
      setCheckoutStep("resultado");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // ── RENDER CART CONTENT ──────────────────
  const renderCartContent = () => {
    if (cart.length === 0) return (
      <div className="empty-cart" style={{paddingTop:"4rem"}}>
        <p className="empty-cart-title">Tu bolsa está vacía</p>
        <p style={{fontSize:"0.75rem",color:"var(--mid-gray)",marginTop:"0.8rem",letterSpacing:"0.08em"}}>Explora nuestra colección</p>
      </div>
    );

    if (checkoutStep === "bolsa") return (
      <>
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-img">{item.emoji}</div>
            <div>
              <div className="cart-item-brand">{item.brand}</div>
              <div className="cart-item-name">{item.name}</div>
              <div className="cart-item-price">{fmt(item.price)} × {item.qty}</div>
            </div>
            <button className="remove-item" onClick={()=>removeFromCart(item.id)}>Quitar</button>
          </div>
        ))}
      </>
    );

    if (checkoutStep === "pago") return (
      <form className="checkout-form" onSubmit={handleCheckout}>
        <p className="checkout-section-label" style={{borderTop:"none",paddingTop:0}}>Datos del comprador</p>
        <div className="form-group"><label>Nombre completo</label>
          <input required value={buyer.nombre} onChange={e=>setBuyer({...buyer,nombre:e.target.value})} placeholder="Ana García"/></div>
        <div className="checkout-row">
          <div className="form-group"><label>Email</label>
            <input required type="email" value={buyer.email} onChange={e=>setBuyer({...buyer,email:e.target.value})} placeholder="ana@email.com"/></div>
          <div className="form-group"><label>Teléfono</label>
            <input value={buyer.telefono} onChange={e=>setBuyer({...buyer,telefono:e.target.value})} placeholder="+57 300..."/></div>
        </div>
        <div className="form-group"><label>Dirección de envío</label>
          <input value={buyer.direccion} onChange={e=>setBuyer({...buyer,direccion:e.target.value})} placeholder="Calle 123 #45-67"/></div>
        <div className="form-group"><label>Ciudad</label>
          <input value={buyer.ciudad} onChange={e=>setBuyer({...buyer,ciudad:e.target.value})} placeholder="Bogotá"/></div>

        <p className="checkout-section-label">Datos de pago</p>
        <p style={{fontSize:"0.65rem",color:"var(--mid-gray)",letterSpacing:"0.05em"}}>
          🔒 Pago seguro procesado por PayU
        </p>
        <div className="form-group"><label>Número de tarjeta</label>
          <input required value={card.numero} onChange={e=>setCard({...card,numero:e.target.value})} placeholder="4111 1111 1111 1111" maxLength={19}/></div>
        <div className="form-group"><label>Nombre en la tarjeta</label>
          <input required value={card.nombre} onChange={e=>setCard({...card,nombre:e.target.value})} placeholder="ANA GARCIA"/></div>
        <div className="checkout-row">
          <div className="form-group"><label>Vencimiento (MM/AA)</label>
            <input required value={card.expiracion} onChange={e=>setCard({...card,expiracion:e.target.value})} placeholder="12/26" maxLength={5}/></div>
          <div className="form-group"><label>CVV</label>
            <input required value={card.cvv} onChange={e=>setCard({...card,cvv:e.target.value})} placeholder="123" maxLength={4} type="password"/></div>
        </div>
        <button type="submit" className="checkout-btn" disabled={checkoutLoading} style={{marginTop:"0.5rem"}}>
          {checkoutLoading ? "Procesando..." : `Pagar ${fmt(total)}`}
        </button>
        <button type="button" onClick={()=>setCheckoutStep("bolsa")}
          style={{background:"none",border:"none",cursor:"pointer",fontSize:"0.65rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--mid-gray)",marginTop:"0.3rem",fontFamily:"Montserrat,sans-serif"}}>
          ← Volver a la bolsa
        </button>
      </form>
    );

    if (checkoutStep === "resultado") return (
      <div style={{padding:"2rem 0"}}>
        <div className={`checkout-result ${checkoutResult?.estado || "error"}`}>
          {checkoutResult?.estado === "aprobada" && "✓ ¡Pago aprobado! Gracias por tu compra."}
          {checkoutResult?.estado === "pendiente" && "⏳ Pago pendiente de confirmación."}
          {checkoutResult?.estado === "rechazada" && "✗ Pago rechazado. Verifica los datos de tu tarjeta."}
          {checkoutResult?.estado === "error" && `✗ ${checkoutResult?.mensaje || "Error al procesar el pago."}`}
        </div>
        {checkoutResult?.referencia && (
          <p style={{fontSize:"0.72rem",color:"var(--mid-gray)",marginTop:"1rem",letterSpacing:"0.08em"}}>
            Ref: {checkoutResult.referencia}
          </p>
        )}
        <button className="checkout-btn" style={{marginTop:"1.5rem"}}
          onClick={()=>{ setCheckoutStep("bolsa"); setCheckoutResult(null); setCartOpen(false); }}>
          {checkoutResult?.ok ? "Continuar comprando" : "Intentar de nuevo"}
        </button>
      </div>
    );
  };

  return (
    <>
      <style>{style}</style>

      {/* NAV */}
      <nav>
        <ul className="nav-links-left">
          <li><a onClick={()=>scrollTo("inicio")}>Inicio</a></li>
          <li><a onClick={()=>scrollTo("catalogo")}>Catálogo</a></li>
        </ul>
        <div className="nav-logo" onClick={()=>scrollTo("inicio")}>
          <span className="nav-logo-monogram">AP</span>
          <span className="nav-logo-name">Ana Prado</span>
        </div>
        <ul className="nav-links-right">
          <li><a onClick={()=>scrollTo("nosotros")}>Nosotros</a></li>
          <li><a onClick={()=>scrollTo("contacto")}>Contacto</a></li>
          <li>
            <button className="cart-btn" onClick={()=>{ setCartOpen(true); setCheckoutStep("bolsa"); }}>
              <span style={{fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:500}}>Bolsa</span>
              {cartCount>0 && <span className="cart-count">{cartCount}</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <section id="inicio" className="hero">
        <div className="hero-left">
          <div className="hero-left-bg-text">AP</div>
          <p className="hero-eyebrow">Colección Primavera — 2026</p>
          <h1 className="hero-title">Mucho<br/>más que<br/><em>moda.</em></h1>
          <div className="hero-divider"/>
          <p className="hero-desc">Piezas seleccionadas de las mejores marcas del mundo. Una curaduría pensada para mujeres que saben exactamente quiénes son.</p>
          <div className="hero-cta-group">
            <button className="btn-primary" onClick={()=>scrollTo("catalogo")}>Ver colección</button>
            <button className="btn-outline" onClick={()=>scrollTo("nosotros")}>Nuestra historia</button>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-line-v"/>
          <div className="hero-monogram-large">AP</div>
          <div className="hero-tag-float">
            <span className="num">+200</span>
            <span className="lbl">Estilos disponibles</span>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="section" style={{background:"var(--white)"}}>
        <div className="section-header">
          <div><p className="section-label">Destacados</p><h2 className="section-title">Más <em>vendidos</em></h2></div>
          <button className="see-all" onClick={()=>scrollTo("catalogo")}>Ver todo el catálogo</button>
        </div>
        <div className="products-grid">
          {PRODUCTS.slice(0,4).map(p=>(
            <div key={p.id} className="product-card">
              <div className="product-image">
                <div className="product-img-inner">{p.emoji}</div>
                {p.tag && <span className={`product-tag ${p.tag==="Oferta"?"sale":""}`}>{p.tag}</span>}
                <div className="product-overlay"><button className="product-add" onClick={()=>addToCart(p)}>Agregar a la bolsa</button></div>
              </div>
              <p className="product-brand">{p.brand}</p>
              <p className="product-name">{p.name}</p>
              <div className="product-price"><span>{fmt(p.price)}</span>{p.originalPrice && <span className="price-old">{fmt(p.originalPrice)}</span>}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATALOG */}
      <section id="catalogo" className="section" style={{background:"var(--off-white)"}}>
        <div className="section-header">
          <div><p className="section-label">Tienda</p><h2 className="section-title">Catálogo <em>completo</em></h2></div>
        </div>
        <div className="filter-bar">
          {CATEGORIES.map(c=><button key={c} className={`filter-btn ${filter===c?"active":""}`} onClick={()=>setFilter(c)}>{c}</button>)}
        </div>
        <div className="products-grid">
          {filtered.map(p=>(
            <div key={p.id} className="product-card">
              <div className="product-image">
                <div className="product-img-inner">{p.emoji}</div>
                {p.tag && <span className={`product-tag ${p.tag==="Oferta"?"sale":""}`}>{p.tag}</span>}
                <div className="product-overlay"><button className="product-add" onClick={()=>addToCart(p)}>Agregar a la bolsa</button></div>
              </div>
              <p className="product-brand">{p.brand}</p>
              <p className="product-name">{p.name}</p>
              <div className="product-price"><span>{fmt(p.price)}</span>{p.originalPrice && <span className="price-old">{fmt(p.originalPrice)}</span>}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="nosotros" className="about-section">
        <div className="about-left">
          <div className="about-bg-monogram">AP</div>
          <div className="about-logo-centered">
            <div className="about-logo-ap">AP</div>
            <div className="about-logo-sub">Ana Prado</div>
            <div className="about-logo-tagline">Mucho más que moda</div>
          </div>
        </div>
        <div className="about-right">
          <p className="section-label">Quiénes somos</p>
          <h2 className="section-title">Una historia de <em>estilo</em></h2>
          <p className="about-text">Ana Prado nació de una pasión genuina por la moda y la convicción de que vestir bien no es vanidad — es autoexpresión.</p>
          <p className="about-text">Trabajamos con las marcas más reconocidas del mundo para ofrecerte opciones que se adaptan a tu estilo de vida.</p>
          <div className="about-stats">
            <div><div className="stat-num">+200</div><div className="stat-label">Productos disponibles</div></div>
            <div><div className="stat-num">15+</div><div className="stat-label">Marcas aliadas</div></div>
            <div><div className="stat-num">3K+</div><div className="stat-label">Clientas satisfechas</div></div>
            <div><div className="stat-num">5★</div><div className="stat-label">Calificación promedio</div></div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <div id="contacto" style={{background:"var(--white)"}}>
        <div className="contact-section">
          <div className="contact-left">
            <p className="section-label">Contáctanos</p>
            <h2 className="contact-title">Hablemos de <em>moda</em></h2>
            <p className="contact-text">¿Tienes preguntas sobre tallas, disponibilidad o tu pedido? Estamos aquí para ayudarte.</p>
            <div className="contact-info">
              <div className="contact-info-item"><span className="contact-info-label">Email</span><span className="contact-info-val">hola@anaprado.co</span></div>
              <div className="contact-info-item"><span className="contact-info-label">WhatsApp</span><span className="contact-info-val">+57 300 000 0000</span></div>
              <div className="contact-info-item"><span className="contact-info-label">Instagram</span><span className="contact-info-val">@anapradomoda</span></div>
            </div>
          </div>
          <form className="contact-form" onSubmit={handleContactSubmit}>
            {contactStatus === "ok" && (
              <div className="form-success">✓ Tu mensaje fue recibido. Pronto te contactaremos.</div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" value={contactForm.nombre} onChange={e=>setContactForm({...contactForm,nombre:e.target.value})} required placeholder="Tu nombre"/>
                {contactErrors.nombre && <span className="form-error">{contactErrors.nombre}</span>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={contactForm.email} onChange={e=>setContactForm({...contactForm,email:e.target.value})} required placeholder="tu@email.com"/>
                {contactErrors.email && <span className="form-error">{contactErrors.email}</span>}
              </div>
            </div>
            <div className="form-group">
              <label>Teléfono (opcional)</label>
              <input type="tel" value={contactForm.telefono} onChange={e=>setContactForm({...contactForm,telefono:e.target.value})} placeholder="+57 300 000 0000"/>
            </div>
            <div className="form-group">
              <label>Mensaje</label>
              <textarea value={contactForm.mensaje} onChange={e=>setContactForm({...contactForm,mensaje:e.target.value})} required placeholder="¿En qué podemos ayudarte?"/>
              {contactErrors.mensaje && <span className="form-error">{contactErrors.mensaje}</span>}
            </div>
            {contactStatus === "error" && !Object.keys(contactErrors).length && (
              <div className="form-error">Ocurrió un error. Intenta de nuevo.</div>
            )}
            <button type="submit" className="submit-btn" disabled={contactLoading}>
              {contactLoading ? "Enviando..." : "Enviar mensaje"}
            </button>
          </form>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-top">
          <div className="footer-logo-block">
            <span className="logo-main">ANA PRADO</span>
            <span className="logo-tag">Mucho más que moda</span>
            <p className="footer-tagline">Moda multimarca seleccionada con criterio. Piezas para mujeres que saben exactamente quiénes son.</p>
          </div>
          <div className="footer-col"><h4>Tienda</h4><ul><li>Novedades</li><li>Más vendidos</li><li>Ofertas</li><li>Marcas</li></ul></div>
          <div className="footer-col"><h4>Información</h4><ul><li>Guía de tallas</li><li>Envíos</li><li>Devoluciones</li><li>Nuestra historia</li></ul></div>
          <div className="footer-col"><h4>Contacto</h4><ul><li>hola@anaprado.co</li><li>+57 300 000 0000</li><li>@anapradomoda</li></ul></div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Ana Prado. Todos los derechos reservados.</span>
          <span>Colombia</span>
        </div>
      </footer>

      {/* CART SIDEBAR */}
      <div className={`cart-overlay ${cartOpen?"open":""}`} onClick={()=>setCartOpen(false)}/>
      <div className={`cart-sidebar ${cartOpen?"open":""}`}>
        <div className="cart-header">
          <div>
            <div className="cart-header-title">
              {checkoutStep==="bolsa" && "Tu bolsa"}
              {checkoutStep==="pago"  && "Pago seguro"}
              {checkoutStep==="resultado" && "Resultado"}
            </div>
            <div className="cart-header-sub">{cartCount} {cartCount===1?"artículo":"artículos"}</div>
          </div>
          <button className="close-cart" onClick={()=>setCartOpen(false)}>Cerrar ✕</button>
        </div>

        <div className="cart-items">{renderCartContent()}</div>

        {/* Footer de la bolsa – solo en paso "bolsa" con items */}
        {checkoutStep==="bolsa" && cart.length>0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-amount">{fmt(total)}</span>
            </div>
            <button className="checkout-btn" onClick={()=>setCheckoutStep("pago")}>
              Proceder al pago →
            </button>
          </div>
        )}
      </div>

      <div className={`toast ${toast?"show":""}`}>{toast}</div>
    </>
  );
}
