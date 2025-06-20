import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ChatBotPage() {
  const [situations, setSituations] = useState([]);
  const [guideline, setGuideline] = useState(
    "상황을 선택하면 행동요령이 여기에 표시됩니다."
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    console.log("상황 리스트 요청 시작");
    axios
      .get(`${apiUrl}/situations`)
      .then((res) => {
        console.log("받은 상황 리스트:", res.data);
        setSituations(res.data);
      })
      .catch((err) => {
        console.error("상황 리스트 로딩 실패:", err);
        setSituations([]);
      });
  }, []);

  // useEffect(() => {
  //   console.log("상황 리스트 요청 시작");
  //   fetch(`${apiUrl}/situations`)
  //     .then((res) => {
  //       if (!res.ok) throw new Error(`네트워크 오류: ${res.status}`);
  //       return res.json();
  //     })
  //     .then((data) => {
  //       console.log("받은 상황 리스트:", data);
  //       setSituations(data);
  //     })
  //     .catch((err) => {
  //       console.error("상황 리스트 로딩 실패:", err);
  //       setSituations([]);
  //     });
  // }, []);

  const handleSituationClick = async (situation) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/guideline/${encodeURIComponent(situation)}`
      );
      const text = await res.text();
      setGuideline(text);
    } catch {
      setGuideline("행동요령을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "auto", padding: "20px" }}>
      <h1>🔥 화재 발생 시 행동요령 안내 챗봇 🔥</h1>

      <div style={{ marginBottom: "20px" }}>
        {situations.map((situation) => (
          <button
            key={situation}
            onClick={() => handleSituationClick(situation)}
            style={{
              margin: "5px",
              padding: "10px 15px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            {situation}
          </button>
        ))}
      </div>

      <div
        style={{
          whiteSpace: "pre-wrap",
          border: "1px solid #ccc",
          padding: "15px",
          minHeight: "150px",
          fontSize: "16px",
        }}
      >
        {loading ? "불러오는 중..." : guideline}
      </div>

      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#444",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          borderRadius: "5px",
        }}
      >
        돌아가기
      </button>
    </div>
  );
}

export default ChatBotPage;
