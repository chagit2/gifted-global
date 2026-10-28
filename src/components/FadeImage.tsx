import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";

// An <img> that fades in once loaded, over a soft placeholder, instead of
// popping in line by line.
export function FadeImage({
  className = "",
  onLoad,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Images that finished before hydration never fire onLoad.
  useEffect(() => {
    setLoaded(!!ref.current?.complete);
  }, [props.src]);

  return (
    <img
      ref={ref}
      {...props}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}

// A gift photo shown whole, never cropped: whatever its shape, it sits in the
// frame over a soft, blurred copy of itself instead of empty bars.
// `className` styles the frame (size, aspect, rounding, outline).
export function FitImage({ className = "", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <span className={`relative block overflow-hidden bg-white/70 ${className}`}>
      <img
        src={props.src}
        alt=""
        aria-hidden
        loading={props.loading}
        className="absolute inset-0 size-full scale-110 object-cover opacity-50 blur-xl"
      />
      <FadeImage {...props} className="relative size-full object-contain" />
    </span>
  );
}
