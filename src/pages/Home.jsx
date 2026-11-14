
import React, { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Search,
  LayoutGrid,
  Code2,
  Sparkles,
  Github,
  ExternalLink,
  Clock3,
  Layers3,
  HeartPulse,
  Calculator,
  CloudSun,
  CheckCircle2,
  Menu,
  X
} from "lucide-react";

import "../css/Home.css";

const apps = [
  {
    id: 1,
    title: "Health & Fitness Tracker",
    description:
      "Track daily calories, monitor your fitness activities and visualize your weekly health progress.",
    category: "Health & Fitness",
    icon: HeartPulse,
    color: "purple",
    route: "/health-fitness",
    status: "Live",
  },

  {
    id: 2,
    title: "Weather App",
    description:
      "Explore weather conditions, temperature and forecasts for different locations.",
    category: "Utilities",
    icon: CloudSun,
    color: "blue",
    route: "/weather",
    status: "Coming Soon",
  },

  {
    id: 3,
    title: "Calculator",
    description:
      "A simple and interactive calculator for everyday mathematical operations.",
    category: "Productivity",
    icon: Calculator,
    color: "orange",
    route: "/calculator",
    status: "Coming Soon",
  },

];

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Apps");
  const [mobileMenu, setMobileMenu] = useState(false);

  const categories = [
    "All Apps",
    "Health & Fitness",
    "Utilities",
    "Productivity",
  ];

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch =
        app.title.toLowerCase().includes(search.toLowerCase()) ||
        app.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "All Apps" ||
        app.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const liveApps = apps.filter(
    (app) => app.status === "Live"
  ).length;

  return (
    <div className="hub">

      {/* Sidebar */}
      <aside className={`hub-sidebar ${mobileMenu ? "sidebar-open" : ""}`}>

        <div className="hub-logo">
          <div className="logo-icon">
            <Code2 size={22} />
          </div>

          <div>
            <h2>Crio<span>Labs</span></h2>
            <p>PROJECT COLLECTION</p>
          </div>

          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">WORKSPACE</span>

          <button className="sidebar-link active">
            <LayoutGrid size={18} />
            <span>All Applications</span>
          </button>

          <button
            className="sidebar-link"
            onClick={() => {
              setActiveCategory("Health & Fitness");
              setMobileMenu(false);
            }}
          >
            <Activity size={18} />
            <span>Health & Fitness</span>
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Sparkles size={19} />
            <h4>Keep Building!</h4>
            <p>
              Every project is another step forward
              in your development journey.
            </p>
          </div>

          <div className="sidebar-footer">
            <div className="profile-avatar">D</div>
            <div>
              <strong>Developer Workspace</strong>
              <span>Crio Projects</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="hub-main">

        <header className="hub-header">
          <button
            className="mobile-menu"
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={21} />
          </button>

          <div className="breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>Applications</strong>
          </div>

          <div className="header-right">
            <div className="header-status">
              <span></span>
              Workspace Active
            </div>

            <div className="header-avatar">D</div>
          </div>
        </header>

        <div className="hub-content">

          {/* Hero Section */}
          <section className="hub-hero">
            <div className="hero-content">
              <div className="hero-tag">
                <Sparkles size={14} />
                YOUR DEVELOPMENT SPACE
              </div>

              <h1>
                Build. Explore.
                <br />
                <span>Create Something Amazing.</span>
              </h1>

              <p>
                Welcome to your personal application hub.
                All your Crio projects, experiments and
                creations in one place.
              </p>

              <div className="hero-meta">
                <span>
                  <Layers3 size={16} />
                  {apps.length} Projects
                </span>

                <span>
                  <CheckCircle2 size={16} />
                  {liveApps} Live Applications
                </span>
              </div>
            </div>

            <div className="hero-art">
              <div className="hero-glow"></div>
              <div className="hero-window">
                <div className="window-top">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="window-code">
                  <div><i>01</i> <b>const</b> developer = {"{"}</div>
                  <div><i>02</i> &nbsp; creativity: <em>true</em>,</div>
                  <div><i>03</i> &nbsp; projects: <em>∞</em>,</div>
                  <div><i>04</i> &nbsp; learning: <em>"always"</em></div>
                  <div><i>05</i> {"}"}</div>
                  <div className="code-last"><i>06</i> <b>build</b>(developer);</div>
                </div>
              </div>

              <div className="floating-icon float-one">
                <Code2 size={23} />
              </div>

              <div className="floating-icon float-two">
                <Sparkles size={21} />
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section className="hub-stats">
            <div className="stat-box">
              <div className="stat-symbol purple-symbol">
                <Layers3 size={20} />
              </div>
              <div>
                <span>Total Projects</span>
                <strong>{apps.length}</strong>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-symbol green-symbol">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span>Live Projects</span>
                <strong>{liveApps}</strong>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-symbol orange-symbol">
                <Clock3 size={20} />
              </div>
              <div>
                <span>Coming Soon</span>
                <strong>{apps.length - liveApps}</strong>
              </div>
            </div>
          </section>

          {/* Apps Section */}
          <section className="apps-section">

            <div className="apps-heading">
              <div>
                <span className="section-overline">
                  YOUR COLLECTION
                </span>
                <h2>Explore Applications</h2>
                <p>Choose a project and start exploring.</p>
              </div>

              <div className="search-box">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="category-list">
              {categories.map((category) => (
                <button
                  key={category}
                  className={
                    activeCategory === category ? "category-active" : ""
                  }
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Application Cards */}
            <div className="apps-grid">
              {filteredApps.map((app) => {
                const Icon = app.icon;
                const isLive = app.status === "Live";

                return (
                  <article className="app-card" key={app.id}>
                    <div className="app-card-top">
                      <div className={`app-icon ${app.color}`}>
                        <Icon size={25} />
                      </div>

                      <span className={`app-status ${isLive ? "live" : "soon"}`}>
                        <span></span>
                        {app.status}
                      </span>
                    </div>

                    <span className="app-category">
                      {app.category}
                    </span>

                    <h3>{app.title}</h3>

                    <p>{app.description}</p>

                    <div className="app-card-footer">
                      <span>PROJECT #{String(app.id).padStart(2, "0")}</span>

                      {isLive ? (
                        <a href={app.route} className="launch-button">
                          Launch App
                          <ArrowUpRight size={16} />
                        </a>
                      ) : (
                        <button className="launch-button disabled" disabled>
                          Coming Soon
                          <Clock3 size={15} />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}

              {/* Add New Project Card */}
              {activeCategory === "All Apps" && !search && (
                <div className="add-project-card">
                  <div className="add-project-icon">
                    <PlusIcon />
                  </div>
                  <h3>More Projects Coming</h3>
                  <p>
                    Keep adding your Crio course projects
                    and build your own collection.
                  </p>
                  <span>YOUR NEXT IDEA STARTS HERE</span>
                </div>
              )}
            </div>

            {filteredApps.length === 0 && (
              <div className="no-results">
                <Search size={25} />
                <h3>No applications found</h3>
                <p>Try searching with a different keyword.</p>
              </div>
            )}
          </section>

          <footer className="hub-footer">
            <span>© {new Date().getFullYear()} CrioLabs</span>
            <span>Designed & Built with <b>♥</b> by Developer</span>
          </footer>

        </div>
      </main>
    </div>
  );
}

function PlusIcon() {
  return (
    <span className="plus-icon">
      +
    </span>
  );
}
