export default function GeneratePlaceholder(title: string) {
  return function Placeholder() {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl text-primary font-bold">{title[0]}</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400 max-w-md">
          This is a placeholder page for the {title} module. It demonstrates the proper routing and sidebar functionality as requested.
        </p>
      </div>
    );
  };
}
