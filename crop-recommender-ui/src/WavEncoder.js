// Utility function to convert raw PCM audio data to a playable WAV Blob.
// The Gemini TTS API returns audio/L16, which is 16-bit signed PCM.
// This function constructs the necessary WAV header and combines it with the audio data.
const pcmToWav = (pcmData, sampleRate) => {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  const dataSize = pcmData.length * 2; // Each sample is 2 bytes (16-bit)
  const fileSize = 36 + dataSize;

  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // File size
  view.setUint32(4, fileSize, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // number of channels
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate
  view.setUint32(28, byteRate, true);
  // block align
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, bitsPerSample, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataSize, true);

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  const pcmBuffer = pcmData.buffer;
  const combinedBuffer = new Blob([header, pcmBuffer], { type: 'audio/wav' });

  return combinedBuffer;
};

export default pcmToWav;
