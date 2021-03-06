window.addEventListener('load', async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
    } catch (error) {
      console.log('dead');
    }
  }
});

const API_URL =
  'https://api.jsonbin.io/v3/b/62508786d20ace068f959826';
const KEY_MASTER_API =
  '$2b$10$Vk7WtdXZWVdBZZOg5xtZ7efgP2Vzcm7.0xFShfs68AoRlvxwyv1aW';

const App = {
  images: [],
  constraints: {
    video: true,
    audio: false,
  },
  selectedFilter: '',
  mediaStream: null,
  els: {
    galleryIcon: document.querySelector('.icon-gallery'),
    cameraIcon: document.querySelector('.icon-camera'),
    pages: document.querySelectorAll('section'),
    filters: document.querySelector('select'),
    captureBtn: document.getElementById('captureImage'),
    goToCameraBtn: document.getElementById('goToCamera'),
    content: document.querySelector('.content'),
    deleteImageIcon: document.querySelector('.icon-delete'),

    // camera
    cameraWrapper: document.querySelector('video'),

    //canvas
    canvasWrapper: document.querySelector('canvas'),
    galleryPage: document.querySelector('#gallery'),
    capturedImage: document.querySelector(
      '#captured-image img'
    ),
  },

  startStream() {
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia(this.constraints)
        .then((stream) => {
          this.mediaStream = stream;
          this.els.cameraWrapper.srcObject = stream;
        })
        .catch((err) => {
          console.log(err);
          this.startStream();
        });
    } else {
      console.log('Streaming not support on the device');
    }
  },

  stopStream(pageId) {
    if (pageId !== 'camera') {
      this.mediaStream
        .getTracks()
        .forEach((track) => track.stop());
    }
  },
  captureImage() {
    //canvas

    const canvasCTX =
      this.els.canvasWrapper.getContext('2d');

    canvasCTX.drawImage(
      this.els.cameraWrapper,
      0,
      0,
      this.els.canvasWrapper.width,
      this.els.canvasWrapper.height
    );
    let imageData = canvasCTX.getImageData(
      0,
      0,
      this.els.canvasWrapper.width,
      this.els.canvasWrapper.height
    );
    // 1 . select a filter
    // 2 : use Imagefilter here
    let filtered;
    if (this.selectedFilter !== '') {
      filtered =
        ImageFilters[this.selectedFilter](imageData);
    }

    // 3 check if use dont select any filter , show original image 
    //else if a filter was selected, take filtered image and show up

    //
    canvasCTX.putImageData(
      this.selectedFilter !== '' && filtered
        ? filtered
        : imageData,
      0,
      0
    );
    let data =
      this.els.canvasWrapper.toDataURL('image/png');
    App.images.push({
      id: this.images.length + 1,
      imgData: data,
    });
    this.els.capturedImage.setAttribute('src', data);

    App.setData();
  },
  renderAllImageOnGallery() {
    let output = this.images.map(
      (image) =>
        `
      <aside class="images">
            <span class="icon-delete" data-id=${image.id}>X</span>
            <img src="${image.imgData}"/>
          </aside>
      `
    );
    this.els.galleryPage.innerHTML = output.join('');

    const deleteIcons =
      document.querySelectorAll('.icon-delete');
    deleteIcons?.forEach((icon) => {
      icon.addEventListener('click', () => {
        const imageId = icon.dataset.id;
        const index = this.images.findIndex(
          (image) => image.id === imageId
        );
        this.images.splice(index, 1);
        App.setData();
        App.renderAllImageOnGallery();
      });
    });
  },
  handleEvents() {
    this.els.galleryIcon.addEventListener('click', () => {
      App.els.cameraIcon.classList.add('action');
      App.els.galleryIcon.classList.remove('action');
      App.els.pages.forEach((page) => {
        if (page.id === 'gallery') {
          App.els.content.classList.add('open-gallery');
          this.renderAllImageOnGallery();
        } else {
          page.classList.remove('active');
        }
        App.stopStream(page.id);
      });
    });

    this.els.cameraIcon.addEventListener('click', () => {
      App.els.galleryIcon.classList.add('action');
      App.els.cameraIcon.classList.remove('action');
      App.els.pages.forEach((page) => {
        if (page.id === 'camera') {
          page.classList.add('active');
          App.startStream();
        } else {
          App.els.content.classList.remove('open-gallery');

          page.classList.remove('active');
        }
        App.stopStream(page.id);
      });
    });

    this.els.captureBtn.addEventListener('click', () => {
      App.els.pages.forEach((page) => {
        if (page.id === 'captured-image') {
          page.classList.add('active');
          App.captureImage();
          App.stopStream(page.id);
        } else {
          page.classList.remove('active');
        }
      });
    });
    this.els.goToCameraBtn.addEventListener('click', () => {
      App.els.pages.forEach((page) => {
        if (page.id === 'camera') {
          page.classList.add('active');

          App.startStream();
        } else {
          page.classList.remove('active');
        }
      });
    });

    this.els.filters.addEventListener('click', () => {
      const options = document.querySelectorAll('option');
      App.selectedFilter =
        options[this.els.filters.selectedIndex].value;
    });

    this.els.filters.innerHTML = Object.keys(ImageFilters)
      .map((key) => {
        return `
        <option value=${key === 'utils' ? '' : key}>${
          key === 'utils' ? 'V??lj a redigering ' : key
        }</option>
      `;
      })
      .join('');
  },

  async fetchingData() {
    const imagesOnLocalStorage = JSON.parse(
      localStorage.getItem('images')
    );
    if (imagesOnLocalStorage) {
      App.images = imagesOnLocalStorage;
      App.renderAllImageOnGallery();
    }
    try {
      await fetch(API_URL, {
        headers: {
          'X-Master-Key': KEY_MASTER_API,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (imagesOnLocalStorage) {
            App.setData();
            return;
          }
          App.images = data.record.images;
          return;
        });
    } catch (error) {
      console.log(error);
    }
  },
  async setData() {
    if (App.images.length === 0) {
      localStorage.removeItem('images');
    } else {
      localStorage.setItem(
        'images',
        JSON.stringify(this.images)
      );
    }
    try {
      await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'X-Master-Key': KEY_MASTER_API,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({images: App.images}),
      });
    } catch (error) {
      console.log(error);
    }
  },
  init() {
    this.startStream();
    this.handleEvents();
    App.fetchingData();
    this.renderAllImageOnGallery();
  },
};

App.init();
