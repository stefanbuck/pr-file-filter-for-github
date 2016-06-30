import FileFilter from './file-filter';

if (window.location.pathname.match(/pull\/[0-9]+\/files$/)) {
  const filter = new FileFilter();
  filter.init();
}
