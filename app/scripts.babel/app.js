import FileFilter from './file-filter';
import injection from 'github-injection';

injection(window, function(err) {
  if (err) {
    throw err;
  }

  if (window.location.pathname.match(/pull\/[0-9]+\/files$/) || window.location.pathname.match(/pull\/[0-9]+\/commits\/[0-9a-z]+$/)) {
    const filter = new FileFilter();
    filter.init();
  }
});
