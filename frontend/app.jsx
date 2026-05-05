// ============================================================
// StudyMart - Complete React Frontend (app.jsx)
// ============================================================

const { useState, useEffect, useContext, createContext, useCallback } = React;

const API = 'https://studymart-production.up.railway.app/api';

// ── Auth Context ─────────────────────────────────────────────
const AuthCtx = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sm_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('sm_token') || null);

  const login = (userData, tok) => {
    setUser(userData); setToken(tok);
    localStorage.setItem('sm_user', JSON.stringify(userData));
    localStorage.setItem('sm_token', tok);
  };
  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('sm_user'); localStorage.removeItem('sm_token');
  };

  return <AuthCtx.Provider value={{ user, token, login, logout }}>{children}</AuthCtx.Provider>;
}
const useAuth = () => useContext(AuthCtx);

// ── Cart Context ─────────────────────────────────────────────
const CartCtx = createContext(null);
function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [open, setOpen] = useState(false);
  const { token } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!token) { setCart([]); return; }
    try {
      const r = await fetch(`${API}/cart`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setCart(Array.isArray(d) ? d : []);
    } catch { setCart([]); }
  }, [token]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (type, id) => {
    if (!token) return false;
    await fetch(`${API}/cart`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_type: type, item_id: id }),
    });
    await fetchCart();
    return true;
  };

  const removeFromCart = async (type, id) => {
    await fetch(`${API}/cart/${type}/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    await fetchCart();
  };

  const total = cart.reduce((s, i) => s + (i.detail?.price || 0), 0);

  return (
    <CartCtx.Provider value={{ cart, total, open, setOpen, addToCart, removeFromCart, fetchCart }}>
      {children}
    </CartCtx.Provider>
  );
}
const useCart = () => useContext(CartCtx);

// ── Page Context ─────────────────────────────────────────────
const PageCtx = createContext(null);
function PageProvider({ children }) {
  const [page, setPage] = useState('home');
  const [params, setParams] = useState({});
  const nav = (p, args = {}) => { setPage(p); setParams(args); window.scrollTo(0, 0); };
  return <PageCtx.Provider value={{ page, params, nav }}>{children}</PageCtx.Provider>;
}
const usePage = () => useContext(PageCtx);

// ── API helper ───────────────────────────────────────────────
async function apiFetch(url, opts = {}) {
  const r = await fetch(API + url, opts);
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Request failed');
  return d;
}

// ════════════════════════════════════════════════════════════
// COMPONENTS
// ════════════════════════════════════════════════════════════

function Badge({ color = '#1a3c6e', bg = '#e8eef8', children, style = {} }) {
  return (
    <span style={{
      background: bg, color, fontSize: 11, fontWeight: 600,
      padding: '3px 9px', borderRadius: 20, letterSpacing: 0.3, ...style
    }}>{children}</span>
  );
}

function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, style = {}, type = 'button' }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none',
    borderRadius: 8, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.18s', opacity: disabled ? 0.6 : 1,
    fontSize: size === 'sm' ? 13 : size === 'lg' ? 16 : 14,
    padding: size === 'sm' ? '7px 14px' : size === 'lg' ? '14px 28px' : '10px 20px',
  };
  const variants = {
    primary: { background: 'var(--brand)', color: '#fff' },
    accent: { background: 'var(--accent)', color: '#1a1f2e' },
    outline: { background: 'transparent', color: 'var(--brand)', border: '1.5px solid var(--brand)' },
    ghost: { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' },
    danger: { background: 'var(--red)', color: '#fff' },
    green: { background: 'var(--green)', color: '#fff' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--surface)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
      transition: 'box-shadow 0.2s, transform 0.2s',
      cursor: onClick ? 'pointer' : 'default', ...style,
    }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >{children}</div>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{
        width: 36, height: 36, border: '3px solid var(--border)',
        borderTop: '3px solid var(--brand)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: type === 'error' ? 'var(--red)' : 'var(--green)',
      color: '#fff', padding: '12px 20px', borderRadius: 10,
      fontWeight: 600, fontSize: 14, boxShadow: 'var(--shadow-lg)',
      animation: 'slideUp 0.3s ease',
    }}>
      {type === 'error' ? '✕ ' : '✓ '}{msg}
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }`}</style>
    </div>
  );
}

