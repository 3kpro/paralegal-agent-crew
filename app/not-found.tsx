import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-4">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
          Return Home
        </Link>
      </div>
    </div>
  );
}
