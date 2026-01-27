'use client';

import { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  parseISO,
  isValid
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
} from 'lucide-react';
import { 
  DndContext, 
  useDraggable, 
  useDroppable, 
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter
} from '@dnd-kit/core';
import { OrbitalLoader } from '@/components/ui/orbital-loader';
import Link from 'next/link';

interface ScheduledCampaign {
  id: string;
  name: string;
  status: string;
  campaign_content: {
    id: string;
    platform: string;
    scheduled_at: string | null;
    status: string;
  }[];
}

interface CalendarEvent {
  id: string;
  campaignId: string;
  title: string;
  date: Date;
  platform: string;
}

function DraggableEvent({ event, isOverlay = false }: { event: CalendarEvent, isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: event
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Platform colors
  const getPlatformColor = (p: string) => {
    switch (p.toLowerCase()) {
      case 'twitter': return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'linkedin': return 'bg-blue-600/20 text-blue-300 border-blue-600/30';
      default: return 'bg-coral-500/20 text-coral-300 border-coral-500/30';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        text-xs p-1.5 mb-1 rounded border cursor-grab active:cursor-grabbing truncate
        ${getPlatformColor(event.platform)}
        ${isDragging && !isOverlay ? 'opacity-30' : 'opacity-100'}
        ${isOverlay ? 'shadow-2xl scale-105 z-50 cursor-grabbing' : 'hover:brightness-110'}
        transition-all duration-200
      `}
    >
      <span className="font-semibold mr-1">
        {event.platform.substring(0, 1).toUpperCase()}
      </span>
      {event.title}
    </div>
  );
}

function DroppableDay({ date, children, isCurrentMonth, isToday }: { date: Date, children: React.ReactNode, isCurrentMonth: boolean, isToday: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: date.toISOString(),
    data: { date }
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[100px] p-2 border-r border-b border-gray-800 relative transition-colors duration-200
        ${!isCurrentMonth ? 'bg-gray-900/40 text-gray-600' : 'bg-transparent text-gray-300'}
        ${isToday ? 'bg-coral-900/10' : ''}
        ${isOver ? 'bg-coral-500/20 ring-inset ring-2 ring-coral-500/50' : ''}
      `}
    >
      <div className={`
        text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full
        ${isToday ? 'bg-coral-500 text-white' : ''}
      `}>
        {format(date, 'd')}
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [campaigns, setCampaigns] = useState<ScheduledCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    fetchScheduledCampaigns();
  }, []);

  async function fetchScheduledCampaigns() {
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns/scheduled');
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (e) {
      console.error("Failed to fetch campaigns", e);
    } finally {
      setLoading(false);
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveEvent(event.active.data.current as CalendarEvent);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const campaignId = (active.data.current as CalendarEvent).campaignId;
      const newDate = (over.data.current as any).date;
      
      if (!newDate) return;

      // Optimistically update
      const originalCampaigns = [...campaigns];
      setCampaigns(prev => prev.map(c => {
         if (c.id === campaignId) {
             // For simplicity, we update all content pieces of this campaign to the new date
             // preserving the time if possible, or defaulting to noon
             return {
                 ...c,
                 campaign_content: c.campaign_content.map(cc => {
                    // Update scheduled_at if it's the specific content being dragged
                    // OR if the active ID matches the content ID (which is what we used)
                    // Wait, we generate event IDs based on content ID
                    if (cc.id === active.id) {
                         const oldTime = cc.scheduled_at ? parseISO(cc.scheduled_at) : new Date();
                         // Keep time, change date
                         const newDateTime = new Date(newDate);
                         if (isValid(oldTime)) {
                            newDateTime.setHours(oldTime.getHours(), oldTime.getMinutes());
                         } else {
                            newDateTime.setHours(12, 0);
                         }
                         return { ...cc, scheduled_at: newDateTime.toISOString() };
                    }
                    return cc;
                 })
             };
         }
         return c;
      }));

      // Call API
      try {
        // Find the original content schedule time to get hours/minutes 
        // We do this inside the optimistic update logic above properly
        const draggedContent = activeEvent; // From start state
        // But we need the exact new ISO string we just calculated.
        
        // Let's recalculate simply here
        const newDateObj = new Date(newDate);
        if (draggedContent?.date && isValid(draggedContent.date)) {
             newDateObj.setHours(draggedContent.date.getHours(), draggedContent.date.getMinutes());
        } else {
             newDateObj.setHours(12, 0);
        }

        const res = await fetch(`/api/campaigns/${campaignId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scheduled_at: newDateObj.toISOString() // This updates the campaign... wait my API updates the campaign status and content
          })
        });

        if (!res.ok) throw new Error('Failed to update');
        
        // Refresh to confirm
        fetchScheduledCampaigns();

      } catch (e) {
        console.error("Update failed", e);
        // Revert
        setCampaigns(originalCampaigns);
      }
    }
    
    setActiveId(null);
    setActiveEvent(null);
  };

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const dateFormat = "d";
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map campaigns to events
  const events: CalendarEvent[] = campaigns.flatMap(c => 
     c.campaign_content
        .filter(cc => cc.scheduled_at)
        .map(cc => ({
            id: cc.id,
            campaignId: c.id,
            title: c.name,
            date: parseISO(cc.scheduled_at!),
            platform: cc.platform
        }))
  );

  const getEventsForDay = (date: Date) => {
    return events.filter(e => isSameDay(e.date, date));
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  return (
    <div className="bg-[#343a40] backdrop-blur-xl border-2 border-gray-700/50 rounded-3xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
         <div className="flex items-center gap-4">
             <div className="p-2 bg-coral-500/10 rounded-xl">
                 <CalendarIcon className="w-6 h-6 text-coral-500" />
             </div>
             <div>
                 <h2 className="text-xl font-bold text-white">Smart Schedule</h2>
                 <p className="text-gray-400 text-sm">Drag and drop to reschedule content</p>
             </div>
         </div>
         
         <div className="flex items-center gap-2">
            <button onClick={today} className="px-3 py-1.5 text-xs font-medium bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors mr-2">
                Today
            </button>
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
            <span className="text-lg font-semibold w-32 text-center">
                {format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
         </div>
      </div>

      <div className="p-0">
          {/* Week days header */}
          <div className="grid grid-cols-7 border-b border-gray-700/50 bg-gray-800/30">
              {weekDays.map(day => (
                  <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {day}
                  </div>
              ))}
          </div>

          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
              <div className="grid grid-cols-7 auto-rows-fr bg-[#2b2b2b]">
                  {loading ? (
                       <div className="col-span-7 h-96 flex items-center justify-center">
                           <OrbitalLoader className="h-10 w-10 text-coral-500" />
                       </div>
                  ) : (
                      days.map((day, i) => (
                          <DroppableDay 
                             key={day.toString()} 
                             date={day}
                             isCurrentMonth={isSameMonth(day, monthStart)}
                             isToday={isSameDay(day, new Date())}
                          >
                              {getEventsForDay(day).map(event => (
                                  <DraggableEvent key={event.id} event={event} />
                              ))}
                          </DroppableDay>
                      ))
                  )}
              </div>

              <DragOverlay>
                  {activeEvent ? (
                      <DraggableEvent event={activeEvent} isOverlay />
                  ) : null}
              </DragOverlay>
          </DndContext>
      </div>
    </div>
  );
}
