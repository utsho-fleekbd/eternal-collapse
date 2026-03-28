import { Rocket, Sparkle } from "lucide-react";
import { useState } from "react";

interface CosmicQuizProps {
  onSuccess: () => void;
}

export default function CosmicQuiz({ onSuccess }: CosmicQuizProps) {
  const [user, setUser] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      user.trim().toLowerCase() === "puja" &&
      author.trim().toLowerCase() === "utsho"
    ) {
      setVisible(false);
      onSuccess();
    } else {
      setError("Oops! Try again, my star.");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl"
        style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
      >
        <h2 className="mb-2 text-center font-display text-4xl font-bold text-primary flex items-center justify-around">
          <Sparkle /> A Cosmic Quiz <Sparkle />
        </h2>
        <p className="mb-6 text-center font-body text-sm text-muted-foreground">
          Answer correctly to unlock the universe's secrets
        </p>

        <div className="mb-5">
          <label className="mb-2 block font-display text-lg text-foreground">
            Who are you, my star?
          </label>
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full rounded-xl border border-border bg-muted px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Type your name..."
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block font-display text-lg text-foreground">
            Who's the most amazing person in the world?
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full rounded-xl border border-border bg-muted px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Who could it be..."
          />
        </div>

        {error && (
          <p className="mb-4 text-center font-body text-sm text-accent">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-primary py-3 font-display text-lg font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-5"
        >
          Unlock the Stars <Rocket />
        </button>
      </form>
    </div>
  );
}
