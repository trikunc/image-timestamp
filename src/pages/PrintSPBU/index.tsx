import { useState } from "react";
import KyaiMojo from "../../components/SPBU/KyaiMojo";
import Kentungan from "../../components/SPBU/Kentungan";
import Jamang from "../../components/SPBU/Jamang";

const SPBU = () => {
  const [activeTab, setActiveTab] = useState("KyaiMojo");

  const tabs = [
    { key: "KyaiMojo", label: "Kyai Mojo" },
    { key: "Kentungan", label: "Kentungan" },
    { key: "Jamang", label: "Jamang" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "KyaiMojo":
        return <KyaiMojo />;
      case "Kentungan":
        return <Kentungan />;
      case "Jamang":
        return <Jamang />;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 20 }}>

      {/* TAB HEADER */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #ccc",
              cursor: "pointer",
              backgroundColor:
                activeTab === tab.key ? "#1976d2" : "#f1f1f1",
              color: activeTab === tab.key ? "#fff" : "#000",
              fontWeight: activeTab === tab.key ? "bold" : "normal",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div>{renderContent()}</div>
    </div>
  );
};

export default SPBU;