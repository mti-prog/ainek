export const MOTION_PROMPTS: Record<string, string> = {
  walk: "A person walks naturally toward the camera for 3 steps with a relaxed human gait — heel-to-toe foot placement, subtle arm swing, slight body sway. After the third step, they smoothly stop and face the camera directly. Total duration: 6–7 seconds. Fabric responds dynamically to movement and settles naturally as the body stops. Camera is fixed and stationary. Cinematic lighting.",
  turn360: "The person performs one smooth, seamless 360-degree rotation in place over 7–8 seconds, pivoting on one foot at a perfectly consistent speed. Camera remains completely fixed. Every angle of the outfit is clearly visible. Fabric drapes and hangs naturally under gravity throughout the full rotation. Studio lighting stays consistent from all angles.",
  pose: "The person transitions through exactly 2 distinct high-fashion editorial poses within 7–8 seconds. Each pose is held for 2–3 seconds with a slow, deliberate transition between them. Confident posture, elongated silhouette, intentional hand and arm placement. Subtle micro-movements keep the figure lifelike. No camera movement. Vogue editorial style lighting.",
  catwalk: "The person walks runway catwalk style toward the camera for 7–8 seconds — one foot placed precisely in front of the other, confident long stride, subtle rhythmic hip sway. Upright posture, shoulders back, chin slightly elevated. Clothing panels and fabric move naturally with each step. Camera is fixed. High-end fashion runway lighting.",
  casual: "The person moves in a relaxed, natural manner for 7–8 seconds — gently shifting weight between feet, making small spontaneous hand gestures, slightly turning the torso left and right. Movements are unhurried and candid, like standing in a fitting room. Clothing shifts and settles naturally with each subtle motion. No posed or exaggerated movement. Camera is fixed.",
};

export const MOTION_LABELS: Record<string, { label: string; icon: string }> = {
  walk:    { label: "Walk",      icon: "🚶" },
  turn360: { label: "360° Spin", icon: "🔄" },
  pose:    { label: "Pose",      icon: "✨" },
  catwalk: { label: "Catwalk",   icon: "👑" },
  casual:  { label: "Casual",    icon: "😊" },
};
