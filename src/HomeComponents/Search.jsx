import React, { useEffect, useState } from "react";
import {
  history,
  globalSearch,
  userSearch,
  postSearch,
  tripSearch,
  deleteOneHistory,
  deleteAllHistory,
} from "../Apis/searchApi";

const Search = ({ isSearchOpen, setIsSearchOpen }) => {
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");

  // 🧠 Fetch history when search box opens
  useEffect(() => {
    if (!isSearchOpen) return;

    const fetchHistory = async () => {
      setError("");
      try {
        const { data } = await history();
        setRecent(data.history);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch search history");
      }
    };

    fetchHistory();
  }, [isSearchOpen]);

  // 🔍 Handle search by type
  const handleClick = async (type) => {
    if (!query.trim()) return;

    try {
      let search;
      switch (type) {
        case "All":
          search = await globalSearch(query);
          break;
        case "Users":
          search = await userSearch(query);
          break;
        case "Posts":
          search = await postSearch(query);
          break;
        case "Trips":
          search = await tripSearch(query);
          break;
        default:
          return;
      }
      setResults(search.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch search results.");
    }
  };

  return (
    <div
      className="w-full relative flex items-center justify-center"
      onClick={(e) => {
        e.stopPropagation();
        if (!isSearchOpen) setIsSearchOpen(true);
      }}
    >
      {/* 🔍 Input */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Trips, Posts or Users..."
        className="w-full border border-[#8D99AE]/30 rounded-xl pl-5 pr-20 py-2.5 text-lg text-white placeholder-[#8D99AE] bg-[#353749] focus:outline-none focus:ring-2 focus:ring-[#EF233C]/80 transition-all duration-300 shadow-md"
      />

      {/* 🔎 Search Icon */}
      <i className="bx bx-search absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-[#EF233C]" />

      {/* ❌ Close Icon */}
      <i
        className={`bx bx-x ${
          isSearchOpen ? "opacity-100" : "opacity-0"
        } absolute right-14 top-1/2 -translate-y-1/2 text-2xl text-[#EF233C] cursor-pointer transition-opacity duration-300`}
        onClick={() => {
          setIsSearchOpen(false);
          setQuery("");
          setResults([]);
        }}
      />

      {/* 🔽 Dropdown */}
      {isSearchOpen && (
        <div className="absolute top-full mt-2 w-full bg-[#2B2D42] rounded-xl shadow-xl z-50 border border-[#8D99AE]/20 overflow-hidden animate-fadeIn">
          {/* Filter Buttons */}
          <div className="flex items-center justify-around py-2 bg-[#353749]/60 border-b border-[#8D99AE]/20">
            {["All", "Users", "Posts", "Trips"].map((type) => (
              <button
                key={type}
                onClick={() => handleClick(type)}
                className="text-[#EDF2F4] hover:text-[#EF233C] px-3 py-1 text-sm font-medium transition-colors duration-200"
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search Results */}
          {query.trim() && results.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
              {results.map((item) => (
                <div
                  key={item._id}
                  className="px-4 py-3 hover:bg-[#353749] cursor-pointer text-[#EDF2F4] transition-all duration-200"
                >
                  {item.username || item.title || item.name || "Unknown"}
                </div>
              ))}
            </div>
          )}

          {/* Recent History */}
          {!query.trim() && recent.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
              {recent.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center px-4 py-3 hover:bg-[#353749] cursor-pointer text-[#EDF2F4] transition-all duration-200"
                >
                  <span>
                    {item.query} <span className="text-[#8D99AE] text-sm">({item.type})</span>
                  </span>
                  <i
                    className="bx bx-x text-[#EF233C] text-lg cursor-pointer hover:text-red-600"
                    onClick={() => deleteOneHistory(item._id)}
                  ></i>
                </div>
              ))}

              <div className="text-center py-2 border-t border-[#8D99AE]/20">
                <button
                  onClick={deleteAllHistory}
                  className="text-[#EF233C] text-sm hover:text-red-400 transition-colors duration-200"
                >
                  Clear All History
                </button>
              </div>
            </div>
          )}

          {/* No Results */}
          {query.trim() && results.length === 0 && !error && (
            <div className="text-center py-3 text-[#8D99AE]">No results found</div>
          )}
        </div>
      )}

      {/* ⚠️ Error Message */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default Search;
