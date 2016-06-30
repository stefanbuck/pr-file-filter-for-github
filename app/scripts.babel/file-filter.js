import minimatch from 'minimatch';
const fileNodeSelector = '[data-filterable-for="files-changed-filter-field"] .js-navigation-item';

export default class FileFilter {
  constructor() {
    this.fileNames = [];
    this.searchInput = document.getElementById('files-changed-filter-field');
  }

  showFiltered(filter) {
    this.fileNames.forEach(file => {
      if (minimatch(file.name, filter, { matchBase: true })) {
        file.filterNode.style.display = 'block';
        file.listNode.style.display = 'block';
      } else {
        file.filterNode.style.display = 'none';
        file.listNode.style.display = 'none';
      }
    });
  }

  findParentNode(el) {
    if (!el) return;
    while ((el = el.parentElement) && !el.classList.contains('file'));
    return el;
  }

  handleInput(event) {
    const value = event.target.value + '*';

    window.setTimeout(this.showFiltered.bind(this), 500, value);
  }

  collectFiles() {
    const fileNodes = document.querySelectorAll(fileNodeSelector);
    for (const node of fileNodes) {
      const name = node.querySelector('.description').textContent.trim().replace(/.../, '');
      const listNodeHeader = document.querySelector('#files [title$="' + name + '"]');

      this.fileNames.push({
        name: listNodeHeader.getAttribute('title'),
        filterNode: node,
        listNode: this.findParentNode(listNodeHeader),
      });
    }
  }

  bindEventListener() {
    this.searchInput.addEventListener('input', this.handleInput.bind(this));
  }

  init() {
    this.bindEventListener();
    this.collectFiles();
  }
}
