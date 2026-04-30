'use client';

import { useState } from 'react';
import { Employee } from '@/app/data/employees';

interface BirthdayCardModalProps {
  employee: Employee;
  onClose: () => void;
}

type Stage = 'idle' | 'generating' | 'preview' | 'posting' | 'done' | 'error';

export function BirthdayCardModal({ employee, onClose }: BirthdayCardModalProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cardText, setCardText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  async function handleGenerate() {
    setStage('generating');
    setErrorMsg('');
    try {
      const res = await fetch('/api/birthday-card', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');
      setImageUrl(data.imageUrl);
      setCardText(data.text);
      setStage('preview');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStage('error');
    }
  }

  async function handlePostToSlack() {
    setStage('posting');
    try {
      const res = await fetch('/api/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cardText, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Slack post failed');
      setStage('done');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStage('error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: employee.avatarColor }}
            >
              {employee.initials}
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Birthday Card</h2>
              <p className="text-xs text-gray-400">{employee.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">

          {/* Idle */}
          {stage === 'idle' && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="text-5xl">🎂</div>
              <div>
                <p className="font-semibold text-gray-900">Generate a birthday card for {employee.name}</p>
                <p className="text-sm text-gray-400 mt-1">Gemini will create a personalised image + message, then you can post it to Slack.</p>
              </div>
              <button
                onClick={handleGenerate}
                className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Generate Card
              </button>
            </div>
          )}

          {/* Generating */}
          {stage === 'generating' && (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Generating birthday card with Gemini…</p>
            </div>
          )}

          {/* Preview */}
          {stage === 'preview' && imageUrl && (
            <div className="space-y-4">
              <img
                src={imageUrl}
                alt="Generated birthday card"
                className="w-full rounded-xl border border-gray-100 object-cover"
              />
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {cardText}
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleGenerate}
                  className="flex-1 px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                >
                  Regenerate
                </button>
                <button
                  onClick={handlePostToSlack}
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                  </svg>
                  Post to Slack
                </button>
              </div>
            </div>
          )}

          {/* Posting */}
          {stage === 'posting' && (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Posting to Slack…</p>
            </div>
          )}

          {/* Done */}
          {stage === 'done' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Posted to Slack! 🎉</p>
                <p className="text-sm text-gray-400 mt-1">The birthday card has been sent to #hr</p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Error */}
          {stage === 'error' && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Something went wrong</p>
                <p className="text-sm text-red-500 mt-1">{errorMsg}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStage('idle')}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
