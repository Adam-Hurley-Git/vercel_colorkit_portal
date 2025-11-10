// features/tasks-coloring/index.js

function isTasksChip(el) {
  return !!el && el.nodeType === 1 && el.matches?.('[data-eventid^="tasks."], [data-eventid^="tasks_"]');
}

function getTaskIdFromChip(el) {
  if (!el || !el.getAttribute) return null;

  const ev = el.getAttribute('data-eventid');
  if (ev && (ev.startsWith('tasks.') || ev.startsWith('tasks_'))) {
    return ev.slice(6);
  }

  const taskId = el.getAttribute('data-taskid');
  if (taskId) return taskId;

  let current = el;
  while (current && current !== document.body) {
    const parentEv = current.getAttribute?.('data-eventid');
    if (parentEv && (parentEv.startsWith('tasks.') || parentEv.startsWith('tasks_'))) {
      return parentEv.slice(6);
    }
    const parentTaskId = current.getAttribute?.('data-taskid');
    if (parentTaskId) return parentTaskId;
    current = current.parentNode;
  }

  return null;
}

function getPaintTarget(chip) {
  if (!chip) return null;

  const isInModal = chip.closest('[role="dialog"]');
  if (isInModal) return null;

  const taskButton = chip.querySelector?.('.GTG3wb') || chip.closest?.('.GTG3wb');
  if (taskButton && !taskButton.closest('[role="dialog"]')) {
    return taskButton;
  }

  if (chip.matches('[role="button"]')) {
    return chip;
  }

  const buttonElement = chip.querySelector?.('[role="button"]');
  if (buttonElement) {
    return buttonElement;
  }

  return chip;
}

function getGridRoot() {
  return document.querySelector('[role="grid"]') || document.body;
}

function findTaskElementOnCalendarGrid(taskId) {
  const taskElements = document.querySelectorAll(`[data-eventid="tasks.${taskId}"], [data-eventid="tasks_${taskId}"]`);
  for (const el of taskElements) {
    if (!el.closest('[role="dialog"]')) {
      return el;
    }
  }
  return null;
}

function findTaskButtonsByCharacteristics() {
  const taskButtons = [];
  const potentialTaskSelectors = ['[data-eventid*="task"]', '[data-taskid]', '.GTG3wb'];

  for (const selector of potentialTaskSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const el of elements) {
      if (!el.closest('[role="dialog"]') && getTaskIdFromChip(el)) {
        taskButtons.push(el);
      }
    }
  }
  return taskButtons;
}

function findTaskByContent(taskName, taskDate) {
  if (lastClickedTaskId && taskElementReferences.has(lastClickedTaskId)) {
    const storedElement = taskElementReferences.get(lastClickedTaskId);
    if (storedElement && document.contains(storedElement)) {
      return storedElement;
    }
  }

  const calendarTasks = document.querySelectorAll('[data-eventid^="tasks."]');
  for (const task of calendarTasks) {
    const taskText = task.textContent?.toLowerCase() || '';
    if (taskText.includes(taskName.toLowerCase())) {
      return task;
    }
  }

  return null;
}

function resolveTaskIdFromEventTarget(t) {
  let taskId = getTaskIdFromChip(t);
  if (taskId) return taskId;

  const chip = t?.closest?.('[data-eventid^="tasks."]');
  if (chip) {
    taskId = getTaskIdFromChip(chip);
    if (taskId) return taskId;
  }

  let current = t?.parentNode;
  while (current && current !== document.body) {
    taskId = getTaskIdFromChip(current);
    if (taskId) return taskId;
    current = current.parentNode;
  }

  return null;
}

const KEY = 'cf.taskColors';
let taskElementReferences = new Map();

// PERFORMANCE: In-memory cache to avoid constant storage reads
let taskToListMapCache = null;
let listColorsCache = null;
let manualColorsCache = null;
let cacheLastUpdated = 0;
const CACHE_LIFETIME = 30000; // 30 seconds
let cachedColorMap = null;
let colorMapLastLoaded = 0;
const COLOR_MAP_CACHE_TIME = 1000; // Cache for 1 second

function cleanupStaleReferences() {
  for (const [taskId, element] of taskElementReferences.entries()) {
    if (!element.isConnected) {
      taskElementReferences.delete(taskId);
    }
  }
}

