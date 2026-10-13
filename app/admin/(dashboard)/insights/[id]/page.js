import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArticleForm from '@/components/admin/ArticleForm';
import { getArticleByIdAdmin } from '@/lib/insights';

export const dynamic = 'force-dynamic';

export default async function EditInsightsArticlePage({ params }) {
  params = await params;
  const article = await getArticleByIdAdmin(params.id);
  if (!article) notFound();

  return (
    <div>
      <Link href="/admin/insights" className="text-xs text-brandblue font-semibold">← Back to Insights</Link>
      <h1 className="text-2xl font-bold text-navy mt-2 mb-6">Edit article</h1>
      <ArticleForm articleId={article.id} initial={article} />
    </div>
  );
}
