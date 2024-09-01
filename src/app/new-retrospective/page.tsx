"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function NewRetrospective() {
  const [title, setTitle] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const supabase = createClient();
  const router = useRouter();

  const handleAddOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const handleRemoveOption = (index: number) => {
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: retrospectiveData, error: retrospectiveError } =
      await supabase.from("retrospectives").insert([{ title }]).select();

    if (retrospectiveError) {
      console.error("Error creating retrospective:", retrospectiveError);
      return;
    }

    const retrospectiveId = retrospectiveData[0].id;

    const { error: pollError } = await supabase.from("polls").insert([
      {
        retrospective_id: retrospectiveId,
        question: pollQuestion,
        options: JSON.stringify(pollOptions),
      },
    ]);

    if (pollError) {
      console.error("Error creating poll:", pollError);
      return;
    }

    router.push(`/retrospective?id=${retrospectiveId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">Create a New Retrospective</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Retrospective Title"
          className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
          required
        />

        <h2 className="text-xl font-semibold mb-4">Poll</h2>
        <input
          type="text"
          value={pollQuestion}
          onChange={(e) => setPollQuestion(e.target.value)}
          placeholder="Poll Question"
          className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
        />

        {pollOptions.map((option, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            {pollOptions.length > 2 && (
              <button
                type="button"
                onClick={() => handleRemoveOption(index)}
                className="ml-2 px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-700"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddOption}
          className="block px-4 py-2 mb-4 bg-green-500 text-white rounded-lg hover:bg-green-700"
        >
          Add Option
        </button>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
        >
          Create Retrospective
        </button>
      </form>
    </div>
  );
}
