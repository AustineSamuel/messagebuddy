export function isAudioMessageType(type?: string) {
  const normalized = (type || "").toLowerCase();
  return normalized === "ptt" || normalized === "audio" || normalized === "voice";
}

export function isAudioApiMessage(message: { type?: string; hasMedia?: boolean }) {
  return isAudioMessageType(message.type) || (Boolean(message.hasMedia) && message.type === "ptt");
}
