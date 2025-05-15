import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import type { MosaicPath } from 'react-mosaic-component';

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

import './app.css';

const ELEMENT_MAP: { [viewId: string]: JSX.Element } = {
  promptBin: <div>Prompt Bin</div>,
  sourceMonitor: <div>Source Monitor</div>,
  timelineControl: <div>Timeline</div>,
  mediaBin: <div>Media Bin</div>,
  newView: <div>New View Content</div>,
};

const TITLE_MAP: { [viewId: string]: string } = {
  promptBin: "Prompt Bin",
  sourceMonitor: "Source Monitor",
  timelineControl: "Timeline",
  mediaBin: "Media Bin",
  newView: "New View",
};

const createNode = () => 'newView';

export const app = (
  <div id="app">
    <Mosaic<string>
      renderTile={(id, path) => (
        <MosaicWindow<string>
          path={path}
          title={TITLE_MAP[id] || "Unknown Window"}
          createNode={createNode}
        >
          {ELEMENT_MAP[id]}
        </MosaicWindow>
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
);