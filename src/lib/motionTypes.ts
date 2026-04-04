export const MOTION_PROMPTS: Record<string, string> = {
  walk: "The person walks naturally 3 steps toward the camera, then stops and faces the camera directly. Natural human gait. Fabric moves realistically with body movement.",
  turn360: "The person does a slow, smooth 360-degree rotation in place over 6 seconds, showing the outfit from all angles. Camera stays fixed. Fabric drapes naturally.",
  pose: "The person strikes 2–3 stylish fashion model poses, transitioning smoothly. Editorial fashion photography style. Confident, elegant movement.",
  catwalk: "The person walks in runway catwalk style — one foot in front of the other, confident stride, slight hip movement. Walking toward the camera. High fashion editorial.",
  casual: "The person moves naturally and casually — shifting weight, slight hand gestures, turning slightly. Everyday natural movement as if standing in a fitting room.",
};

export const MOTION_LABELS: Record<string, { label: string; icon: string }> = {
  walk:    { label: "Walk",      icon: "🚶" },
  turn360: { label: "360° Spin", icon: "🔄" },
  pose:    { label: "Pose",      icon: "✨" },
  catwalk: { label: "Catwalk",   icon: "👑" },
  casual:  { label: "Casual",    icon: "😊" },
};
