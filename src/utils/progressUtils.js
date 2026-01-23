/**
 * Utilities for calculating user progress across the application
 */

/**
 * Calculate progress percentage from session's plan_progress
 * This matches the calculation used in PlanAction.jsx
 *
 * @param {Object} session - The user's session object
 * @param {Object} session.plan_progress - The plan progress data
 * @returns {number} Progress percentage (0-100)
 */
export function calculateProgressFromSession(session) {
  if (!session?.plan_progress) return 0;

  // Count completed days (days marked as completed)
  const completedDays = Object.keys(session.plan_progress).filter(
    key => session.plan_progress[key]?.completed
  ).length;

  return Math.round((completedDays / 7) * 100);
}

/**
 * Calculate progress percentage from session's plan_progress based on individual tasks
 * This is a more granular calculation that counts individual checked tasks
 *
 * @param {Object} session - The user's session object
 * @param {Function} getDayChecklist - Function to get checklist for a specific day
 * @returns {number} Progress percentage (0-100)
 */
export function calculateDetailedProgressFromSession(session, getDayChecklist) {
  if (!session?.plan_progress || !getDayChecklist) return 0;

  // Calculate total tasks across all days
  const totalTasks = [1, 2, 3, 4, 5, 6, 7].reduce(
    (acc, day) => acc + getDayChecklist(day).length,
    0
  );

  if (totalTasks === 0) return 0;

  // Count checked tasks
  const checkedTasks = [1, 2, 3, 4, 5, 6, 7].reduce((acc, day) => {
    const list = getDayChecklist(day);
    return acc + list.filter((i) => i.checked).length;
  }, 0);

  return Math.round((checkedTasks / totalTasks) * 100);
}

/**
 * Get the current day number based on progress
 *
 * @param {Object} session - The user's session object
 * @returns {number} Current day (1-7)
 */
export function getCurrentDay(session) {
  if (!session?.plan_progress) return 1;

  const completedDays = Object.keys(session.plan_progress).filter(
    key => session.plan_progress[key]?.completed
  ).length;

  return Math.min(completedDays + 1, 7);
}
