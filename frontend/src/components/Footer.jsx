import React from 'react';
import { Globe, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-8 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-800">Globe Trotter</span>
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Built with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>using Node.js, Express, Prisma & React</span>
        </div>
      </div>
    </footer>
  );
}
