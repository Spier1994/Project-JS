export class Player {
    constructor() {
        this.tracks = [];
        this.trackIndex = 0;
        this.currentTrack = null;
        this.isPlaying = false;
        this.audio = new Audio();
        this.volume = 0.5;
    }

    /**
     * Метод добавления трека
     * @param  {object} track - объект трека
     */
    addTrack(track) {
        this.tracks.push(track);
    }

    /**
     * Метод получания текущего трека
     * @return {object} возвращает объект данных текущего трека 
     */
    get track() {
        return {
            img: this.currentTrack?.album.images[0].url,
            name: this.currentTrack?.name,
            artist: this.currentTrack?.artists[0].name
        };
    }

    /**
     * Метод добавления текущего трека
     * @param  {string} trackName - название трека
     */
    set track(trackName) {
        const track = this.tracks.find((item, i) => {
            if (item.name === trackName) {
                this.trackIndex = i;
                return true;
            }
            return false;
        });
        this.currentTrack = track;

        if (this.audio.src) {
            this.audio.pause();
        }

        this.audio.src = track && track.preview_url
        this.audio.volume = this.volume;
    }

    /**
     * Метод проигрывания трека
     */
    play() {
        this.audio.volume = this.volume;
        this.audio.play();
        this.isPlaying = true;
    }

    /**
     * Метод остановки проигрывания трека
     */
    pause() {
        if (!this.audio.src) return;
        this.audio.pause();
        this.isPlaying = false;
    }

    /**
     * Метод установки громкости
     * @param  {number} value - значение громкости
     */
    setVolume(value) {
        this.volume = value;
        if (!this.audio) return;
        this.audio.volume = value;
    }

    /**
     * Метод переключения плеера на следующий трек
     */
    nextTrack() {

        if (!this.currentTrack) return;

        this.trackIndex++;

        if (this.trackIndex > this.tracks.length - 1) {
            this.trackIndex = 0;
        }

        this.track = this.tracks[this.trackIndex].name;
        this.isPlaying = true;
        this.audio.play();
    }

    /**
     * Метод переключения плеера на предыдущий трек
     */
    previousTrack() {
        if (!this.currentTrack) return;

        this.trackIndex--;

        if (this.trackIndex < 0) {
            this.trackIndex = this.tracks.length - 1;
        }

        this.track = this.tracks[this.trackIndex].name;
        this.isPlaying = true;
        this.audio.play();
    }
} 