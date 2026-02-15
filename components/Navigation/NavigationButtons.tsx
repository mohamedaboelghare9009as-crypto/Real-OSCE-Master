import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { ChevronLeft, ChevronRight, Home, Menu, BarChart3, Calendar, User, Settings, BookOpen, Stethoscope } from 'lucide-react';

interface NavigationButtonsProps {
  className?: string;
  showPrevious?: boolean;
  showNext?: boolean;
  showMenu?: boolean;
  showHome?: boolean;
  customButtons?: Array<{
    text: string;
    icon?: React.ReactNode;
    onClick: () => void;
    className?: string;
  }>;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  className = '',
  showPrevious = true,
  showNext = true,
  showMenu = true,
  showHome = true,
  customButtons = []
}) => {
  const { previousPage, nextPage, goToMainMenu, goToDashboard, canGoNext, canGoPrevious } = useNavigation();

  return (
    <div className={`flex items-center justify-center gap-3 flex-wrap ${className}`}>
      {/* Previous Button */}
      {showPrevious && canGoPrevious && (
        <button
          onClick={previousPage}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all duration-200 hover:scale-105"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
      )}

      {/* Home Button */}
      {showHome && (
        <button
          onClick={goToDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-sm"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </button>
      )}

      {/* Menu Button */}
      {showMenu && (
        <button
          onClick={goToMainMenu}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-sm"
        >
          <Menu className="w-4 h-4" />
          Main Menu
        </button>
      )}

      {/* Next Button */}
      {showNext && canGoNext && (
        <button
          onClick={nextPage}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-sm"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Custom Buttons */}
      {customButtons.map((btn, index) => (
        <button
          key={index}
          onClick={btn.onClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-sm ${btn.className || 'bg-slate-500 hover:bg-slate-600 text-white'
            }`}
        >
          {btn.icon}
          {btn.text}
        </button>
      ))}
    </div>
  );
};

// Breadcrumb Navigation Component
export const BreadcrumbNavigation: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { getCurrentPage, pages } = useNavigation();
  const currentPage = getCurrentPage();

  if (!currentPage) return null;

  const getIcon = (pageId: string) => {
    const icons = {
      dashboard: <Home className="w-4 h-4" />,
      cases: <BookOpen className="w-4 h-4" />,
      session: <Stethoscope className="w-4 h-4" />,
      analytics: <BarChart3 className="w-4 h-4" />,
      calendar: <Calendar className="w-4 h-4" />,
      profile: <User className="w-4 h-4" />,
      admin: <Settings className="w-4 h-4" />,
    };
    return icons[pageId as keyof typeof icons] || null;
  };

  return (
    <nav className={`flex items-center gap-2 text-sm text-slate-600 ${className}`}>
      {getIcon(currentPage.id)}
      <span className="font-medium">{currentPage.title}</span>
      {currentPage.description && (
        <span className="text-slate-400">• {currentPage.description}</span>
      )}
    </nav>
  );
};

// Page Progress Indicator Component
export const PageProgress: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentPage, pages } = useNavigation();

  return (
    <div className={`flex justify-center gap-1.5 ${className}`}>
      {pages.map((_, index) => (
        <div
          key={index}
          className={`h-2 rounded-full transition-all duration-300 ${index === currentPage
              ? 'w-6 bg-emerald-500'
              : index < currentPage
                ? 'w-2 bg-emerald-300'
                : 'w-2 bg-slate-200'
            }`}
        />
      ))}
    </div>
  );
};

// Quick Navigation Grid Component
export const QuickNavigationGrid: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { goToPage, getPagesInCategory } = useNavigation();
  const mainPages = getPagesInCategory('main');
  const userPages = getPagesInCategory('user');

  const getIcon = (pageId: string) => {
    const icons = {
      dashboard: <Home className="w-6 h-6" />,
      cases: <BookOpen className="w-6 h-6" />,
      session: <Stethoscope className="w-6 h-6" />,
      analytics: <BarChart3 className="w-6 h-6" />,
      calendar: <Calendar className="w-6 h-6" />,
      profile: <User className="w-6 h-6" />,
      admin: <Settings className="w-6 h-6" />,
    };
    return icons[pageId as keyof typeof icons] || <Menu className="w-6 h-6" />;
  };

  const handlePageClick = (page: any, index: number) => {
    if (page.id === 'session') {
      // Navigate to cases instead since session requires a case ID
      goToPage(1); // Cases page
    } else {
      goToPage(index);
    }
  };

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
      {/* Main Navigation */}
      {mainPages.map((page, index) => (
        <button
          key={page.id}
          onClick={() => handlePageClick(page, index)}
          className="clay-card hover:scale-105 text-left group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-200 transition-colors">
              {getIcon(page.id)}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{page.title}</h3>
              {page.description && (
                <p className="text-xs text-slate-500">{page.description}</p>
              )}
            </div>
          </div>
        </button>
      ))}

      {/* User Pages */}
      <div className="col-span-full">
        <h3 className="text-sm font-medium text-slate-500 mb-3">Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {userPages.map((page) => (
            <button
              key={page.id}
              onClick={() => handlePageClick(page, pages.indexOf(page))}
              className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
            >
              <div className="p-1.5 bg-slate-200 text-slate-600 rounded">
                {getIcon(page.id)}
              </div>
              <div>
                <h4 className="font-medium text-slate-700">{page.title}</h4>
                {page.description && (
                  <p className="text-xs text-slate-500">{page.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Keyboard Shortcuts Help Component
export const KeyboardShortcutsHelp: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg max-w-xs ${className}`}>
      <h4 className="font-semibold text-slate-800 mb-2">Keyboard Shortcuts</h4>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-600">Previous</span>
          <kbd className="px-2 py-1 bg-slate-100 rounded">Ctrl + ←</kbd>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Next</span>
          <kbd className="px-2 py-1 bg-slate-100 rounded">Ctrl + →</kbd>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Home</span>
          <kbd className="px-2 py-1 bg-slate-100 rounded">Ctrl + Home</kbd>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Menu</span>
          <kbd className="px-2 py-1 bg-slate-100 rounded">Ctrl + M</kbd>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Back</span>
          <kbd className="px-2 py-1 bg-slate-100 rounded">ESC</kbd>
        </div>
      </div>
    </div>
  );
};

export default NavigationButtons;