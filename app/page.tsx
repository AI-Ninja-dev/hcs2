import {
  Activity,
  ArrowRight,
  BadgeCheck,
  HeartPulse,
  Menu,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Wrench,
} from "lucide-react";

const conditions = [
  { title: "Manage Diabetes", copy: "CGM and home monitoring tools for clearer daily decisions.", icon: Activity },
  { title: "Monitor Blood Pressure", copy: "Track hypertension trends with dependable home devices.", icon: HeartPulse },
  { title: "Protect Heart Health", copy: "Stay closer to the signals that shape cardiovascular wellbeing.", icon: TrendingUp },
  { title: "Monitor From Home", copy: "Bring connected chronic-care monitoring into everyday life.", icon: Stethoscope },
];

const products = [
  { name: "Anytime 5 Pro CGM", category: "Continuous glucose monitoring", metric: "24/7 glucose insight" },
  { name: "Smart BP Monitor", category: "Hypertension care", metric: "Connected blood pressure" },
  { name: "ECG Health Watch", category: "Heart health", metric: "Everyday rhythm insight" },
];

export default function HomePage() {
  return (
    <main>
      <header className="site-header shell">
        <a className="brand" href="#top" aria-label="HomeClinicStore home">
          <span className="brand-mark">H</span>
          <span>HomeClinicStore</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#shop">Shop</a>
          <a href="#diabetes">Diabetes</a>
          <a href="#heart">Heart Health</a>
          <a href="#caregrid">Remote Monitoring</a>
          <a href="#services">Services</a>
          <a href="#learn">Learn</a>
        </nav>
        <div className="header-actions">
          <a className="text-link" href="#shop">Browse products</a>
          <a className="button button-dark" href="#shop">Shop health tech <ArrowRight size={16} /></a>
          <button className="mobile-menu" aria-label="Open menu"><Menu size={21} /></button>
        </div>
      </header>

      <section id="top" className="hero shell section-pad">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> Next-gen healthcare at home</div>
          <h1>Your health.<br /><span>Connected at home.</span></h1>
          <p className="hero-lede">
            Modern tools for diabetes, blood pressure, heart health and chronic care — designed to make everyday monitoring simpler, clearer and more connected.
          </p>
          <div className="hero-actions">
            <a className="button button-accent" href="#cgm">Explore CGM <ArrowRight size={17} /></a>
            <a className="button button-ghost" href="#conditions">Find your solution</a>
          </div>
          <div className="trust-row">
            <span><ShieldCheck size={17} /> Trusted home-health technology</span>
            <span><BadgeCheck size={17} /> Professional biomedical support</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="CGM glucose monitoring concept">
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="device-card glass-panel">
            <div className="device-topline">
              <span>Glucose now</span>
              <span className="status-dot">Live</span>
            </div>
            <div className="glucose-value">6.1 <small>mmol/L</small></div>
            <div className="trend"><TrendingUp size={18} /> Stable trend</div>
            <div className="chart" aria-hidden="true">
              <svg viewBox="0 0 360 120" role="img">
                <path d="M0 82 C35 76 48 42 86 55 S139 91 172 67 S224 35 260 48 S322 74 360 38" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="metric-grid">
              <div><span>Time in range</span><strong>91%</strong></div>
              <div><span>Avg glucose</span><strong>6.5</strong></div>
            </div>
          </div>
          <div className="floating-chip chip-left"><Activity size={17} /> 24/7 insight</div>
          <div className="floating-chip chip-right"><HeartPulse size={17} /> Better daily decisions</div>
        </div>
      </section>

      <section id="cgm" className="shell cgm-spotlight section-pad-sm">
        <div className="section-kicker">Continuous Glucose Monitoring</div>
        <div className="cgm-grid">
          <div>
            <h2>Know more than a single glucose reading.</h2>
            <p>CGM helps reveal direction, patterns and changes throughout the day so diabetes management can become more informed and less reactive.</p>
          </div>
          <div className="cgm-stats">
            <div><strong>24/7</strong><span>continuous insight</span></div>
            <div><strong>Trends</strong><span>not isolated numbers</span></div>
            <div><strong>Home</strong><span>monitoring made simple</span></div>
          </div>
        </div>
      </section>

      <section id="conditions" className="shell section-pad">
        <div className="section-heading split-heading">
          <div>
            <div className="section-kicker">Start with what matters to you</div>
            <h2>Health technology built around real needs.</h2>
          </div>
          <p>Shop and learn by condition, not by confusing technical categories.</p>
        </div>
        <div className="condition-grid">
          {conditions.map(({ title, copy, icon: Icon }) => (
            <article className="condition-card" key={title}>
              <div className="icon-wrap"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p>{copy}</p>
              <a href="#shop">Explore <ArrowRight size={15} /></a>
            </article>
          ))}
        </div>
      </section>

      <section id="shop" className="product-section section-pad">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <div className="section-kicker">Featured health technology</div>
              <h2>Designed for everyday confidence.</h2>
            </div>
            <a className="text-link" href="#shop">View all products <ArrowRight size={16} /></a>
          </div>
          <div className="product-grid">
            {products.map((product, index) => (
              <article className="product-card" key={product.name}>
                <div className={`product-art art-${index + 1}`}>
                  <div className="product-device"><Activity size={34} /></div>
                  <span className="product-badge">Connected care</span>
                </div>
                <div className="product-copy">
                  <span>{product.category}</span>
                  <h3>{product.name}</h3>
                  <p>{product.metric}</p>
                  <a href="#contact">Discover product <ArrowRight size={15} /></a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="heart" className="shell narrative-grid section-pad">
        <article className="story-card story-heart">
          <div className="section-kicker">Cardiovascular + hypertension</div>
          <h2>Small readings can tell a bigger story.</h2>
          <p>Regular home blood-pressure and heart monitoring can make trends easier to spot and conversations with healthcare professionals more useful.</p>
          <a className="button button-light" href="#shop">Explore heart health <ArrowRight size={16} /></a>
        </article>
        <article id="diabetes" className="story-card story-diabetes">
          <div className="section-kicker">Diabetes management</div>
          <h2>See the pattern, not just the number.</h2>
          <p>Pair continuous glucose insight with practical home monitoring so everyday decisions are supported by richer information.</p>
          <a className="button button-dark" href="#cgm">Explore diabetes care <ArrowRight size={16} /></a>
        </article>
      </section>

      <section id="caregrid" className="caregrid section-pad">
        <div className="shell caregrid-grid">
          <div>
            <div className="eyebrow eyebrow-dark"><Sparkles size={15} /> CareGrid remote monitoring</div>
            <h2>From home readings to connected care.</h2>
            <p>CareGrid brings vital trends, chronic-care monitoring and meaningful alerts into one connected layer for patients and care teams.</p>
            <div className="caregrid-points">
              <span><Activity size={18} /> Connected vitals</span>
              <span><TrendingUp size={18} /> Long-term trends</span>
              <span><ShieldCheck size={18} /> Meaningful alerts</span>
              <span><Stethoscope size={18} /> Patient-provider connection</span>
            </div>
          </div>
          <div className="dashboard-panel">
            <div className="dashboard-head"><span>CareGrid health overview</span><span className="live-pill">Live</span></div>
            <div className="dashboard-big"><small>Today’s overview</small><strong>Stable</strong><p>3 of 3 key signals within your usual range.</p></div>
            <div className="dashboard-metrics">
              <div><span>Blood pressure</span><strong>122/78</strong></div>
              <div><span>Glucose</span><strong>6.1</strong></div>
              <div><span>Heart rate</span><strong>72</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="shell services section-pad">
        <div className="services-copy">
          <div className="section-kicker">Biomedical support</div>
          <h2>Health technology needs dependable support behind it.</h2>
          <p>HomeClinicStore combines modern health devices with servicing, calibration, repair and practical device support.</p>
        </div>
        <div className="services-list">
          {["Servicing", "Calibration", "Repair", "Device support"].map((item, i) => (
            <div className="service-row" key={item}>
              <span className="service-number">0{i + 1}</span>
              <strong>{item}</strong>
              <Wrench size={19} />
            </div>
          ))}
        </div>
      </section>

      <section id="learn" className="shell learn-panel section-pad-sm">
        <div>
          <div className="section-kicker">Understand your health</div>
          <h2>Better monitoring starts with better understanding.</h2>
        </div>
        <div className="learn-links">
          <a href="#cgm"><span>CGM explained simply</span><ArrowRight size={17}/></a>
          <a href="#heart"><span>Why blood-pressure trends matter</span><ArrowRight size={17}/></a>
          <a href="#caregrid"><span>What remote monitoring can do</span><ArrowRight size={17}/></a>
        </div>
      </section>

      <section id="contact" className="shell final-cta section-pad">
        <div className="cta-panel">
          <div>
            <div className="eyebrow eyebrow-dark"><ShieldCheck size={15} /> Health technology, closer to home</div>
            <h2>Make home monitoring part of everyday care.</h2>
            <p>Discover connected devices, chronic-care tools and professional support from HomeClinicStore.</p>
          </div>
          <div className="cta-actions">
            <a className="button button-light" href="#shop">Shop health technology <ArrowRight size={16}/></a>
            <a className="button button-outline-light" href="#services">Explore services</a>
          </div>
        </div>
      </section>

      <footer className="footer shell">
        <div className="brand footer-brand"><span className="brand-mark">H</span><span>HomeClinicStore</span></div>
        <p>Modern healthcare at home.</p>
        <div className="footer-links"><a href="#shop">Shop</a><a href="#caregrid">CareGrid</a><a href="#services">Services</a><a href="#learn">Learn</a></div>
        <small>© 2026 HomeClinicStore. Health information on this site does not replace professional medical advice.</small>
      </footer>
    </main>
  );
}
