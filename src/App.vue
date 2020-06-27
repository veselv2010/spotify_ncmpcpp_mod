<template>
    <div id="app">
        <router-view />
    </div>
</template>

<script>
export default {
    name: "App",
    components: {}
};
</script>

<style>
@font-face {
    font-family: "Windows";
    src: url("assets/profontwindows-webfont.woff2") format("woff2"),
        url("assets/profontwindows-webfont.woff") format("woff");
    font-weight: normal;
    font-style: normal;
}

@font-face {
    font-family: "ProggyTiny";
    src: url("assets/proggytinysz-webfont.woff2") format("woff2"),
        url("assets/proggytinysz-webfont.woff") format("woff");
    font-weight: normal;
    font-style: normal;
}

* {
    margin: 0;
    padding: 0;
}

a {
    white-space: pre;
    text-decoration: none;
}

#app {
    font-family: ProggyTiny, Windows;
    font-size: 12px;
}

.cursorPointer {
    cursor: pointer;
}

.whiteText {
    color: #f8f8f8;
}

.pinkText {
    color: #db95e5;
}

.blueText {
    color: #2c90b5;
}

.darkPinkText {
    color: #a497b0;
}

.debugButton {
    /* https://www.spotify.com */
    position: absolute;
    background-color: transparent;
    border: 0;
    border-radius: 500px;
    display: inline-block;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 2px;
    line-height: 1;
    text-align: center;
    text-transform: uppercase;
    touch-action: manipulation;
    transition-duration: 33ms;
    transition-property: background-color, border-color, color, box-shadow,
        filter, transform;
    user-select: none;
    vertical-align: middle;
    transform: translate3d(0, 0, 0);
    padding: 17px 48px;
    background-color: #1db954;
    color: #ffffff;
    margin-left: 505px;
}

.debugButton:hover {
    transform: scale(1.04);
    background-color: #1ed760;
}

.debugButton:active {
    transform: scale(1);
    background-color: #14833b;
    box-shadow: none;
}
</style>
