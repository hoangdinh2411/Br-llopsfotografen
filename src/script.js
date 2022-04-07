window.addEventListener('load', async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('../sw.js');
    } catch (error) {
      console.log(error);
    }
  }
});

const App = {
  capturedImages: [],
  prevPageActive: 'camera',
  els: {
    galleryIcon: document.querySelector('.icon-gallery'),
    cameraIcon: document.querySelector('.icon-camera'),
    pages: document.querySelectorAll('section'),
    captureBtn: document.getElementById('captureImage'),
    goToCameraBtn: document.getElementById('goToCamera'),
    content: document.querySelector('.content'),
    deleteImageIcon: document.querySelector('.icon-delete'),
  },

  init() {
    this.els.galleryIcon.addEventListener('click', () => {
      App.els.cameraIcon.classList.add('action');
      App.els.galleryIcon.classList.remove('action');
      App.els.pages.forEach((page) => {
        if (page.id === 'gallery') {
          App.els.content.classList.add('open-gallery');
        } else {
          page.classList.remove('active');
        }
      });
    });
    this.els.cameraIcon.addEventListener('click', () => {
      App.els.galleryIcon.classList.add('action');
      App.els.cameraIcon.classList.remove('action');
      App.els.pages.forEach((page) => {
        if (page.id === App.prevPageActive) {
          page.classList.add('active');
        } else {
          App.els.content.classList.remove('open-gallery');

          page.classList.remove('active');
        }
      });
    });

    this.els.captureBtn.addEventListener('click', () => {
      App.els.pages.forEach((page) => {
        if (page.id === 'captured-image') {
          page.classList.add('active');
          App.prevPageActive = page.id;
        } else {
          page.classList.remove('active');
        }
      });
    });
    this.els.goToCameraBtn.addEventListener('click', () => {
      App.els.pages.forEach((page) => {
        if (page.id === 'camera') {
          page.classList.add('active');
          App.prevPageActive = page.id;
        } else {
          page.classList.remove('active');
        }
      });
    });
  },
};

App.init();
