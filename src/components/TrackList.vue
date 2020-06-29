<template>
    <div id="tracklist">
        <a class="debugButton" v-on:click="$router.push('/');">
            <span>reload page</span>
        </a>
        <span class="thanksForInventingJavascript">if everything is undefined try to reload page <br> or play something on spotify</span>
        <div class="mainContainer flexColumn">
            <TrackListHeader
                @on-new-track="updateAlbumCover($event.coverUri);updateCurrentTrackId($event.id)"
                @on-playing-click="changePlaylistListState()"
            />

            <div class="flexRow">
                <div class="playlistList" v-if="isPlaylistListOn">
                    <div class="flexRow cursorPointer" :class="{selectedPlaylist: selectedPlaylist == null}" @click="onLibraryClick()">
                        <a class="playlistName darkGrayText">My library</a>
                        <a class="playlistTrackCount grayText">{{libraryTrackCount}}</a>
                    </div>
                    <div
                        class="playlist flexRow cursorPointer"
                        v-for="(playlist, i) of userPlaylists"
                        :key="playlist + i"
                        @click="onPlaylistClick(playlist)"
                        :class="{selectedPlaylist: selectedPlaylist == playlist}"
                    >
                        <a class="playlistName darkGrayText">{{playlist.name}}</a>
                        <a class="playlistTrackCount grayText">{{playlist.total}}</a>
                    </div>
                </div>

                <div class="savedTracksContainer flexRow">
                    <div class="currentTrackImage">
                        <img :src="this.currentTrackAlbumCoverUri" />
                    </div>
                    <div class="trackContainer">
                        <div
                            class="track flexRow cursorPointer"
                            v-for="(track, i) of loadedTracks"
                            :key="track + i"
                            :class="{currentTrack: track.id == currentTrackId}"
                            @click="playSpecificTrack(track.id)"
                        >
                            <a class="darkPinkText trackIndex">
                                {{getTrackIndexDisplay(track, i)}}
                            </a>
                            <a class="whiteText trackName">{{track.name}}</a>
                            <a
                                class="blueText trackArtist"
                            >{{track.artist}}</a>
                            <a class="blueText trackEstimatedTime">{{track.estimatedTime}}</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="futureprogressbar"></div>

        </div>
    </div>
</template>

<script>
import axios from "axios";
import TrackListHeader from "@/components/TrackListHeader";
// import TrackListLyrics from "@/components/TrackListLyrics";

