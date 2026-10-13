import Link from 'next/link';
import ArticleForm from '@/components/admin/ArticleForm';

export default function NewInsightsArticlePage() {
  return (
    <div>
      <Link href="/admin/insights" className="text-xs text-brandblue font-semibold">← Back to Insights</Link>
      <h1 className="text-2xl font-bold text-navy mt-2 mb-6">New article</h1>
      <ArticleForm />
    </div>
  );
}
