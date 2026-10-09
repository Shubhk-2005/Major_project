import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { DocumentVault } from '../components/documents/DocumentVault';
import { SopFeedback } from '../components/documents/SopFeedback';

type Tab = 'vault' | 'sop';

const tabs: {id: Tab;label: string;}[] = [
{ id: 'vault', label: 'Vault' },
{ id: 'sop', label: 'SOP feedback' }];


export function Documents() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'sop' ? 'sop' : 'vault';
  const setTab = (t: Tab) => setParams(t === 'vault' ? {} : { tab: t });

  return (
    <div>
      <PageHeader title="Documents" description="Every file you’ve uploaded, plus line-level feedback on your statement of purpose that feeds straight into your score." />
      <div role="tablist" aria-label="Documents" className="mt-8 flex gap-6 border-b border-line">
        {tabs.map((t) =>
        <button
          key={t.id}
          role="tab"
          id={`tab-${t.id}`}
          aria-selected={tab === t.id}
          aria-controls={`panel-${t.id}`}
          onClick={() => setTab(t.id)}
          className={`-mb-px border-b-2 pb-3 text-[14px] transition-colors duration-150 ${tab === t.id ? 'border-ink font-medium text-ink' : 'border-transparent text-ink-2 hover:text-ink'}`}>
          
            {t.label}
          </button>
        )}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-8">
        {tab === 'vault' ? <DocumentVault onReviewSop={() => setTab('sop')} /> : <SopFeedback />}
      </div>
    </div>);

}