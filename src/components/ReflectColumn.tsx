import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface ReflectColumnProps {
  sentiment: string;
  retrospectiveId: string;
  step: "reflect" | "group" | "vote" | "discuss";
}

interface Reflection {
  id: string;
  content: string;
  user_id: string;
  votes: number;
}

const ReflectColumn: React.FC<ReflectColumnProps> = ({
  sentiment,
  retrospectiveId,
  step,
}) => {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReflection, setNewReflection] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error) setUserId(data.user?.id || null);
    };
    fetchUser();
  }, [supabase]);

  const fetchReflections = async () => {
    const { data, error } = await supabase
      .from("reflections")
      .select("*")
      .eq("retrospective_id", retrospectiveId)
      .eq("sentiment", sentiment);

    if (error) {
      console.error("Error fetching reflections:", error);
    } else {
      setReflections(data);
    }
  };

  useEffect(() => {
    fetchReflections();
  }, [retrospectiveId, sentiment, step]);

  const handleVote = async (reflectionId: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from("votes")
      .insert([{ item_id: reflectionId, type: "reflection", user_id: userId }]);
    if (error) console.error("Error voting:", error);
    fetchReflections();
  };

  const handleAddReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newReflection.trim()) return;

    const { error } = await supabase.from("reflections").insert([
      {
        retrospective_id: retrospectiveId,
        sentiment,
        content: newReflection,
        user_id: userId,
      },
    ]);

    if (error) {
      console.error("Error adding reflection:", error);
    } else {
      setNewReflection("");
      setIsDialogOpen(false);
      fetchReflections();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 dark:text-white">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
        {sentiment}
      </h2>
      <ul className="flex-grow mb-4 space-y-2 overflow-y-auto">
        {reflections.map((reflection) => (
          <li
            key={reflection.id}
            className="bg-gray-100 dark:bg-gray-700 p-2 rounded"
          >
            {step !== "reflect" || reflection.user_id === userId ? (
              <>
                <p>{reflection.content}</p>
                {step === "vote" && (
                  <button
                    onClick={() => handleVote(reflection.id)}
                    className="ml-2 px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                  >
                    Vote ({reflection.votes})
                  </button>
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
            <div className="mt-4 bg-gray-200 dark:bg-gray-700 p-4 rounded-lg">
              <form onSubmit={handleAddReflection}>
                <textarea
                  value={newReflection}
                  onChange={(e) => setNewReflection(e.target.value)}
                  placeholder={`What made you feel ${sentiment.toLowerCase()}?`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  required
                />
                <div className="mt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReflectColumn;
