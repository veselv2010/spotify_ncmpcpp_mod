<template>
  <div id="tracklist">
    <a class="debugButton" v-on:click="loadSavedTracks();loadCurrentTrack();getArtistBiography();">
      <span>click me</span>
    </a>
    <div class="mainContainer flexColumn">

      <TrackListHeader @load-current-track="updateAlbumCover($event)"/>

      <div class="savedTracksContainer flexRow">
        <div class="currentTrackImage">
          <img v-bind:src="this.currentTrackAlbumCoverUri" />
        </div>
        <div class="trackContainer">
          <div class="track flexRow" v-for="(track, i) of savedTracks" :key="track + i">
            <a class="darkPinkText trackIndex">{{String(i + 1).padStart(2, '0')}}</a>
            <a class="whiteText trackName">{{track.name + " "}}</a>
            <a class="blueText trackArtist">{{track.artist}}</a>
            <a class="blueText trackEstimatedTime">{{track.estimatedTime}}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
axios.defaults.headers.common["Authorization"] =
  "Bearer " + window.localStorage.getItem("access_token");

import TrackListHeader from "@/components/TrackListHeader";

export default {
  name: "TrackList",
  data() {
    return {
      currentTrackAlbumCoverUri: "",
      savedTracks: [],
      interval: null
    };
  },
  components:{
    TrackListHeader,
  },
  methods: {
    async loadSavedTracks() {
      let limit = 50;
      let offset = 0;
      const selfUserEndpoint = `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`;

      try {
        let res = await axios({
          method: "get",
          url: selfUserEndpoint
        });

        for (let item of res.data.items) {
          const trackName = item.track.name;
          const trackArtist = item.track.artists[0].name;
          const trackDuration = item.track.duration_ms / 1000;
          const trackId = item.id;

          const formattedDuration = `${Math.floor(trackDuration / 60)}:${String(
            Math.floor(trackDuration % 60)
          ).padStart(2, "0")}`;

          this.savedTracks.push({
            name: trackName,
            artist: trackArtist,
            estimatedTime: formattedDuration,
            id: trackId
          });
        }

        return res.data;
      } catch (x) {
        console.log(x.response);
        return x.response;
      }
    },

    async getArtistBiography() {
      if (!window.localStorage.getItem("anonymousToken")) return;

      let artistId = "3dz0NnIZhtKKeXZxLOxCam"; //porter robinson
      try {
        let res = await axios({
          method: "get",
          url: `https://api-partner.spotify.com/pathfinder/v1/query?operationName=queryArtist&variables=%7B%22uri%22%3A%22spotify%3Aartist%${artistId}%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22586fab74eb300f60438e327e4142e4a509a656a24b17292672034271fea85079%22%7D%7D`,
          headers: {
            Authorization:
              "Bearer " + window.localStorage.getItem("anonymousToken")
          }
        });

        return res.data;
      } catch (x) {
        console.log(x.response);
        return x.response;
      }
    },

    updateAlbumCover(currentTrackAlbumCoverUri){
      this.currentTrackAlbumCoverUri = currentTrackAlbumCoverUri;
    }
  },
  created() {
    this.loadSavedTracks();
  },
};
</script>

<style scoped>
a {
  white-space: pre;
}

.flexRow {
  display: flex;
  flex-flow: row;
}

.flexColumn {
  display: flex;
  flex-flow: column;
}

.mainContainer {
  width: 505px;
  height: 680px;
  background: #1a1a1a;
}

.trackContainer {
  display: inline-block;
  min-width: 313px;
}

.track {
  display: flex;
  justify-content: space-between;
  overflow: hidden;
}

.trackIndex {
  margin-right: 8px;
}

.trackEstimatedTime {
  margin-left: auto;
  margin-right: 5px;
}

.currentTrackImage {
  margin-right: 15px;
}

.currentTrackImage img {
  width: 160px;
}

.savedTracksContainer {
  margin: 2px;
  overflow: auto;
  border-left: 1px #212121 solid;
}
</style>