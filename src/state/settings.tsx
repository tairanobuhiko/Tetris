import React from 'react';
import { BGM_TRACKS } from '@/config';
import { getCurrentBgmTrackId, selectBgmTrack } from '@/audio/audio';

// ゲーム内設定を扱うコンテキスト。
type SettingsContextValue = {
  bgmTrackId: string;
  changeBgmTrack: (id: string) => Promise<void>;
};

const SettingsContext = React.createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bgmTrackId, setBgmTrackId] = React.useState<string>(() => getCurrentBgmTrackId());

  const changeBgmTrack = React.useCallback(async (id: string) => {
    await selectBgmTrack(id);
    setBgmTrackId(getCurrentBgmTrackId());
  }, []);

  const value = React.useMemo(
    () => ({ bgmTrackId, changeBgmTrack }),
    [bgmTrackId, changeBgmTrack],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings(): SettingsContextValue {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings は SettingsProvider の内部で使用してください');
  return ctx;
}

export const BGM_OPTIONS = BGM_TRACKS;

