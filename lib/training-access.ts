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

  const enrollment = await db.findCourseEnrollment(user.id, courseId);
  if (enrollment) return true;

  const subscription = await db.findActiveTrainingSubscription(user.id);
  if (subscription) return true;

  const purchase = await db.findCoursePurchase(user.id, courseId);
  return !!purchase;
}

export async function canAccessLesson(
  user: TrainingAccessUser,
  lesson: { course_id: string; is_preview?: boolean | null },
): Promise<boolean> {
  if (lesson.is_preview) return true;
  return canAccessCourse(user, lesson.course_id);
}
