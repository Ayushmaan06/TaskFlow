"use client";

import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch("/api/swagger")
      .then((r) => r.json())
      .then(setSpec);
  }, []);

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          padding: "20px 32px",
          color: "white",
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          ⚡ TaskFlow API Documentation
        </h1>
        <p style={{ opacity: 0.85, fontSize: 14 }}>
          Interactive REST API documentation — built with OpenAPI 3.0
        </p>
      </div>
      {spec ? (
        <SwaggerUI spec={spec} />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 300,
            color: "#666",
          }}
        >
          Loading API specification...
        </div>
      )}
    </div>
  );
}
