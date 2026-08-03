import { usePushNotifications } from "./use-push-notifications";

export function NotificationToggle(): JSX.Element | null {
  const { status, subscribed, loading, error, enable, disable } = usePushNotifications();

  if (status === "unsupported") return null;

  if (status === "needs-install") {
    return (
      <span className="notification-toggle__hint" title="En iPhone: toca Compartir → Añadir a pantalla de inicio para poder activarlas">
        🔔 Instala la app para notificaciones
      </span>
    );
  }

  return (
    <div className="notification-toggle">
      <button type="button" disabled={loading} onClick={() => (subscribed ? disable() : enable())}>
        {subscribed ? "🔔 Notificaciones activadas" : "🔕 Activar notificaciones"}
      </button>
      {error && <span className="notification-toggle__error">{error}</span>}
    </div>
  );
}
