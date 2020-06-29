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
                <div class="playlistList" v-if="this.isPlaylistListOn">
                    <div class="flexRow cursorPointer" :class="{selectedPlaylist: selectedPlaylist.id == undefined}" @click="onLibraryClick()">
                        <a class="playlistName darkGrayText">My library</a>
                        <a class="playlistTrackCount grayText">{{libraryTrackCount}}</a>
                    </div>
                    <div
                        class="playlist flexRow cursorPointer"
                        v-for="(playlist, i) of userPlaylists"
                        :key="playlist + i"
                        @click="onPlaylistClick(playlist.id);selectedPlaylist=playlist"
                        :class="{selectedPlaylist: selectedPlaylist == playlist}"
                    >
                        <a class="playlistName darkGrayText">{{playlist.name}}</a>
                        <a class="playlistTrackCount grayText">{{playlist.total}}</a>
                    </div>
                </div>

                <div class="savedTracksContainer flexRow">
                    <div class="currentTrackImage">
                        <img v-bind:src="this.currentTrackAlbumCoverUri" />
                    </div>
                    <div class="trackContainer">
                        <div
                            class="track flexRow cursorPointer"
                            v-for="(track, i) of loadedTracks"
                            :key="track + i"
                            :class="{currentTrack: track.id == currentTrackId}"
                            @click="playSpecificTrack(track.id)"
                        >
                            <a class="darkPinkText trackIndex">{{track.id == currentTrackId ? getCurrentTrackOperators(String(i + 1).padStart(2, '0')) : String(i + 1).padStart(2, '0')}}</a>
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
axios.defaults.headers.common["Authorization"] =
    "Bearer " + window.localStorage.getItem("access_token");

import TrackListHeader from "@/components/TrackListHeader";
// import TrackListLyrics from "@/components/TrackListLyrics";

export default {
    name: "TrackList",
    data() {
        return {
            libraryTrackCount: 0,
            currentTrackAlbumCoverUri: "",
            currentTrackId: "",
            loadedTracks: [],
            userPlaylists: [],
            selectedPlaylist: {},
            interval: null,
            isPlaylistListOn: false
        };
    },
    components: {
        TrackListHeader,
    },
    methods: {
        async loadUserInfo() {
            try {
                let res = await axios({
                    method: "get",
                    url: "https://api.spotify.com/v1/me"
                });

                this.loadUserPlaylists(
                    `https://api.spotify.com/v1/users/${res.data.id}/playlists`
                );
                return res.data;
            } catch (error) {
                console.log(error.response);
                return error.response;
            }
        },

        async loadUserPlaylists(endpoint) {
            try {
                let res = await axios({
                    method: "get",
                    url: endpoint
                });

                for (let item of res.data.items) {
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
            try {
                let res = await axios({
                    method: "get",
                    url: endpoint
                });

                for (let item of res.data.items) {
                    const trackDuration = item.track.duration_ms / 1000;
                    const formattedDuration = `${Math.floor(
                        trackDuration / 60
                    )}:${String(Math.floor(trackDuration % 60)).padStart(
                        2,
                        "0"
                    )}`;

                    this.loadedTracks.push({
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
                    this.loadSavedTracks(res.data.next);
                }

                this.selectedPlaylist.id = undefined;
                this.libraryTrackCount = res.data.total;
 
                return res.data;
            } catch (x) {
                console.log(x.response);
                return x.response;
            }
        },

        async loadTracksFromPlaylist(endpoint) {
            try {
                let res = await axios({
                    method: "get",
                    url:
                        endpoint +
                        "?fields=id,name,tracks(items(track(name,artists(name,external_urls.spotify),album.name,album.external_urls.spotify,duration_ms,external_urls.spotify)),next)"
                });

                for (let item of res.data.tracks.items) {
                    const trackDuration = item.track.duration_ms / 1000;
                    const formattedDuration = `${Math.floor(
                        trackDuration / 60
                    )}:${String(Math.floor(trackDuration % 60)).padStart(
                        2,
                        "0"
                    )}`;

                    this.loadedTracks.push({
                        name: item.track.name,
                        artist: item.track.artists[0].name,
                        estimatedTime: formattedDuration,
                        // id: track.id,
                        artist_uri: item.track.artists[0].external_urls.spotify,
                        track_uri: item.track.external_urls.spotify
                    });
                }

                if (res.data.tracks.next != null) {
                    this.loadSavedTracks(res.data.tracks.next);
                }

                return res.data;
            } catch (x) {
                console.log(x.response);
                return x.response.data;
            }
        },

        updateAlbumCover(coverUri) {
            this.currentTrackAlbumCoverUri = coverUri;
        },

        changePlaylistListState() {
            this.isPlaylistListOn = !this.isPlaylistListOn;
        },

        onPlaylistClick(playlist_id) {
            this.loadedTracks = [];
            this.loadTracksFromPlaylist(
                `https://api.spotify.com/v1/playlists/${playlist_id}`
            );
        },
        onLibraryClick(){
            this.selectedPlaylist = {};
            this.loadedTracks = [];
            this.loadSavedTracks(`https://api.spotify.com/v1/me/tracks?limit=50&offset=0`);
        },

        updateCurrentTrackId(id) {
            this.currentTrackId = id;
        },
        getCurrentTrackOperators(index){
            let operators = "";
            while(operators.length != index.length){
                operators += ">";
            }
            return operators;
        },
        async playSpecificTrack(track_id){
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
    created() {
        this.loadSavedTracks(
            "https://api.spotify.com/v1/me/tracks?limit=50&offset=0"
        );
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