<template>
  <div id="tracklistsidemenu">
    <div class="playlistList">
      <div
        class="flexRow cursorPointer"
        :class="{selectedPlaylist: selectedPlaylist == null}"
        @click="onLibraryClick()"
      >
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
  </div>
</template>

<script>
import axios from "axios";

export default {
    name: "TrackListSideMenu",
    props:{
        libraryTrackCount: Number,
    },
    data(){
        return{
            userPlaylists: null,
            selectedPlaylist: null,
        }
    },
    methods:{
        async onPlaylistClick(playlist) {
            this.$emit('on-element-click', `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`);
            this.selectedPlaylist = playlist;
        },
        async onLibraryClick() {
            this.$emit('on-element-click', "https://api.spotify.com/v1/me/tracks?limit=50&offset=0");
            this.selectedPlaylist = null;
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
        
        async getUserId() {
            const res = await axios.get("https://api.spotify.com/v1/me");
            return res.data.id;
        },
    },
    async created(){
        const userId = await this.getUserId();
        this.userPlaylists = await this.getUserPlaylists(`https://api.spotify.com/v1/users/${userId}/playlists`);
    },
};
</script>

<style scoped>
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
</style>