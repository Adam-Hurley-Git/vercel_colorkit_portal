'use client';

import { useRouter } from 'next/navigation';
import {
  Calendar,
  MousePointerClick,
  Palette,
  ExternalLink,
  ArrowRight,
  Chrome,
  Settings,
  Clock,
  ListChecks,
  ToggleLeft,
  CheckSquare,
  Lightbulb,
} from 'lucide-react';

export default function HowItWorksPage() {
  const router = useRouter();

  const handleOpenCalendar = () => {
    window.open('https://calendar.google.com', '_blank');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Progress Bar - Complete! */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
          style={{ width: '100%' }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <div className="max-w-5xl mx-auto w-full">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-display font-bold text-slate-900 mb-3">You&apos;re All Set!</h1>
            <p className="text-lg text-slate-600">Here&apos;s how to use ColorKit with Google Calendar</p>
          </div>

          {/* How It Works Steps */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 relative">
                  <Chrome className="w-7 h-7 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                </div>
                <h3 className="font-display font-bold text-slate-900 mb-2">Find the Extension</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Look for the ColorKit icon in your Chrome toolbar (top-right corner, next to the address bar)
                </p>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 italic">
                    💡 If you don&apos;t see it, click the puzzle icon to pin ColorKit
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 relative">
                  <Calendar className="w-7 h-7 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                </div>
                <h3 className="font-display font-bold text-slate-900 mb-2">Open Google Calendar</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Navigate to{' '}
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    calendar.google.com
                  </a>{' '}
                  in your browser
                </p>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium">
                    ✨ The extension only works on Google Calendar pages
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 relative">
                  <MousePointerClick className="w-7 h-7 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                </div>
                <h3 className="font-display font-bold text-slate-900 mb-2">Click the Icon</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Click the ColorKit extension icon to open settings and start customizing your calendar
                </p>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-green-700 font-medium">🎨 Customize colors, tasks & time blocks!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Note: Settings are OFF by default */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 mb-6 border border-amber-200">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-display font-bold text-slate-900 mb-2">Important: Turn On Features First!</h3>
                <p className="text-sm text-slate-700 mb-2">
                  All features are turned <span className="font-bold text-amber-700">OFF by default</span>. You need to
                  enable each feature in the extension settings before using it.
                </p>
                <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-amber-200">
                  <ToggleLeft className="w-5 h-5 text-slate-400" />
                  <span className="text-xs text-slate-600">
                    Click the toggle switches in settings to turn features ON
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 1: Day Coloring */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900">Day Coloring</h3>
                <p className="text-xs text-slate-600">Add background colors to calendar columns</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm font-semibold text-slate-900 mb-2">When to use:</p>
                <ul className="text-xs text-slate-700 space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span>Color-code weekdays vs weekends to quickly see work days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span>Highlight important dates (deadlines, meetings, special events)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span>Make your calendar easier to scan at a glance</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-sm font-semibold text-slate-900 mb-3">How to set it up:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <p className="text-xs text-slate-700">
                      Open Google Calendar, then click the ColorKit extension icon in your toolbar
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <p className="text-xs text-slate-700">Find the &quot;Day Coloring&quot; section and toggle it ON</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <p className="text-xs text-slate-700">
                      Choose colors for each weekday (Monday-Sunday) by clicking the color boxes
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    <p className="text-xs text-slate-700">
                      Optionally, add specific dates with custom colors (holidays, birthdays, etc.)
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      5
                    </span>
                    <p className="text-xs text-slate-700">
                      Your calendar columns will instantly show the background colors you chose!
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual Demo - Before/After */}
              <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-blue-300">
                <div className="flex gap-6 justify-center items-start">
                  {/* Before - Plain gray days */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600 text-center uppercase tracking-wide mb-1">
                      Before
                    </p>
                    <p className="text-xs font-bold text-slate-600 text-center mb-3">All Look the Same</p>
                    <div className="flex gap-2 justify-center min-w-[200px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-slate-500">Mon</span>
                        <div className="w-8 h-24 bg-slate-50 rounded border-2 border-slate-300 shadow-sm"></div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-slate-500">Tue</span>
                        <div className="w-8 h-24 bg-slate-50 rounded border-2 border-slate-300 shadow-sm"></div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-slate-500">Wed</span>
                        <div className="w-8 h-24 bg-slate-50 rounded border-2 border-slate-300 shadow-sm"></div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-slate-500">Thu</span>
                        <div className="w-8 h-24 bg-slate-50 rounded border-2 border-slate-300 shadow-sm"></div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-32 bg-slate-300 self-center"></div>

                  {/* After - Colored days */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-blue-600 text-center uppercase tracking-wide mb-1">
                      After ✨
                    </p>
                    <p className="text-xs font-bold text-green-600 text-center mb-3">Each Day Unique!</p>
                    <div className="flex gap-2 justify-center min-w-[200px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-blue-600">Mon</span>
                        <div className="w-8 h-24 bg-gradient-to-b from-blue-200 to-blue-300 rounded border-2 border-blue-400 shadow-md"></div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-purple-600">Tue</span>
                        <div className="w-8 h-24 bg-gradient-to-b from-purple-200 to-purple-300 rounded border-2 border-purple-400 shadow-md"></div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-pink-600">Wed</span>
                        <div className="w-8 h-24 bg-gradient-to-b from-pink-200 to-pink-300 rounded border-2 border-pink-400 shadow-md"></div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-green-600">Thu</span>
                        <div className="w-8 h-24 bg-gradient-to-b from-green-200 to-green-300 rounded border-2 border-green-400 shadow-md"></div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Benefit Callout */}
                <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg px-4 py-3 text-center">
                  <p className="text-sm font-bold text-blue-900">
                    💙 Give Monday a Mood and Friday a Vibe - scan your week 3x faster!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Task List Coloring */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <ListChecks className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900">Task List Coloring</h3>
                <p className="text-xs text-slate-600">Organize tasks with automatic or manual colors</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm font-semibold text-slate-900 mb-2">When to use:</p>
                <ul className="text-xs text-slate-700 space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 flex-shrink-0">•</span>
                    <span>Visually separate work tasks from personal tasks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 flex-shrink-0">•</span>
                    <span>Color-code tasks by priority or category</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 flex-shrink-0">•</span>
                    <span>Make important tasks stand out in your calendar</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-sm font-semibold text-slate-900 mb-3">Option 1: Auto-Color by Task List</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <p className="text-xs text-slate-700">Open the extension settings on Google Calendar</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <p className="text-xs text-slate-700">
                      Toggle ON &quot;Task List Coloring&quot; and connect your Google Tasks
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <p className="text-xs text-slate-700">
                      Assign a color to each task list (e.g., &quot;Work&quot; = blue, &quot;Personal&quot; = green)
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    <p className="text-xs text-slate-700">
                      All tasks from each list will automatically show with that color!
                    </p>
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-900 mb-3">Option 2: Manually Color Individual Tasks</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <p className="text-xs text-slate-700">
                      In Google Calendar, click on any <span className="font-semibold">already created task</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <p className="text-xs text-slate-700">
                      The task modal will open - look for the color picker added by ColorKit
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <p className="text-xs text-slate-700">
                      Click your preferred color - the task will update with that unique color
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckSquare className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 italic">
                      Note: You must click on an existing task to change its color - new tasks inherit list colors
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual Demo - Before/After */}
              <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-green-300">
                <div className="flex gap-6 justify-center items-start">
                  {/* Before - Standard blue tasks */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600 text-center uppercase tracking-wide mb-1">
                      Google Tasks
                    </p>
                    <p className="text-xs font-bold text-red-600 text-center mb-3">Only 1 Color</p>
                    <div className="space-y-2 min-w-[200px]">
                      <div className="h-8 bg-blue-100 rounded border-l-4 border-blue-500 px-2 flex items-center gap-2 shadow-sm">
                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"
                            opacity="0.3"
                          />
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span className="text-xs text-blue-900">Team Meeting</span>
                      </div>
                      <div className="h-8 bg-blue-100 rounded border-l-4 border-blue-500 px-2 flex items-center gap-2 shadow-sm">
                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"
                            opacity="0.3"
                          />
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span className="text-xs text-blue-900">Review Docs</span>
                      </div>
                      <div className="h-8 bg-blue-100 rounded border-l-4 border-blue-500 px-2 flex items-center gap-2 shadow-sm">
                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"
                            opacity="0.3"
                          />
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span className="text-xs text-blue-900">Send Email</span>
                      </div>
                      <div className="h-8 bg-blue-100 rounded border-l-4 border-blue-500 px-2 flex items-center gap-2 shadow-sm">
                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"
                            opacity="0.3"
                          />
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span className="text-xs text-blue-900">Call Client</span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-32 bg-slate-300 self-center"></div>

                  {/* After - Priority colored tasks */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-blue-600 text-center uppercase tracking-wide mb-1">
                      ColorKit Power
                    </p>
                    <p className="text-xs font-bold text-green-600 text-center mb-3">∞ Unlimited Colors! ✨</p>
                    <div className="space-y-2 min-w-[200px]">
                      <div className="h-8 bg-red-100 rounded border-l-4 border-red-500 px-2 flex items-center gap-2 shadow-md">
                        <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"
                            opacity="0.3"
                          />
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span className="text-xs font-semibold text-red-900">Team Meeting</span>
                      </div>
                      <div className="h-8 bg-amber-100 rounded border-l-4 border-amber-500 px-2 flex items-center gap-2 shadow-md">
                        <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"
                            opacity="0.3"
                          />
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span className="text-xs font-semibold text-amber-900">Review Docs</span>
                      </div>
                      <div className="h-8 bg-green-100 rounded border-l-4 border-green-500 px-2 flex items-center gap-2 shadow-md">
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"
                            opacity="0.3"
                          />
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span className="text-xs font-semibold text-green-900">Send Email</span>
                      </div>
                      <div className="h-8 bg-blue-100 rounded border-l-4 border-blue-500 px-2 flex items-center gap-2 shadow-md">
                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"
                            opacity="0.3"
                          />
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span className="text-xs font-semibold text-blue-900">Call Client</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Benefit Callout */}
                <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg px-4 py-3 text-center">
                  <p className="text-sm font-bold text-green-900">
                    💡 Pick the <span className="underline">perfect color</span> for every task - not stuck with just
                    one color like Google Tasks!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Time Blocking */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-green-200">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900">Time Blocking</h3>
                <p className="text-xs text-slate-600">Visual background blocks for focus periods</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm font-semibold text-slate-900 mb-2">When to use:</p>
                <ul className="text-xs text-slate-700 space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 flex-shrink-0">•</span>
                    <span>Block out focus time for deep work (e.g., 9 AM - 12 PM every weekday)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 flex-shrink-0">•</span>
                    <span>Mark regular break times or lunch hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 flex-shrink-0">•</span>
                    <span>Show recurring activities (gym time, family time, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 flex-shrink-0">•</span>
                    <span>Protect time slots from being accidentally booked</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-sm font-semibold text-slate-900 mb-3">How to set it up:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <p className="text-xs text-slate-700">Open the extension settings on Google Calendar</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <p className="text-xs text-slate-700">Toggle ON &quot;Time Blocking&quot;</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <p className="text-xs text-slate-700">
                      Create a new time block by setting start time, end time, and color
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    <p className="text-xs text-slate-700">
                      Choose when it repeats: Daily, Weekdays only, Weekends only, or specific days
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      5
                    </span>
                    <p className="text-xs text-slate-700">
                      The time block will appear as a colored background behind your events
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-600 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold">Pro tip:</span> Use subtle colors for time blocks so your actual
                    events remain visible and easy to read
                  </span>
                </p>
              </div>

              {/* Visual Demo - Before/After */}
              <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-green-300">
                <div className="flex gap-6 justify-center items-start">
                  {/* Before - Plain calendar grid */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600 text-center uppercase tracking-wide mb-3">
                      Before
                    </p>
                    <div className="space-y-1 min-w-[200px]">
                      <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                        <span className="text-xs text-slate-400 font-mono">8:30 AM</span>
                        <div className="flex-1 h-6 bg-white border border-slate-200 rounded"></div>
                      </div>
                      <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                        <span className="text-xs text-slate-400 font-mono">10:15 AM</span>
                        <div className="flex-1 h-6 bg-white border border-slate-200 rounded"></div>
                      </div>
                      <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                        <span className="text-xs text-slate-400 font-mono">1:00 PM</span>
                        <div className="flex-1 h-6 bg-white border border-slate-200 rounded"></div>
                      </div>
                      <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                        <span className="text-xs text-slate-400 font-mono">3:45 PM</span>
                        <div className="flex-1 h-6 bg-white border border-slate-200 rounded"></div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-36 bg-slate-300 self-center"></div>

                  {/* After - Time blocks with labels */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-green-600 text-center uppercase tracking-wide mb-3">
                      After ✨
                    </p>
                    <div className="space-y-1 min-w-[200px]">
                      <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                        <span className="text-xs text-slate-400 font-mono">8:30 AM</span>
                        <div className="flex-1 h-6 bg-gradient-to-r from-purple-200 to-purple-300 border-2 border-purple-400 rounded px-2 flex items-center shadow-md">
                          <span className="text-xs font-bold text-purple-700">🎯 Deep Work</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                        <span className="text-xs text-slate-400 font-mono">10:15 AM</span>
                        <div className="flex-1 h-6 bg-gradient-to-r from-teal-200 to-teal-300 border-2 border-teal-400 rounded px-2 flex items-center shadow-md">
                          <span className="text-xs font-bold text-teal-700">💬 Meetings</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                        <span className="text-xs text-slate-400 font-mono">1:00 PM</span>
                        <div className="flex-1 h-6 bg-gradient-to-r from-amber-200 to-amber-300 border-2 border-amber-400 rounded px-2 flex items-center shadow-md">
                          <span className="text-xs font-bold text-amber-700">🍽️ Lunch Break</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                        <span className="text-xs text-slate-400 font-mono">3:45 PM</span>
                        <div className="flex-1 h-6 bg-gradient-to-r from-blue-200 to-blue-300 border-2 border-blue-400 rounded px-2 flex items-center shadow-md">
                          <span className="text-xs font-bold text-blue-700">📧 Admin Time</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Benefit Callout */}
                <div className="mt-4 bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-300 rounded-lg px-4 py-3 text-center">
                  <p className="text-sm font-bold text-purple-900">
                    🎯 Protect deep work time without cluttering your calendar with fake events!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleOpenCalendar}
              className="btn btn-primary btn-lg group shadow-xl hover:shadow-2xl px-8 py-3 w-full sm:w-auto"
            >
              <span className="font-semibold">Open Google Calendar</span>
              <ExternalLink className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={handleGoToDashboard} className="btn btn-secondary btn-lg px-8 py-3 w-full sm:w-auto">
              <span className="font-semibold">Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center mt-6">
            <p className="text-sm text-slate-600">
              Need help?{' '}
              <a
                href="https://www.calendarextension.com/help"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                Visit our help center
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
