import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { referenceApi } from '../api/reference';
import SkeletonTextPage from '../components/SkeletonTextPage';

export default function ReferencePage() {
  const { pageKey } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['reference', pageKey],
    queryFn: () => referenceApi.getByPageKey(pageKey),
    staleTime: 5 * 60_000,
  });

  return (
    <div id={`page-${pageKey}`} className="page active">
      {isLoading && (
        <div className="mt-6">
          <SkeletonTextPage />
        </div>
      )}
      {isError && <div className="error-state">Couldn't load this page. Please try again.</div>}

      {data && (
        <>
          <div className="section-header">
            <div>
              <div className="section-title">
                {data.icon} {data.title}
              </div>
              {data.description && <div className="section-desc">{data.description}</div>}
            </div>
          </div>

          {/* bodyHtml is original, hand-authored markup from the static app (extracted
              verbatim via migration-tools/extract_reference.py) — rendered as-is so the
              .ref-item/.story-card/.gap-item/.plan-day/.sql-block styles in index.css
              apply exactly as they did in the static version. Admins edit this field as
              a single HTML blob from the admin dashboard rather than per-field forms. */}
          <div dangerouslySetInnerHTML={{ __html: data.bodyHtml }} />
        </>
      )}
    </div>
  );
}
