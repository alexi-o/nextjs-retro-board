import React, { useState } from "react";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Gif } from "@giphy/react-components";

const giphyFetch = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY);

const GifPicker = ({ onGifSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [gifs, setGifs] = useState([]);

  console.log("Giphy API Key:", process.env.NEXT_PUBLIC_GIPHY_API_KEY);

  const fetchGifs = async (query) => {
    const { data } = await giphyFetch.search(query, { limit: 10 });

    setGifs(data);
  };

  const handleGifClick = (gif) => {
    onGifSelect(gif);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <input
        type="text"
        placeholder="Search GIFs"
        onFocus={() => setIsOpen(true)}
        onChange={(e) => fetchGifs(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
      />

      {gifs.length > 0 && (
        <div className=" z-10 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <div
                key={gif.id}
                className="cursor-pointer"
                onClick={() => handleGifClick(gif)}
              >
                <Gif gif={gif} width={200} hideAttribution noLink />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GifPicker;
