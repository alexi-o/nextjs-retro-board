"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface PollProps {
  retrospectiveId: string;
  step: "reflect" | "group" | "vote" | "discuss";
}

interface PollData {
  id: string;
  question: string;
  options: string[];
}

interface VoteData {
  option: string;
}

const Poll: React.FC<PollProps> = ({ retrospectiveId, step }) => {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votes, setVotes] = useState<VoteData[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data) setUserId(data.user?.id || null);
    };

    const fetchPoll = async () => {
      const { data } = await supabase
        .from("polls")
        .select("*")
        .eq("retrospective_id", retrospectiveId)
        .single();

      if (data) {
        setPoll({ ...data, options: JSON.parse(data.options) });
      }
    };

    const fetchVotes = async () => {
      if (!poll) return;

      const { data: votesData } = await supabase
        .from("votes")
        .select("*")
        .eq("item_id", poll.id)
        .eq("type", "poll");

      setVotes(votesData || []);
    };

    const checkIfVoted = async () => {
      if (!userId || !poll) return;
      const { data } = await supabase
        .from("votes")
        .select("*")
        .eq("item_id", poll.id)
        .eq("user_id", userId)
        .single();

      if (data) {
        setHasVoted(true);
        setSelectedOption(data.option);
      }
    };

    fetchUser();
    fetchPoll().then(() => {
      fetchVotes();
      checkIfVoted();
    });
  }, [retrospectiveId, poll?.id, userId, supabase]);

  const handleVote = async () => {
    if (!userId || !selectedOption || !poll) return;

    const { error } = await supabase.from("votes").insert([
      {
        item_id: poll.id,
        option: selectedOption,
        type: "poll",
        user_id: userId,
      },
    ]);

    if (!error) {
      setHasVoted(true);
      setVotes([...votes, { option: selectedOption }]);
    }
  };

  const handleDeleteVote = async () => {
    if (!userId || !poll) return;

    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("item_id", poll.id)
      .eq("user_id", userId)
      .eq("type", "poll");

    if (!error) {
      setHasVoted(false);
      setSelectedOption(null);
      setVotes(votes.filter((vote) => vote.option !== selectedOption));
    }
  };

  const getVoteCount = (option: string) =>
    votes.filter((vote) => vote.option === option).length;

  if (!poll) return <div>Loading...</div>;

  return (
    <div className="poll-container flex flex-col h-full bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-8 text-gray-900 dark:text-gray-100">
      <h3 className="text-lg font-bold mb-4">{poll.question}</h3>
      <div className="flex-1">
        {step === "reflect" && !hasVoted && (
          <div>
            {poll.options.map((option, index) => (
              <div key={index} className="mb-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="poll"
                    value={option}
                    checked={selectedOption === option}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="form-radio text-blue-500 dark:text-blue-400"
                  />
                  <span className="ml-2">{option}</span>
                </label>
              </div>
            ))}
            <button
              onClick={handleVote}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              Submit Vote
            </button>
          </div>
        )}

        {hasVoted && step === "reflect" && (
          <div>
            <p>Thank you for voting!</p>
            <ul className="mt-4 space-y-2">
              {poll.options.map((option, index) => (
                <li key={index} className="flex justify-between">
                  <span>{option}</span>
                  <span>{getVoteCount(option)} votes</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleDeleteVote}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
            >
              Vote Again
            </button>
          </div>
        )}

        {step !== "reflect" && (
          <div>
            <p>The poll is now closed.</p>
            <ul className="mt-4 space-y-2">
              {poll.options.map((option, index) => (
                <li key={index} className="flex justify-between">
                  <span>{option}</span>
                  <span>{getVoteCount(option)} votes</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Poll;
