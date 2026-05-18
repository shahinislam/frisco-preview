export default function ContentSkeleton() {
  return (
    <div className="content-skeleton">
      {/* Title bar */}
      <div className="bg-dark">
        <div className="container text-center py-2">
          <div className="sk-line sk-title mx-auto mb-0" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
        </div>
      </div>

      <br />

      <div className="container py-4">
        {/* Hero image */}
        <div className="sk-hero mb-4" style={{ borderRadius: "8px" }} />

        {/* Content lines */}
        <div className="sk-body">
          <div className="sk-line sk-full" />
          <div className="sk-line sk-full" />
          <div className="sk-line sk-medium" />
          <div className="sk-line sk-full" />
          <div className="sk-line sk-short" />
          <div className="sk-line sk-full" />
          <div className="sk-line sk-full" />
          <div className="sk-line sk-medium" />
        </div>
      </div>
    </div>
  );
}
