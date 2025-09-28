import { Github, Book, Search } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black/50 backdrop-blur-sm mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <p className="text-gray-400 text-sm italic">
            "All acts are immutably recorded on-chain."
          </p>
          
          <div className="flex items-center justify-center space-x-6">
            <a
              href="https://github.com/n4y/logos-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-cyan-400 transition-colors flex items-center space-x-1 text-sm"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            
            <a
              href="https://docs.n4y.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-cyan-400 transition-colors flex items-center space-x-1 text-sm"
            >
              <Book className="w-4 h-4" />
              <span>Docs</span>
            </a>
            
            <a
              href="https://basescan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-cyan-400 transition-colors flex items-center space-x-1 text-sm"
            >
              <Search className="w-4 h-4" />
              <span>Explorer</span>
            </a>
          </div>
          
          <div className="text-xs text-gray-600 pt-4 border-t border-gray-800">
            <p>© 2025 N4Y LOGOS Studio. Built for the decentralized future.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}