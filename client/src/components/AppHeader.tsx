import { Telescope } from "lucide-react";

interface AppHeaderProps {
  title: string;
}

export default function AppHeader({ title }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center">
          <Telescope className="text-primary mr-2 h-5 w-5" />
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div>
          <button className="p-2 rounded-full hover:bg-neutral-100" aria-label="User menu">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-neutral-600"
            >
              <path d="M18 20a6 6 0 0 0-12 0" />
              <circle cx="12" cy="10" r="4" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
