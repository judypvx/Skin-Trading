const Index = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111111",
        color: "white",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        CS:GO Trading Dashboard
      </h1>

      <div
        style={{
          backgroundColor: "#222222",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
        }}
      >
        <h2>Dashboard Test</h2>
        <p>If you can see this, the basic React app is working!</p>
      </div>

      <div
        style={{
          backgroundColor: "#333333",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <h3>Next Steps:</h3>
        <ul>
          <li>✅ React is working</li>
          <li>✅ Dark theme loaded</li>
          <li>🔄 Loading full components...</li>
        </ul>
      </div>
    </div>
  );
};

export default Index;
