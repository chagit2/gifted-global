import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";

// An <img> that fades in once loaded, over a soft placeholder, instead of
// popping in line by line.
export function FadeImage({ className = "", onLoad, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
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
      className={`bg-white/5 transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
    />
  );
}
