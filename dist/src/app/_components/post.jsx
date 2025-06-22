'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.LatestPost = LatestPost;
const react_1 = require('react');
const react_2 = require('~/trpc/react');
function LatestPost() {
  const [latestPost] = react_2.api.post.getLatest.useSuspenseQuery();
  const utils = react_2.api.useUtils();
  const [name, setName] = (0, react_1.useState)('');
  const createPost = react_2.api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName('');
    },
  });
  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <form
        onSubmit={e => {
          e.preventDefault();
          createPost.mutate({ name });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
