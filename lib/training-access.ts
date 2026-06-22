import 'server-only';

import * as db from '@/lib/db';
import { isPaymentEnabled, isPaymentExempt } from '@/lib/payment-config';

export type TrainingAccessUser = {
  id: string;
  role?: string;
} | null;

export async function canAccessCourse(
  user: TrainingAccessUser,
  courseId: string,
): Promise<boolean> {
  if (isPaymentExempt(user)) return true;
  if (!isPaymentEnabled()) return true;
  if (!user?.id) return false;

  // Active subscription grants access to all courses regardless of expiry
  const subscription = await db.findActiveTrainingSubscription(user.id);
  if (subscription) return true;

  const enrollment = await db.findCourseEnrollment(user.id, courseId);
  if (enrollment) {
    // Enrollment with no expiry (NULL) = unlimited access
    // Enrollment with future expiry = valid access
    if (
      !enrollment.access_expires_at ||
      new Date(enrollment.access_expires_at) > new Date()
    ) {
      return true;
    }
  }

  // No valid enrollment → no access (admin must re-enroll or user must repurchase)
  return false;
}

export async function canAccessLesson(
  user: TrainingAccessUser,
  lesson: { course_id: string; is_preview?: boolean | null },
): Promise<boolean> {
  if (lesson.is_preview) return true;
  return canAccessCourse(user, lesson.course_id);
}
