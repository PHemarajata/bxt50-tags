// Starts the app: the logic (unchanged from Claude Design) plus the screens in view.js.
import { AppLogic } from './logic.js';
import { view } from './view.js';
import CONFIG from '../config.js';

class App extends AppLogic {
  componentDidUpdate(prevProps, prevState) {
    super.componentDidUpdate(prevProps, prevState);
    // Start each new screen at the top (a tag result opened from low on the page used to open scrolled down).
    const S = this.state;
    if (prevState.screen !== S.screen || prevState.serial !== S.serial || prevState.role !== S.role) window.scrollTo(0, 0);
  }
  render() { return view(this.renderVals()); }
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App, CONFIG));
