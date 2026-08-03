import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/auth-context";
import { useTheme } from "../features/theme/theme-context";
import { NotificationToggle } from "../features/notifications/notification-toggle";

export function AppLayout(): JSX.Element {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell">
      <header className="app-header">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 130 32"
          className="app-header__logo"
          aria-label="Kosmo"
          role="img"
        >
          <defs>
            <clipPath id="logo-icon-box">
              <rect x="0" y="0" width="30" height="32"/>
            </clipPath>
            <clipPath id="logo-ring-back">
              <rect x="0" y="0" width="30" height="16"/>
            </clipPath>
            <clipPath id="logo-ring-front">
              <rect x="0" y="16" width="30" height="16"/>
            </clipPath>
          </defs>
          <g clipPath="url(#logo-icon-box)">
            <ellipse cx="15" cy="16" rx="21" ry="7" fill="none" stroke="#7dd3fc" strokeWidth="2"
                     transform="rotate(-22 15 16)" clipPath="url(#logo-ring-back)" opacity="0.4"/>
            <circle cx="15" cy="16" r="12" fill="#38bdf8"/>
            <circle cx="11" cy="12" r="4.5" fill="#bae6fd" opacity="0.3"/>
            <ellipse cx="15" cy="16" rx="21" ry="7" fill="none" stroke="#7dd3fc" strokeWidth="2"
                     transform="rotate(-22 15 16)" clipPath="url(#logo-ring-front)"/>
          </g>
          <text
            x="36" y="22"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
            fontSize="19" fontWeight="700" fill="currentColor" letterSpacing="-0.3"
          >
            kosmo
          </text>
        </svg>
        <nav className="app-header__nav">
          <Link to="/">Almanaque</Link>
          <Link to="/tablero">Tablero</Link>
          <Link to="/spaces">Espacios</Link>
          <Link to="/tasks">Todas las tareas</Link>
        </nav>
        <div className="app-header__user">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <NotificationToggle />
          {user && <span>{user.name}</span>}
          <button type="button" onClick={logout}>
            Salir
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
