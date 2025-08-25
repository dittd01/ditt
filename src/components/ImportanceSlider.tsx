
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

interface ImportanceSliderProps {
  topicId: string;
}

const TOTAL_FLAMES = 10;

/**
 * @fileoverview ImportanceSlider component for rating topic importance.
 *
 * @description
 * This component renders an interactive flame-based rating system. It is designed to be
 * mobile-first, providing large, easy-to-use touch targets.
 *
 * It manages two pieces of state:
 * 1. `savedRating`: The user's persisted choice, stored in localStorage.
 * 2. `hoverRating`: A transient state for immediate visual feedback on desktop hover.
 *
 * The component is self-contained and handles all its logic, including state
 * management, user interactions (click, hover), and localStorage synchronization.
 *
 * @param {string} topicId - The unique identifier for the topic being rated. This is
 *   used to create a unique key for localStorage.
 */
export function ImportanceSlider({ topicId }: ImportanceSliderProps) {
  // Why: `savedRating` stores the user's permanently clicked rating.
  // It's initialized to `null` and then populated from localStorage via useEffect.
  // This prevents hydration mismatches between server and client.
  const [savedRating, setSavedRating] = useState<number | null>(null);

  // Why: `hoverRating` is for transient hover effects on desktop.
  // It allows for immediate visual feedback without altering the saved state.
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  /**
   * @function useEffect
   * @description
   * This effect runs once on component mount on the client-side.
   * Rationale: Its primary purpose is to safely read the user's previously saved
   * rating from localStorage. Reading from localStorage in an effect prevents
   * server-side rendering (SSR) errors and hydration mismatches, as localStorage
   * is a browser-only API.
   */
  useEffect(() => {
    const storedRating = localStorage.getItem(`importance_for_${topicId}`);
    if (storedRating) {
      setSavedRating(parseInt(storedRating, 10));
    }
  }, [topicId]);

  /**
   * @function handleRatingClick
   * @description
   * Handles the click/tap event on a flame. This is the primary interaction for
   * both desktop and mobile.
   *
   * Rationale: It updates the `savedRating` state and persists the choice to
   * localStorage. This ensures the user's selection is remembered across sessions.
   * If the user clicks the same flame again, it resets the rating, providing an
   * intuitive way to undo a rating.
   *
   * @param {number} index - The 0-based index of the clicked flame.
   */
  const handleRatingClick = (index: number) => {
    const newRating = savedRating === index ? null : index;
    setSavedRating(newRating);
    if (newRating === null) {
      localStorage.removeItem(`importance_for_${topicId}`);
    } else {
      localStorage.setItem(`importance_for_${topicId}`, newRating.toString());
    }
  };

  /**
   * @function handleMouseLeave
   * @description
   * Resets the hover state when the mouse leaves the container.
   * Rationale: This ensures that once the user is no longer actively hovering,
   * the display reverts to showing the `savedRating`, providing a stable UI.
   */
  const handleMouseLeave = () => {
    setHoverRating(null);
  };

  const ratingToDisplay = hoverRating !== null ? hoverRating : savedRating;
  const cardDescription = savedRating === null 
    ? "Your rating helps us understand what matters most. This is saved privately and is not a public vote."
    : `You rated this a ${savedRating + 1} out of ${TOTAL_FLAMES}. You can change it at any time.`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>How important is this issue to you?</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="flex justify-center items-center gap-1 sm:gap-2 py-4"
          onMouseLeave={handleMouseLeave}
        >
          {/*
            Why: We create an array of a fixed length to map over. This is a clean,
            declarative way to render a specific number of identical elements (the flames)
            without needing a traditional for-loop.
          */}
          {Array.from({ length: TOTAL_FLAMES }).map((_, index) => {
            const isFilled = ratingToDisplay !== null && index <= ratingToDisplay;
            return (
              <Flame
                key={index}
                className={cn(
                  'h-7 w-7 sm:h-8 sm:w-8 cursor-pointer transition-colors duration-150',
                  isFilled
                    ? 'text-destructive fill-current' // Why: Red color for filled state (hover or saved).
                    : 'text-muted-foreground/30'     // Why: A muted, unfilled state.
                )}
                onMouseEnter={() => setHoverRating(index)}
                onClick={() => handleRatingClick(index)}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground px-2">
            <span>Not important</span>
            <span>Critically important</span>
        </div>
      </CardContent>
    </Card>
  );
}
