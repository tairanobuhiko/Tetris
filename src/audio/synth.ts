// 非同期に WAV を生成し Base64 を返すユーティリティ

function toBase64(bytes: Uint8Array): string {
  // 簡易 Base64 エンコード（ブラウザ互換を避け独自実装）
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let i = 0;
  while (i < bytes.length) {
    const c1 = bytes[i++] ?? 0;
    const c2 = bytes[i++] ?? 0;
    const c3 = bytes[i++] ?? 0;
    const enc1 = c1 >> 2;
    const enc2 = ((c1 & 3) << 4) | (c2 >> 4);
    const enc3 = ((c2 & 15) << 2) | (c3 >> 6);
    const enc4 = c3 & 63;
    if (isNaN(c2 as any)) output += chars.charAt(enc1) + chars.charAt(enc2) + '==';
    else if (isNaN(c3 as any))
      output += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + '=';
    else output += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + chars.charAt(enc4);
  }
  return output;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

export function synthWavBase64({
  frequency = 440,
  durationMs = 200,
  volume = 0.25,
  sampleRate = 22050,
}: {
  frequency?: number;
  durationMs?: number;
  volume?: number;
  sampleRate?: number;
}): string {
  const length = Math.floor((durationMs / 1000) * sampleRate);
  const dataSize = length * 2; // 16-bit mono
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM header size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byteRate = sampleRate * blockAlign
  view.setUint16(32, 2, true); // blockAlign = channels * bytesPerSample
  view.setUint16(34, 16, true); // bitsPerSample
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // PCM data (sine wave)
  let offset = 44;
  const amp = Math.floor(32767 * volume);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t);
    const s = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, Math.floor(s * amp), true);
    offset += 2;
  }

  return toBase64(bytes);
}

