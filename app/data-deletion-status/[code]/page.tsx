export default function DataDeletionStatus({
  params,
}: {
  params: { code: string };
}) {
  return (
    <div className="min-h-screen bg-tron-darker py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-tron-text mb-8">
          Data Deletion Request
        </h1>

        <div className="bg-tron-dark p-6 rounded-lg border border-tron-cyan/20">
          <p className="text-tron-text-muted mb-4">
            Your data deletion request has been received and is being processed.
          </p>

          <div className="bg-tron-darker p-4 rounded mb-4">
            <p className="text-sm text-tron-text-muted">Confirmation Code:</p>
            <p className="text-tron-cyan font-mono">{params.code}</p>
          </div>

          <div className="space-y-2 text-sm text-tron-text-muted">
            <p>
              <strong className="text-tron-text">What happens next:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Your social media account connections will be removed</li>
              <li>Your access tokens will be deleted</li>
              <li>Your campaign data will be anonymized or deleted</li>
              <li>This process may take up to 30 days to complete</li>
            </ul>
          </div>

          <p className="text-sm text-tron-text-muted mt-6">
            If you have questions, contact us at{" "}
            <a
              href="mailto:support@getxelora.com"
              className="text-tron-cyan hover:underline"
            >
              support@getxelora.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
