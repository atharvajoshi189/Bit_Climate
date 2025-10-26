// src/lib/awardPoints.ts
import { toast } from 'sonner';

/**
 * Client-side function to call the add-points API route.
 * @param pointsToAdd Number of points to add.
 * @param activityType Description of the activity (e.g., "GHG Emission Analysis").
 * @param activityDetails Optional details (e.g., "Area: [coords]").
 */
export const awardPointsClientSide = async (
  pointsToAdd: number,
  activityType: string,
  activityDetails?: string
): Promise<void> => {
  if (pointsToAdd <= 0) return; // Don't award 0 points

  try {
    const response = await fetch('/api/user/add-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pointsToAdd: pointsToAdd,
        activityType: activityType,
        activityDetails: activityDetails || null,
        // We don't send userId from client, API gets it via auth()
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Don't show error toast for points failure, just log it
      console.error(`Failed to award points for ${activityType}:`, data.error || 'Unknown error');
    } else {
      // Success toast for points earned
      toast.success(`+${pointsToAdd} Eco-Points earned for ${activityType}! Total: ${data.newTotalPoints}`);
      console.log(`Awarded ${pointsToAdd} points for ${activityType}. New total: ${data.newTotalPoints}`);
    }
  } catch (error) {
    console.error(`Error calling add-points API for ${activityType}:`, error);
  }
};