// ── Navbar ───────────────────────────────────────────────────
function Navbar() {
  const { user, logout } = useAuth();
  const { nav } = usePage();
  const { cart, setOpen } = useCart();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const doSearch = async (q) => {
    setSearch(q);
    if (!q.trim()) { setResults(null); return; }
    try {
      const d = await apiFetch(`/search?q=${encodeURIComponent(q)}`);
      setResults(d);
    } catch { setResults(null); }
  };

  const count = cart.length;

  return (
    <nav style={{
      background: 'var(--brand)', color: '#fff', position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Logo */}
        <div onClick={() => nav('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 28 }}>📖</span>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: -0.5 }}>StudyMart</span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {[['notes', '📝 Notes'], ['handwritten', '✍️ Handwritten'], ['pyq', '📋 PYQ']].map(([p, label]) => (
            <button key={p} onClick={() => nav(p)} style={{
              background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff',
              padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>{label}</button>
          ))}
        </div>

        {/* Search */}
        <div style={{ flex: 1, position: 'relative', maxWidth: 360 }}>
          <input
            value={search} onChange={e => doSearch(e.target.value)}
            placeholder="Search notes, subjects, chapters..."
            style={{
              width: '100%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 8, padding: '8px 14px', color: '#fff', fontSize: 13,
            }}
          />
          {results && (
            <div style={{
              position: 'absolute', top: '110%', left: 0, right: 0,
              background: '#fff', borderRadius: 10, boxShadow: 'var(--shadow-lg)',
              zIndex: 200, overflow: 'hidden', color: 'var(--text)',
            }}>
              {[...results.notes, ...results.handwritten, ...results.pyq].length === 0
                ? <div style={{ padding: 16, color: 'var(--muted)', fontSize: 13 }}>No results found</div>
                : [...results.notes, ...results.handwritten, ...results.pyq].map(r => (
                  <div key={`${r.type}-${r.id}`} onClick={() => { nav(r.type === 'pyq' ? 'pyq' : r.type === 'handwritten' ? 'handwritten' : 'notes'); setResults(null); setSearch(''); }}
                    style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 13 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <div style={{ fontWeight: 600 }}>{r.title}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 11 }}>{r.class_name} · {r.subject} · ₹{r.price}</div>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Cart */}
          <button onClick={() => setOpen(true)} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
            borderRadius: 8, padding: '8px 14px', cursor: 'pointer', position: 'relative',
            fontFamily: 'inherit', fontWeight: 600, fontSize: 14,
          }}>
            🛒 Cart
            {count > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6, background: 'var(--accent)',
                color: '#1a1f2e', borderRadius: '50%', width: 18, height: 18,
                fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{count}</span>
            )}
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(!menuOpen)} style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: 600, fontSize: 13,
              }}>
                👤 {user.name.split(' ')[0]} ▾
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0,
                  background: '#fff', color: 'var(--text)', borderRadius: 10,
                  boxShadow: 'var(--shadow-lg)', minWidth: 160, overflow: 'hidden', zIndex: 200,
                }}>
                  <div onClick={() => { nav('purchases'); setMenuOpen(false); }}
                    style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 14 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >📦 My Purchases</div>
                  {user.role === 'admin' && (
                    <div onClick={() => { nav('admin'); setMenuOpen(false); }}
                      style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 14 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >⚙️ Admin Panel</div>
                  )}
                  <div onClick={() => { logout(); setMenuOpen(false); }}
                    style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 14, color: 'var(--red)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >🚪 Logout</div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => nav('login')} style={{
              background: 'var(--accent)', border: 'none', color: '#1a1f2e',
              borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
            }}>Login / Sign Up</button>
          )}
        </div>
      </div>
    </nav>
  );
}

