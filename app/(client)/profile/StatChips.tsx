'use client';
import useSWR from 'swr';

export default function StatChips() {
  const { data } = useSWR('/api/profile/me', (u) => fetch(u).then((r) => r.json()));
  return (
    <div className="chips">
      <div className="chip">
        {
          <>
            ''
            <span role="img" aria-label="emoji">
              P
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              t
            </span>
            <span role="img" aria-label="emoji">
              a
            </span>
            <span role="img" aria-label="emoji">
              l
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            ' '''
          </>
        }
        <b>{data?.balances?.petals ?? 0}</b>
      </div>
      <div className="chip">
        {
          <>
            ''
            <span role="img" aria-label="emoji">
              R
            </span>
            <span role="img" aria-label="emoji">
              u
            </span>
            <span role="img" aria-label="emoji">
              n
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            ' '''
          </>
        }
        <b>{data?.balances?.runes ?? 0}</b>
      </div>
      <div className="chip">
        {
          <>
            ''
            <span role="img" aria-label="emoji">
              P
            </span>
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            <span role="img" aria-label="emoji">
              t
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            ' '''
          </>
        }
        <b>{data?.posts?.length ?? 0}</b>
      </div>
      <div className="chip">
        {
          <>
            ''
            <span role="img" aria-label="emoji">
              A
            </span>
            <span role="img" aria-label="emoji">
              c
            </span>
            <span role="img" aria-label="emoji">
              h
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              v
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              m
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              n
            </span>
            <span role="img" aria-label="emoji">
              t
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            ' '''
          </>
        }
        <b>{data?.achievements?.length ?? 0}</b>
      </div>
    </div>
  );
}
