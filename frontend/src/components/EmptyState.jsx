export default function EmptyState({ icon: Icon, title = 'No data found', description = '', action }) {
  return (
    <div className="neon-card text-center py-12">
      {Icon && <Icon size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />}
      <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {description && <p className="mb-4 max-w-md mx-auto text-sm" style={{ color: 'var(--text-secondary)' }}>{description}</p>}
      {action && action}
    </div>
  );
}
