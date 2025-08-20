
'use client';

type EventName = 
    | 'view_card'
    | 'open_card'
    | 'filter_click'
    | 'vote_cast'
    | 'vote_changed'
    | 'related_click';

type EventPayload = {
    topicId?: string;
    category?: string;
    subCategory?: string;
    sourceTopicId?: string;
    destinationTopicId?: string;
    [key: string]: any;
};

/**
 * A simulated analytics tracking function.
 * In a real application, this would send data to a service like Google Analytics, Vercel Analytics, etc.
 * For this prototype, it logs the event to the console.
 * 
 * @param eventName The name of the event to track.
 * @param payload An object containing additional data about the event.
 */
export function trackEvent(eventName: EventName, payload: EventPayload = {}): void {
    if (typeof window === 'undefined') {
        // Don't track events on the server
        return;
    }

    const eventData = {
        event: eventName,
        ...payload,
        timestamp: new Date().toISOString(),
        url: window.location.pathname,
    };

    console.log('[ANALYTICS]', eventData);

    // Example of how you might send to a real service:
    // if (process.env.NODE_ENV === 'production') {
    //     gtag('event', eventName, payload);
    // }
}
