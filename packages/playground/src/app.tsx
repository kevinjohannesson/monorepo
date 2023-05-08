import "./app.css";
import "gis-viewer/style/dist/index.css";
import { GisViewer } from "gis-viewer";

const App = () => {
  return (
    <div>
      <GisViewer
        id="default"
        initialCenterCoordinate={[568228.114364449, 6816936.078896927]}
        initialZoomLevel={5}
      />
    </div>
  );
};

export default App;
