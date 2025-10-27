// A vibrant, accessible color palette
const COLOR_PALETTE = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#22c55e', // green-500
  '#f97316', // orange-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#eab308', // yellow-500
  '#64748b', // slate-500
  '#10b981', // emerald-500
  '#06b6d4', // cyan-500
  '#d946ef', // fuchsia-500
];

/**
 * Gets a consistent color for a handler based on their ID from a list of all handlers.
 * @param handlerId The ID of the handler.
 * @param allHandlerIds An array of all handler IDs to ensure consistent color mapping.
 * @returns A color string in hex format.
 */
export const getHandlerColor = (handlerId: string, allHandlerIds: string[]): string => {
  const index = allHandlerIds.indexOf(handlerId);
  if (index === -1) {
    return '#9ca3af'; // gray-400 for unknown/unassigned handlers
  }
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
};

/**
 * A map of funding source keys to specific colors.
 */
export const FUNDING_SOURCE_COLORS: Record<string, string> = {
  insurance: '#3b82f6', // blue-500
  internal: '#14b8a6', // teal-500
  customer: '#f97316', // orange-500
};

/**
 * A map of insurance status keys to specific colors.
 */
export const INSURANCE_STATUS_COLORS: Record<string, string> = {
  pending: '#eab308', // yellow-500
  approved: '#22c55e', // green-500
  rejected: '#ef4444', // red-500
};

/**
 * A map of SLA status keys to specific colors.
 */
export const SLA_STATUS_COLORS: Record<string, string> = {
  'Inom SLA': '#06b6d4', // cyan-500
  'Över SLA': '#d946ef', // fuchsia-500
};

/**
 * Gets a color from the general palette by index. Useful for charts where
 * items don't have a specific semantic meaning.
 * @param index The index of the item.
 * @returns A color string in hex format.
 */
export const getColorByIndex = (index: number): string => {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
};
