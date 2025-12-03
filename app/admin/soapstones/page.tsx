
import { generateSEO } from '@/app/lib/seo';
import { isAdmin } from '@/app/lib/authz';
import AdminSoapstones from './ui';

export function generateMetadata() {
  return generateSEO({
    title: 'Soapstones',
    description: 'Leave signs for fellow travelers',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\admin\soapstones\page.tsx',
  });
}
export default async function AdminSoapstonesPage() {
  if (!(await isAdmin()))
    return (
      <div className="p-6">
        {
          <>
            <span role="img" aria-label="emoji">
              A
            </span>
            <span role="img" aria-label="emoji">
              c
            </span>
            <span role="img" aria-label="emoji">
              c
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            <span role="img" aria-label="emoji">
              s
            </span>
            ' '
            <span role="img" aria-label="emoji">
              d
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              n
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              d
            </span>
            .' '
            <span role="img" aria-label="emoji">
              A
            </span>
            <span role="img" aria-label="emoji">
              d
            </span>
            <span role="img" aria-label="emoji">
              m
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              n
            </span>
            ' '
            <span role="img" aria-label="emoji">
              r
            </span>
            <span role="img" aria-label="emoji">
              o
            </span>
            <span role="img" aria-label="emoji">
              l
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            ' '
            <span role="img" aria-label="emoji">
              r
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              q
            </span>
            <span role="img" aria-label="emoji">
              u
            </span>
            <span role="img" aria-label="emoji">
              i
            </span>
            <span role="img" aria-label="emoji">
              r
            </span>
            <span role="img" aria-label="emoji">
              e
            </span>
            <span role="img" aria-label="emoji">
              d
            </span>
            .
          </>
        }
      </div>
    );
  return <AdminSoapstones />;
}
