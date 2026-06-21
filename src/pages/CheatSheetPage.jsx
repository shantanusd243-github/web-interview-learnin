import { useQuery } from '@tanstack/react-query';
import { cheatSheetApi } from '../api/reference';
import SkeletonTextPage from '../components/SkeletonTextPage';
const CATEGORY_ORDER = ['coreJava', 'java8', 'spring', 'micro'];

export default function CheatSheetPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['cheatsheet'],
    queryFn: cheatSheetApi.listGrouped,
    staleTime: 5 * 60_000,
  });

  const categories = data ? Object.entries(data).sort(([a], [b]) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  }) : [];

  return (
    <div id="page-cheat" className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">⚡ Quick Revision Cheat Sheet</div>
          <div className="section-desc">High-density facts for last-minute review.</div>
        </div>
      </div>

      {isLoading && (
        <div className="mt-6">
          <SkeletonTextPage />
        </div>
      )}
      {isError && <div className="error-state">Couldn't load the cheat sheet. Please try again.</div>}

      {categories.map(([key, items]) => (
        <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }} key={key}>
          <div
            style={{
              padding: '14px 16px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {items[0]?.categoryIcon} {items[0]?.categoryLabel || key}
          </div>
          <div>
            {items.map((item) => (
              <div className="cheat-item" key={item.id}>
                <div className="cheat-q">{item.question}</div>
                <div className="cheat-a">{item.answer}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
