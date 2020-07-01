<template>
  <div id="tracklistsidemenu">
      <input v-model="searchText" class="searchBar" type="search" @input="onLocalSearch()" placeholder="local search"/>
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
            searchText: "",
        }
    },
    methods:{
        async onPlaylistClick(playlist) {
            this.selectedPlaylist = playlist;
            this.searchText = "";
            this.$emit('on-element-click', {endpoint: `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
                                            playlist: playlist});
        },

        async onLibraryClick() {
            this.selectedPlaylist = null;
            this.$emit('on-element-click', {endpoint: "https://api.spotify.com/v1/me/tracks?limit=50&offset=0",
                                            playlist: null});
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
                   description: item.description,
               };
           });

           return playlists;
        },        

        async getUserId() {
            const res = await axios.get("https://api.spotify.com/v1/me");
            return res.data.id;
        },

        onLocalSearch(){
            this.$emit('on-local-search', this.searchText);
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

.selectedPlaylist{
    background: #161817;
}

.selectedPlaylist a {
    color: white;
}

.searchBar{
    padding: 2px 7px 2px 7px;
    font-size: 14px;
    font-family: ProggyTiny;
    background: #1a1a1a;
    color: red;
    border: none;
    width: 100%;
    text-align: center;
}
</style>