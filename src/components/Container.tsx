export default function Container(
  { className = "", ...props }: React.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 md:px-6 ${className}`}
      {...props}
    />
  );
}