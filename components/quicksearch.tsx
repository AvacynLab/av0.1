'use client';

import { GlobeIcon, ArrowRightIcon } from 'lucide-react';
import { Button } from './ui/button';

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
}

interface QuickSearchProps {
  searchResults?: TavilySearchResult[];
}

function TruncatedContent({ content }: { content: string }) {
  const truncatedContent = content.length > 150 ? content.slice(0, 150) + '...' : content;
  
  return (
    <p className="text-sm text-muted-foreground overflow-hidden line-clamp-3">
      {truncatedContent}
    </p>
  );
}

export function QuickSearch({ searchResults = [] }: QuickSearchProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      <div className="flex flex-col gap-4">
        {searchResults.map((result, index) => (
          <div 
            key={index} 
            className="flex flex-col gap-2 p-4 border rounded-lg transition-colors duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:text-primary-dark"
            >
              <span className="font-medium">{result.title}</span>
            </a>
            <TruncatedContent content={result.content} />
            <Button 
              variant="link" 
              className="self-end p-0 h-auto hover:text-primary-dark"
              onClick={() => window.open(result.url, '_blank')}
            >
              <span className="flex items-center gap-1">
                Visiter <ArrowRightIcon className="size-4" />
              </span>
            </Button>
          </div>
        ))}
      </div>

      {searchResults.length > 5 && (
        <Button variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground">
          Afficher plus de résultats
        </Button>
      )}
    </div>
  );
}