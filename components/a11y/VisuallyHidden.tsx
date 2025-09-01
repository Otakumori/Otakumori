export default function VisuallyHidden(props: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className="sr-only" {...props} />;
}
