export default function EmptyState({ icon: Icon, title = 'No data found', description = '', action }) {
  return (
    <div className="card text-center py-12">
      {Icon && <Icon size={48} className="mx-auto mb-4 text-gray-300" />}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-gray-500 mb-4 max-w-md mx-auto">{description}</p>}
      {action && action}
    </div>
  );
}