export default {
    name: "TrackList",
    data() {
        return {
            libraryTrackCount: 0,
            currentTrackAlbumCoverUri: "",
            currentTrackId: null,
            loadedTracks: [],
            userPlaylists: [],
            selectedPlaylist: null,
            interval: null,
            isPlaylistListOn: false
        };
    },
    components: {
        TrackListHeader,
    },
    methods: {
        async loadUserInfo() {
            const res = await axios.get("https://api.spotify.com/v1/me");

            this.loadUserPlaylists(
                `https://api.spotify.com/v1/users/${res.data.id}/playlists`
            );

            return res.data;
        },

        async loadUserPlaylists(endpoint) {
            try {
                const res = await axios.get(endpoint);

                for (const item of res.data.items) {
                    this.userPlaylists.push({
                        id: item.id,
                        name: item.name,
                        total: item.tracks.total
                    });
                }
                return res.data;
            } catch (error) {
                console.log(error.response);
                return error.response;
            }
        },

        async loadSavedTracks(endpoint) {
            //`https://api.spotify.com/v1/me/tracks?limit=50&offset=0`
            let tracks = [];

            try {
                const res = await axios.get(endpoint);

                for (let item of res.data.items) {
                    const trackDuration = item.track.duration_ms / 1000;
                    const formattedDuration = `${Math.floor(
                        trackDuration / 60
                    )}:${String(Math.floor(trackDuration % 60))
                            .padStart(2, "0")}`;

                    tracks.push({
                        name: item.track.name,
                        artist: item.track.artists[0].name,
                        estimatedTime: formattedDuration,
                        id: item.track.id,
                        artist_uri:
                            item.track.album.artists[0].external_urls.spotify,
                        track_uri: item.track.external_urls.spotify
                    });
                }

                if (res.data.next != null) {
                    const nextTracks = await this.loadSavedTracks(res.data.next);
                    tracks = [...tracks, ...nextTracks.tracks];
                }

                // this.selectedPlaylist.id = null;
                // this.libraryTrackCount = res.data.total;
 
                return { tracks, total: res.data.total };
            } catch (x) {
                console.log(x.response);
                return x.response;
            }
        },

        async loadTracksFromPlaylist(endpoint) {
            const fields = 'items(track(name,artists(name,external_urls.spotify),album.name,album.external_urls.spotify,duration_ms,external_urls.spotify,id)),next';
            const params = new URLSearchParams({ fields });

            const url = endpoint.includes('?')
                    ? endpoint + '&' + params.toString()
                    : endpoint + '?' + params.toString();
                    
            console.log({ url });
            const res = await axios.get(url);

            const tracks = res.data.items.map(item => {
                const trackDuration = item.track.duration_ms / 1000;

                return {
                    name: item.track.name,
                    artist: item.track.artists[0].name,
                    estimatedTime: Math.floor(trackDuration / 60)
                        + ':'
                        + String(
                            Math.floor(trackDuration % 60)).padStart(2, "0"),
                    id: item.track.id,
                    artist_uri: item.track.artists[0].external_urls.spotify,
                    track_uri: item.track.external_urls.spotify
                };
            });
            
            this.loadedTracks = [...this.loadedTracks, ...tracks];

            if (res.data.next) {
                this.loadTracksFromPlaylist(res.data.next);
            }

            return res.data;
        },

        updateAlbumCover(coverUri) {
            this.currentTrackAlbumCoverUri = coverUri;
        },

        changePlaylistListState() {
            this.isPlaylistListOn = !this.isPlaylistListOn;
        },

        onPlaylistClick(playlist) {
            this.loadedTracks = [];
            this.loadTracksFromPlaylist(
                `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`
            );

            this.selectedPlaylist = playlist;
        },
        async onLibraryClick() {
            this.selectedPlaylist = null;
            this.loadedTracks = [];
            const saved = await this.loadSavedTracks(`https://api.spotify.com/v1/me/tracks?limit=50&offset=0`);
            this.loadedTracks = saved.tracks;
            this.loadedTracks.total = saved.total;
        },

        updateCurrentTrackId(id) {
            this.currentTrackId = id;
        },
        getTrackIndexDisplay(track, index) {
            const str = String(index + 1).padStart(2, '0');

            return track.id == this.currentTrackId
                ? Array(str.length).fill('>').join('')
                : str;
        },
        async playSpecificTrack(track_id) {
            try {
                let res = await axios({
                    method: "put",
                    url: `https://api.spotify.com/v1/me/player/play`,
                    data: `{"uris":["spotify:track:${track_id}"]}`,
                });
 
                return res.data;
            } catch (x) {
                console.log(x.response);
                return x.response;
            }
        },

    },
    async created() {
        const saved = await this.loadSavedTracks("https://api.spotify.com/v1/me/tracks?limit=50&offset=0");
        this.loadedTracks = saved.tracks;
        this.libraryTrackCount = saved.total;

        this.loadUserInfo();
    }
};
</script>

<style scoped>
.flexRow {
    display: flex;
    flex-flow: row;
}

.flexColumn {
    display: flex;
    flex-flow: column;
}

.mainContainer {
    width: 560px;
    height: 680px;
    background: #1a1a1a;
}

.trackContainer {
    flex: auto;
    min-width: 230px;
}

.track {
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    line-height: 15px;
    user-select: none;
}

.trackIndex {
    margin-right: 8px;
    margin-left: 5px;
}

.trackName {
    margin-right: 5px;
    overflow: hidden;
}

.trackArtist {
    margin-right: 5px;
    overflow: hidden;
}

.trackEstimatedTime {
    margin-left: auto;
    margin-right: 5px;
}

.currentTrackImage {
    margin-top: 3px;
    margin-right: 10px;
    min-width: 145px;
    max-width: 165px;
}

.currentTrackImage img {
    width: 100%;
    height: auto;
}

.savedTracksContainer {
    position: relative;
    margin: 2px;
    border-right: 1px #212121 solid;
    overflow: auto;
    scrollbar-width: thin;
    max-height: 640px;
    flex: 1;
}

.futureprogressbar {
    min-height: 50px;
}

.playlistList {
    max-width: 150px;
    line-height: 12px;
    padding-right: 3px;
    margin-left: 3px;
}

.playlistTrackCount {
    margin-left: auto;
}

.playlistName {
    margin-right: 2px;
    overflow: hidden;
}

.selectedPlaylist a {
    color: white;
}

.currentTrack{
    background: #161817;
}

.currentTrack a:nth-child(1){
    color: #db95e5;
}

.currentTrack a:nth-child(2){
    color: white;
}

.thanksForInventingJavascript{
    position: absolute;
    margin-left: 650px;
    margin-top: 100px;
    color: white;
}
</style>