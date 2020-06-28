<template>
    <div id="tracklistlyrics">
        
    </div>
</template>

<script>
import geniusLyrics from "genius-lyrics-api";

export default {
    name: "TrackListLyrics",
    data(){
        return{

        };
    },
    methods:{
        async getSongLyrics(){
            const options = {
                apiKey: "vHPo0E1_ucwHThbbghjmxjBmqL8UvSaCIuJZ4pEKJGlJIOi4gbo1zYLKLdhOU9Z8",
                title: "Ribs",
                artist: "BONES",
                optimizeQuery: true,
            }

            let resp = await geniusLyrics.getLyrics(options);

            console.log(resp);
        }
    },
    created(){
        this.getSongLyrics();
    },
}
</script>

<style scoped>

</style>