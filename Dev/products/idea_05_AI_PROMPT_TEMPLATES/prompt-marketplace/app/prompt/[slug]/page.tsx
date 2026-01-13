
import { PurchaseCard } from '@/components/purchase/PurchaseCard';
import { MOCK_PROMPTS } from '@/lib/mockData';
import { ArrowLeft, CheckCircle2, Lock, Zap } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function PromptDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const { dev } = await searchParams;
  const isDevMode = dev === 'true';

  const prompt = MOCK_PROMPTS.find((p) => p.slug === slug);

  if (!prompt) {
    notFound();
  }

  const categoryColor = {
    Marketing: 'bg-blue-100 text-blue-800',
    'Content Creation': 'bg-purple-100 text-purple-800',
    'Code & Development': 'bg-slate-100 text-slate-800',
    'Business Operations': 'bg-green-100 text-green-800',
    'Creative Writing': 'bg-pink-100 text-pink-800',
  }[prompt.category] || 'bg-gray-100 text-gray-800';

  return (
    <div className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center">
            <Link href="/library" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400">
                <ArrowLeft className="h-4 w-4" /> Back to Library
            </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-12 lg:grid-cols-3">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Header */}
            <div>
               <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${categoryColor} mb-4`}>
                  {prompt.category}
               </span>
               <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                 {prompt.title}
               </h1>
            </div>

            {/* Description */}
            <div className="prose prose-slate max-w-none dark:prose-invert">
                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                    {prompt.description}
                </p>
            </div>

            {/* Why This Prompt? / Use Cases */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                    <Zap className="h-5 w-5 text-indigo-500" />
                    Perfect For
                </h3>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {prompt.use_cases?.map((useCase, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500 flex-shrink-0" />
                            <span className="text-slate-600 dark:text-slate-300">{useCase}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Full Prompt Preview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        Prompt Preview
                    </h3>
                    {isDevMode && (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            DEV MODE
                        </span>
                    )}
                </div>

                {isDevMode ? (
                    // Dev Mode: Show full unblurred prompt
                    <div className="rounded-xl bg-slate-50 p-6 dark:bg-slate-950">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 dark:text-slate-300">
                            {prompt.full_text}
                        </pre>
                    </div>
                ) : (
                    // Production: Show blurred locked preview
                    <div className="relative overflow-hidden rounded-xl bg-slate-50 p-6 dark:bg-slate-950">
                        <div className="font-mono text-sm text-slate-400 blur-sm select-none">
                            Act as a professional... [BLURRED CONTENT] ... generate high-end results.
                            {prompt.full_text.slice(0, 100)}...
                            [LOCKED CONTENT]
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-[2px] dark:bg-slate-950/50">
                            <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
                                <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-700">
                                    <Lock className="h-6 w-6 text-slate-500" />
                                </div>
                                <p className="font-semibold text-slate-900 dark:text-white">Purchase to unlock full prompt</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Example Output */}
            {prompt.example_output && (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">
                        Example Output
                    </h3>
                    <div className="prose prose-base max-w-none rounded-xl bg-slate-50 p-6 dark:bg-slate-950 dark:prose-invert">
                        <pre className="whitespace-pre-wrap font-sans text-slate-600 dark:text-slate-400">
                            {prompt.example_output}
                        </pre>
                    </div>
                </div>
            )}
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-1">
             <PurchaseCard prompt={prompt} />
          </div>

        </div>
      </main>
    </div>
  );
}
