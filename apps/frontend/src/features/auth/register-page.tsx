import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./auth-context";

export function RegisterPage(): JSX.Element {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email, password, name);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 130 32"
            className="auth-brand__logo"
            aria-label="Kosmo"
            role="img"
          >
            <defs>
              <clipPath id="auth-logo-box-r"><rect x="0" y="0" width="30" height="32"/></clipPath>
              <clipPath id="auth-ring-back-r"><rect x="0" y="0" width="30" height="16"/></clipPath>
              <clipPath id="auth-ring-front-r"><rect x="0" y="16" width="30" height="16"/></clipPath>
            </defs>
            <g clipPath="url(#auth-logo-box-r)">
              <ellipse cx="15" cy="16" rx="21" ry="7" fill="none" stroke="#7dd3fc" strokeWidth="2"
                       transform="rotate(-22 15 16)" clipPath="url(#auth-ring-back-r)" opacity="0.4"/>
              <circle cx="15" cy="16" r="12" fill="#38bdf8"/>
              <circle cx="11" cy="12" r="4.5" fill="#bae6fd" opacity="0.3"/>
              <ellipse cx="15" cy="16" rx="21" ry="7" fill="none" stroke="#7dd3fc" strokeWidth="2"
                       transform="rotate(-22 15 16)" clipPath="url(#auth-ring-front-r)"/>
            </g>
            <text
              x="36" y="22"
              fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
              fontSize="19" fontWeight="700" fill="currentColor" letterSpacing="-0.3"
            >
              kosmo
            </text>
          </svg>
          <p className="auth-brand__tagline">Tu agenda modular</p>
        </div>
        <h2 className="auth-form-title">Crear cuenta</h2>

        <label htmlFor="name">Nombre</label>
        <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />

        <label htmlFor="email">Correo electrónico</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear cuenta"}
        </button>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
