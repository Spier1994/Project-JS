import {
    SpotifyApi
} from "./api/api.js";
import {
    Player
} from "./player/player.js";
import {
    millisToMinutesAndSeconds,
    formatTime
} from './utils.js'

const clientId = 'f03d452f6b3647c38ab26ad5f8cc8629';
const secret = '8848ff822526499f9d0ba968f87807b3';

const track = document.getElementById('track');
const search = document.querySelector('.header__topbar_search-input');
const content = document.querySelector('.main__content');

const playButton = document.querySelector('.play_button');
const volumeButton = document.querySelector('.player_volume');
const progress = document.querySelector('.player_controls_playback-input');
const timeTrack = document.querySelector('.player_controls_playback-fullTime');
const currentTimeTrack = document.querySelector('.player_controls_playback-currentTime');
const nextButton = document.querySelector('.button_player.next');
const prevButton = document.querySelector('.button_player.prev');

const spotify = new SpotifyApi(clientId, secret);
const player = new Player();

/**
 * Функция создания карточки плейлиста
 * @param  {string} imgUrl - урл изображения
 * @param  {string} name - имя 
 * @param  {string} description 
 * @return {HTMLElement} - елемент карточки плейлиста
 */
function createCard(imgUrl, name, description) {
    const card = document.createElement('div');
    card.classList.add('card');

    const cardImage = document.createElement('img');
    cardImage.classList.add('card_image');
    cardImage.setAttribute('src', imgUrl);
    card.append(cardImage);

    const cardTitle = document.createElement('span');
    cardTitle.classList.add('card_title', 'ellipsis');
    cardTitle.textContent = name;
    card.append(cardTitle);

    const cardDescription = document.createElement('div');
    cardDescription.classList.add('card_description', 'ellipsis');
    cardDescription.textContent = description && description.slice(0, 55)
    card.append(cardDescription);

    return card;
}

/**
 * Функция добавления плейлиста
 * @param  {HTMLElement} el - элемент дом дерева
 * @param  {Array} items - массив данных плейлиста
 * @param  {string} playlistName - название плейлиста, по умолчанию пустая строка
 */
function addPlaylistElements(el, items, playlistName = '') {
    const playlist = document.createElement('div');
    playlist.classList.add('playlist');
    const title = document.createElement('h2');
    title.classList.add('title');
    title.textContent = playlistName;

    if (items.length) {
        items.slice(0, 8).forEach((item) => {
            const card = createCard(item.images[0].url, item.name, item.description);
            playlist.append(card);
        });
    } else {
        playlist.textContent = 'Ничего не найдено';
    }

    el.append(title);
    el.append(playlist);
}

/**
 * Функция добавления и отображения списка треков 
 * @param  {HTMLElement} el - элемент дом дерева
 * @param  {Array} items - масстив треков
 */
function addTracks(el, items) {
    const tracksElement = document.createElement('div');
    tracksElement.classList.add('tracks');
    const title = document.createElement('h2');
    title.classList.add('title');
    title.textContent = 'Найденные треки';

    if (!items.length) {
        tracksElement.textContent = 'Ничего не найдено';
    }

    items.forEach((item) => {
        const tracks = track.cloneNode(true);
        tracks.classList.add('tracks_item');
        if (item.preview_url) {
            tracks.querySelector('.tracks_item_info-play-image').setAttribute('src', item.album.images[0].url);
            tracks.querySelector('.tracks_item_info-album-name').textContent = item.name;
            tracks.querySelector('.tracks_item_info-album-artist').textContent = item.artists[0].name;
            tracks.querySelector('.tracks_item-ms').textContent = millisToMinutesAndSeconds(item.duration_ms);
            tracks.addEventListener('click', () => {
                player.track = item.name;
                addTrackInfo(item.album.images[0].url, item.name, item.artists[0].name);
                player.play();
                changeButton();
                eventsPlayer();
            })
            player.addTrack(item);
            tracksElement.append(tracks);
        }
    });

    el.append(title);
    el.append(tracksElement);
}
/**
 * Функция подгрузки контента на страницу
 */
