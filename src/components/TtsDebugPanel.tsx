import { useEffect, useState, useCallback } from 'react';
import {
  getHebrewTtsDebugInfo,
  subscribeHebrewTtsStatus,
  refreshHebrewVoices,
  speakHebrew
} from '../utils/speech';

/** Dev-only: Hebrew TTS voice status, he-IL list, test speak */
export function TtsDebugPanel() {
  const [info, setInfo] = useState(getHebrewTtsDebugInfo);

  useEffect(() => {
    return subscribeHebrewTtsStatus(() => {
      setInfo(getHebrewTtsDebugInfo());
    });
  }, []);

  const onRefresh = useCallback(() => {
    refreshHebrewVoices();
    setInfo(getHebrewTtsDebugInfo());
  }, []);

  const onTest = useCallback(() => {
    speakHebrew('בּוֹאִי נִשְׂחַק וְנִלְמַד בְּיַחַד.', {
      rate: 0.78,
      pitch: 1.05,
      label: 'debug-test'
    });
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 8,
        left: 8,
        maxWidth: 360,
        maxHeight: '42vh',
        overflow: 'auto',
        zIndex: 10000,
        fontSize: 11,
        fontFamily: 'monospace',
        background: 'rgba(0,0,0,0.85)',
        color: '#e5e7eb',
        padding: 10,
        borderRadius: 8,
        border: '1px solid #444'
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6, color: '#f472b6' }}>Hebrew TTS (dev)</div>
      <div>status: {info.status}</div>
      <div>Hebrew voice found: {info.selectedVoice ? 'yes' : 'no'}</div>
      <div style={{ marginTop: 4 }}>
        selected: {info.selectedVoice ? `${info.selectedVoice.name} (${info.selectedVoice.lang})` : '—'}
      </div>
      <div style={{ marginTop: 8, color: '#93c5fd' }}>he / he-IL voices ({info.hebrewVoicesDetected.length}):</div>
      <ul style={{ margin: '4px 0', paddingInlineStart: 16 }}>
        {info.hebrewVoicesDetected.map((v) => (
          <li key={`${v.name}-${v.lang}`}>
            {v.name} — {v.lang} {v.localService ? '(local)' : ''}
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={onRefresh} style={{ fontSize: 11, padding: '4px 8px' }}>
          Refresh voices
        </button>
        <button type="button" onClick={onTest} style={{ fontSize: 11, padding: '4px 8px' }}>
          Test phrase
        </button>
      </div>
    </div>
  );
}