// ── Cart Drawer ──────────────────────────────────────────────
function CartDrawer() {
  const { cart, total, open, setOpen, removeFromCart } = useCart();
  const { user, token } = useAuth();
  const { nav } = usePage();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) { nav('login'); setOpen(false); return; }
    setLoading(true);
    try {
      const order = await apiFetch('/orders/create', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'StudyMart',
        description: 'Purchase Notes',
        order_id: order.order_id,
        handler: async (response) => {
          try {
            await apiFetch('/orders/verify', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, db_order_id: order.db_order_id }),
            });
            setToast({ msg: 'Payment successful! Notes unlocked 🎉', type: 'success' });
            setOpen(false);
          } catch { setToast({ msg: 'Verification failed', type: 'error' }); }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#1a3c6e' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      setToast({ msg: e.message, type: 'error' });
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, maxWidth: '95vw',
        background: '#fff', zIndex: 301, boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>🛒 Your Cart ({cart.length})</h2>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Cart is empty</div>
              <div style={{ fontSize: 13 }}>Browse notes and add them to cart</div>
            </div>
          ) : cart.map(item => (
            <div key={`${item.item_type}-${item.item_id}`} style={{
              display: 'flex', gap: 12, marginBottom: 16, padding: 12,
              background: 'var(--bg)', borderRadius: 10, alignItems: 'flex-start',
            }}>
              <div style={{ fontSize: 32 }}>
                {item.item_type === 'pyq' ? '📋' : item.item_type === 'handwritten' ? '✍️' : '📝'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.detail?.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {item.detail?.class_name} · {item.detail?.subject_name || item.detail?.chapter_title}
                </div>
                <div style={{ color: 'var(--brand)', fontWeight: 700, fontSize: 15, marginTop: 4 }}>₹{item.detail?.price}</div>
              </div>
              <button onClick={() => removeFromCart(item.item_type, item.item_id)}
                style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 18 }}>🗑</button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: 20, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontWeight: 700, fontSize: 16 }}>
              <span>Total</span>
              <span style={{ color: 'var(--brand)' }}>₹{total.toFixed(2)}</span>
            </div>
            <Btn onClick={handleCheckout} variant="accent" size="lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Processing...' : '💳 Pay with Razorpay'}
            </Btn>
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>🔒 Secured by Razorpay</div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Auth Modal ───────────────────────────────────────────────
function LoginPage() {
  const { nav } = usePage();
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const url = mode === 'login' ? '/auth/login' : '/auth/register';
      const d = await apiFetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      login(d.user, d.token);
      nav('home');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const inp = (field) => ({
    value: form[field],
    onChange: e => setForm(f => ({ ...f, [field]: e.target.value })),
    style: { width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, marginBottom: 12 },
  });

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a3c6e 0%, #2456a4 100%)', padding: 20 }}>
      <Card style={{ maxWidth: 420, width: '100%', padding: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📖</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--brand)' }}>StudyMart</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
            {mode === 'login' ? 'Welcome back! Sign in to access your notes.' : 'Join thousands of students studying smarter.'}
          </p>
        </div>

        <div style={{ display: 'flex', marginBottom: 20, background: 'var(--bg)', borderRadius: 8, padding: 4 }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
              background: mode === m ? '#fff' : 'transparent',
              color: mode === m ? 'var(--brand)' : 'var(--muted)',
              boxShadow: mode === m ? 'var(--shadow)' : 'none',
            }}>{m === 'login' ? 'Sign In' : 'Sign Up'}</button>
          ))}
        </div>

        {mode === 'register' && <input placeholder="Full Name" {...inp('name')} />}
        <input placeholder="Email address" type="email" {...inp('email')} />
        {mode === 'register' && <input placeholder="Phone (optional)" {...inp('phone')} />}
        <input placeholder="Password" type="password" {...inp('password')} />

        {error && <div style={{ background: '#fef2f2', color: 'var(--red)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <Btn onClick={submit} size="lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}>
          {loading ? 'Please wait...' : mode === 'login' ? '→ Sign In' : '→ Create Account'}
        </Btn>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
          Demo admin: <strong>admin@studymart.com</strong> / <strong>admin123</strong>
        </div>
      </Card>
    </div>
  );
}

// ── Item Card ────────────────────────────────────────────────
function ItemCard({ item, type, onToast }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { nav } = usePage();
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    if (!user) { nav('login'); return; }
    const ok = await addToCart(type, item.id);
    if (ok) { setAdded(true); onToast({ msg: 'Added to cart!', type: 'success' }); setTimeout(() => setAdded(false), 2000); }
  };

  const typeIcon = type === 'pyq' ? '📋' : type === 'handwritten' ? '✍️' : '📝';
  const typeLabel = type === 'pyq' ? 'PYQ Paper' : type === 'handwritten' ? 'Handwritten' : 'Notes';
  const typeBg = type === 'pyq' ? '#fff3e0' : type === 'handwritten' ? '#f3e5f5' : '#e8eef8';
  const typeColor = type === 'pyq' ? '#e65100' : type === 'handwritten' ? '#6a1b9a' : '#1a3c6e';

  return (
    <Card style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Badge bg={typeBg} color={typeColor}>{typeIcon} {typeLabel}</Badge>
        {item.purchased && <Badge bg="#e8f5e9" color="#2e7d32">✓ Owned</Badge>}
      </div>

      <div style={{ fontSize: 22, marginTop: 4 }}>{item.subject_name?.includes('Math') ? '📐' : item.subject_name?.includes('Physics') ? '⚛️' : item.subject_name?.includes('Chem') ? '🧪' : item.subject_name?.includes('Bio') ? '🧬' : item.subject_name?.includes('Science') ? '🔬' : item.subject_name?.includes('Computer') ? '💻' : '📚'}</div>

      <div>
        <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.4, marginBottom: 4 }}>{item.title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          {item.class_name} · {item.subject_name}
          {item.chapter_number && ` · Ch. ${item.chapter_number}`}
          {item.year && ` · ${item.year}`}
          {item.author_name && ` · by ${item.author_name}`}
        </div>
      </div>

      {item.description && <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{item.description}</div>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
        {item.pages && <Badge bg="#f5f5f5" color="#555">📄 {item.pages} pages</Badge>}
        {item.solutions_included ? <Badge bg="#e8f5e9" color="#2e7d32">✓ Solutions</Badge> : null}
        {item.board && <Badge bg="#e3f2fd" color="#0d47a1">{item.board}</Badge>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--brand)' }}>
          {item.is_free ? <span style={{ color: 'var(--green)' }}>FREE</span> : `₹${item.price}`}
        </div>
        {item.purchased ? (
          <Btn variant="green" size="sm">⬇ Download</Btn>
        ) : (
          <Btn onClick={handleAdd} variant={added ? 'ghost' : 'primary'} size="sm" disabled={added}>
            {added ? '✓ Added' : '+ Add to Cart'}
          </Btn>
        )}
      </div>
    </Card>
  );
}

