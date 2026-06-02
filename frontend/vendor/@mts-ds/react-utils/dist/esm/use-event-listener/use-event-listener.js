import { useRef, useEffect } from 'react';
import { useIsomorphicLayoutEffect } from '../use-isomorphic-layout-effect/use-isomorphic-layout-effect.js';

// MediaQueryList Event based useEventListener interface

/**
 * Custom hook for attaching event listeners to DOM elements, the window, or media query lists.
 * @template KW - The type of event for window events.
 * @template KH - The type of event for HTML element events.
 * @template KM - The type of event for media query list events.
 * @template T - The type of the DOM element (default is `void`).
 * @param {KW | KH | KM} eventName - The name of the event to listen for.
 * @param {(event: WindowEventMap[KW] | HTMLElementEventMap[KH] | MediaQueryListEventMap[KM] | Event) => void} handler - The event handler function.
 * @param {RefObject<T>} [element] - The DOM element or media query list to attach the event listener to (optional).
 * @param {boolean | AddEventListenerOptions} [options] - An options object that specifies characteristics about the event listener (optional).
 * @see [Documentation](https://usehooks-ts.com/react-hook/use-event-listener)
 * @example
 * // Example 1: Attach a window event listener
 * useEventListener('resize', handleResize);
 * @example
 * // Example 2: Attach a document event listener with options
 * const elementRef = useRef(document);
 * useEventListener('click', handleClick, elementRef, { capture: true });
 * @example
 * // Example 3: Attach an element event listener
 * const buttonRef = useRef<HTMLButtonElement>(null);
 * useEventListener('click', handleButtonClick, buttonRef);
 */
function useEventListener(eventName, handler, element, options) {
  // Create a ref that stores handler
  const savedHandler = useRef(handler);
  useIsomorphicLayoutEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  useEffect(() => {
    // Define the listening target
    const targetElement = element?.current ?? window;
    if (!(targetElement && targetElement.addEventListener)) return;

    // Create event listener that calls handler function stored in ref
    const listener = event => savedHandler.current(event);
    targetElement.addEventListener(eventName, listener, options);

    // Remove event listener on cleanup
    // eslint-disable-next-line consistent-return
    return () => {
      targetElement.removeEventListener(eventName, listener, options);
    };
  }, [eventName, element, options]);
}

export { useEventListener };
