import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { Button } from '@/components/ui/button';

const NEXT_LABEL = {
  light: 'Switch to dark mode',
  dark: 'Switch to system theme',
  system: 'Switch to light mode',
};

export default function ThemeToggle({ className = '' }) {
  const { theme, cycleTheme } = useTheme();
  const Icon = theme === 'dark' ? Moon : theme === 'system' ? Monitor : Sun;
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      aria-label={NEXT_LABEL[theme]}
      title={NEXT_LABEL[theme]}
      className={`text-gray-600 dark:text-gray-300 ${className}`}
    >
      <Icon className="w-5 h-5" />
    </Button>
  );
}
