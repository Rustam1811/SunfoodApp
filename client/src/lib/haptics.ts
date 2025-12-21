export function softTap() {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  navigator.vibrate(8);
}

export function impact() {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  navigator.vibrate([12, 30, 12]);
}
