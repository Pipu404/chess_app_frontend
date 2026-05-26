"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ChevronLeft, ArrowRight } from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.msg || data.error || "Something went wrong");
      }
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 items-center justify-center font-sans text-zinc-900 px-4">
      {/* Mobile App Container */}
      <div className="w-full max-w-[400px] bg-white min-h-[850px] shadow-2xl rounded-[40px] overflow-hidden flex flex-col relative border-[8px] border-zinc-100">
        
        {/* Header */}
        <div className="flex items-center px-6 pt-10 pb-4">
          <Link href="/login" className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition">
            <ChevronLeft size={24} className="text-zinc-600" />
          </Link>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 px-8 pt-6 pb-10">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-zinc-900">Create <br/>Account</h1>
            <p className="text-zinc-500 font-medium text-sm">Join to play and learn chess</p>
          </div>

          <form className="flex flex-col gap-5 flex-1" onSubmit={handleSubmit}>
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium text-center">{error}</div>}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={20} className="text-zinc-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl pl-11 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-400 font-medium"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={20} className="text-zinc-400" />
                </div>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl pl-11 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-400 font-medium"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-zinc-400" />
                </div>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-2xl pl-11 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-400 font-medium"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <button disabled={loading} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl py-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-zinc-900/20 disabled:opacity-70">
                {loading ? "Signing up..." : "Sign Up"}
                {!loading && <ArrowRight size={18} />}
              </button>
              
              <button type="button" className="w-full bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-semibold rounded-2xl py-4 flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </button>
            </div>
          </form>

          <div className="flex justify-center items-center mt-auto pt-6">
            <p className="text-sm text-zinc-500 font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-zinc-900 font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
