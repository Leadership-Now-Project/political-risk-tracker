'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ActionsTimelineData } from '@/lib/types';
import { getActionStatusColor, getCaseStatusColor, getActionStatusLabel, getCaseStatusLabel, getActionTypeLabel, getPushbackTypeLabel, getCategoryLabel } from '@/lib/actions-utils';

interface TimelineViewProps {
  data: ActionsTimelineData;
}

export default function TimelineView({ data }: TimelineViewProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set([data.weeks[0]?.weekOf]));

  const toggleWeek = (weekOf: string) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekOf)) {
        next.delete(weekOf);
      } else {
        next.add(weekOf);
      }
      return next;
    });
  };

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-navy/20 dark:bg-cream/20" />

      <div className="space-y-6">
        {data.weeks.map((week) => {
          const isExpanded = expandedWeeks.has(week.weekOf);
          const totalItems = week.actions.length + week.pushback.length;

          return (
            <div key={week.weekOf} className="relative pl-10 md:pl-14">
              {/* Timeline dot */}
              <div className="absolute left-2.5 md:left-4.5 top-4 w-3 h-3 rounded-full bg-gold border-2 border-white dark:border-navy shadow-sm" />

              {/* Week card */}
              <div className="bg-white dark:bg-navy-600 rounded-lg shadow-ln-light border border-navy/10">
                <button
                  onClick={() => toggleWeek(week.weekOf)}
                  className="w-full px-4 py-4 flex items-center justify-between text-left"
                >
                  <div>
                    <h3 className="font-semibold text-navy dark:text-cream">
                      {week.weekLabel}
                    </h3>
                    <p className="text-sm text-navy/60 dark:text-cream/60 mt-1">
                      {week.summary}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gold/10 text-gold">
                      {totalItems} item{totalItems !== 1 ? 's' : ''}
                    </span>
                    <svg
                      className={`w-5 h-5 text-navy/40 dark:text-cream/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-navy/10 dark:border-cream/10 pt-4">
                    {/* Actions */}
                    {week.actions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-navy/50 dark:text-cream/50 uppercase tracking-wider mb-2">
                          Executive Actions
                        </h4>
                        <div className="space-y-2">
                          {week.actions.map((action) => {
                            const colors = getActionStatusColor(action.status);
                            return (
                              <Link
                                key={action.id}
                                href={`/actions-pushback/action/${action.id}`}
                                className={`block p-3 rounded-lg border-l-4 ${colors.border} bg-cream/50 dark:bg-navy-700/50 hover:bg-cream dark:hover:bg-navy-700 transition-colors`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-navy dark:text-cream">
                                    {action.title}
                                  </span>
                                  <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${colors.bg} ${colors.text}`}>
                                    {getActionStatusLabel(action.status)}
                                  </span>
                                </div>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-xs text-navy/50 dark:text-cream/50">
                                    {getActionTypeLabel(action.type)}
                                  </span>
                                  <span className="text-xs text-navy/30 dark:text-cream/30">·</span>
                                  <span className="text-xs text-navy/50 dark:text-cream/50">
                                    {getCategoryLabel(action.category)}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Pushback */}
                    {week.pushback.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-navy/50 dark:text-cream/50 uppercase tracking-wider mb-2">
                          Legal &amp; Institutional Responses
                        </h4>
                        <div className="space-y-2">
                          {week.pushback.map((item) => {
                            const colors = getCaseStatusColor(item.caseStatus);
                            return (
                              <Link
                                key={item.id}
                                href={`/actions-pushback/case/${item.id}`}
                                className={`block p-3 rounded-lg border-l-4 ${colors.border} bg-cream/50 dark:bg-navy-700/50 hover:bg-cream dark:hover:bg-navy-700 transition-colors`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-navy dark:text-cream">
                                    {item.title}
                                  </span>
                                  <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${colors.bg} ${colors.text}`}>
                                    {getCaseStatusLabel(item.caseStatus)}
                                  </span>
                                </div>
                                <span className="text-xs text-navy/50 dark:text-cream/50">
                                  {getPushbackTypeLabel(item.type)}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