async function loadMap() {
  const now = Date.now();
  if (cachedColorMap && now - colorMapLastLoaded < COLOR_MAP_CACHE_TIME) {
    return cachedColorMap;
  }

  return new Promise((res) =>
    chrome.storage.sync.get(KEY, (o) => {
      cachedColorMap = o[KEY] || {};
      colorMapLastLoaded = now;
      res(cachedColorMap);
    }),
  );
}

async function saveMap(map) {
  return new Promise((res) => chrome.storage.sync.set({ [KEY]: map }, res));
}

async function setTaskColor(taskId, color) {
  const map = await loadMap();
  map[taskId] = color;
  cachedColorMap = map; // Update cache immediately
  colorMapLastLoaded = Date.now(); // Refresh cache timestamp
  await saveMap(map);
  return map;
}

async function clearTaskColor(taskId) {
  const map = await loadMap();
  delete map[taskId];
  cachedColorMap = map; // Update cache immediately
  colorMapLastLoaded = Date.now(); // Refresh cache timestamp
  await saveMap(map);
  return map;
}

async function buildInlineTaskColorRow(initial) {
  const initialColor = initial || '#4285f4';

  // Check if shared utilities are available
  if (!window.cc3SharedUtils?.createCustomColorPicker) {
    console.warn('Custom color picker utilities not available, falling back to HTML5 picker');
    return buildFallbackColorRow(initialColor);
  }

  // Load inline colors from settings
  let inlineColors = null;
  try {
    if (window.cc3Storage) {
      const settings = await window.cc3Storage.getSettings();
      inlineColors = settings?.taskColoring?.inlineColors;
    }
  } catch (error) {
    console.warn('Could not load inline colors from settings:', error);
  }

  let currentColor = initialColor;

  // Create the custom color picker with modal-specific configuration
  const colorPicker = window.cc3SharedUtils.createCustomColorPicker({
    initialColor: currentColor,
    openDirection: 'up', // Open upward in modals
    position: 'modal', // Modal positioning mode
    enableTabs: true,
    inlineColors: inlineColors, // Pass inline colors from settings
    onColorChange: (color) => {
      currentColor = color;
    },
    onApply: () => {
      // This will be handled by the modal Apply button
    },
    onClear: () => {
      // This will be handled by the modal Clear button
    },
  });

  // Create Apply and Clear buttons for the modal UI
  const applyBtn = document.createElement('button');
  applyBtn.textContent = 'Apply';
  applyBtn.style.cssText = `
    padding: 6px 16px;
    border: none;
    border-radius: 4px;
    background: #1a73e8;
    color: white;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    margin-left: 8px;
  `;

  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear';
  clearBtn.style.cssText = `
    padding: 6px 16px;
    border: 1px solid #dadce0;
    border-radius: 4px;
    background: #f8f9fa;
    color: #3c4043;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    margin-left: 8px;
  `;

  // Add click event prevention to stop bubbling
  [applyBtn, clearBtn].forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
    });
  });

  // Return API that matches the original interface
  return {
    colorPicker,
    colorInput: {
      get value() {
        return colorPicker.getColor();
      },
      set value(color) {
        colorPicker.setColor(color);
      },
      addEventListener: (event, handler) => {
        if (event === 'change') {
          // Store the handler to call when apply is clicked
          applyBtn._changeHandler = handler;
        }
      },
      dispatchEvent: (event) => {
        if (event.type === 'change' && applyBtn._changeHandler) {
          applyBtn._changeHandler(event);
        }
      },
    },
    applyBtn,
    clearBtn,
    presetContainer: null, // Not needed with custom picker
  };
}

