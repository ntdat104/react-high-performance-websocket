import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { BiSort } from "react-icons/bi";
import { FiSearch } from "react-icons/fi";
import CryptoCard from "./components/CryptoCard";
import { useAppDispatch } from "./redux/hooks";
import { connect } from "./redux/ws-slice";

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [cryptocurrencies, setCryptocurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("market_cap");
  const [sortDirection, setSortDirection] = useState("desc");

  React.useEffect(() => {
    dispatch(connect());
  }, []);

  const fetchCryptoData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 100,
            sparkline: false,
          },
        }
      );
      setCryptocurrencies(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch cryptocurrency data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCryptoData();
  }, []);

  const filteredAndSortedCryptos = useMemo(() => {
    return cryptocurrencies
      .filter((crypto: any) =>
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a: any, b: any) => {
        const multiplier = sortDirection === "desc" ? -1 : 1;
        switch (sortBy) {
          case "price":
            return (a.current_price - b.current_price) * multiplier;
          case "change":
            return (
              (a.price_change_percentage_24h - b.price_change_percentage_24h) *
              multiplier
            );
          default:
            return (a.market_cap - b.market_cap) * multiplier;
        }
      });
  }, [cryptocurrencies, searchTerm, sortBy, sortDirection]);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="bg-gray-800 rounded-xl p-4 h-[160px]"></div>
      ))}
    </div>
  );

  const ErrorFallback = ({ error, resetErrorBoundary }) => (
    <div className="text-center py-10">
      <p className="text-red-500 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Try again
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">
            Cryptocurrency Prices
          </h1>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search cryptocurrencies..."
                className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="market_cap">Market Cap</option>
                <option value="price">Price</option>
                <option value="change">24h Change</option>
              </select>
              <button
                onClick={() =>
                  setSortDirection(sortDirection === "desc" ? "asc" : "desc")
                }
                className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <BiSort className="text-white text-xl" />
              </button>
            </div>
          </div>
        </div>

        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={fetchCryptoData}
        >
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredAndSortedCryptos.map((crypto: any) => (
                <CryptoCard key={crypto.id} crypto={crypto} />
              ))}
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default App;
