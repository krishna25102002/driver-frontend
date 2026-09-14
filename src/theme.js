// =============================================
// 🎨 DriveGo Driver Theme — Navy + Orange
// =============================================

export const C = {
  // Brand (Navy)
  primary: '#1B2A4A',
  primaryDark: '#131E38',
  primarySoft: '#E9EDF5',
  primaryBorder: '#C8D2E4',

  // Action (Orange)
  accent: '#FF6A00',
  accentDark: '#E85D00',
  accentSoft: '#FFF0E3',
  accentBorder: '#FFD9BC',

  // Surfaces
  bg: '#F5F5F7',
  surface: '#FFFFFF',
  surfaceAlt: '#FAFAFB',
  border: '#EDEDEF',
  borderDark: '#E0E0E4',

  // Text
  text: '#1A1A1A',
  textSub: '#6B6B6B',
  textMuted: '#9E9EA7',

  // Status
  warning: '#FF9500',
  success: '#22B358',
  successSoft: '#E6F7EE',
  danger: '#EF4444',
  dangerSoft: '#FDEBEC',
  info: '#3B82F6',
  infoSoft: '#E8F1FE',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  inputBg: '#F2F2F4',
};

// Shared card shadow (soft, modern)
export const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 3,
};

// Expose convenience references on the palette object so existing
// screens that used C.shadow / C.card keep working.
C.shadow = shadow;

// Shared card shell
C.card = {
  backgroundColor: C.surface,
  borderRadius: 20,
  padding: 16,
  borderWidth: 1,
  borderColor: C.border,
  ...shadow,
};

// Shared button treatments
C.primaryButton = {
  backgroundColor: C.accent,
  borderRadius: 30,
  paddingVertical: 14,
  paddingHorizontal: 24,
  alignItems: 'center',
  justifyContent: 'center',
  ...shadow,
  shadowOpacity: 0.22,
};

C.outlineButton = {
  borderWidth: 1.5,
  borderColor: C.accent,
  borderRadius: 30,
  paddingVertical: 13,
  paddingHorizontal: 24,
  alignItems: 'center',
  justifyContent: 'center',
};

C.input = {
  backgroundColor: C.inputBg,
  borderRadius: 14,
  paddingHorizontal: 14,
  color: C.text,
};

// Typography scale (lightweight helpers)
C.fonts = {
  h1: { fontSize: 28, fontWeight: 'bold', color: C.text },
  h2: { fontSize: 20, fontWeight: 'bold', color: C.text },
  h3: { fontSize: 16, fontWeight: 'bold', color: C.text },
  body: { fontSize: 14, color: C.textSub },
  caption: { fontSize: 12, color: C.textMuted },
  section: {
    fontSize: 12,
    fontWeight: 'bold',
    color: C.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
};

export default C;