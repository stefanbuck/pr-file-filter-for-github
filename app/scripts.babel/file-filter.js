import minimatch from 'minimatch';
import isGlob from 'is-glob';
const fileNodeSelector = '[data-filterable-for="files-changed-filter-field"] .js-navigation-item';

export default class FileFilter {
  constructor() {
    this.files = [];
    this.searchInput = document.getElementById('files-changed-filter-field');
    this.searchToggle = document.querySelector('.diffbar-item.toc-select .js-menu-target');
    this.searchValue = '';
    this.fileDropdown = document.querySelector('.diffbar-item.toc-select .js-navigation-container');
  }

  matches(files, filter) {
    if (filter === '') {
      return files;
    }

    if (!isGlob(filter)) {
      return files.map(file => ({
        ...file,
        show: file.name.toLowerCase().includes(filter.toLowerCase())
      }));
    }

    const matchConfig = {
      nocase: true,
      dot: true,
      matchBase: true
    };
    const matchedFiles = minimatch.match(this.files.map(file => file.name), filter, matchConfig);

    return files.map(file => ({
      ...file,
      show: matchedFiles.includes(file.name),
    }));
  }

  showFiltered() {
    let count = 0;
    this.matches(this.files, this.searchValue).forEach(file => {
      file.filterNode.style.display = file.show ? 'block' : 'none';
      file.listNode.style.display = file.show ? 'block' : 'none';

      if (file.show) {
        count++;
      }
    });

    if (this.searchValue !== '') {
      if (count === 0) {
        this.searchToggle.querySelector('strong').textContent = 'No files match "' + this.searchValue + '"';
      } else {
        this.searchToggle.querySelector('strong').textContent = count + ' files match "' + this.searchValue + '"';
      }
    } else {
      this.searchToggle.querySelector('strong').textContent = count + ' changed files';
    }
  }

  findParentNode(el) {
    if (!el) return;
    while ((el = el.parentElement) && !el.classList.contains('file'));
    return el;
  }

  handleSearchToggleClick() {
    this.searchInput.value = this.searchValue;
    this.showFiltered();
  }

  handleInput(event) {
    this.searchValue = event.target.value;

    window.setTimeout(this.showFiltered.bind(this), 250);
  }

  collectFiles() {
    const fileNodes = document.querySelectorAll(fileNodeSelector);
    for (const node of fileNodes) {
      let name = node.querySelector('.description').textContent.trim().replace(/.../, '').replace(/\{ → /, '').replace(/\}/, '');
      if (name.includes('→')) {
        name = name.replace(/(.*)→ /g, '');
      }
      const listNodeHeader = document.querySelector('#files [title$="' + name + '"]');

      this.files.push({
        name: listNodeHeader.getAttribute('title'),
        filterNode: node,
        listNode: this.findParentNode(listNodeHeader),
        show: true,
      });
    }
  }

  bindMutationObserver() {
    this.mutationObserver = new MutationObserver(this.showFiltered.bind(this));
    this.mutationObserver.observe(this.fileDropdown, {
      subtree: true,
      attributes: true,
      attributeFilter: ['style']
    });
  }

  bindEventListener() {
    this.searchInput.addEventListener('input', this.handleInput.bind(this));
    this.searchToggle.addEventListener('click', this.handleSearchToggleClick.bind(this));
  }

  init() {
    this.bindEventListener();
    this.bindMutationObserver();
    this.collectFiles();
  }
}
