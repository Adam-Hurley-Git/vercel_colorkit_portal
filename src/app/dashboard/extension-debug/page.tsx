'use client';

import { useState } from 'react';

interface TestResult {
  success: boolean;
  message?: string;
  error?: string;
  results?: {
    customerId: string;
    userEmail: string;
    tokensFound: number;
    sent: number;
    failed: number;
    details: Array<{
      token: string;
      success: boolean;
      messageId?: string;
      error?: string;
      created_at: string;
      last_used_at: string | null;
    }>;
  };
}

export default function ExtensionDebugPage() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const testFCM = async () => {
    setTesting(true);
    setResult(null);

    try {
      const response = await fetch('/api/extension/test-fcm');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 lg:gap-8 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Extension Debug Tools</h1>
          <p className="text-slate-600 mt-1">Test and verify your extension configuration</p>
        </div>
      </div>

      {/* FCM Test Section */}
      <div className="card card-elevated">
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-semibold text-slate-900">FCM Push Notifications</h2>
              <p className="text-sm text-slate-600 mt-1">Test Firebase Cloud Messaging setup</p>
            </div>
            <button onClick={testFCM} disabled={testing} className="btn btn-primary">
              {testing ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Testing...
                </>
              ) : (
                'Send Test Push'
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 text-sm mb-2">How to test:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Make sure your Chrome extension is installed</li>
              <li>Open Google Calendar in another tab</li>
              <li>Click &quot;Send Test Push&quot; above</li>
              <li>
                Check the extension background console (
                <code className="bg-blue-100 px-1 rounded">chrome://extensions</code> → Details → Service Worker →
                Inspect)
              </li>
              <li>Look for &quot;FCM push received&quot; message in console</li>
            </ol>
          </div>

          {/* Results */}
          {result && (
            <div
              className={`border rounded-lg p-4 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                    {result.success ? 'Success!' : 'Error'}
                  </h3>
                  <p className={`text-sm mt-1 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.message || result.error}
                  </p>

                  {result.results && (
                    <div className="mt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-white rounded p-2 border border-green-200">
                          <div className="text-xs text-slate-600">Customer ID</div>
                          <div className="font-mono text-xs text-slate-900 truncate">{result.results.customerId}</div>
                        </div>
                        <div className="bg-white rounded p-2 border border-green-200">
                          <div className="text-xs text-slate-600">Email</div>
                          <div className="font-mono text-xs text-slate-900 truncate">{result.results.userEmail}</div>
                        </div>
                        <div className="bg-white rounded p-2 border border-green-200">
                          <div className="text-xs text-slate-600">Tokens Found</div>
                          <div className="font-semibold text-green-600">{result.results.tokensFound}</div>
                        </div>
                        <div className="bg-white rounded p-2 border border-green-200">
                          <div className="text-xs text-slate-600">Sent / Failed</div>
                          <div className="font-semibold text-green-600">
                            {result.results.sent} / {result.results.failed}
                          </div>
                        </div>
                      </div>

                      {result.results.details && result.results.details.length > 0 && (
                        <div className="bg-white rounded border border-green-200 p-3">
                          <h4 className="text-xs font-semibold text-slate-900 mb-2">Token Details:</h4>
                          <div className="space-y-2">
                            {result.results.details.map((detail, idx) => (
                              <div key={idx} className="text-xs border-b border-slate-200 pb-2 last:border-0">
                                <div className="flex items-center justify-between mb-1">
                                  <code className="text-xs font-mono bg-slate-100 px-1 rounded">{detail.token}</code>
                                  {detail.success ? (
                                    <span className="text-green-600 font-semibold">✓ Sent</span>
                                  ) : (
                                    <span className="text-red-600 font-semibold">✗ Failed</span>
                                  )}
                                </div>
                                {detail.messageId && (
                                  <div className="text-slate-600">Message ID: {detail.messageId}</div>
                                )}
                                {detail.error && <div className="text-red-600">Error: {detail.error}</div>}
                                <div className="text-slate-500 mt-1">
                                  Created: {new Date(detail.created_at).toLocaleString()}
                                </div>
                                {detail.last_used_at && (
                                  <div className="text-slate-500">
                                    Last used: {new Date(detail.last_used_at).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Check */}
      <div className="card card-elevated">
        <div className="card-body space-y-4">
          <h2 className="text-xl font-display font-semibold text-slate-900">Configuration Checklist</h2>

          <div className="space-y-2">
            <div className="flex items-start gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <div className="font-medium text-slate-900">Extension Installed</div>
                <div className="text-slate-600">
                  Install the Chrome extension and open Google Calendar. The extension should appear in your browser.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <div className="font-medium text-slate-900">FCM Configuration</div>
                <div className="text-slate-600">
                  Ensure <code className="bg-slate-100 px-1 rounded">FIREBASE_PROJECT_ID</code>,{' '}
                  <code className="bg-slate-100 px-1 rounded">FIREBASE_CLIENT_EMAIL</code>, and{' '}
                  <code className="bg-slate-100 px-1 rounded">FIREBASE_PRIVATE_KEY</code> are set in your environment
                  variables.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <div className="font-medium text-slate-900">Extension Configuration</div>
                <div className="text-slate-600">
                  Check <code className="bg-slate-100 px-1 rounded">config.production.js</code> in your extension has
                  the correct <code className="bg-slate-100 px-1 rounded">FCM_SENDER_ID</code>.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                4
              </div>
              <div>
                <div className="font-medium text-slate-900">Database Table</div>
                <div className="text-slate-600">
                  Ensure the <code className="bg-slate-100 px-1 rounded">fcm_tokens</code> table exists in your Supabase
                  database.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