// Fallback to HTML5 color picker if custom picker is not available
async function buildFallbackColorRow(initial) {
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.value = initial || '#4285f4';
  colorInput.style.cssText = `
    width: 37px;
    height: 37px;
    border: 2px solid #dadce0;
    border-radius: 50%;
    cursor: pointer;
    margin-right: 8px;
    transition: all 0.2s ease;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    padding: 0;
    background: none;
  `;

  // Add hover effect
  colorInput.onmouseover = () => {
    colorInput.style.borderColor = '#1a73e8';
    colorInput.style.transform = 'scale(1.05)';
  };
  colorInput.onmouseout = () => {
    colorInput.style.borderColor = '#dadce0';
    colorInput.style.transform = 'scale(1)';
  };

  const applyBtn = document.createElement('button');
  applyBtn.textContent = 'Apply';
  applyBtn.style.cssText = `
    padding: 4px 8px;
    border: 1px solid #dadce0;
    border-radius: 4px;
    background: #fff;
    color: #3c4043;
    cursor: pointer;
    font-size: 11px;
    margin-right: 6px;
    min-width: 50px;
    height: 24px;
  `;

  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear';
  clearBtn.style.cssText = `
    padding: 4px 8px;
    border: 1px solid #dadce0;
    border-radius: 4px;
    background: #f8f9fa;
    color: #3c4043;
    cursor: pointer;
    font-size: 11px;
    min-width: 50px;
    height: 24px;
  `;

  return { colorInput, applyBtn, clearBtn, presetContainer: null };
}

async function paintTaskImmediately(taskId, color) {
  if (!taskId) return;

  // If no color provided, check cache for list default color
  let finalColor = color;
  if (!finalColor) {
    const cache = await refreshColorCache();
    const listId = cache.taskToListMap[taskId];
    if (listId && cache.listColors[listId]) {
      finalColor = cache.listColors[listId];
    }
  }

  // Single optimized selector that combines all patterns for maximum speed
  const combinedSelector = `[data-eventid="tasks.${taskId}"], [data-eventid="tasks_${taskId}"], [data-taskid="${taskId}"]`;
  const allTaskElements = document.querySelectorAll(combinedSelector);

  // Get modal element once for faster checks
  const modalElement = document.querySelector('[role="dialog"]');

  // Batch paint all elements for maximum performance
  let paintedCount = 0;
  for (const taskElement of allTaskElements) {
    // Fast modal check - skip if element is inside the cached modal
    if (modalElement && modalElement.contains(taskElement)) {
      continue;
    }

    const target = getPaintTarget(taskElement);
    if (target) {
      if (finalColor) {
        // Apply the new color (skip clearPaint for speed since applyPaint overwrites)
        applyPaint(target, finalColor);
      } else {
        // Clear the color (no manual color and no list default)
        clearPaint(target);
      }

      // Update task reference for future repaints
      if (!taskElementReferences.has(taskId)) {
        taskElementReferences.set(taskId, taskElement);
      }
      paintedCount++;
    }
  }

  // Immediate secondary paint check (no delay) for missed elements
  doRepaint(true); // Instant bypass of throttling
}