function loadContent() {

    Promise.all([spotify.getFeaturedPlaylists(), spotify.getNewReleasesPlaylist()])
        .then(([featuredPlaylists, newReleasesPlaylist]) => {
            if (featuredPlaylists.status && newReleasesPlaylist.status) {
                addPlaylistElements(content, featuredPlaylists.data.playlists.items, featuredPlaylists.data.message);
                addPlaylistElements(content, newReleasesPlaylist.data.albums.items, 'Новые релизы');
            } else {
                content.textContent = featuredPlaylists.data.msg || newReleasesPlaylist.data.msg;
            }
        })
        .catch(error => content.textContent = error.data?.msg);
}

/**
 * Функция добавления и отображения информации по треку
 * @param  {string} img - ссылка на изображение
 * @param  {string} name - названия трека
 * @param  {string} artist - навзание исполнителя 
 */
function addTrackInfo(img, name, artist) {
    const player = document.querySelector('.player_info');
    player.querySelector('.player_info-img').setAttribute('src', img);
    player.querySelector('.player_info-album-name').textContent = name;
    player.querySelector('.player_info-album-artist').textContent = artist;
    timeTrack.textContent = '00:29';
}
/**
 * Функция добавления или удаление события на плеер
 */
function eventsPlayer() {
    if (player.audio.currentSrc) {
        player.audio.removeEventListener('timeupdate', updateSliderAndButtonPlay);
    }
    player.audio.addEventListener('timeupdate', updateSliderAndButtonPlay);
}
/**
 * Функция обновления состояния ползунка прогресса исполняемого трека и кнопки
 * @param  {Event} e - событие 
 */
function updateSliderAndButtonPlay(e) {

    const {
        duration,
        currentTime
    } = e.target;

    const progressPercent = (currentTime /duration) * 100;
    progress.setAttribute('value', progressPercent);
    currentTimeTrack.textContent = formatTime(currentTime % 60);

    if (player.audio.ended) {
        playButton.innerHTML = '<svg height="16" width="16" viewBox="0 0 16 16" class="svg"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>';
    }
}
/**
 * Функция обновления плеера
 */
function updatePlayer(){
    const {
        img,
        name,
        artist
    } = player.track;
    if (img && name && artist) {
        addTrackInfo(img, name, artist);
        changeButton();
        eventsPlayer();
    }
}

/**
 * Функция изменения кнопки в зависимости от состояния audio (прогрывается/непроигрывается)
 */
function changeButton() {
    const state = player.isPlaying;
    if (state) {
        playButton.innerHTML = '<svg height="16" width="16" viewBox="0 0 16 16" class="svg"><path d="M2.7 1a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7H2.7zm8 0a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7h-2.6z"></path></svg>';
    } else {
        playButton.innerHTML = '<svg height="16" width="16" viewBox="0 0 16 16" class="svg"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path></svg>';
    }
}

window.addEventListener('DOMContentLoaded', loadContent);


search.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    if (query.length > 3) {
        const res = await spotify.getSearchResults(query);
        if(res.status){
            content.innerHTML = '';
            addPlaylistElements(content, res.data.playlists.items, 'Плейлисты');
            addTracks(content, res.data.tracks.items);
        } else {
            content.textContent = res.data.msg;
        }
    }
});

playButton.addEventListener('click', () => {

    if (!player.isPlaying && player.currentTrack) {
        player.play();
        eventsPlayer();
    } else {
        player.pause();
    }
    changeButton();
});

volumeButton.addEventListener('change', (e) => {
    player.setVolume(e.target.value);
});

nextButton.addEventListener('click', () => {
    player.nextTrack();
    updatePlayer();
});

prevButton.addEventListener('click', () => {
    player.previousTrack();
    updatePlayer();
}); 