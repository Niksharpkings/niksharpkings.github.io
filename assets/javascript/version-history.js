const versionHistoryContainer = document.querySelector('.version-card-content');
const currentVersionElement = document.querySelector('[data-current-version]');

function createVersionEntry(entry) {
  const item = document.createElement('li');
  const strong = document.createElement('strong');
  const details = document.createElement('span');
  const label = typeof entry.label === 'string' ? entry.label.trim() : '';

  if (label.startsWith(`${entry.version} -`)) {
    strong.textContent = entry.version;
    details.textContent = label.slice(entry.version.length);
    item.append(strong, details);
    return item;
  }

  if (entry.version) {
    strong.textContent = entry.version;
    item.appendChild(strong);
  }

  details.textContent = label || ` - | ${entry.date} ${entry.time} | ${entry.notes}`;
  item.appendChild(details);
  return item;
}

async function loadVersionHistory() {
  if (!versionHistoryContainer) {
    return;
  }

  const historyPath = versionHistoryContainer.dataset.versionHistory;

  if (!historyPath) {
    versionHistoryContainer.textContent = 'Version history source is missing.';
    return;
  }

  try {
    const response = await fetch(historyPath, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Failed to load version history: ${response.status}`);
    }

    const versionHistory = await response.json();
    const versions = Array.isArray(versionHistory.versions) ? versionHistory.versions : [];
    const currentVersion = versionHistory.currentVersion || versions[0]?.version || 'Unknown version';

    if (currentVersionElement) {
      currentVersionElement.textContent = currentVersion;
    }

    if (!versions.length) {
      versionHistoryContainer.textContent = 'No version history entries were found.';
      return;
    }

    const list = document.createElement('ul');

    versions.forEach((entry) => {
      list.appendChild(createVersionEntry(entry));
    });

    versionHistoryContainer.replaceChildren(list);
  } catch (error) {
    console.error(error);
    if (currentVersionElement) {
      currentVersionElement.textContent = 'Unavailable';
    }
    versionHistoryContainer.textContent = 'Version history is unavailable right now.';
  }
}

loadVersionHistory();
