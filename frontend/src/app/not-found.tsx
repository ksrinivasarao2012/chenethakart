import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-3 text-4xl font-semibold md:text-6xl">This thread came loose</h1>
      <p className="mt-4 max-w-md text-brown-soft">We couldn’t find the page you were looking for. Let’s get you back to something handmade.</p>
      <div className="mt-8 flex gap-3">
        <Button href="/">Back home</Button>
        <Button href="/shop" variant="outline">Browse the shop</Button>
      </div>
    </div>
  );
}
