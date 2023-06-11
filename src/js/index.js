import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '36887374-3bdcf63f0efd8aeff98ac00f8';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let currentQuery = '';


async function searchImages(query) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page: page,
      },
    });

    const { hits, totalHits } = response.data;

    if (hits.length === 0) {
      Notiflix.Notify.failure('Sorry, no images were found matching your query. Please try again.');
      return;
    }

    if (page === 1) {
      gallery.innerHTML = '';
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    hits.forEach((image) => {
      const { webformatURL, largeImageURL, tags, likes, views, comments, downloads } = image;

      const card = document.createElement('div');
      card.classList.add('photo-card');

      const imgLink = document.createElement('a');
      imgLink.href = largeImageURL;

      const img = document.createElement('img');
      img.src = webformatURL;
      img.alt = tags;
      img.loading = 'lazy';

      const info = document.createElement('div');
      info.classList.add('info');

      const likesElem = createInfoItem('Likes', likes);
      const viewsElem = createInfoItem('Views', views);
      const commentsElem = createInfoItem('Comment', comments);
      const downloadsElem = createInfoItem('Downloads', downloads);

      info.append(likesElem, viewsElem, commentsElem, downloadsElem);
      imgLink.append(img);
      card.append(imgLink, info);
      gallery.append(card);
    });

    page += 1;

    if (page > 1 && page <= Math.ceil(totalHits / 40)) {
      loadMoreBtn.style.display = 'block';
    } else {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.info('Sorry, you have reached the end of your search results.');
    }

    refreshLightbox();
    scrollToNextGroup();
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('An error occurred while searching for images. Please try again.');
  }
}


function createInfoItem(label, value) {
  const item = document.createElement('p');
  item.classList.add('info-item');
  item.innerHTML = `<b>${label}:</b> ${value}`;
  return item;
}


form.addEventListener('submit', (event) => {
  event.preventDefault();
  page = 1;
  currentQuery = form.searchQuery.value.trim();
  if (currentQuery !== '') {
    searchImages(currentQuery);
  }
});




loadMoreBtn.addEventListener('click', () => {
  searchImages(currentQuery);
});


function refreshLightbox() {
  const lightbox = new SimpleLightbox('.gallery a', {});
  lightbox.refresh();
}


function scrollToNextGroup() {
  const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
}

const clearInput = () => {
  const input = document.querySelector('.search-form input[type="text"]');
  input.value = '';
};
