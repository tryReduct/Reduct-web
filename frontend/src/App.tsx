import { useState } from 'react';
import { Mosaic, MosaicWindow, MosaicContext } from 'react-mosaic-component';
import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import PromptBin from './components/PromptBin';
import MediaBin from './components/MediaBin';
import TimelineControl from './components/TimelineControl';
import SourceMonitor from './components/SourceMonitor';
import './app.css';

interface UploadedMedia {
  id: string;
  name: string;
  type: string;
  path: string;
  duration?: number;
}

const App = () => {
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);

  const handleMediaImport = (files: File[]) => {
    const newMedia = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      path: URL.createObjectURL(file),
      duration: file.type.startsWith('video/') ? 10 : undefined // Default duration for videos
    }));
    setUploadedMedia(prev => [...prev, ...newMedia]);
  };

  const ELEMENT_MAP: { [viewId: string]: JSX.Element } = {
    promptBin: <PromptBin />,
    // promptBin: <div>Prompt Bin</div>,
    // mediaBin: <div>Media Bin</div>,
    // sourceMonitor: <div>Source Monitor</div>,
    sourceMonitor: <SourceMonitor />,
    // timelineControl: <div>Timeline</div>,
    timelineControl: <TimelineControl uploadedMedia={uploadedMedia} />,
    mediaBin: <MediaBin onImport={handleMediaImport} />,
    newView: <div>New View Content</div>,
  };

  const TITLE_MAP: { [viewId: string]: string } = {
    promptBin: "Prompt Bin",
    sourceMonitor: "Source Monitor",
    timelineControl: "Timeline",
    mediaBin: "Media Bin",
    newView: "New View",
    videoExample: "Video Player Example",
  };

  const createNode = () => 'newView';

  return (
    <DndProvider backend={HTML5Backend}>
      <main>
        <div id="app">
          <Mosaic<string>
            renderTile={(id, path) => (
              <MosaicContext.Consumer>
                {({ mosaicActions }) => (
                  <MosaicWindow<string>
                    path={path}
                    title={TITLE_MAP[id] || "Unknown Window"}
                    createNode={createNode}
                    toolbarControls={[
                      <Button
                        key="expand"
                        icon={IconNames.MAXIMIZE}
                        minimal
                        title="Expand"
                        onClick={() => mosaicActions.expand(path)}
                      />,
                      <Button
                        key="close"
                        icon={IconNames.CROSS}
                        minimal
                        title="Close"
                        onClick={() => mosaicActions.remove(path)}
                      />
                    ]}
                  >
                    {ELEMENT_MAP[id]}
                  </MosaicWindow>
                )}
              </MosaicContext.Consumer>
            )}
            initialValue={{
              direction: 'row',
              first: {
                direction: 'column',
                first: {
                  direction: 'row',
                  first: 'mediaBin',
                  second: 'sourceMonitor',
                  splitPercentage: 50,
                },
                second: 'timelineControl',
                splitPercentage: 50,
              },
              second: 'promptBin',
              splitPercentage: 80,
            }}
          />
        </div>
      </main>
    </DndProvider>
  );
};

export default App;