// ── Filters ──────────────────────────────────────────────────
function Filters({ classes, subjects, filters, setFilters }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
      <select value={filters.class_id || ''} onChange={e => setFilters(f => ({ ...f, class_id: e.target.value, subject_id: '' }))}
        style={{ padding: '9px 14px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, background: '#fff', minWidth: 140 }}>
        <option value="">All Classes</option>
        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <select value={filters.subject_id || ''} onChange={e => setFilters(f => ({ ...f, subject_id: e.target.value }))}
        style={{ padding: '9px 14px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, background: '#fff', minWidth: 160 }}>
        <option value="">All Subjects</option>
        {subjects.filter(s => !filters.class_id || String(s.class_id) === String(filters.class_id)).map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
  );
}

// ── Notes Page ───────────────────────────────────────────────
function NotesPage({ type = 'note' }) {
  const [items, setItems] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const { token } = useAuth();

  const endpoint = type === 'note' ? '/notes' : type === 'handwritten' ? '/handwritten' : '/pyq';

  useEffect(() => {
    Promise.all([apiFetch('/classes'), apiFetch('/classes/1/subjects'), apiFetch('/classes/2/subjects')])
      .then(([cls, s1, s2]) => { setClasses(cls); setSubjects([...s1, ...s2]); });
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API}${endpoint}?${q}`, { headers }).then(r => r.json()).then(d => {
      setItems(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, [filters, endpoint, token]);

  const titles = { note: '📝 Typed Notes', handwritten: '✍️ Handwritten Notes', pyq: '📋 Previous Year Papers' };
  const descs = {
    note: 'Chapter-wise typed notes for CBSE Class 10 & 12',
    handwritten: 'Handwritten notes by toppers & teachers',
    pyq: 'CBSE board exam papers with complete solutions',
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>{titles[type]}</h1>
        <p style={{ color: 'var(--muted)' }}>{descs[type]}</p>
      </div>

      <Filters classes={classes} subjects={subjects} filters={filters} setFilters={setFilters} />

      {loading ? <Spinner /> : (
        items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 600 }}>No items found</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {items.map(item => <ItemCard key={item.id} item={item} type={type} onToast={setToast} />)}
          </div>
        )
      )}
    </div>
  );
}

// ── Home Page ────────────────────────────────────────────────
function HomePage() {
  const { nav } = usePage();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      apiFetch('/notes').catch(() => []),
      apiFetch('/handwritten').catch(() => []),
      apiFetch('/pyq').catch(() => []),
    ]).then(([n, h, p]) => setStats({ notes: n.length, handwritten: h.length, pyq: p.length }));
  }, []);

  const features = [
    { icon: '📝', title: 'Typed Notes', desc: 'Clear, structured notes for every chapter', page: 'notes', color: '#e8eef8' },
    { icon: '✍️', title: 'Handwritten Notes', desc: 'Handwritten by toppers with key highlights', page: 'handwritten', color: '#f3e5f5' },
    { icon: '📋', title: 'PYQ Papers', desc: 'Previous year papers with complete solutions', page: 'pyq', color: '#fff3e0' },
  ];

  const classes = [
    { name: 'Class 10', subjects: 'Maths, Science, SST, English, Hindi', emoji: '🏫', id: 1 },
    { name: 'Class 12', subjects: 'Physics, Chemistry, Maths, Biology, CS, Commerce', emoji: '🎓', id: 2 },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a3c6e 0%, #2456a4 100%)', color: '#fff', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📖</div>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, fontFamily: "'Crimson Pro', serif" }}>
            Study Smarter,<br />Score Better
          </h1>
          <p style={{ fontSize: 18, opacity: 0.85, marginBottom: 32, lineHeight: 1.6 }}>
            CBSE Class 10 & 12 — chapter-wise typed notes, handwritten notes by toppers, and previous year question papers with solutions.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Btn onClick={() => nav('notes')} variant="accent" size="lg">Browse Notes →</Btn>
            <Btn onClick={() => nav('pyq')} variant="outline" size="lg" style={{ borderColor: '#fff', color: '#fff' }}>View PYQ Papers</Btn>
          </div>

          {stats && (
            <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 48 }}>
              {[['📝', stats.notes, 'Typed Notes'], ['✍️', stats.handwritten, 'Handwritten'], ['📋', stats.pyq, 'PYQ Papers']].map(([icon, count, label]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>{icon} {count}+</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px' }}>
        {/* Features */}
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 36 }}>Everything You Need to Excel</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 64 }}>
          {features.map(f => (
            <Card key={f.title} style={{ padding: 28, textAlign: 'center', cursor: 'pointer', background: f.color }} onClick={() => nav(f.page)}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{f.desc}</p>
              <Btn variant="primary" size="sm">Browse →</Btn>
            </Card>
          ))}
        </div>

        {/* Classes */}
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 36 }}>Choose Your Class</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 64 }}>
          {classes.map(c => (
            <Card key={c.id} style={{ padding: 32, cursor: 'pointer' }} onClick={() => nav('notes')}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>{c.emoji}</div>
              <h3 style={{ fontWeight: 800, fontSize: 24, marginBottom: 8, color: 'var(--brand)' }}>{c.name}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>{c.subjects}</p>
              <Btn variant="outline" size="sm">View Notes →</Btn>
            </Card>
          ))}
        </div>

        {/* Why StudyMart */}
        <div style={{ background: 'var(--brand)', borderRadius: 20, padding: '40px 32px', color: '#fff', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 20 }}>Why Students Love StudyMart</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
            {[['✅', 'CBSE Aligned', 'Latest syllabus'], ['⚡', 'Instant Access', 'Download immediately'], ['💰', 'Affordable', 'Starting ₹19 only'], ['🔒', 'Secure', 'Razorpay protected']].map(([icon, title, sub]) => (
              <div key={title}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>
                <div style={{ opacity: 0.75, fontSize: 13 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── My Purchases ─────────────────────────────────────────────
function PurchasesPage() {
  const { token } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/purchases', { headers: { Authorization: `Bearer ${token}` } })
      .then(d => { setPurchases(d); setLoading(false); });
  }, [token]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>📦 My Purchases</h1>
      {loading ? <Spinner /> : purchases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontWeight: 600 }}>No purchases yet</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {purchases.map(p => (
            <Card key={p.id} style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 32 }}>{p.item_type === 'pyq' ? '📋' : p.item_type === 'handwritten' ? '✍️' : '📝'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>Item #{p.item_id} — {p.item_type}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Purchased: {new Date(p.purchased_at).toLocaleDateString('en-IN')}</div>
              </div>
              <Btn variant="green" size="sm" onClick={async () => {
                const r = await fetch(`${API}/download/${p.item_type}/${p.item_id}`, { headers: { Authorization: `Bearer ${token}` } });
                if (r.ok) { const blob = await r.blob(); const url = URL.createObjectURL(blob); window.open(url); }
              }}>⬇ Download</Btn>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Admin Panel ──────────────────────────────────────────────
function AdminPanel() {
  const { token } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [notes, setNotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({});
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    apiFetch('/admin/stats', { headers }).then(setStats);
    apiFetch('/classes').then(cls => {
      setClasses(cls);
      Promise.all(cls.map(c => apiFetch(`/classes/${c.id}/subjects`))).then(all => setSubjects(all.flat()));
    });
  }, []);

  useEffect(() => {
    if (tab === 'notes') apiFetch('/admin/notes', { headers }).then(setNotes);
    if (tab === 'users') apiFetch('/admin/users', { headers }).then(setUsers);
  }, [tab]);

  useEffect(() => {
    if (form.subject_id) {
      apiFetch(`/subjects/${form.subject_id}/chapters`).then(setChapters);
    }
  }, [form.subject_id]);

  const deleteItem = async (endpoint, id) => {
    if (!confirm('Delete this item?')) return;
    await fetch(`${API}${endpoint}/${id}`, { method: 'DELETE', headers });
    setNotes(notes.filter(n => n.id !== id));
    setToast({ msg: 'Deleted!', type: 'success' });
  };

  const tabs = [['dashboard', '📊 Dashboard'], ['notes', '📝 Notes'], ['users', '👥 Users']];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>⚙️ Admin Panel</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {tabs.map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
            background: tab === t ? 'var(--brand)' : 'var(--surface)',
            color: tab === t ? '#fff' : 'var(--text)',
            border: '1px solid var(--border)',
          }}>{l}</button>
        ))}
      </div>

      {tab === 'dashboard' && stats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              ['👥', stats.total_users, 'Students'],
              ['📝', stats.total_notes, 'Typed Notes'],
              ['✍️', stats.total_handwritten, 'Handwritten'],
              ['📋', stats.total_pyq, 'PYQ Papers'],
              ['🛍', stats.total_orders, 'Orders'],
              ['₹', `₹${stats.total_revenue.toFixed(0)}`, 'Revenue'],
            ].map(([icon, val, label]) => (
              <Card key={label} style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--brand)' }}>{val}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</div>
              </Card>
            ))}
          </div>

          <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Orders</h2>
          <Card style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  {['Name', 'Email', 'Amount', 'Payment ID', 'Date'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)', fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders.map(o => (
                  <tr key={o.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{o.name}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{o.email}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--brand)', fontWeight: 700 }}>₹{o.total_amount}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>{o.payment_id || '—'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === 'notes' && (
        <div>
          <Card style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Add New Note</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <select value={form.subject_id || ''} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13 }}>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={form.chapter_id || ''} onChange={e => setForm(f => ({ ...f, chapter_id: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13 }}>
                <option value="">Select Chapter</option>
                {chapters.map(c => <option key={c.id} value={c.id}>Ch. {c.chapter_number}: {c.title}</option>)}
              </select>
              <input placeholder="Title" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13 }} />
              <input placeholder="Price (₹)" type="number" value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13 }} />
              <input placeholder="Pages" type="number" value={form.pages || ''} onChange={e => setForm(f => ({ ...f, pages: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13 }} />
            </div>
            <textarea placeholder="Description" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, marginTop: 12, minHeight: 80, resize: 'vertical' }} />
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Upload PDF file:</label>
              <input type="file" accept=".pdf" onChange={e => setForm(f => ({ ...f, pdf: e.target.files[0] }))} />
            </div>
            <Btn onClick={async () => {
              const fd = new FormData();
              Object.entries({ ...form, type: 'notes' }).forEach(([k, v]) => { if (v) fd.append(k, v); });
              try {
                await fetch(`${API}/admin/notes`, { method: 'POST', headers, body: fd });
                setToast({ msg: 'Note added!', type: 'success' });
                apiFetch('/admin/notes', { headers }).then(setNotes);
                setForm({});
              } catch (e) { setToast({ msg: e.message, type: 'error' }); }
            }} style={{ marginTop: 16 }}>+ Add Note</Btn>
          </Card>

          <div style={{ display: 'grid', gap: 10 }}>
            {notes.map(n => (
              <Card key={n.id} style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{n.class_name} · {n.subject_name} · Ch. {n.chapter_number} · ₹{n.price} · {n.pages || '?'} pages</div>
                </div>
                <Btn variant="danger" size="sm" onClick={() => deleteItem('/admin/notes', n.id)}>🗑 Delete</Btn>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <Card style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Name', 'Email', 'Role', 'Phone', 'Joined'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '12px 16px' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge bg={u.role === 'admin' ? '#fff3e0' : '#e8eef8'} color={u.role === 'admin' ? '#e65100' : '#1a3c6e'}>{u.role}</Badge>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{u.phone || '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

// ── Footer ───────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: 'var(--text)', color: 'rgba(255,255,255,0.7)', padding: '40px 20px', marginTop: 60 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
        <div>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📖 StudyMart</div>
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>CBSE Class 10 & 12 notes, handwritten notes & previous year papers.</p>
        </div>
        {[
          ['Quick Links', ['Home', 'Notes', 'Handwritten', 'PYQ Papers']],
          ['Subjects', ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English']],
          ['Contact', ['support@studymart.com', 'Jhansi, UP, India']],
        ].map(([title, items]) => (
          <div key={title}>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: 12, fontSize: 14 }}>{title}</div>
            {items.map(i => <div key={i} style={{ fontSize: 13, marginBottom: 6 }}>{i}</div>)}
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12 }}>
        © 2025 StudyMart. Made with ❤️ for CBSE students.
      </div>
    </footer>
  );
}

// ── Root App ─────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <PageProvider>
          <AppInner />
        </PageProvider>
      </CartProvider>
    </AuthProvider>
  );
}

function AppInner() {
  const { page } = usePage();
  const { user } = useAuth();
  const { nav } = usePage();

  const pages = {
    home: <HomePage />,
    notes: <NotesPage type="note" />,
    handwritten: <NotesPage type="handwritten" />,
    pyq: <NotesPage type="pyq" />,
    login: <LoginPage />,
    purchases: user ? <PurchasesPage /> : <LoginPage />,
    admin: user?.role === 'admin' ? <AdminPanel /> : <LoginPage />,
  };

  return (
    <div>
      <Navbar />
      <CartDrawer />
      {pages[page] || <HomePage />}
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
