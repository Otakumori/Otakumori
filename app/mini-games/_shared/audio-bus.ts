let audioContext: AudioContext | null = null;
let isMuted = false;

export function play(soundUrl: string, volumeDb: number = 0): void {
  if (isMuted || !soundUrl) return;
  
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    fetch(soundUrl)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext!.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        const source = audioContext!.createBufferSource();
        const gainNode = audioContext!.createGain();
        
        source.buffer = audioBuffer;
        source.connect(gainNode);
        gainNode.connect(audioContext!.destination);
        
        // Convert dB to linear gain
        const gain = Math.pow(10, volumeDb / 20);
        gainNode.gain.value = gain;
        
        source.start(0);
      })
      .catch(error => {
        console.warn("Failed to play audio:", error);
      });
  } catch (error) {
    console.warn("Audio context error:", error);
  }
}

export function setMuted(muted: boolean): void {
  isMuted = muted;
}

export function getMuted(): boolean {
  return isMuted;
}
