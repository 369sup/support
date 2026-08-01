import { Separator } from "@support/shadcn/ui/separator";

type RoutePlaceholderProps = {
  title: string;
  description: string;
};

export function RoutePlaceholder({
  title,
  description,
}: RoutePlaceholderProps) {
  return (
    <main className="flex flex-1 items-center px-5 py-20 sm:px-8">
      <section className="mx-auto w-full max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          {description}
        </p>
        <Separator className="my-10" />
        <p className="text-sm text-muted-foreground">
          This route foundation is ready for product-specific content.
        </p>
      </section>
    </main>
  );
}
