import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import GifPicker from "@/components/GifPicker";
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EmojiPicker from "emoji-picker-react";

const ReflectColumn = ({ sentiment, emoji, retrospectiveId, step }) => {
  const [reflections, setReflections] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReflection, setNewReflection] = useState("");
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [votes, setVotes] = useState({});
  const [emojiPickerAnchorEl, setEmojiPickerAnchorEl] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || null);
    };
    fetchUser();
  }, [supabase]);

  useEffect(() => {
    const fetchReflections = async () => {
      const { data } = await supabase
        .from("reflections")
        .select("*")
        .eq("retrospective_id", retrospectiveId)
        .eq("sentiment", sentiment);

      setReflections(data);
      const initialVotes = data.reduce((acc, reflection) => {
        acc[reflection.id] = {};
        return acc;
      }, {});
      setVotes(initialVotes);
    };

    fetchReflections();
  }, [retrospectiveId, sentiment, step]); // Ensure 'step' is included in the dependency array

  const handleAddReflection = async (e) => {
    e.preventDefault();
    if (!userId || !newReflection.trim()) return;

    const { error } = await supabase.from("reflections").insert([
      {
        retrospective_id: retrospectiveId,
        sentiment,
        content: newReflection,
        user_id: userId,
        gif_url: selectedGif?.images?.downsized?.url || null,
      },
    ]);

    if (error) {
      console.error("Error adding reflection:", error);
    } else {
      setNewReflection("");
      setSelectedGif(null);
      setIsDialogOpen(false);
      setShowGifPicker(false);
      fetchReflections(); // Fetch reflections again after adding a new one
    }
  };

  const handleVote = (reflectionId, emoji) => {
    setVotes((prevVotes) => ({
      ...prevVotes,
      [reflectionId]: {
        ...prevVotes[reflectionId],
        [emoji]: (prevVotes[reflectionId][emoji] || 0) + 1,
      },
    }));
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEmojiPickerClick = (event) => {
    setEmojiPickerAnchorEl(event.currentTarget);
  };

  const handleEmojiPickerClose = () => {
    setEmojiPickerAnchorEl(null);
  };

  const addNewEmoji = (reflectionId, emoji) => {
    handleVote(reflectionId, emoji.emoji);
    handleEmojiPickerClose();
  };

  const open = Boolean(anchorEl);
  const openEmojiPicker = Boolean(emojiPickerAnchorEl);

  const getSubheading = (sentiment) => {
    switch (sentiment) {
      case "Glad":
        return "Positive experiences";
      case "Bad":
        return "Negative experiences";
      case "Mad":
        return "Frustrations & challenges";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 dark:text-white">
      <h2 className="text-xl font-bold text-left text-gray-900 dark:text-gray-100">
        {emoji} {sentiment}
      </h2>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
        {getSubheading(sentiment)}
      </h3>
      <ul className="flex-grow mb-4 space-y-2 overflow-y-auto">
        {reflections.map((reflection) => (
          <li
            key={reflection.id}
            className="bg-gray-100 dark:bg-gray-700 p-2 rounded"
          >
            {step !== "reflect" || reflection.user_id === userId ? (
              <>
                <p>{reflection.content}</p>
                {reflection.gif_url && (
                  <img
                    src={reflection.gif_url}
                    alt="GIF"
                    className="mt-2 rounded"
                  />
                )}
                {step === "vote" && (
                  <div className="flex items-center space-x-2 mt-2">
                    {Object.keys(votes[reflection.id] || {}).map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleVote(reflection.id, emoji)}
                        className="text-lg"
                      >
                        {emoji} {votes[reflection.id][emoji]}
                      </button>
                    ))}
                    <button
                      onClick={(event) =>
                        handleEmojiPickerClick(event, reflection.id)
                      }
                      className="text-lg"
                    >
                      ➕
                    </button>
                    <Popover
                      open={openEmojiPicker}
                      anchorEl={emojiPickerAnchorEl}
                      onClose={handleEmojiPickerClose}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      transformOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}
                      PaperProps={{
                        style: {
                          maxHeight: "400px",
                          maxWidth: "300px",
                          overflowY: "auto",
                          backgroundColor: "#1f1f1f",
                          color: "#fff",
                        },
                      }}
                    >
                      <EmojiPicker
                        onEmojiClick={(emoji) =>
                          addNewEmoji(reflection.id, emoji)
                        }
                      />
                    </Popover>
                  </div>
                )}
              </>
            ) : (
              <span className="italic text-gray-500 dark:text-gray-400">
                Hidden
              </span>
            )}
          </li>
        ))}
      </ul>

      {step === "reflect" && (
        <div>
          {!isDialogOpen && (
            <button
              onClick={() => setIsDialogOpen(true)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
            >
              + Add Item
            </button>
          )}

          {isDialogOpen && (
            <div className="mt-2 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg relative">
              <form onSubmit={handleAddReflection} className="space-y-2">
                <textarea
                  value={newReflection}
                  onChange={(e) => setNewReflection(e.target.value)}
                  placeholder={`What made you feel ${sentiment.toLowerCase()}?`}
                  className="w-full px-2 py-1 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none h-8"
                  rows={1}
                  required
                />
                <div className="flex justify-between items-center">
                  <div className="flex space-x-1">
                    <button
                      type="submit"
                      className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                      title="Add Item"
                    >
                      + Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDialogOpen(false)}
                      className="px-2 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      title="Cancel"
                    >
                      X
                    </button>
                  </div>
                  <IconButton
                    aria-label="attach-gif"
                    onClick={handleClick}
                    size="small"
                    sx={{
                      color: "white",
                      backgroundColor: "gray",
                      "&:hover": {
                        backgroundColor: "darkgray",
                      },
                    }}
                  >
                    <AttachFileIcon />
                  </IconButton>
                </div>
                <Popover
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  PaperProps={{
                    style: {
                      maxHeight: "400px",
                      maxWidth: "300px",
                      overflowY: "auto",
                      backgroundColor: "#1f1f1f",
                      color: "#fff",
                    },
                  }}
                >
                  <GifPicker
                    onGifSelect={(gif) => {
                      setSelectedGif(gif);
                      handleClose();
                    }}
                  />
                </Popover>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReflectColumn;
