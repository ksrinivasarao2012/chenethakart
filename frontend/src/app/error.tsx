"use client";

import Button from "@/components/ui/Button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center" role="alert">
      <h1 className="text-4xl font-semibold md:text-5xl">Something went wrong</h1>
      <p className="mt-4 max-w-md text-brown-soft">We hit an unexpected snag. Please try again — and make sure the Chenethakart API is running.</p>
      <Button onClick={reset} className="mt-8">Try again</Button>
    </div>
  );
}
