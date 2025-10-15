import { DomFactory } from '../lib/dom/domFactory.js';
import { StateCoordinator } from '../lib/state/stateCoordinator.js';
import { MenuCatalog } from '../lib/business/menuCatalog.js';
import { FloatingActionButton } from '../lib/components/floatingActionButton.js';
import { MockMenu } from '../lib/components/mockMenu.js';
import { OverlayController } from '../lib/controllers/overlayController.js';
import { injectionGuard } from '../lib/util/injectionGuard.js';
import { getDocumentRoot, shouldBootstrap, buildOverlay } from '../lib/utils/appUtils.js';

class OverlayBootstrapper {
  constructor(documentRef) {
    if (!documentRef) throw new Error('OverlayBootstrapper requires a document reference.');
    this.documentRef = documentRef;
  }

  run() {
    const root = getDocumentRoot(this.documentRef);
    if (!shouldBootstrap(root, injectionGuard)) return;
    const { controller } = buildOverlay({
      documentRef: this.documentRef,
      DomFactory,
      StateCoordinator,
      MenuCatalog,
      FloatingActionButton,
      MockMenu,
      OverlayController,
    });
    controller.initialize();
    injectionGuard.markInitialised(root);
  }
}

/** Initialize the overlay on the current page. */
export default function bootstrap() {
  const bootstrapper = new OverlayBootstrapper(document);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => bootstrapper.run(), { once: true });
  } else {
    bootstrapper.run();
  }
}
