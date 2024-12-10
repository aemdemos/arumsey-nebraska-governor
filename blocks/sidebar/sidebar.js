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
  const sections = fragment.querySelectorAll(':scope > .section');
  const [header, social, posts] = sections;

  header.classList.add('header');
  social.classList.add('social');
  posts.classList.add('posts');

  block.append(...sections);
}
