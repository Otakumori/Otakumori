
import { generateSEO } from '@/app/lib/seo';
import { env } from '@/env.mjs';

export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/test',
  });
}
export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>
        <span role="img" aria-label="Test tube"></span>
        {
          <>
            ''' '
            <span role="img" aria-label="emoji">
              T
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            <span role="img" aria-label="emoji">
              t
            </span>
            ' '
            <span role="img" aria-label="emoji">
              P
            </span>
            <span role="img" aria-label="emoji">
              a
            </span>
            <span role="img" aria-label="emoji">
              g
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
          </>
        }
      </h1>
      <p>
        {
          <>
            <span role="img" aria-label="emoji">
              I
            </span>
            <span role="img" aria-label="emoji">
              f
            </span>
            ' '
            <span role="img" aria-label="emoji">
              y
            </span>
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              u
            </span>
            ' '
            <span role="img" aria-label="emoji">
              c
            </span>
            <span role="img" aria-label="emoji">
              a
            </span>
            <span role="img" aria-label="emoji">
              n
            </span>
            ' '
            <span role="img" aria-label="emoji">
              s
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            ' '
            <span role="img" aria-label="emoji">
              t
            </span>
            <span role="img" aria-label="emoji">
              h
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            ,' '
            <span role="img" aria-label="emoji">
              N
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              x
            </span>
            <span role="img" aria-label="emoji">
              t
            </span>
            .
            <span role="img" aria-label="emoji">
              j
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            ' '
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            ' '
            <span role="img" aria-label="emoji">
              w
            </span>
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              r
            </span>
            <span role="img" aria-label="emoji">
              k
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              n
            </span>
            <span role="img" aria-label="emoji">
              g
            </span>
            !
          </>
        }
      </p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>
          {
            <>
              <span role="img" aria-label="emoji">
                E
              </span>
              <span role="img" aria-label="emoji">
                n
              </span>
              <span role="img" aria-label="emoji">
                v
              </span>
              <span role="img" aria-label="emoji">
                i
              </span>
              <span role="img" aria-label="emoji">
                r
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              <span role="img" aria-label="emoji">
                n
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
              ' '
              <span role="img" aria-label="emoji">
                C
              </span>
              <span role="img" aria-label="emoji">
                h
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                c
              </span>
              <span role="img" aria-label="emoji">
                k
              </span>
              <span role="img" aria-label="emoji">
                :
              </span>
            </>
          }
        </h2>
        <p>
          {
            <>
              <span role="img" aria-label="emoji">
                N
              </span>
              <span role="img" aria-label="emoji">
                E
              </span>
              <span role="img" aria-label="emoji">
                X
              </span>
              <span role="img" aria-label="emoji">
                T
              </span>
              <span role="img" aria-label="emoji">
                _
              </span>
              <span role="img" aria-label="emoji">
                P
              </span>
              <span role="img" aria-label="emoji">
                U
              </span>
              <span role="img" aria-label="emoji">
                B
              </span>
              <span role="img" aria-label="emoji">
                L
              </span>
              <span role="img" aria-label="emoji">
                I
              </span>
              <span role="img" aria-label="emoji">
                C
              </span>
              <span role="img" aria-label="emoji">
                _
              </span>
              <span role="img" aria-label="emoji">
                S
              </span>
              <span role="img" aria-label="emoji">
                I
              </span>
              <span role="img" aria-label="emoji">
                T
              </span>
              <span role="img" aria-label="emoji">
                E
              </span>
              <span role="img" aria-label="emoji">
                _
              </span>
              <span role="img" aria-label="emoji">
                U
              </span>
              <span role="img" aria-label="emoji">
                R
              </span>
              <span role="img" aria-label="emoji">
                L
              </span>
              <span role="img" aria-label="emoji">
                :
              </span>
              ' '''
            </>
          }
          {env.NEXT_PUBLIC_SITE_URL || 'NOT SET'}
        </p>
        <p>
          {
            <>
              <span role="img" aria-label="emoji">
                N
              </span>
              <span role="img" aria-label="emoji">
                O
              </span>
              <span role="img" aria-label="emoji">
                D
              </span>
              <span role="img" aria-label="emoji">
                E
              </span>
              <span role="img" aria-label="emoji">
                _
              </span>
              <span role="img" aria-label="emoji">
                E
              </span>
              <span role="img" aria-label="emoji">
                N
              </span>
              <span role="img" aria-label="emoji">
                V
              </span>
              <span role="img" aria-label="emoji">
                :
              </span>
              ' '''
            </>
          }
          {env.NODE_ENV || 'NOT SET'}
        </p>
      </div>
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
          {
            <>
              '' ←' '
              <span role="img" aria-label="emoji">
                B
              </span>
              <span role="img" aria-label="emoji">
                a
              </span>
              <span role="img" aria-label="emoji">
                c
              </span>
              <span role="img" aria-label="emoji">
                k
              </span>
              ' '
              <span role="img" aria-label="emoji">
                t
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              ' '
              <span role="img" aria-label="emoji">
                H
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              <span role="img" aria-label="emoji">
                m
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                p
              </span>
              <span role="img" aria-label="emoji">
                a
              </span>
              <span role="img" aria-label="emoji">
                g
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              ''
            </>
          }
        </a>
      </div>
    </div>
  );
}
