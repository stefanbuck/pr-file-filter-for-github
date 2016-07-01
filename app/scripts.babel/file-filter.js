import minimatch from 'minimatch';
const fileNodeSelector = '[data-filterable-for="files-changed-filter-field"] .js-navigation-item';

export default class FileFilter {
  constructor() {
    this.files = [];
    this.searchInput = document.getElementById('files-changed-filter-field');
  }

  matches(files, filter) {
    if (filter === '') {
      return files;
    }

    if (!filter.includes('*')) {
      return files.filter(file => file.name.includes(filter));
    }

    if (!filter.endsWith('*')) {
      filter = filter + '*';
    }

    const matchConfig = {
      nocase: true,
      dot: true,
      matchBase: true
    };
    const matchedFiles = minimatch.match(this.files.map(file => file.name), filter, matchConfig);

    return files.filter(file => matchedFiles.includes(file.name));
  }

  showFiltered(filter) {
    this.files.forEach(file => {
      file.filterNode.style.display = 'none';
      file.listNode.style.display = 'none';
    });
    this.matches(this.files, filter).forEach(file => {
      file.filterNode.style.display = 'block';
      file.listNode.style.display = 'block';
    });
  }

  findParentNode(el) {
    if (!el) return;
    while ((el = el.parentElement) && !el.classList.contains('file'));
    return el;
  }

  handleInput(event) {
    const value = event.target.value;

    window.setTimeout(this.showFiltered.bind(this), 300, value);
  }

  collectFiles() {
    const fileNodes = document.querySelectorAll(fileNodeSelector);
    for (const node of fileNodes) {
      const name = node.querySelector('.description').textContent.trim().replace(/.../, '').replace(/\{ → /, '').replace(/\}/, '');
      const listNodeHeader = document.querySelector('#files [title$="' + name + '"]');

      this.files.push({
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
