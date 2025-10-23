import React, { useState, useEffect } from "react";
import PlayerSearch from "../../components/PlayerSearch";
import FileList from "../user/FileList";
import "./SearchFeed.scss";

const SearchFeed = () => {
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [posts, setPosts] = useState([]);        // ✅ 검색 결과 저장
  const [loading, setLoading] = useState(false); // ✅ 로딩 상태
  const [error, setError] = useState(null);      // ✅ 에러 상태

  // ✅ 선수 이름 변경 시 전체 유저 글 불러오기
  useEffect(() => {
    if (!selectedPlayer) return;

    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://localhost:3000/api/files/search?player=${encodeURIComponent(selectedPlayer)}`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "검색 실패");
        setPosts(data);
      } catch (err) {
        console.error("검색 결과 불러오기 실패:", err);
        setError("검색 중 문제가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [selectedPlayer]);

  return (
    <section className="search-feed container">
      <header className="search-header">
        <h1>⚽ 선수별 포토메모 피드</h1>
        <p>선수 이름으로 검색하면 모든 유저의 포토메모를 확인할 수 있습니다.</p>
      </header>

      {/* ✅ 검색창 */}
      <div className="search-box">
        <PlayerSearch onSelect={(name) => setSelectedPlayer(name)} />
      </div>

      {/* ✅ 상태별 표시 */}
      {!selectedPlayer && (
        <p className="search-placeholder">검색할 선수를 입력해보세요 🏆</p>
      )}

      {loading && <p className="loading">불러오는 중입니다...</p>}

      {error && <p className="error">{error}</p>}

      {/* ✅ 검색 결과 */}
      {selectedPlayer && !loading && !error && (
        <div className="search-result">
          <h2 className="search-result-title">
            📸 <strong>{selectedPlayer}</strong> 관련 포토메모
          </h2>

          {posts.length > 0 ? (
            <FileList posts={posts} showAllUsers={true} />
          ) : (
            <p className="no-posts">아직 {selectedPlayer} 관련 포토메모가 없습니다 😅</p>
          )}
        </div>
      )}
    </section>
  );
};

export default SearchFeed;
