import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-[70vh] grid place-items-center p-6">
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}