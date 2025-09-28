import { Clock, ExternalLink } from 'lucide-react';
import { EventEntry } from '@/lib/types';

interface EventFeedProps {
  events: EventEntry[];
}

export default function EventFeed({ events }: EventFeedProps) {
  const getEventIcon = (type: EventEntry['type']) => {
    const iconClass = "w-3 h-3";
    switch (type) {
      case 'logos_created':
        return <div className={`${iconClass} bg-purple-400 rounded-full`} />;
      case 'task_assigned':
        return <div className={`${iconClass} bg-blue-400 rounded-full`} />;
      case 'task_fulfilled':
        return <div className={`${iconClass} bg-green-400 rounded-full`} />;
      case 'payout':
        return <div className={`${iconClass} bg-yellow-400 rounded-full`} />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-orange-400" />
        Event Feed
      </h3>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-4 text-sm">No events yet</p>
        ) : (
          events.map(event => (
            <div
              key={event.id}
              className="flex items-start space-x-3 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                {getEventIcon(event.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {event.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {formatTime(event.timestamp)}
                  </span>
                  <a
                    href={event.explorerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View</span>
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}