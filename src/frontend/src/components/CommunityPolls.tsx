import { useState } from "react";
import { toast } from "sonner";
import { type Poll, loadPolls, loadVotes, saveVotes } from "../data/pollsData";

interface Props {
  currentUserId: string;
}

export function CommunityPolls({ currentUserId }: Props) {
  const [polls, setPolls] = useState<Poll[]>(() =>
    loadPolls().filter((p) => !p.closed),
  );
  const [votes, setVotes] = useState(loadVotes);

  function castVote(pollId: string, optionIdx: number) {
    if (votes[pollId]?.[currentUserId] !== undefined) {
      toast.error("You have already voted on this poll.");
      return;
    }
    const updatedVotes = {
      ...votes,
      [pollId]: { ...(votes[pollId] || {}), [currentUserId]: optionIdx },
    };
    setVotes(updatedVotes);
    saveVotes(updatedVotes);
    toast.success("Vote cast!");
    setPolls(loadPolls().filter((p) => !p.closed));
  }

  if (polls.length === 0) return null;

  return (
    <div className="mb-5">
      <h3 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">poll</span>
        Community Polls
      </h3>
      <div className="space-y-3">
        {polls.map((poll) => {
          const myVote = votes[poll.id]?.[currentUserId];
          const hasVoted = myVote !== undefined;
          const pollVoters = votes[poll.id] || {};
          const totalVotes = Object.keys(pollVoters).length;
          const optionCounts = poll.options.map(
            (_, i) => Object.values(pollVoters).filter((v) => v === i).length,
          );

          return (
            <div
              key={poll.id}
              className="bg-zinc-900 border border-purple-500/20 rounded-xl p-4"
              data-ocid="explore.poll.card"
            >
              <p className="font-semibold text-white text-sm mb-3">
                {poll.question}
              </p>
              {poll.expiryDate && (
                <p className="text-xs text-zinc-500 mb-2">
                  Closes: {new Date(poll.expiryDate).toLocaleDateString()}
                </p>
              )}
              <div className="space-y-2">
                {poll.options.map((opt, i) => {
                  const count = optionCounts[i];
                  const pct =
                    totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                  const isMyVote = myVote === i;
                  return (
                    <button
                      key={`${poll.id}-opt-${String(i)}`}
                      type="button"
                      disabled={hasVoted}
                      onClick={() => castVote(poll.id, i)}
                      data-ocid="explore.poll.button"
                      className={`w-full text-left rounded-lg overflow-hidden transition-all ${
                        hasVoted
                          ? "cursor-default"
                          : "hover:border-purple-400/60"
                      } border ${
                        isMyVote ? "border-purple-400" : "border-zinc-700"
                      }`}
                    >
                      <div className="relative px-3 py-2">
                        {hasVoted && (
                          <div
                            className={`absolute inset-0 transition-all ${
                              isMyVote ? "bg-purple-500/20" : "bg-zinc-800/60"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        )}
                        <div className="relative flex justify-between items-center">
                          <span className="text-sm text-white">
                            {isMyVote && "✓ "}
                            {opt}
                          </span>
                          {hasVoted && (
                            <span className="text-xs text-zinc-400 font-semibold">
                              {pct}%
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {hasVoted && (
                <p className="text-xs text-zinc-500 mt-2 text-right">
                  {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
