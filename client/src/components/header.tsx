export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b-2 border-cricket-primary">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cricket-primary rounded-full flex items-center justify-center">
              <i className="fas fa-cricket text-white text-lg"></i>
            </div>
            <div>
              <h1 className="font-playfair font-bold text-xl text-cricket-dark">Cricket Companion</h1>
              <p className="text-xs text-cricket-gray">AI-Powered Scoring & Analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-cricket-gray hover:text-cricket-primary transition-colors">
              <i className="fas fa-sync-alt"></i>
            </button>
            <button className="p-2 text-cricket-gray hover:text-cricket-primary transition-colors">
              <i className="fas fa-cog"></i>
            </button>
            <div className="w-8 h-8 bg-cricket-accent rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">U</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
