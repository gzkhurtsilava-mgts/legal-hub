/// <reference types="react" />
import * as react from 'react';
import { useLayoutEffect, RefObject, Ref } from 'react';

/**
 * useId
 *
 * Autogenerate IDs to facilitate WAI-ARIA and server rendering.
 *
 * Note: The returned ID will initially be `null` and will update after a
 * component mounts. Users may need to supply their own ID if they need
 * consistent values for SSR.
 *
 * @see Docs https://reach.tech/auto-id
 */
declare function useId(idFromProps: string): string;
declare function useId(idFromProps: number): number;
declare function useId(idFromProps: string | number): string | number;
declare function useId(idFromProps: string | undefined | null): string | undefined;
declare function useId(idFromProps: number | undefined | null): number | undefined;
declare function useId(idFromProps: string | number | undefined | null): string | number | undefined;
declare function useId(): string | undefined;
//# sourceMappingURL=use-id.d.ts.map

declare const isReactValidElement: <Props>(element: React.ReactNode) => element is react.ReactElement<Props, string | react.JSXElementConstructor<any>>;

/**
 * Custom hook for using either `useLayoutEffect` or `useEffect` based on the environment (client-side or server-side).
 * @param {Function} effect - The effect function to be executed.
 * @param {Array<any>} [dependencies] - An array of dependencies for the effect (optional).
 * @see [Documentation](https://usehooks-ts.com/react-hook/use-isomorphic-layout-effect)
 * @example
 * useIsomorphicLayoutEffect(() => {
 *   // Code to be executed during the layout phase on the client side
 * }, [dependency1, dependency2]);
 */
declare const useIsomorphicLayoutEffect: typeof useLayoutEffect;

/**
 * Custom hook for determining if the code is running on the client side (in the browser).
 * @returns {boolean} A boolean value indicating whether the code is running on the client side.
 * @see [Documentation](https://usehooks-ts.com/react-hook/use-is-client)
 * @example
 * const isClient = useIsClient();
 * // Use isClient to conditionally render or execute code specific to the client side.
 */
declare function useIsClient(): boolean;

declare function useEventListener<K extends keyof MediaQueryListEventMap>(eventName: K, handler: (event: MediaQueryListEventMap[K]) => void, element: RefObject<MediaQueryList>, options?: boolean | AddEventListenerOptions): void;
declare function useEventListener<K extends keyof WindowEventMap>(eventName: K, handler: (event: WindowEventMap[K]) => void, element?: undefined, options?: boolean | AddEventListenerOptions): void;
declare function useEventListener<K extends keyof HTMLElementEventMap, T extends HTMLElement = HTMLDivElement>(eventName: K, handler: (event: HTMLElementEventMap[K]) => void, element: RefObject<T>, options?: boolean | AddEventListenerOptions): void;
declare function useEventListener<K extends keyof DocumentEventMap>(eventName: K, handler: (event: DocumentEventMap[K]) => void, element: RefObject<Document>, options?: boolean | AddEventListenerOptions): void;
//# sourceMappingURL=use-event-listener.d.ts.map

declare function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): Ref<T>;

/**
 * Функция для объединения нескольких объектов пропсов в один.
 */
declare type MergedObjectProps = Record<PropertyKey, unknown>;

declare const mergeProps: <T extends MergedObjectProps>(...args: (T | undefined)[]) => T;

declare function getScrollParentElement(node: HTMLElement | null): HTMLElement | null;

export { getScrollParentElement, isReactValidElement, mergeProps, mergeRefs, useEventListener, useId, useIsClient, useIsomorphicLayoutEffect };
