<template>
    <div id="tracklist">
        <a class="debugButton" v-on:click="$router.push('/');">
            <span>reload page</span>
        </a>
        <span class="thanksForInventingJavascript">if everything is undefined try to reload page <br> 
        or play something on spotify<br>
        <br>
        [+1] is spotify love button<br>
        [----] is shuffle button<br>
        press space to pause playback<br>
        clicking on [playing] will reveal the playlists list<br>
        clicking on any track on the right will change current track to it (premium required)</span>
        <div class="mainContainer flexColumn">
            <TrackListHeader
                @on-new-track="updateDisplayingCover($event.coverUri);updateCurrentTrackId($event.id)"
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
                        <img :src="this.currentDisplayingCover" />
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
        </div>
    </div>
</template>

<script>
import axios from "axios";
import TrackListHeader from "@/components/TrackListHeader";

export default {
    name: "TrackList",
    data() {
        return {
            libraryTrackCount: null,
            currentDisplayingCover: {},
            currentTrackId: null,
            currentTrackCoverUri: null,
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
        async getUserId() {
            const res = await axios.get("https://api.spotify.com/v1/me");
            return res.data.id;
        },
 
        async getUserPlaylists(endpoint) {
           const res = await axios.get(endpoint);

           const playlists = res.data.items.map(item =>{
               const coverUri = item.images[0] != undefined ? item.images[0].url : null;
               return{
                   id: item.id,
                   name: item.name,
                   total: item.tracks.total,
                   coverUri: coverUri,
               };
           });

           return playlists;
        },
     
        async getTracks(endpoint) {
            const endpointUrl = new URL(endpoint);
            const fields = 'items(track(name,artists(name,external_urls.spotify),album.name,album.external_urls.spotify,duration_ms,external_urls.spotify,id)),next';

            if(endpointUrl.pathname.includes("v1/playlists/"))
                endpointUrl.searchParams.set('fields', fields);

            const res = await axios.get(endpointUrl);

            let tracks = res.data.items.map(item => {
                const trackDuration = item.track.duration_ms / 1000;
                const formattedDuration = Math.floor(trackDuration / 60)
                        + ':'
                        + String(
                            Math.floor(trackDuration % 60)).padStart(2, "0");
                return {
                    name: item.track.name,
                    artist: item.track.artists[0].name,
                    estimatedTime: formattedDuration,
                    id: item.track.id,
                    artist_uri: item.track.artists[0].external_urls.spotify,
                    track_uri: item.track.external_urls.spotify,
                };
            });        

            if (res.data.next) {
                const nextTracks = await this.getTracks(res.data.next);
                tracks = [...tracks, ...nextTracks];
            }

            return tracks;
        },

        updateDisplayingCover(coverUri) {
            this.currentTrackCoverUri = coverUri;

            // if(this.selectedPlaylist != null){
            //     this.currentDisplayingCover = this.selectedPlaylist.coverUri;
            //     return;
            // }

            this.currentDisplayingCover = coverUri;
        },

        changePlaylistListState() {
            this.isPlaylistListOn = !this.isPlaylistListOn;
        },

        async onPlaylistClick(playlist) {
            this.loadedTracks = []; 
            this.loadedTracks = await this.getTracks(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`);
            this.selectedPlaylist = playlist;
        },
        async onLibraryClick() {
            this.selectedPlaylist = null;
            this.loadedTracks = [];
            const saved = await this.getTracks(`https://api.spotify.com/v1/me/tracks?limit=50&offset=0`);
            this.loadedTracks = saved;
            this.libraryTrackCount = saved.length;
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
            await axios({
                method: 'put',
                url: `https://api.spotify.com/v1/me/player/play`,
                data: `{"uris":["spotify:track:${track_id}"]}`,
            });
        },
    },
    async created() {
        const saved = await this.getTracks("https://api.spotify.com/v1/me/tracks?limit=50&offset=0");
        this.loadedTracks = saved;
        this.libraryTrackCount = saved.length;

        const userId = await this.getUserId();
        this.userPlaylists = await this.getUserPlaylists(`https://api.spotify.com/v1/users/${userId}/playlists`);
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