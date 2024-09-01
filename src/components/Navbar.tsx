"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-lg font-bold">
          <Link href="/">Retro Board</Link>
        </div>
        <div className="space-x-4">
          {user ? (
            <>
              <Link href="/profile" className="text-white">
                Profile
              </Link>
              <button onClick={handleLogout} className="text-white">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white">
                Login
              </Link>
              <Link href="/signup" className="text-white">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
