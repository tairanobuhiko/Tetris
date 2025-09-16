import React from 'react';
import { Modal, Pressable, View, Text, StyleSheet, ScrollView } from 'react-native';
const { Ionicons } = require('@expo/vector-icons');
import { COLORS } from '@/theme';
import { BGM_OPTIONS } from '@/state/settings';

type Props = {
  visible: boolean;
  selectedBgmId: string;
  onClose: () => void;
  onSelectBgm: (id: string) => void | Promise<void>;
};

export const SettingsModal: React.FC<Props> = ({ visible, selectedBgmId, onClose, onSelectBgm }) => {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="設定画面を閉じる" />
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>サウンド設定</Text>
            <Pressable onPress={onClose} style={styles.closeButton} accessibilityLabel="設定画面を閉じる">
              <Ionicons name="close" size={20} color={COLORS.text} />
            </Pressable>
          </View>
          <Text style={styles.sectionLabel}>プレイ中のBGM</Text>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {BGM_OPTIONS.map((track) => {
              const active = track.id === selectedBgmId;
              return (
                <Pressable
                  key={track.id}
                  style={[styles.option, active && styles.optionActive]}
                  onPress={() => onSelectBgm(track.id)}
                  accessibilityLabel={`${track.title} を選択する`}
                >
                  <View style={styles.optionTextWrap}>
                    <Text style={styles.optionTitle}>{track.title}</Text>
                    {track.description ? <Text style={styles.optionDescription}>{track.description}</Text> : null}
                  </View>
                  {active ? (
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.accent} />
                  ) : (
                    <View style={styles.optionIndicator} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.74)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    backgroundColor: 'rgba(15,23,42,0.92)',
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.28)',
    gap: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '700', letterSpacing: 4 },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148,163,184,0.14)',
  },
  sectionLabel: { color: COLORS.text, opacity: 0.72, letterSpacing: 2 },
  scroll: { maxHeight: 320 },
  scrollContent: { gap: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.24)',
    backgroundColor: 'rgba(15,23,42,0.65)',
  },
  optionActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(56,189,248,0.18)',
  },
  optionTextWrap: { flex: 1, gap: 4 },
  optionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  optionDescription: { color: COLORS.text, opacity: 0.7, fontSize: 13 },
  optionIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(148,163,184,0.38)',
  },
});

