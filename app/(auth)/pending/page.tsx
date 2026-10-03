export default function PendingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg max-w-lg w-full shadow-sm border border-gray-200">
        <svg className="w-16 h-16 text-orange-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-2xl font-bold mb-4">Account Pending Approval</h1>
        <p className="mb-6 text-lg text-gray-600">
          Your account is pending Admin approval. Your LMS role and access will be activated after Admin review.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <form action="/auth/signout" method="POST">
            <button type="submit" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded transition-colors">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
