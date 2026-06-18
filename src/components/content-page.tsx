type ContentPageProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function ContentPage({ title, description, children }: ContentPageProps) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-serif mb-3">{title}</h1>
      {description ? (
        <p className="text-muted-foreground mb-8">{description}</p>
      ) : (
        <div className="mb-8" />
      )}
      <div className="prose prose-neutral max-w-none text-sm md:text-base leading-relaxed space-y-4 text-foreground">
        {children}
      </div>
    </div>
  );
}
