/** @param {Document} documentRef */
export const getDocumentRoot = (documentRef) => documentRef.documentElement;
/** @param {Document} documentRef */
export const getMountTarget = (documentRef) => documentRef.body || documentRef.documentElement;
/**
 * @param {Element} root
 * @param {{isInitialised:(root:Element)=>boolean}} guard
 */
export const shouldBootstrap = (root, guard) => Boolean(root) && !guard.isInitialised(root);

/**
 * Compose overlay building blocks.
 * @returns {{domFactory:any,stateCoordinator:any,menuCatalog:any,menuItems:any[],button:any,menu:any,controller:any}}
 */
export const buildOverlay = ({
  documentRef,
  DomFactory,
  StateCoordinator,
  MenuCatalog,
  FloatingActionButton,
  MockMenu,
  OverlayController,
}) => {
  const domFactory = new DomFactory(documentRef);
  const stateCoordinator = new StateCoordinator();
  const menuCatalog = new MenuCatalog();
  const menuItems = menuCatalog.loadItems();
  const button = new FloatingActionButton({ domFactory, stateCoordinator });
  const menu = new MockMenu({ domFactory, stateCoordinator, items: menuItems });
  const documentRoot = getMountTarget(documentRef);
  const controller = new OverlayController({ documentRoot, domFactory, button, menu });
  return { domFactory, stateCoordinator, menuCatalog, menuItems, button, menu, controller };
};
