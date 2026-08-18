export const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export type OrderCancellationEligibility = {
  eligible: boolean;
  hoursRemaining: number;
  minutesRemaining: number;
  reason?: string;
};

export function getOrderCancellationEligibility(
  createdAtIso: string,
  status: string
): OrderCancellationEligibility {
  const orderTime = new Date(createdAtIso).getTime();
  const now = Date.now();
  const elapsedMs = now - orderTime;
  const remainingMs = TWENTY_FOUR_HOURS_MS - elapsedMs;

  const hoursRemaining = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));
  const minutesRemaining = Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)));

  const normalizedStatus = (status || "").toLowerCase();

  if (normalizedStatus === "cancelled") {
    return { eligible: false, hoursRemaining: 0, minutesRemaining: 0, reason: "Order is already cancelled" };
  }

  if (normalizedStatus === "delivered") {
    return { eligible: false, hoursRemaining: 0, minutesRemaining: 0, reason: "Delivered orders cannot be cancelled" };
  }

  if (remainingMs <= 0) {
    return {
      eligible: false,
      hoursRemaining: 0,
      minutesRemaining: 0,
      reason: "Cancellation window expired (orders can only be cancelled within 24 hours of purchase)",
    };
  }

  return {
    eligible: true,
    hoursRemaining,
    minutesRemaining,
  };
}