async function injectTaskColorControls(dialogEl, taskId, onChanged) {
  if (!dialogEl || !taskId) return;

  // Don't inject for temporary or new task IDs - only for existing tasks
  if (taskId.startsWith('test-task-') || taskId.startsWith('temp-') || taskId.startsWith('new-task-')) {
    // Skip injection for temporary/new task IDs
    return;
  }

  const existingColorPicker = dialogEl.querySelector('.cf-task-color-inline-row');
  if (existingColorPicker) return;

  // Require actual task elements with real task IDs for injection
  const hasExistingTaskElements = dialogEl.querySelector('[data-eventid^="tasks."], [data-taskid]');

  // Only inject if we have evidence this is an existing task modal
  if (!hasExistingTaskElements) {
    // No existing task elements found - appears to be create new event modal, skip injection
    return;
  }

  const map = await loadMap();
  const initialColor = map[taskId] || '#4285f4';
  const { colorPicker, colorInput, applyBtn, clearBtn, presetContainer } = await buildInlineTaskColorRow(initialColor);

  // Immediately show the current task color in the calendar when modal opens
  if (map[taskId]) {
    // Use non-blocking immediate paint for instant modal response
    paintTaskImmediately(taskId, map[taskId]); // Remove await for faster modal opening
  }

  applyBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const selectedColor = colorPicker ? colorPicker.getColor() : colorInput.value;
    await setTaskColor(taskId, selectedColor);
    onChanged?.(taskId, selectedColor);

    // Immediately paint all instances of this task with reliable identification
    await paintTaskImmediately(taskId, selectedColor);

    // Also trigger immediate repaint system for additional coverage
    repaintSoon(true);
  });

  clearBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    e.preventDefault();

    await clearTaskColor(taskId);
    onChanged?.(taskId, null);

    // Reset color picker or input to default
    if (colorPicker) {
      colorPicker.setColor('#4285f4');
    } else {
      colorInput.value = '#4285f4';
    }

    // Immediately clear all instances of this task with reliable identification
    await paintTaskImmediately(taskId, null);

    // Also trigger immediate repaint system for additional coverage
    repaintSoon(true);
  });

  const colorRow = document.createElement('div');
  colorRow.className = 'cf-task-color-inline-row';
  colorRow.style.cssText = `
    display: flex !important;
    align-items: center !important;
    padding: 8px 12px !important;
    border: 1px solid #dadce0 !important;
    border-radius: 8px !important;
    background: #ffffff !important;
    margin: 8px 0 !important;
    font-family: 'Google Sans', Roboto, Arial, sans-serif !important;
    font-size: 11px !important;
    min-height: 40px !important;
    width: 100% !important;
    box-sizing: border-box !important;
    flex-wrap: nowrap !important;
    gap: 8px !important;
  `;

  // Add custom color picker or fallback input
  if (colorPicker) {
    colorRow.appendChild(colorPicker.container);
  } else {
    colorRow.appendChild(colorInput);
    if (presetContainer) {
      colorRow.appendChild(presetContainer);
    }
  }

  // Add both Apply and Clear buttons back to the modal
  colorRow.appendChild(applyBtn);
  colorRow.appendChild(clearBtn);

  // Always place within the modal content area, never outside
  const modalContent = dialogEl.querySelector('[role="document"]') || dialogEl;

  // Look for a good insertion point within the modal, prioritizing bottom placement
  const footerArea = modalContent.querySelector('div.HcF6Td');
  if (footerArea) {
    // Insert at the beginning of the footer area to keep it inside
    footerArea.insertBefore(colorRow, footerArea.firstChild);
  } else {
    // Find any container with buttons and insert there
    const allDivs = modalContent.querySelectorAll('div');
    let buttonContainer = null;
    for (const div of allDivs) {
      if (div.querySelector('button')) {
        buttonContainer = div;
        break;
      }
    }

    if (buttonContainer) {
      buttonContainer.appendChild(colorRow);
    } else {
      // Final fallback: create a wrapper div and append to modal content
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'padding: 8px; border-top: 1px solid #dadce0; margin-top: 16px;';
      wrapper.appendChild(colorRow);
      modalContent.appendChild(wrapper);
    }
  }
}

const MARK = 'cf-task-colored';
let repaintQueued = false;
let lastClickedTaskId = null;
let lastRepaintTime = 0;
let repaintCount = 0;

