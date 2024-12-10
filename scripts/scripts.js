/* eslint-disable no-unused-vars */
import {
  buildBlock,
  loadHeader,
  loadFooter,
  loadBlock,
  decorateBlock,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Builds a sidebar and appends to document.
 * @param {Element} main The container element
 */
function buildSidebar(main) {
  if (main.parentElement === null) {
    return;
  }
  const wrapper = document.createElement('div');
  wrapper.classList.add('main-wrapper');
  main.parentElement.insertBefore(wrapper, main);
  const sidebar = document.createElement('aside');
  wrapper.append(main, sidebar);
}

/**
 * Loads a block named 'sidebar' into aside
 * @param aside aside element
 * @returns {Promise}
 */
async function loadSidebar(aside) {
  if (aside) {
    const sidebarBlock = buildBlock('sidebar', '');
    aside.append(sidebarBlock);
    decorateBlock(sidebarBlock);
    return loadBlock(sidebarBlock);
  }
  return Promise.resolve();
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // buildHeroBlock(main);
    buildSidebar(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  // eslint-disable-next-line no-use-before-define
  decorateLinkedPictures(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadSidebar(doc.querySelector('aside'));
  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();

/**
 * Decorates linked pictures in a given block.
 * @param {HTMLElement} block - The block element containing the pictures.
 */
function decorateLinkedPictures(block) {
  block.querySelectorAll('picture + br + a').forEach((a) => {
    // remove br
    a.previousElementSibling.remove();
    const picture = a.previousElementSibling;
    a.textContent = '';
    a.append(picture);
  });
  block.querySelectorAll('p:has(picture + a)').forEach((p) => {
    const picture = p.querySelector('picture');
    const a = p.querySelector('a');
    a.textContent = '';
    a.append(picture);
  });
}
