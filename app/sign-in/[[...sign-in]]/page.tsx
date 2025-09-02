import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-[70vh] grid place-items-center p-6">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}