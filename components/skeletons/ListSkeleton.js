export default function ListSkeleton() {
  return (
    <div className="container py-4">
      {/* Page title */}
      <div className="sk-line sk-title mb-4" />

      {/* Card grid */}
      <div className="row g-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="col-md-4">
            <div className="sk-card">
              <div className="sk-card-img" />
              <div className="sk-card-body">
                <div className="sk-line sk-medium" />
                <div className="sk-line sk-short" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
