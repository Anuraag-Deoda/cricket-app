import { useCricketStore } from "@/store/cricket-store";

export default function BottomNavigation() {
  const { activeTab, setActiveTab } = useCricketStore();

  const tabs = [
    { id: 'scoring', label: 'Score', icon: 'fas fa-edit' },
    { id: 'analytics', label: 'Stats', icon: 'fas fa-chart-line' },
    { id: 'commentary', label: 'Commentary', icon: 'fas fa-microphone' },
    { id: 'teams', label: 'Teams', icon: 'fas fa-users' },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === tab.id ? 'text-cricket-primary' : 'text-cricket-gray'
            }`}
          >
            <i className={`${tab.icon} text-sm`}></i>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
