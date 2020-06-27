<template>
  <div id="tracklistheader">
    <header class="topContainer flexRow">
      <div class="flexColumn leftSide">
        <div class="topCornerText">
          <a class="darkPinkText">[bio]</a>
          <a class="darkPinkText">[lyr]</a>
          <a class="darkPinkText">[vis]</a>
        </div>
        <div class="topCornerText">
          <a class="whiteText">[playing]</a>
        </div>
      </div>

      <div class="flexColumn">
        <div class="flexRow center topCornerText">
          <a class="whiteText">{{currentTrack.artist}}</a>
          <a class="blueText">{{" " + currentTrack.name}}</a>
        </div>
        <div class="flexRow center topCornerText">
          <a class="pinkText">{{currentTrack.album}}</a>
        </div>
      </div>

      <div class="flexColumn rightSide">
        <div class="flexRow rightSide topCornerText">
          <a class="blueText">{{currentTrack.currentTime + "r" + " "}}</a>
          <a class="blueText">@</a>
          <a class="blueText">{{" " + currentTrack.volume + "%"}}</a>
        </div>
        <div class="flexRow rightSide topCornerText">
          <a class="darkPinkText">[+1]</a>
          <a class="darkPinkText">[-m]</a>
          <a class="whiteText">[----]</a>
        </div>
      </div>
    </header>
  </div>
</template>

<script>
import axios from "axios";
axios.defaults.headers.common["Authorization"] =
  "Bearer " + window.localStorage.getItem("access_token");

export default {
  name: "TrackListHeader",
  data() {
    return {
        coveruri: "",
      currentTrack: {},
      interval: null
    };
  },
  props:{
     
  },
  methods:{
    async loadCurrentTrack() {
      const currentTrackEndPoint = "https://api.spotify.com/v1/me/player";
      try {
        let res = await axios({
          method: "get",
          url: currentTrackEndPoint
        });

        const estDeltaMs = (res.data.item.duration_ms - res.data.progress_ms) / 1000;

        const currentTrackTime = `${Math.floor(estDeltaMs / 60)}:${String(
          Math.floor(estDeltaMs % 60)
        ).padStart(2, "0")}`;

        this.currentTrack = {
          name: res.data.item.name,
          artist: res.data.item.artists[0].name,
          album: res.data.item.album.name,
          volume: res.data.device.volume_percent,
          coverUri: res.data.item.album.images[1].url,
          id: res.data.item.id,
          currentTime: currentTrackTime,
        };
        this.coveruri = this.currentTrack.coverUri;
 
        this.$emit("load-current-track", this.coveruri);

        return res.data;
      } catch (x) {
        console.log(x.response);
        return x.response;
      }
    },
  },
  mounted() {
    this.loadCurrentTrack();
    setInterval(this.loadCurrentTrack, 1000);
  }
}  
</script>

<style scoped>
a {
  white-space: pre;
}
.flexRow {
  display: flex;
  flex-flow: row;
}

.center {
  justify-content: center;
}

.flexColumn {
  display: flex;
  flex-flow: column;
}

.leftSide {
  margin-right: auto;
}

.rightSide {
  margin-left: auto;
}

.topContainer {
  padding: 2px 2px 0 2px;
}

.topCornerText {
  overflow: hidden;
  line-height: 12px;
}
</style>