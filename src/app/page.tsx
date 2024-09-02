"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Home() {
  const [retrospectives, setRetrospectives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("retrospectives")
        .select("id, title");
      if (error) {
        console.error("Error fetching retrospectives:", error);
      } else {
        setRetrospectives(data || []);
      }
      setIsLoading(false);
    };

    checkUser();
  }, [supabase, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4  h-screen">
      <h1 className="text-4xl font-bold mb-8">Welcome to Retro Board</h1>
      <div className="space-y-4">
        <Link href="/new-retrospective" className="block text-blue-500">
          Create New Retrospective
        </Link>
        <h2 className="text-2xl font-bold mt-8">Past Retrospectives</h2>
        <ul className="space-y-2">
          {retrospectives.map((retro) => (
            <li key={retro.id}>
              <Link
                href={`/retrospective?id=${retro.id}`}
                className="text-blue-500"
              >
                {retro.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
