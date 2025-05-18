/**
 * Returns a greeting message based on the current time of day.
 *
 * - Morning:    5 AM to 11:59 AM
 * - Afternoon:  12 PM to 5:59 PM
 * - Evening:    6 PM to 4:59 AM
 *
 * @returns {string} A localized greeting message (e.g., "Good morning!")
 */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good morning!';
  } else if (hour >= 12 && hour < 18) {
    return 'Good afternoon!';
  } else {
    return 'Good evening!';
  }
};

export default getGreeting;
