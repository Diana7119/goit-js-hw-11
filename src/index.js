import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'simplelightbox/dist/simple-lightbox.min.js';

const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const guardEl = document.querySelector('.js-guard');

const BASE_URL =
  'https://pixabay.com/api/?image_type=photo&orientation=horizontal&safesearch=true&per_page=40';
const API_KEY = '37785786-64a8ca81d7f9f5d8dae241bba';
let pageNow = 1;
let query = '';
let hits = 0;
let totalHitsEl = 0;

const options = { root: null, rootMargin: '500px', threshold: 1.0 };
let observer = new IntersectionObserver(loadMore, options);

formEl.addEventListener('submit', hendleInput);




async function hendleInput(evt) {
  evt.preventDefault();
  try {
    query = evt.target.searchQuery.value;
    if (query === '') {
      throw new Error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    pageNow = 1;
    evt.target.searchQuery.value = '';
    const { data } = await axios.get(
      `${BASE_URL}&key=${API_KEY}&q=${query}&page=${pageNow}`
    );

    hits = data.hits.length;
    totalHitsEl = data.totalHits;

    if (data.hits.length === 0) {
      return Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    galleryEl.innerHTML = await createContent(data.hits);

    Notify.success(`Hooray! We found ${data.totalHits} images.`);

    new SimpleLightbox('.gallery a', { captionDelay: 250 });

    observer.observe(guardEl);
  } catch (err) {
    Notify.warning(err.message);
  }
}

function createContent(arr) {
  return arr
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card">
      <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" width="300px" />   <div class="info">
        <p class="info-item">
          <b>Likes</b><span>${likes}</span>
        </p>
        <p class="info-item">
          <b>Views</b><span>${views}</span>
        </p>
        <p class="info-item">
          <b>Comments</b><span>${comments}</span>
        </p>
        <p class="info-item">
          <b>Downloads</b><span>${downloads}</span>
        </p>
      </div></a>
   
    </div>`
    )
    .join('');
}



async function loadMore(entries) {
  try {
    if (hits >= totalHitsEl) {
      observer.unobserve(guardEl);
    }
    await entries.forEach(async entry => {
      if (entry.isIntersecting) {
        pageNow += 1;
        const { data } = await axios.get(
          `${BASE_URL}&key=${API_KEY}&q=${query}&page=${pageNow}`
        );

        hits += data.hits.length;

        galleryEl.insertAdjacentHTML('beforeend', createContent(data.hits));

        new SimpleLightbox('.gallery a', { captionDelay: 250 });
      }
    });
  } catch (err) {
    Notify.warning(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}