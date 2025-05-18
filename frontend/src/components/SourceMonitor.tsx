import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

const SourceMonitor = () => {
  return (
    <main>
      <MediaPlayer
        title="Sprite Fight"
        src="https://files.vidstack.io/sprite-fight/720p.mp4"
      >
        <MediaProvider />
        <DefaultVideoLayout
          thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
          icons={defaultLayoutIcons}
        />
      </MediaPlayer>
    </main>
  );
};

export default SourceMonitor;
