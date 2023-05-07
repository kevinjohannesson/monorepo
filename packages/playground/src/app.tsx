import "./app.css";
import "gis-viewer/style/dist/index.css";
import { GisViewer } from "gis-viewer";

const App = () => {
  return (
    <div>
      <GisViewer id="default" />
    </div>
  );
};

export default App;
