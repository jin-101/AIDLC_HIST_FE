interface AdminStatusPanelProps {
  title: string;
  message?: string | null;
  actionLabel?: string;
  onAction?: () => void;
}

export function AdminStatusPanel({ title, message, actionLabel, onAction }: AdminStatusPanelProps) {
  return (
    <section className="status-panel" data-testid="admin-status-panel">
      <h2>{title}</h2>
      {message ? <p className="error-text">{message}</p> : null}
      {actionLabel && onAction ? (
        <button data-testid="admin-status-action-button" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
