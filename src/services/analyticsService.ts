import ReactGA from 'react-ga4';

const MEASUREMENT_ID = "G-KZSFL2LX09"; 

/**
 * Initializes Google Analytics. Should be called once when the app starts.
 */
export const initGA = () => {
    if (MEASUREMENT_ID) {
        ReactGA.initialize(MEASUREMENT_ID, {
            gaOptions: {
                cookieDomain: 'auto'
            }
        });
        console.log("Google Analytics Initialized");
    } else {
        console.error("GA Measurement ID is not set.");
    }
};

/**
 * Tracks a custom event for a new user signing up.
 * @param method - The method used for signing up (e.g., 'email', 'google').
 */
export const trackUserSignUp = (method: string) => {
    ReactGA.event({
        category: 'User',
        action: 'Sign Up',
        label: method,
    });
};

/**
 * Tracks a custom event when a user subscribes to a court notification.
 * @param courtId - The ID of the court.
 * @param courtName - The name of the court.
 * @param userId - The ID of the user subscribing.
 * @param userEmail - The email of the userSubscribing.
 */
export const trackNotificationSubscribed = (courtId: string, courtName: string, userId: string, userEmail: string) => {
    ReactGA.event({
        category: 'Engagement',
        action: 'Notification Subscribed',
        label: `${courtName} (${courtId}): ${userId} (${userEmail})`,
    });
};