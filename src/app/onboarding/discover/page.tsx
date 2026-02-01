'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Palette, Clock, ArrowRight, ArrowLeft, Crown, Check, Sparkles } from 'lucide-react';

export default function DiscoverPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const features = [
    {
      id: 'dayColoring',
      title: 'Day Coloring',
      subtitle: 'Make your calendar instantly scannable',
      gradient: 'from-blue-500 to-purple-500',
      icon: <Calendar className="w-8 h-8" />,
      freeFeatures: ['Color each weekday with a unique tint', 'Customize colors and opacity', 'See your week at a glance'],
      proFeatures: ['Color specific dates (holidays, deadlines)', 'Highlight important events', 'Date-based visual reminders'],
      demoFree: (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-green-600 text-center uppercase tracking-wide mb-3">Free: Weekly Colors</p>
          <div className="flex gap-2 justify-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => {
              const colors = ['bg-blue-200 border-blue-400', 'bg-purple-200 border-purple-400', 'bg-pink-200 border-pink-400', 'bg-green-200 border-green-400', 'bg-amber-200 border-amber-400'];
              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-slate-600">{day}</span>
                  <div className={`w-10 h-20 ${colors[i]} rounded border-2 shadow-sm`}></div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 text-center mt-2">Every week repeats these colors</p>
        </div>
      ),
      demoPro: (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-purple-600 text-center uppercase tracking-wide mb-3">Pro: Date-Specific Colors</p>
          <div className="flex gap-2 justify-center">
            {[
              { day: '14', label: "Valentine's", color: 'bg-red-300 border-red-500' },
              { day: '17', label: 'Deadline', color: 'bg-orange-300 border-orange-500' },
              { day: '25', label: 'Payday', color: 'bg-green-300 border-green-500' },
            ].map((item) => (
              <div key={item.day} className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-slate-600">{item.day}</span>
                <div className={`w-14 h-20 ${item.color} rounded border-2 shadow-md flex items-end justify-center pb-1`}>
                  <span className="text-[10px] font-semibold text-slate-700">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 text-center mt-2">Highlight specific dates that matter</p>
        </div>
      ),
    },
    {
      id: 'eventColoring',
      title: 'Event Styling',
      subtitle: 'Customize how your events look',
      gradient: 'from-red-500 to-orange-500',
      icon: <Palette className="w-8 h-8" />,
      freeFeatures: ['Custom background color for events', 'Unlimited color choices', 'Quick color picker on any event'],
      proFeatures: ['Custom text colors for readability', 'Colored borders to stand out', 'Save templates for quick styling', 'Calendar-wide default colors'],
      demoFree: (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-green-600 text-center uppercase tracking-wide mb-3">Free: Background Colors</p>
          <div className="space-y-2 max-w-[280px] mx-auto">
            {[
              { name: 'Team Standup', bg: 'bg-blue-100', border: 'border-l-blue-500' },
              { name: 'Client Call', bg: 'bg-green-100', border: 'border-l-green-500' },
              { name: 'Deep Work', bg: 'bg-purple-100', border: 'border-l-purple-500' },
            ].map((event) => (
              <div key={event.name} className={`${event.bg} ${event.border} border-l-4 rounded px-3 py-2 shadow-sm`}>
                <span className="text-sm font-medium text-slate-700">{event.name}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 text-center mt-2">Pick any background color you want</p>
        </div>
      ),
      demoPro: (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-purple-600 text-center uppercase tracking-wide mb-3">Pro: Full Styling Control</p>
          <div className="space-y-2 max-w-[280px] mx-auto">
            {[
              { name: 'URGENT: Ship Feature', bg: 'bg-red-500', text: 'text-white', border: 'border-2 border-red-700' },
              { name: 'VIP Client Meeting', bg: 'bg-amber-400', text: 'text-amber-900', border: 'border-2 border-amber-600' },
              { name: 'Focus Time', bg: 'bg-indigo-600', text: 'text-indigo-100', border: 'border-2 border-indigo-400' },
            ].map((event) => (
              <div key={event.name} className={`${event.bg} ${event.text} ${event.border} rounded px-3 py-2 shadow-md`}>
                <span className="text-sm font-bold">{event.name}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 text-center mt-2">Text color + borders + templates</p>
        </div>
      ),
    },
    {
      id: 'timeBlocking',
      title: 'Time Blocking',
      subtitle: 'Protect your focus time visually',
      gradient: 'from-green-500 to-teal-500',
      icon: <Clock className="w-8 h-8" />,
      freeFeatures: ['Weekly recurring time blocks', 'Custom labels and colors', 'Visual overlays without fake events'],
      proFeatures: ['Date-specific time blocks', 'Override weekly schedule for special days', 'Holiday and vacation exceptions'],
      demoFree: (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-green-600 text-center uppercase tracking-wide mb-3">Free: Weekly Schedule</p>
          <div className="grid grid-cols-5 gap-1 max-w-[300px] mx-auto">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
              <div key={day} className="text-center">
                <span className="text-xs font-bold text-slate-500">{day}</span>
                <div className="mt-1 space-y-1">
                  <div className="h-6 bg-purple-200 rounded text-[9px] font-semibold text-purple-700 flex items-center justify-center border border-purple-300">
                    Focus
                  </div>
                  <div className="h-4 bg-slate-100 rounded"></div>
                  <div className="h-6 bg-teal-200 rounded text-[9px] font-semibold text-teal-700 flex items-center justify-center border border-teal-300">
                    Admin
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 text-center mt-2">Same blocks repeat every week</p>
        </div>
      ),
      demoPro: (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-purple-600 text-center uppercase tracking-wide mb-3">Pro: Date-Specific Blocks</p>
          <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
            {[
              { day: 'Dec 24', blocks: [{ label: 'Half Day', color: 'bg-amber-200 text-amber-700 border-amber-300' }] },
              { day: 'Dec 25', blocks: [{ label: 'Holiday', color: 'bg-red-200 text-red-700 border-red-300' }] },
              { day: 'Jan 2', blocks: [{ label: 'Planning', color: 'bg-blue-200 text-blue-700 border-blue-300' }] },
            ].map((item) => (
              <div key={item.day} className="text-center">
                <span className="text-xs font-bold text-slate-600">{item.day}</span>
                <div className="mt-1 space-y-1">
                  {item.blocks.map((block, i) => (
                    <div key={i} className={`h-12 ${block.color} rounded text-[10px] font-semibold flex items-center justify-center border shadow-sm`}>
                      {block.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 text-center mt-2">Override schedule for specific dates</p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/onboarding/complete');
    }
  };

  const currentFeature = features[currentStep];
  const progress = ((currentStep + 1) / features.length) * 34 + 33; // 33-67%

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="container mx-auto px-4 min-h-screen flex flex-col justify-center py-8">
        <div className="max-w-5xl mx-auto w-full">
          {/* Back Button */}
          <button
            onClick={() => currentStep === 0 ? router.push('/onboarding') : setCurrentStep(currentStep - 1)}
            className="mb-3 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Feature Card */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-in-up">
            <div className={`absolute inset-0 bg-gradient-to-br ${currentFeature.gradient} opacity-5`}></div>

            <div className="relative px-6 py-6 sm:px-8 sm:py-8">
              {/* Header */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${currentFeature.gradient} rounded-2xl mb-4 shadow-xl`}>
                  <div className="text-white scale-75">{currentFeature.icon}</div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-2">{currentFeature.title}</h1>
                <p className="text-lg text-slate-600">{currentFeature.subtitle}</p>
              </div>

              {/* FREE vs PRO Comparison */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Free Column */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-display font-bold text-green-800 text-lg">Free</h3>
                    <span className="ml-auto text-xs font-semibold bg-green-500 text-white px-2 py-0.5 rounded-full">INCLUDED</span>
                  </div>

                  {/* Free Demo */}
                  <div className="bg-white rounded-lg p-4 mb-4 min-h-[180px] flex items-center justify-center border border-green-200">
                    {currentFeature.demoFree}
                  </div>

                  {/* Free Features List */}
                  <ul className="space-y-2">
                    {currentFeature.freeFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro Column */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border-2 border-purple-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 opacity-10 rounded-bl-full"></div>

                  <div className="flex items-center gap-2 mb-4 relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-display font-bold text-purple-800 text-lg">Pro</h3>
                    <span className="ml-auto text-xs font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      UPGRADE
                    </span>
                  </div>

                  {/* Pro Demo */}
                  <div className="bg-white rounded-lg p-4 mb-4 min-h-[180px] flex items-center justify-center border border-purple-200 relative">
                    {currentFeature.demoPro}
                  </div>

                  {/* Pro Features List */}
                  <ul className="space-y-2">
                    {currentFeature.proFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-purple-800">
                        <Crown className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-blue-500'
                        : index < currentStep
                          ? 'w-2 bg-blue-300'
                          : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  ></button>
                ))}
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <button onClick={handleNext} className="btn btn-primary btn-lg group shadow-xl hover:shadow-2xl">
                  {currentStep < features.length - 1 ? 'Next Feature' : 'Get Started'}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Skip Option */}
          <div className="text-center mt-4">
            <button
              onClick={() => router.push('/onboarding/complete')}
              className="text-slate-500 hover:text-slate-700 text-sm transition-colors"
            >
              Skip to setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
