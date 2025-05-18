import { Timeline } from '@xzdarcy/react-timeline-editor';
import type { TimelineRow } from '@xzdarcy/react-timeline-editor';
import { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';

interface UploadedMedia {
  id: string;
  name: string;
  type: string;
  path: string;
  duration?: number;
}

interface TimelineControlProps {
  uploadedMedia: UploadedMedia[];
}

// Predefined set of visually distinct colors
const CLIP_COLORS = [
  '#FF5733', // Coral Red
  '#33FF57', // Neon Green
  '#3357FF', // Royal Blue
  '#FF33F6', // Hot Pink
  '#33FFF6', // Cyan
  '#F6FF33', // Yellow
  '#FF8C33', // Orange
  '#8C33FF', // Purple
  '#33FF8C', // Mint
  '#FF338C', // Rose
  '#338CFF', // Sky Blue
  '#8CFF33', // Lime
];

interface CustomTimelineRow extends TimelineRow {
  name: string;
  type: string;
  actions: Array<{
    id: string;
    name: string;
    start: number;
    end: number;
    type: string;
    color: string;
    effectId: string;
  }>;
}

const TimelineControl = ({ uploadedMedia }: TimelineControlProps) => {
  const [editorData, setEditorData] = useState<CustomTimelineRow[]>([
    {
      id: 'video1',
      name: 'Video Track 1',
      type: 'video',
      actions: []
    },
    {
      id: 'video2',
      name: 'Video Track 2',
      type: 'video',
      actions: []
    }
  ]);

  const [effects, setEffects] = useState<Record<string, any>>({});
  const [usedColors, setUsedColors] = useState<Set<string>>(new Set());

  // Function to get the next available color
  const getNextColor = () => {
    const availableColors = CLIP_COLORS.filter(color => !usedColors.has(color));
    if (availableColors.length === 0) {
      // If all colors are used, reset the used colors set
      setUsedColors(new Set());
      return CLIP_COLORS[0];
    }
    const color = availableColors[0];
    setUsedColors(prev => new Set([...prev, color]));
    return color;
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'media',
    drop: (item: { media: UploadedMedia }) => {
      const media = item.media;
      const newAction = {
        id: Date.now().toString(),
        name: media.name,
        start: 0, // Start at the beginning of the timeline
        end: media.duration || 10, // Use media duration or default to 10 seconds
        type: media.type,
        color: getNextColor(), // Get a unique color for this clip
        effectId: `effect_${Date.now()}`
      };

      // Add the effect
      setEffects(prev => ({
        ...prev,
        [newAction.effectId]: {
          id: newAction.effectId,
          name: media.name,
          type: media.type,
          path: media.path
        }
      }));

      // Add the action to the first track
      setEditorData(prev => {
        const newData = [...prev];
        if (newData[0] && Array.isArray(newData[0].actions)) {
          newData[0].actions = [...newData[0].actions, newAction];
        }
        return newData;
      });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }));

  const handleTimelineChange = (newData: TimelineRow[]) => {
    // Cast the data to our custom type since we know it matches our structure
    setEditorData(newData as CustomTimelineRow[]);
  };

  return (
    <div 
      ref={drop as any} 
      className={`w-full h-full bg-gray-900 p-4 ${isOver ? 'bg-gray-800' : ''}`}
    >
      <Timeline
        editorData={editorData}
        effects={effects}
        onChange={handleTimelineChange}
        scale={5}
        scaleWidth={65}
        startLeft={20}
        rowHeight={44}
        style={{
          backgroundColor: '#1a1a1a',
          color: '#ffffff'
        }}
      />
    </div>
  );
};

export default TimelineControl;