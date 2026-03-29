'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { voiceApi, providerApi, knowledgeApi } from '../lib/api';

type Tab = 'knowledge' | 'voice' | 'provider';

export default function InfluencerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('knowledge');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'knowledge',
      label: 'Knowledge Base',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      key: 'voice',
      label: 'Voice Registration',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
    },
    {
      key: 'provider',
      label: 'Provider Config',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up delay-100">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans font-semibold text-sm whitespace-nowrap transition-all duration-300 cursor-pointer ${
              activeTab === tab.key
                ? 'bg-primary/20 text-primary-light border border-primary/30'
                : 'bg-white/5 text-white/50 border border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'knowledge' && <KnowledgeBaseTab />}
      {activeTab === 'voice' && <VoiceRegistrationTab />}
      {activeTab === 'provider' && <ProviderConfigTab />}
    </div>
  );
}

function KnowledgeBaseTab() {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('Please add some knowledge content');
      return;
    }
    setSaving(true);
    try {
      await knowledgeApi.save({
        influencer_id: 'current',
        content: content.trim(),
        category,
      });
      toast.success('Knowledge saved successfully!');
      setContent('');
    } catch {
      toast.error('Failed to save knowledge entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass border border-white/15 rounded-2xl p-8">
      <h3 className="font-sans font-bold text-xl text-white mb-2">Knowledge Base</h3>
      <p className="text-sm text-white/40 mb-6">
        Add information that your AI voice clone will use to answer questions.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-sans text-sm focus:outline-none focus:border-primary/50 transition-all appearance-none"
          >
            <option value="general">General</option>
            <option value="personal">Personal</option>
            <option value="professional">Professional</option>
            <option value="faq">FAQ</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter knowledge content that your AI will use..."
            rows={6}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 font-sans text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 rounded-xl bg-primary text-white font-sans font-bold text-sm transition-all duration-300 hover:bg-primary-light hover:shadow-[0_0_20px_rgba(97,37,216,0.4)] disabled:opacity-50 btn-primary"
        >
          {saving ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </div>
  );
}

function VoiceRegistrationTab() {
  const [voiceName, setVoiceName] = useState('');
  const [sampleUrl, setSampleUrl] = useState('');
  const [provider, setProvider] = useState('deepgram');
  const [saving, setSaving] = useState(false);

  const handleRegister = async () => {
    if (!voiceName || !sampleUrl) {
      toast.error('Please fill in all fields');
      return;
    }
    setSaving(true);
    try {
      await voiceApi.register({
        name: voiceName,
        voice_sample_url: sampleUrl,
        provider,
      });
      toast.success('Voice registered successfully!');
      setVoiceName('');
      setSampleUrl('');
    } catch {
      toast.error('Failed to register voice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass border border-white/15 rounded-2xl p-8">
      <h3 className="font-sans font-bold text-xl text-white mb-2">Voice Registration</h3>
      <p className="text-sm text-white/40 mb-6">
        Register your voice for AI cloning. Provide a clear audio sample.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Voice Name</label>
          <input
            type="text"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            placeholder="e.g. My Professional Voice"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 font-sans text-sm focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Voice Sample URL</label>
          <input
            type="url"
            value={sampleUrl}
            onChange={(e) => setSampleUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 font-sans text-sm focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-sans text-sm focus:outline-none focus:border-primary/50 transition-all appearance-none"
          >
            <option value="deepgram">Deepgram</option>
            <option value="vapi">Vapi</option>
            <option value="retell">Retell</option>
          </select>
        </div>

        <button
          onClick={handleRegister}
          disabled={saving}
          className="px-8 py-3 rounded-xl bg-primary text-white font-sans font-bold text-sm transition-all duration-300 hover:bg-primary-light hover:shadow-[0_0_20px_rgba(97,37,216,0.4)] disabled:opacity-50 btn-primary"
        >
          {saving ? 'Registering...' : 'Register Voice'}
        </button>
      </div>
    </div>
  );
}

function ProviderConfigTab() {
  const [providerName, setProviderName] = useState('deepgram');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!apiKey) {
      toast.error('Please enter an API key');
      return;
    }
    setSaving(true);
    try {
      await providerApi.save({
        provider: providerName,
        api_key: apiKey,
        config: {},
      });
      toast.success('Provider configuration saved!');
      setApiKey('');
    } catch {
      toast.error('Failed to save provider config');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass border border-white/15 rounded-2xl p-8">
      <h3 className="font-sans font-bold text-xl text-white mb-2">Provider Configuration</h3>
      <p className="text-sm text-white/40 mb-6">
        Configure your voice AI provider settings and API keys.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Provider</label>
          <select
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-sans text-sm focus:outline-none focus:border-primary/50 transition-all appearance-none"
          >
            <option value="deepgram">Deepgram</option>
            <option value="vapi">Vapi</option>
            <option value="retell">Retell</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 font-sans text-sm focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 rounded-xl bg-primary text-white font-sans font-bold text-sm transition-all duration-300 hover:bg-primary-light hover:shadow-[0_0_20px_rgba(97,37,216,0.4)] disabled:opacity-50 btn-primary"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
