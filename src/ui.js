export function createOverlayControl(index, colormap, opacity, onChange) {
    const div = document.createElement('div');
    div.className = 'overlay-control';
  
    // Label for overlay
    const label = document.createElement('label');
    label.textContent = `Overlay ${index}`;
    div.appendChild(label);
  
    // Colormap select
    const colormapSelect = document.createElement('select');
    const colormaps = ['gray', 'red', 'blue', 'green', 'hot', 'cool', 'rainbow'];
    colormaps.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      if (c === colormap) opt.selected = true;
      colormapSelect.appendChild(opt);
    });
    div.appendChild(colormapSelect);
  
    // Opacity slider
    const opacitySlider = document.createElement('input');
    opacitySlider.type = 'range';
    opacitySlider.min = '0';
    opacitySlider.max = '1';
    opacitySlider.step = '0.05';
    opacitySlider.value = opacity;
    div.appendChild(opacitySlider);
  
    // Event listeners
    colormapSelect.addEventListener('change', () => {
      onChange(colormapSelect.value, opacitySlider.value);
    });
  
    opacitySlider.addEventListener('input', () => {
      onChange(colormapSelect.value, opacitySlider.value);
    });
  
    return div;
  }
  