// True when the visitor switched animations off in the accessibility menu.
export const motionOff = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("a11y-no-motion");