function parseCssColorToRGB(hex) {
  if (!hex) return { r: 66, g: 133, b: 244 }; // fallback G blue
  let h = hex.replace('#', '');
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function pickContrastingText(hex) {
  const { r, g, b } = parseCssColorToRGB(hex);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.6 ? '#111' : '#fff';
}

function clearPaint(node) {
  if (!node) return;

  // Simply remove all our custom styles
  node.style.removeProperty('background-color');
  node.style.removeProperty('border-color');
  node.style.removeProperty('color');

  // Remove text color overrides from all text elements
  node.querySelectorAll?.('span, div, p, h1, h2, h3, h4, h5, h6').forEach((textEl) => {
    textEl.style.removeProperty('color');
  });

  // Remove color overrides from SVG icons
  node.querySelectorAll?.('svg').forEach((svg) => {
    svg.style.removeProperty('color');
    svg.style.removeProperty('fill');
  });

  // Remove the marking class
  node.classList.remove(MARK);
}

function applyPaint(node, color) {
  if (!node) return;

  node.classList.add(MARK);
  const text = pickContrastingText(color);

  // Batch all style changes for better performance
  node.style.cssText += `
    background-color: ${color} !important;
    border-color: ${color} !important;
    color: ${text} !important;
  `;

  // Apply text color to all text elements within the task (cached selectors)
  const textElements = node.querySelectorAll('span, div, p, h1, h2, h3, h4, h5, h6');
  for (const textEl of textElements) {
    textEl.style.setProperty('color', text, 'important');
  }

  // Apply color to SVG icons (cached selectors)
  const svgElements = node.querySelectorAll('svg');
  for (const svg of svgElements) {
    svg.style.cssText += `color: ${text} !important; fill: ${text} !important;`;
  }
}

function applyPaintIfNeeded(node, color) {
  if (!node) return;

  // Check if already painted with this color (normalize color comparison)
  const currentBg = node.style.backgroundColor;
  const targetColor = color.toLowerCase();

  // Convert rgb() to hex for comparison if needed
  let normalizedCurrentBg = currentBg;
  if (currentBg && currentBg.startsWith('rgb')) {
    // Simple rgb to hex conversion for comparison
    const rgbMatch = currentBg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      normalizedCurrentBg = `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
    }
  }

  if (node.classList.contains(MARK) && (normalizedCurrentBg === targetColor || currentBg === targetColor)) {
    return; // Already correct color, skip
  }

  // Clear and apply new color
  clearPaint(node);
  applyPaint(node, color);
}

/**
 * PERFORMANCE: Load all color/mapping data into memory cache
 * Reduces storage reads from ~33/sec to ~1/30sec
 */
async function refreshColorCache() {
  const now = Date.now();

  // Return cached data if still fresh
  if (taskToListMapCache && now - cacheLastUpdated < CACHE_LIFETIME) {
    return {
      taskToListMap: taskToListMapCache,
      listColors: listColorsCache,
      manualColors: manualColorsCache,
    };
  }

  // Fetch all data in parallel
  const [localData, syncData] = await Promise.all([
    chrome.storage.local.get('cf.taskToListMap'),
    chrome.storage.sync.get(['cf.taskColors', 'cf.taskListColors']),
  ]);

  // Update cache
  taskToListMapCache = localData['cf.taskToListMap'] || {};
  manualColorsCache = syncData['cf.taskColors'] || {};
  listColorsCache = syncData['cf.taskListColors'] || {};
  cacheLastUpdated = now;

  return {
    taskToListMap: taskToListMapCache,
    listColors: listColorsCache,
    manualColors: manualColorsCache,
  };
}

/**
 * Invalidate cache when storage changes (called by storage listeners)
 */
function invalidateColorCache() {
  cacheLastUpdated = 0;
  taskToListMapCache = null;
  listColorsCache = null;
  manualColorsCache = null;
}

/**
 * Check if task is in the cache (taskToListMap)
 * OPTIMIZED: Uses in-memory cache instead of storage read
 * @param {string} taskId - Task ID
 * @returns {Promise<boolean>} True if task is in cache
 */
async function isTaskInCache(taskId) {
  const cache = await refreshColorCache();
  return cache.taskToListMap.hasOwnProperty(taskId);
}

/**
 * Get the appropriate color for a task
 * OPTIMIZED: Uses in-memory cache instead of storage reads
 * Priority: manual color > list default color > null
 * @param {string} taskId - Task ID
 * @param {Object} manualColorsMap - Map of manual task colors (DEPRECATED, uses cache now)
 * @returns {Promise<string|null>} Color hex string or null
 */
async function getColorForTask(taskId, manualColorsMap) {
  // Load cache once for all tasks
  const cache = await refreshColorCache();

  // Priority 1: Check for manual color
  if (cache.manualColors[taskId]) {
    return cache.manualColors[taskId];
  }

  // Priority 2: Check for list default color
  const listId = cache.taskToListMap[taskId];
  if (listId && cache.listColors[listId]) {
    return cache.listColors[listId];
  }

  return null;
}

// Retry mechanism for waiting until tasks are actually in the DOM
let repaintRetryCount = 0;
const MAX_REPAINT_RETRIES = 20; // Try up to 20 times
const REPAINT_RETRY_DELAY = 200; // Wait 200ms between retries

// PERFORMANCE: Prevent instant lookup spam
const pendingLookups = new Set();
const lookupDebounceTimers = new Map();
const LOOKUP_DEBOUNCE = 500; // Wait 500ms before triggering API

// Handle new task creation - instant API call for list default color
async function handleNewTaskCreated(taskId, element) {
  // Store reference immediately
  taskElementReferences.set(taskId, element);

  // PERFORMANCE: Debounce rapid lookups (e.g., user creates 5 tasks in 2 seconds)
  if (pendingLookups.has(taskId)) {
    return; // Skip duplicate lookups
  }

  // Mark as pending
  pendingLookups.add(taskId);

  // Clear existing timer for this task
  if (lookupDebounceTimers.has(taskId)) {
    clearTimeout(lookupDebounceTimers.get(taskId));
  }

  // Debounce: wait 500ms before triggering API (in case user creates multiple tasks rapidly)
  lookupDebounceTimers.set(
    taskId,
    setTimeout(async () => {
      lookupDebounceTimers.delete(taskId);

      // Check if list coloring is enabled
      const settings = await window.cc3Storage?.getSettings?.();
      if (!settings?.taskListColoring?.enabled) {
        pendingLookups.delete(taskId);
        return; // Feature disabled
      }

      // Send message to background script for instant API call
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'NEW_TASK_DETECTED',
          taskId: taskId,
        });

        if (response?.success && response.color) {
          // Apply color immediately
          paintTaskImmediately(taskId, response.color);

          // Invalidate cache so next repaint picks up the new task
          invalidateColorCache();
        }
      } catch (error) {
        console.error('[Task List Colors] Error applying instant color:', error);
      } finally {
        pendingLookups.delete(taskId);
      }
    }, LOOKUP_DEBOUNCE),
  );
}

async function doRepaint(bypassThrottling = false) {
  const now = Date.now();
  repaintCount++;

  // Check if task coloring features are enabled
  let quickPickColoringEnabled = true;
  let taskListColoringEnabled = false;
  try {
    const settings = await window.cc3Storage?.getSettings?.();
    quickPickColoringEnabled = settings?.taskColoring?.enabled !== false; // Default to true if not set
    taskListColoringEnabled = settings?.taskListColoring?.enabled === true;
  } catch (e) {}

  // Early exit if both quick pick coloring and task list coloring are disabled
  if (!quickPickColoringEnabled && !taskListColoringEnabled) {
    return;
  }

  // Apply throttling only if not bypassing
  if (!bypassThrottling) {
    // Reduced throttling during navigation for faster response
    const minInterval = repaintCount > 5 ? 100 : 25; // Faster for first few repaints
    if (now - lastRepaintTime < minInterval) return;
    if (repaintCount > 15) return; // Allow more repaints during navigation
  }

  lastRepaintTime = now;

  cleanupStaleReferences();
  const map = await loadMap();

  // Early exit if no colors to apply (neither manual nor list defaults)
  if (Object.keys(map).length === 0 && !taskListColoringEnabled) {
    return;
  }

  const processedTaskIds = new Set();

  // First: Process stored element references (fast path)
  for (const [taskId, element] of taskElementReferences.entries()) {
    if (element.isConnected) {
      const color = await getColorForTask(taskId, map);
      if (color) {
        const target = getPaintTarget(element);
        if (target) {
          applyPaintIfNeeded(target, color);
          processedTaskIds.add(taskId);
        }
      }
    }
  }

  // Second: Search for ALL tasks on the page (including new ones after navigation)
  const calendarTasks = document.querySelectorAll('[data-eventid^="tasks."], [data-eventid^="tasks_"], [data-taskid]');

  let skippedModalCount = 0;
  let processedCount = 0;
  let noIdCount = 0;
  let noColorCount = 0;

  for (const chip of calendarTasks) {
    // Skip if in modal
    if (chip.closest('[role="dialog"]')) {
      skippedModalCount++;
      continue;
    }

    const id = getTaskIdFromChip(chip);

    if (id) {
      // Check for any color (manual or list default)
      const color = await getColorForTask(id, map);

      if (color) {
        processedCount++;
        // Always process tasks that have colors (manual or list default)
        const target = getPaintTarget(chip);
        if (target) {
          applyPaintIfNeeded(target, color);
          processedTaskIds.add(id);

          // Store reference for future fast access
          if (!taskElementReferences.has(id)) {
            taskElementReferences.set(id, chip);
          }
        }
      } else {
        // NO COLOR FOUND - Check if this is an unknown task (not in cache)
        // If task is not in cache and list coloring is enabled, trigger instant API lookup
        if (taskListColoringEnabled && !taskElementReferences.has(id)) {
          // Check if task is in the cache before triggering API
          const inCache = await isTaskInCache(id);
          if (!inCache) {
            // Mark as tracked to avoid duplicate lookups
            taskElementReferences.set(id, chip);

            // Trigger instant API call in background (non-blocking)
            handleNewTaskCreated(id, chip);
          } else {
            // Task in cache but no list color assigned - mark as tracked
            taskElementReferences.set(id, chip);
          }
        }
        noColorCount++;
      }
    } else {
      noIdCount++;
    }
  }

  // RETRY MECHANISM: If we found 0 tasks but list coloring is enabled, keep retrying
  // This handles the case where Google Calendar hasn't rendered tasks yet
  if (calendarTasks.length === 0 && taskListColoringEnabled && repaintRetryCount < MAX_REPAINT_RETRIES) {
    repaintRetryCount++;
    setTimeout(() => {
      doRepaint(true); // Retry with bypass throttling
    }, REPAINT_RETRY_DELAY);
    return; // Exit early, retry will handle the rest
  }

  // Reset retry count when tasks are found
  if (calendarTasks.length > 0) {
    repaintRetryCount = 0;
  }

  // Third: Fallback search for any task IDs we haven't found yet
  const unprocessedTaskIds = Object.keys(map).filter((id) => !processedTaskIds.has(id));
  if (unprocessedTaskIds.length > 0) {
    // More targeted search - only look for specific task IDs we need
    for (const taskId of unprocessedTaskIds) {
      const taskElements = document.querySelectorAll(
        `[data-eventid="tasks.${taskId}"], [data-eventid="tasks_${taskId}"], [data-taskid="${taskId}"]`,
      );

      for (const element of taskElements) {
        if (!element.closest('[role="dialog"]')) {
          const target = getPaintTarget(element);
          if (target) {
            applyPaintIfNeeded(target, map[taskId]);
            taskElementReferences.set(taskId, element);
            break; // Found and painted this task, move to next
          }
        }
      }
    }
  }

  setTimeout(() => {
    repaintCount = 0;
  }, 1000);
}

function repaintSoon(immediate = false) {
  if (repaintQueued && !immediate) return;
  repaintQueued = true;

  if (immediate) {
    // Ultra-fast immediate repaint - no setTimeout, direct execution
    doRepaint(true).then(() => {
      repaintQueued = false;
    });
  } else {
    // Regular frame-based repaint with normal throttling
    requestAnimationFrame(async () => {
      await doRepaint(false);
      repaintQueued = false;
    });
  }
}

function initTasksColoring() {
  // Listen for storage changes to update modal colors in real-time
  if (window.cc3Storage?.onSettingsChanged) {
    window.cc3Storage.onSettingsChanged((newSettings) => {
      // Refresh any open modal color controls
      const openDialog = document.querySelector('[role="dialog"]');
      if (openDialog && openDialog.querySelector('.cf-task-color-inline-row')) {
        const colorRow = openDialog.querySelector('.cf-task-color-inline-row');
        const taskId = window.cfTasksColoring?.getLastClickedTaskId?.();
        if (colorRow && taskId) {
          // Remove old color row and inject updated one with latest colors
          colorRow.remove();
          setTimeout(async () => {
            try {
              await injectTaskColorControls(openDialog, taskId);
            } catch (e) {
              console.error('Error refreshing modal color controls:', e);
            }
          }, 50);
        }
      }
    });
  }

  document.addEventListener(
    'click',
    (e) => {
      const id = resolveTaskIdFromEventTarget(e.target);
      if (id) {
        lastClickedTaskId = id;
        const taskElement = e.target.closest('[data-eventid^="tasks."]') || e.target;
        if (taskElement && !taskElement.closest('[role="dialog"]')) {
          taskElementReferences.set(id, taskElement);
        } else {
          const calendarTaskElement = findTaskElementOnCalendarGrid(id);
          if (calendarTaskElement) {
            taskElementReferences.set(id, calendarTaskElement);
          }
        }
      }
    },
    true,
  );

  const grid = getGridRoot();
  let mutationTimeout;
  let isNavigating = false;
  let mutationCount = 0;

  const mo = new MutationObserver((mutations) => {
    mutationCount++;

    // Detect navigation vs small updates by mutation count and types
    const hasLargeMutation = mutations.some((m) => m.addedNodes.length > 5);
    const isLikelyNavigation = mutationCount > 3 || hasLargeMutation;

    if (isLikelyNavigation && !isNavigating) {
      // Fast response for navigation - immediate repaint
      isNavigating = true;

      // Clear stored references during navigation for fresh discovery
      taskElementReferences.clear();

      repaintSoon();

      // Additional repaints during navigation to catch late-loading elements
      setTimeout(repaintSoon, 10);
      setTimeout(repaintSoon, 50);
      setTimeout(repaintSoon, 150);

      // Reset navigation flag after mutations settle
      setTimeout(() => {
        isNavigating = false;
        mutationCount = 0;
      }, 500);
    } else if (!isNavigating) {
      // Normal debouncing for minor updates
      clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(repaintSoon, 50);
    }
  });
  mo.observe(grid, { childList: true, subtree: true });

  // Listen for URL changes (navigation events)
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      // URL changed - likely navigation, trigger immediate repaint
      repaintSoon();
      setTimeout(repaintSoon, 100);
      setTimeout(repaintSoon, 300);
    }
  });
  urlObserver.observe(document, { subtree: true, childList: true });

  // Also listen for popstate events (back/forward navigation)
  window.addEventListener('popstate', () => {
    repaintSoon();
    setTimeout(repaintSoon, 100);
  });

  // More frequent repaints to ensure colors appear
  setInterval(repaintSoon, 3000);

  // Initial paint immediately and again after a short delay
  repaintSoon();
  setTimeout(repaintSoon, 500);
  setTimeout(repaintSoon, 1500);

  // PERFORMANCE: Listen for storage changes to invalidate cache
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && (changes['cf.taskColors'] || changes['cf.taskListColors'])) {
      invalidateColorCache();
      repaintSoon(); // Repaint with new colors
    }
    if (area === 'local' && changes['cf.taskToListMap']) {
      invalidateColorCache();
      repaintSoon(); // Repaint with new mappings
    }
  });

  window.cfTasksColoring = {
    getLastClickedTaskId: () => lastClickedTaskId,
    repaint: repaintSoon,
    initTasksColoring: initTasksColoring,
    injectTaskColorControls: injectTaskColorControls,
    // Debug functions
    getColorMap: () => loadMap(),
    debugRepaint: () => {
      doRepaint();
    },
  };
}

// Register with feature system for proper settings integration
const taskColoringFeature = {
  id: 'taskColoring',
  init: async function (settings) {
    // Only initialize if enabled
    if (settings && settings.enabled) {
      initTasksColoring();
    } else {
      // Clear any existing task colors
      clearAllTaskColors();
    }
  },
  onSettingsChanged: function (settings) {
    if (settings && settings.enabled) {
      initTasksColoring();
      // Trigger immediate repaint to apply colors
      setTimeout(() => {
        if (window.cfTasksColoring && window.cfTasksColoring.repaint) {
          window.cfTasksColoring.repaint();
        }
      }, 100);
    } else {
      clearAllTaskColors();

      // Also stop any scheduled repaints
      repaintQueued = false;
    }
  },
  teardown: function () {
    clearAllTaskColors();
  },
};

// Function to paint all tasks with default Google blue color (when feature is turned off)
function clearAllTaskColors() {
  const defaultBlue = 'rgb(66, 133, 244)'; // Google Calendar default task color

  // Find all task elements and paint them blue
  const taskElements = document.querySelectorAll('[data-eventid^="tasks."], [data-eventid^="tasks_"], [data-taskid]');

  taskElements.forEach((taskEl) => {
    if (!taskEl.closest('[role="dialog"]')) {
      // Skip modal tasks
      const target = getPaintTarget(taskEl);
      if (target) {
        // Clear any existing custom paint first
        clearPaint(target);
        // Then apply the default blue color
        applyPaint(target, defaultBlue);
      }
    }
  });

  // Clear stored references since we're disabling custom colors
  taskElementReferences.clear();
}

// Register the feature if the registry is available
if (window.cc3Features) {
  window.cc3Features.register(taskColoringFeature);
} else {
  // Fallback: auto-initialize when the module loads if registry not available
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTasksColoring);
  } else {
    initTasksColoring();
  }
}
