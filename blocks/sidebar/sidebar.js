import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the sidebar
 * @param {Element} block The sidebar block element
 */
export default async function decorate(block) {
  block.textContent = '';

  // load sidebar fragment
  const fragment = await loadFragment('/sidebar');

  // decorate sidebar DOM
  const sidebar = fragment.querySelector(':scope > .section');
  while (sidebar.firstElementChild) {
    block.append(sidebar.firstElementChild);
  }

  const fragmentWrapper = block.querySelectorAll('.fragment-wrapper .section');
  [...fragmentWrapper].forEach((child) => {
    if (child.children.length >= 2) {
      const contentWrapper = document.createElement('div');
      contentWrapper.classList.add('content-wrapper');
      contentWrapper.append(child.lastElementChild);
      block.append(contentWrapper);
    }
  });
  const wrapperSection = block.querySelectorAll('.fragment-wrapper');
  [...wrapperSection].forEach((child) => {
    const sectionNumber = child.querySelectorAll('.section').length;
    if (sectionNumber > 1) {
      const section = document.createElement('div');
      section.classList.add('section-wrapper');
      section.append(child.lastElementChild);
      block.append(section);
    }
  });
}
