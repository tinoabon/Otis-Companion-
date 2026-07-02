import React from 'react';

interface DateDividerProps {
    date: string;
}

export const DateDivider: React.FC<DateDividerProps> = ({ date }) => {
    const formatDate = (dateStr: string): string => {
          const today = new Date();
          const msgDate = new Date(dateStr);
          const todayStr = today.toDateString();
          const msgDateStr = msgDate.toDateString();

          if (todayStr === msgDateStr) return 'Today';

          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          if (yesterday.toDateString() === msgDateStr) return 'Yesterday';

          return msgDate.toLocaleDateString([], {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
          });
    };

    return (
          <div className="date-divider">
                <span className="date-label">{formatDate(date)}</span>span>
          </div>div>
        );
};</div>
