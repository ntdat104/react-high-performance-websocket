import React from "react";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import CandlestickChart from "./CandlestickChart";

interface Props {
  crypto?: any;
}

const CryptoCard: React.FC<Props> = (props) => {
  const { crypto } = props;
  return (
    <div className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition-all duration-300 cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={crypto.image}
            alt={crypto.name}
            className="w-10 h-10 rounded-full"
            loading="lazy"
          />
          <div>
            <h3 className="text-white font-semibold">{crypto.name}</h3>
            <span className="text-gray-400 text-sm">
              {crypto.symbol.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Price</span>
          <span className="text-white font-medium">
            ${crypto.current_price.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">24h Change</span>
          <div
            className={`flex items-center ${
              crypto.price_change_percentage_24h >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {crypto.price_change_percentage_24h >= 0 ? (
              <FiTrendingUp className="mr-1" />
            ) : (
              <FiTrendingDown className="mr-1" />
            )}
            {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
          </div>
        </div>
      </div>
      <div className="h-[150px]">
        <CandlestickChart ticker={`${crypto.symbol}USDT`.toUpperCase()} />
      </div>
    </div>
  );
};

export default CryptoCard;
