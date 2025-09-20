import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="default"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="flex items-center gap-3 px-4 py-2"
    >
      {theme === "light" ? (
        <>
          <Sun className="h-5 w-5" />
          <span>Light</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5" />
          <span>Dark</span>
        </>
      )}
    </Button>
  );
};

export default ThemeToggle;