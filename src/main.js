import * as niivue from "../node_modules/@niivue/niivue/dist/index.js";
import { createOverlayControl } from "./ui.js";

let mainVolumeLoaded = false;
const statusEl = document.getElementById('status');
const overlaysContainer = document.getElementById('overlays-container');
let nv1;

function updateStatus(msg) {
  statusEl.textContent = msg;
}

async function addMainVolume(file) {
  if (!file) return;
  updateStatus(`Loading main volume...`);
  try {
    await nv1.loadFromFile(file);
    mainVolumeLoaded = true;
    nv1.setSliceType(nv1.sliceTypeRender);
    updateStatus("Main volume loaded");
  } catch (err) {
    console.error("Error loading main volume:", err);
    updateStatus("Error loading main volume.");
  }
}

async function addOverlayVolumes(files) {
  if (!files || files.length === 0) return;
  updateStatus("Loading overlay volumes...");

  // Load each overlay file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      await nv1.loadFromFile(file);
      // The newly added volume will be last in nv1.volumes array
      const idx = nv1.volumes.length - 1;
      const overlayVolume = nv1.volumes[idx];
      // Default overlay settings
      overlayVolume.colormap = 'red';
      overlayVolume.opacity = 0.5;
      addOverlayControl(idx, overlayVolume.colormap, overlayVolume.opacity);
    } catch (err) {
      console.error("Error loading overlay volume:", err);
      updateStatus("Error loading one of the overlay volumes.");
    }
  }

  if (mainVolumeLoaded) {
    nv1.setSliceType(nv1.sliceTypeRender);
    nv1.updateGLVolume();
    updateStatus("All overlay volumes loaded");
  } else {
    updateStatus("Overlays loaded. Awaiting main volume.");
  }
}

function openMainFileDialog() {
  let input = document.createElement('input');
  input.type = 'file';
  input.accept = "*";
  input.style.display = 'none';
  document.body.appendChild(input);
  input.onchange = function (event) {
    addMainVolume(event.target.files[0]);
    document.body.removeChild(input);
  }
  input.click();
}

function openOverlayFileDialog() {
  let input = document.createElement('input');
  input.type = 'file';
  input.accept = "*";
  input.style.display = 'none';
  input.multiple = true; // allow selecting multiple overlays at once
  document.body.appendChild(input);
  input.onchange = function (event) {
    addOverlayVolumes(event.target.files);
    document.body.removeChild(input);
  }
  input.click();
}

function addOverlayControl(volumeIndex, colormap, opacity) {
  const overlayControl = createOverlayControl(volumeIndex, colormap, opacity, (newColormap, newOpacity) => {
    nv1.volumes[volumeIndex].colormap = newColormap;
    nv1.volumes[volumeIndex].opacity = parseFloat(newOpacity);
    nv1.updateGLVolume();
  });
  overlaysContainer.appendChild(overlayControl);
}

export function initApp() {
  nv1 = new niivue.Niivue({
    logging: true,
    show3Dcrosshair: true,
    backColor: [0, 0, 0, 1]
  });

  nv1.attachTo("gl1");
  nv1.setSliceType(nv1.sliceTypeRender);

  // Buttons
  document.getElementById('openMainBtn').onclick = openMainFileDialog;
  document.getElementById('addOverlayBtn').onclick = openOverlayFileDialog;

  document.getElementById('view3D').addEventListener('click', () => {
    nv1.setSliceType(nv1.sliceTypeRender);
  });

  document.getElementById('viewAxial').addEventListener('click', () => {
    nv1.setSliceType(nv1.sliceTypeAxial);
  });

  document.getElementById('viewCoronal').addEventListener('click', () => {
    nv1.setSliceType(nv1.sliceTypeCoronal);
  });

  document.getElementById('viewSagittal').addEventListener('click', () => {
    nv1.setSliceType(nv1.sliceTypeSagittal);
  });

  document.getElementById('sliceDec').addEventListener('click', () => {
    if (nv1.sliceType !== nv1.sliceTypeRender) {
      let crossPos = nv1.crosshairPos();
      if (nv1.sliceType === nv1.sliceTypeAxial) {
        nv1.setSliceMM(nv1.sliceTypeAxial, crossPos[2] - 2);
      } else if (nv1.sliceType === nv1.sliceTypeCoronal) {
        nv1.setSliceMM(nv1.sliceTypeCoronal, crossPos[1] - 2);
      } else if (nv1.sliceType === nv1.sliceTypeSagittal) {
        nv1.setSliceMM(nv1.sliceTypeSagittal, crossPos[0] - 2);
      }
    }
  });

  document.getElementById('sliceInc').addEventListener('click', () => {
    if (nv1.sliceType !== nv1.sliceTypeRender) {
      let crossPos = nv1.crosshairPos();
      if (nv1.sliceType === nv1.sliceTypeAxial) {
        nv1.setSliceMM(nv1.sliceTypeAxial, crossPos[2] + 2);
      } else if (nv1.sliceType === nv1.sliceTypeCoronal) {
        nv1.setSliceMM(nv1.sliceTypeCoronal, crossPos[1] + 2);
      } else if (nv1.sliceType === nv1.sliceTypeSagittal) {
        nv1.setSliceMM(nv1.sliceTypeSagittal, crossPos[0] + 2);
      }
    }
  });
}
